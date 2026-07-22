const axios = require('axios');
const { Agent: HttpsAgent } = require('node:https');

const API_BASE = 'https://portal1.snirh.gov.br/server/rest/services/SGH/CotasReferencia2/MapServer/2/query';
const GITHUB_API = 'https://api.github.com/repos/kauafpssx/rj/contents';
const DATA_BRANCH = 'data';
const TOKEN = process.env.GITHUB_TOKEN;
const RETENTION_DAYS = 365;

const ESTACOES = [
  { codigo: 87450020, nome: 'Porto Alegre', municipio: 'Porto Alegre', rio: 'Rio Guaíba', cota_inundacao: 3.60, lat: -30.0346, lon: -51.2177 },
  { codigo: 85400000, nome: 'Dona Francisca', municipio: 'Dona Francisca', rio: 'Rio Jacuí', cota_inundacao: 7.50, lat: -29.6094, lon: -53.3961 },
  { codigo: 85642000, nome: 'Cachoeira do Sul', municipio: 'Cachoeira do Sul', rio: 'Rio Jacuí', cota_inundacao: 18.00, lat: -30.0392, lon: -52.8938 },
  { codigo: 86510000, nome: 'Muçum', municipio: 'Muçum', rio: 'Rio Taquari', cota_inundacao: 18.00, lat: -29.1689, lon: -51.8664 },
  { codigo: 86720000, nome: 'Encantado', municipio: 'Encantado', rio: 'Rio Taquari', cota_inundacao: 12.00, lat: -29.2350, lon: -51.8697 },
  { codigo: 86879300, nome: 'Lajeado', municipio: 'Lajeado', rio: 'Rio Taquari', cota_inundacao: 19.00, lat: -29.4669, lon: -51.9614 },
  { codigo: 86881000, nome: 'Bom Retiro do Sul', municipio: 'Bom Retiro do Sul', rio: 'Rio Taquari', cota_inundacao: 16.50, lat: -29.6167, lon: -51.9337 },
  { codigo: 87165001, nome: 'Feliz', municipio: 'Feliz', rio: 'Rio Caí', cota_inundacao: 9.00, lat: -29.4508, lon: -51.3072 },
  { codigo: 87170000, nome: 'São Sebastião do Caí', municipio: 'São Sebastião do Caí', rio: 'Rio Caí', cota_inundacao: 10.00, lat: -29.5978, lon: -51.3872 },
  { codigo: 87376000, nome: 'Taquara', municipio: 'Taquara', rio: 'Rio Paranhana', cota_inundacao: 5.80, lat: -29.6519, lon: -50.7789 },
  { codigo: 87382000, nome: 'São Leopoldo', municipio: 'São Leopoldo', rio: 'Rio dos Sinos', cota_inundacao: 4.50, lat: -29.7603, lon: -51.1478 },
  { codigo: 87399000, nome: 'Gravataí', municipio: 'Gravataí', rio: 'Rio Gravataí', cota_inundacao: 4.75, lat: -29.9439, lon: -50.9925 },
];

const CLIMA_API = 'https://api.open-meteo.com/v1/forecast';

const WEATHER_LABELS = {
  0: 'Céu limpo', 1: 'Poucas nuvens', 2: 'Parc. nublado', 3: 'Nublado',
  45: 'Neblina', 48: 'Neblina densa',
  51: 'Garoa fraca', 53: 'Garoa', 55: 'Garoa forte',
  56: 'Garoa gelada', 57: 'Garoa gelada forte',
  61: 'Chuva fraca', 63: 'Chuva', 65: 'Chuva forte',
  66: 'Chuva gelada', 67: 'Chuva gelada forte',
  71: 'Neve fraca', 73: 'Neve', 75: 'Neve forte', 77: 'Granizo fino',
  80: 'Pancadas fracas', 81: 'Pancadas', 82: 'Pancadas fortes',
  85: 'Pancadas de neve', 86: 'Pancadas de neve fortes',
  95: 'Tempestade', 96: 'Tempestade c/ granizo', 99: 'Tempestade c/ granizo forte',
};

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

async function getCurrentDados() {
  try {
    const { data } = await axios.get(`${GITHUB_API}/dados.json?ref=${DATA_BRANCH}`, { headers: authHeader() });
    let text = Buffer.from(data.content, 'base64').toString();
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    const parsed = JSON.parse(text);
    return parsed.e || {};
  } catch {
    return {};
  }
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

function buildRecords(apiMap, currentMap) {
  const now = formatDate();
  const estacoes = {};
  const medicoes = [];

  for (const e of ESTACOES) {
    const raw = apiMap[e.codigo];
    if (!raw) {
      console.log(`[SKIP] ${e.nome} (${e.codigo}): não encontrado`);
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

  return { estacoes, medicoes, sync: now };
}

async function fetchAPI() {
  const codigos = ESTACOES.map(e => e.codigo).join(',');
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

async function fetchClima() {
  const lats = ESTACOES.map((e) => e.lat).join(',');
  const lons = ESTACOES.map((e) => e.lon).join(',');
  const url = `${CLIMA_API}?latitude=${lats}&longitude=${lons}&current=temperature_2m,weather_code,wind_speed_10m,wind_gusts_10m,precipitation&hourly=precipitation_probability&forecast_days=1&timezone=America%2FSao_Paulo`;
  const { data } = await axios.get(url, { timeout: 15000 });
  if (!Array.isArray(data) || data.length !== ESTACOES.length) {
    throw new Error('Resposta inválida da Open-Meteo');
  }

  const clima = {};
  for (let i = 0; i < ESTACOES.length; i++) {
    const e = ESTACOES[i];
    const r = data[i];
    const cur = r.current;
    const hourIdx = r.hourly.time.indexOf(cur.time.slice(0, 13) + ':00');
    const chuvaProb = hourIdx >= 0 ? r.hourly.precipitation_probability[hourIdx] : null;

    clima[e.codigo] = {
      t: cur.temperature_2m,
      w: cur.weather_code,
      c: WEATHER_LABELS[cur.weather_code] || 'Indefinido',
      v: cur.wind_speed_10m,
      vr: cur.wind_gusts_10m,
      p: cur.precipitation,
      pp: chuvaProb,
    };
  }

  return clima;
}

function historicoPath(codigo) {
  return `historico_${codigo}.json`;
}

async function appendHistoricoEstacao(codigo, entrada) {
  const path = historicoPath(codigo);
  let historico = [];
  const sha = await getSha(DATA_BRANCH, path);
  if (sha) {
    const { data } = await axios.get(`${GITHUB_API}/${path}?ref=${DATA_BRANCH}`, { headers: authHeader() });
    let text = Buffer.from(data.content, 'base64').toString();
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    historico = JSON.parse(text);
  }

  historico.push(entrada);

  const cutoff = Date.now() - RETENTION_DAYS * 86400000;
  historico = historico.filter((e) => e[1] >= cutoff);

  return JSON.stringify(historico);
}

function convertOld(old) {
  if (!Array.isArray(old) || !old.length) return [];
  if (Array.isArray(old[0])) return old;
  if (typeof old[0] === 'object' && old[0] !== null) {
    return old.map((e) => [e.codigo, e.nivel, e.epoch]).filter((e) => e.every((v) => typeof v === 'number'));
  }
  return [];
}

async function migrarHistoricoAntigo() {
  const sha = await getSha(DATA_BRANCH, 'historico.json');
  if (!sha) return;

  const { data } = await axios.get(`${GITHUB_API}/historico.json?ref=${DATA_BRANCH}`, { headers: authHeader() });
  let text = Buffer.from(data.content, 'base64').toString();
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  const raw = JSON.parse(text);
  const old = Array.isArray(raw) && Array.isArray(raw[0]) ? raw : convertOld(raw);

  const porCodigo = {};
  for (const [codigo, nivel, epoch] of old) {
    (porCodigo[codigo] ||= []).push([nivel, epoch]);
  }

  for (const [codigo, entradas] of Object.entries(porCodigo)) {
    entradas.sort((a, b) => a[1] - b[1]);
    await saveFile(DATA_BRANCH, historicoPath(codigo), JSON.stringify(entradas), 'Migração: split histórico por estação');
  }

  await axios.delete(`${GITHUB_API}/historico.json`, {
    headers: authHeader(),
    data: { message: 'Migração: remove historico.json combinado', branch: DATA_BRANCH, sha },
  });

  console.log(`[MIGRAÇÃO] historico.json dividido em ${Object.keys(porCodigo).length} arquivos por estação.`);
}

async function atualizarClima() {
  try {
    const clima = await fetchClima();
    await saveFile(DATA_BRANCH, 'clima.json', JSON.stringify({ s: formatDate(), c: clima }), 'Atualização clima');
  } catch (err) {
    console.warn('Clima: falhou buscar/salvar.', err.message || err);
  }
}

async function run() {
  try {
    await migrarHistoricoAntigo();
    await atualizarClima();

    console.log('Buscando dados da ANA...');
    const currentMap = await getCurrentDados();
    const features = await fetchAPI();

    if (!features.length) {
      console.log('Nenhuma estação retornada. Próxima execução em 5 min.');
      return;
    }

    const apiMap = parseFeatures(features);
    const { estacoes, medicoes, sync } = buildRecords(apiMap, currentMap);

    if (!medicoes.length) {
      console.log('Nenhuma estação com dado novo. Nada para commitar.');
      return;
    }

    const msg = `Atualização: ${sync}`;

    const metadados = buildMetadata();
    await saveFile(DATA_BRANCH, 'dados.json', JSON.stringify({ m: metadados, e: estacoes }), msg);

    for (const [codigo, nivel, epoch] of medicoes) {
      const historicoJson = await appendHistoricoEstacao(codigo, [nivel, epoch]);
      await saveFile(DATA_BRANCH, historicoPath(codigo), historicoJson, msg);
    }

    console.log(`\nConcluído! ${medicoes.length} estações com dado novo.`);
  } catch (err) {
    console.error('Detalhes:', err?.stack || err);
    console.error('Fatal:', err.message || err);
    process.exit(1);
  }
}

run();
