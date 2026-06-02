const axios = require('axios');

const API_BASE = 'https://portal1.snirh.gov.br/server/rest/services/SGH/CotasReferencia2/MapServer/2/query';
const GITHUB_API = 'https://api.github.com/repos/kauafpssx/rj/contents';
const DATA_BRANCH = 'data';
const TOKEN = process.env.GITHUB_TOKEN;

const ESTACOES = [
  { codigo: 85400000, nome: 'Dona Francisca', municipio: 'Dona Francisca', rio: 'Rio Jacuí', cota_inundacao: 7.50 },
  { codigo: 85642000, nome: 'Cachoeira do Sul', municipio: 'Cachoeira do Sul', rio: 'Rio Jacuí', cota_inundacao: 18.00 },
  { codigo: 86510000, nome: 'Muçum', municipio: 'Muçum', rio: 'Rio Taquari', cota_inundacao: 18.00 },
  { codigo: 86720000, nome: 'Encantado', municipio: 'Encantado', rio: 'Rio Taquari', cota_inundacao: 12.00 },
  { codigo: 86879300, nome: 'Lajeado', municipio: 'Lajeado', rio: 'Rio Taquari', cota_inundacao: 19.00 },
  { codigo: 86881000, nome: 'Bom Retiro do Sul', municipio: 'Bom Retiro do Sul', rio: 'Rio Taquari', cota_inundacao: 16.50 },
  { codigo: 87165001, nome: 'Feliz', municipio: 'Feliz', rio: 'Rio Caí', cota_inundacao: 9.00 },
  { codigo: 87170000, nome: 'São Sebastião do Caí', municipio: 'São Sebastião do Caí', rio: 'Rio Caí', cota_inundacao: 10.00 },
  { codigo: 87376000, nome: 'Taquara', municipio: 'Taquara', rio: 'Rio Paranhana', cota_inundacao: 5.80 },
  { codigo: 87382000, nome: 'São Leopoldo', municipio: 'São Leopoldo', rio: 'Rio dos Sinos', cota_inundacao: 4.50 },
  { codigo: 87399000, nome: 'Gravataí', municipio: 'Gravataí', rio: 'Rio Gravataí', cota_inundacao: 4.75 },
  { codigo: 87450020, nome: 'Porto Alegre', municipio: 'Porto Alegre', rio: 'Rio Guaíba', cota_inundacao: 3.60 },
];

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatDate(date) {
  const d = date || new Date();
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function authHeader() {
  return { Authorization: `token ${TOKEN}`, Accept: 'application/vnd.github.v3+json' };
}

async function getSha(branch, path) {
  try {
    const { data } = await axios.get(`${GITHUB_API}/${path}?ref=${branch}`, { headers: authHeader() });
    return data.sha;
  } catch {
    return null;
  }
}

async function saveFile(branch, path, content, message) {
  const sha = await getSha(branch, path);
  await axios.put(`${GITHUB_API}/${path}`, {
    message,
    branch,
    content: Buffer.from(content).toString('base64'),
    sha,
  }, { headers: authHeader() });
  console.log(`[OK] ${path} → ${branch}`);
}

function parseFeatures(features) {
  const map = {};
  for (const f of features) {
    map[f.attributes.Codigo] = f.attributes;
  }
  return map;
}

function buildRecords(apiMap) {
  const now = formatDate();
  const estacoes = [];
  const medicoes = [];

  for (const e of ESTACOES) {
    const raw = apiMap[e.codigo];
    if (!raw) {
      console.log(`[SKIP] ${e.nome} (${e.codigo}): não encontrado`);
      continue;
    }
    const nivelCm = raw.Ult_Dado;
    const nivelM = +(nivelCm / 100).toFixed(2);
    const epoch = raw.Data_ult_dado;
    const dataMedicao = formatDate(new Date(epoch));
    const status = raw.Status_Dado || 'Sem dados';

    estacoes.push({
      codigo: e.codigo,
      nome: e.nome,
      municipio: e.municipio,
      rio: e.rio,
      nivel: nivelM,
      cota_inundacao: e.cota_inundacao,
      epoch,
      data_medicao: dataMedicao,
      status,
    });

    medicoes.push({
      codigo: e.codigo,
      nome: e.nome,
      nivel: nivelM,
      epoch,
      data_medicao: dataMedicao,
      sync: now,
      status,
    });
  }

  return { estacoes, medicoes, sync: now };
}

async function fetchAPI() {
  const codigos = ESTACOES.map(e => e.codigo).join(',');
  const url = `${API_BASE}?f=json&where=Codigo+IN+(${codigos})+AND+Projeto%3D%27RHN%27&outFields=*&returnGeometry=false`;
  const { data } = await axios.get(url, { timeout: 15000 });
  if (!data || typeof data !== 'object') {
    throw new Error(`Resposta inválida da API: ${JSON.stringify(data)}`);
  }
  return data.features || [];
}

async function appendHistorico(medicoes) {
  let historico = [];
  const sha = await getSha('main', 'historico.json');
  if (sha) {
    const { data } = await axios.get(`${GITHUB_API}/historico.json?ref=main`, { headers: authHeader() });
    let text = Buffer.from(data.content, 'base64').toString();
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    const raw = JSON.parse(text);
    historico = Array.isArray(raw) ? raw : convertOld(raw);
  }

  const compact = medicoes.map((m) => [m.codigo, m.nivel, m.epoch]);
  historico.push(...compact);

  const cutoff = Date.now() - 30 * 86400000;
  historico = historico.filter((e) => e[2] >= cutoff);

  return JSON.stringify(historico);
}

function convertOld(old) {
  if (!Array.isArray(old) || !old.length) return [];
  if (Array.isArray(old[0])) return old;
  // already compact
  if (typeof old[0] === 'object' && old[0] !== null) {
    return old.map((e) => [e.codigo, e.nivel, e.epoch]).filter((e) => e.every((v) => typeof v === 'number'));
  }
  return [];
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 5 * 60 * 1000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Buscando dados da ANA... (tentativa ${attempt}/${MAX_RETRIES})`);
      const features = await fetchAPI();

      if (!features.length) {
        if (attempt < MAX_RETRIES) {
          console.log(`Nenhuma estação retornada. Aguardando 5 min para tentar novamente...`);
          await sleep(RETRY_DELAY);
          continue;
        }
        throw new Error('Nenhuma estação retornada pela API após todas as tentativas');
      }

      const apiMap = parseFeatures(features);
      const { estacoes, medicoes, sync } = buildRecords(apiMap);
      const msg = `Atualização: ${sync}`;

      await saveFile(DATA_BRANCH, 'dados.json', JSON.stringify({ sync, estacoes }, null, 2), msg);
      const historicoJson = await appendHistorico(medicoes);
      await saveFile(DATA_BRANCH, 'historico.json', historicoJson, msg);

      console.log(`\nConcluído! ${estacoes.length} estações atualizadas.`);
      return;
    } catch (err) {
      console.error('Detalhes:', err?.stack || err);
      if (attempt < MAX_RETRIES) {
        console.log(`Erro: ${err.message || '(sem mensagem)'}. Aguardando 5 min para tentar novamente...`);
        await sleep(RETRY_DELAY);
      } else {
        console.error('Fatal:', err.message || err);
        process.exit(1);
      }
    }
  }
}

run();
