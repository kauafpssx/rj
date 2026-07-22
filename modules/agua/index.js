const axios = require('axios');
const path = require('node:path');
const { Agent: HttpsAgent } = require('node:https');
const { ESTACOES, DATA_DIR } = require('../../config');
const { readJSON, writeJSON } = require('../../lib/storage');

const API_BASE = 'https://portal1.snirh.gov.br/server/rest/services/SGH/CotasReferencia2/MapServer/2/query';
const RETENTION_DAYS = 365;

const AGUA_DIR = path.join(DATA_DIR, 'agua');
const DADOS_PATH = path.join(AGUA_DIR, 'dados.json');

function historicoPath(codigo) {
  return path.join(AGUA_DIR, `historico_${codigo}.json`);
}

function buildMetadata() {
  const m = {};
  for (const e of ESTACOES) {
    m[e.codigo] = { N: e.nome, M: e.municipio, R: e.rio, C: e.cota_inundacao };
  }
  return m;
}

function parseFeatures(features) {
  const map = {};
  for (const f of features) {
    map[f.attributes.Codigo] = f.attributes;
  }
  return map;
}

async function fetchAPI() {
  const codigos = ESTACOES.map((e) => e.codigo).join(',');
  const url = `${API_BASE}?f=json&where=Codigo+IN+(${codigos})+AND+Projeto%3D%27RHN%27&outFields=*&returnGeometry=false`;
  const { data } = await axios.get(url, {
    timeout: 15000,
    httpsAgent: new HttpsAgent({ family: 4 }),
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    },
  });
  if (!data || typeof data !== 'object') {
    throw new Error(`Resposta inválida da API: ${JSON.stringify(data)}`);
  }
  return data.features || [];
}

function buildRecords(apiMap, currentMap) {
  const estacoes = {};
  const medicoes = [];

  for (const e of ESTACOES) {
    const raw = apiMap[e.codigo];
    if (!raw) {
      console.log(`[agua] [SKIP] ${e.nome} (${e.codigo}): não encontrado`);
      continue;
    }
    const nivelM = +(raw.Ult_Dado / 100).toFixed(2);
    const epoch = raw.Data_ult_dado;

    estacoes[e.codigo] = { n: nivelM, t: epoch };

    const prev = currentMap[e.codigo];
    if (!prev || prev.t !== epoch) {
      medicoes.push([e.codigo, nivelM, epoch]);
    }
  }

  return { estacoes, medicoes };
}

function appendHistoricoEstacao(codigo, entrada) {
  const filePath = historicoPath(codigo);
  const historico = readJSON(filePath, []);
  historico.push(entrada);

  const cutoff = Date.now() - RETENTION_DAYS * 86400000;
  const filtrado = historico.filter((e) => e[1] >= cutoff);

  writeJSON(filePath, filtrado);
}

async function coletar() {
  console.log('[agua] buscando dados da ANA...');
  const dadosAtuais = readJSON(DADOS_PATH, { m: {}, e: {} });
  const currentMap = dadosAtuais.e || {};

  const features = await fetchAPI();
  if (!features.length) {
    console.log('[agua] nenhuma estação retornada.');
    return;
  }

  const apiMap = parseFeatures(features);
  const { estacoes, medicoes } = buildRecords(apiMap, currentMap);

  if (!medicoes.length) {
    console.log('[agua] nenhuma estação com dado novo.');
    return;
  }

  writeJSON(DADOS_PATH, { m: buildMetadata(), e: estacoes, s: new Date().toISOString() });

  for (const [codigo, nivel, epoch] of medicoes) {
    appendHistoricoEstacao(codigo, [nivel, epoch]);
  }

  console.log(`[agua] concluído! ${medicoes.length} estações com dado novo.`);
}

module.exports = { coletar, AGUA_DIR, DADOS_PATH, historicoPath };
