import { CONFIG, ESTACOES } from './config.js';

export async function fetchDados() {
  try {
    const t = Date.now();
    const [dadosRes, histRes] = await Promise.all([
      fetch(CONFIG.DADOS_PATH + '?_t=' + t),
      fetch(CONFIG.HISTORICO_PATH + '?_t=' + t),
    ]);

    let estacoes = [];
    let historico = [];

    if (dadosRes.ok) {
      const dados = await dadosRes.json();
      estacoes = mergeEstacoes(dados);
    } else {
      console.warn('dados.json não encontrado');
    }

    if (histRes.ok) {
      const raw = await histRes.json();
      historico = parseHistorico(raw);
    } else {
      console.warn('historico.json não encontrado');
    }

    return { estacoes, historico };
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    throw err;
  }
}

function mergeEstacoes(dados) {
  const dynamic = dados.e || {};
  const sync = dados.s || '';
  const hasMeta = dados.m && Object.keys(dados.m).length > 0;

  if (hasMeta) {
    return Object.entries(dados.m).map(([cod, meta]) => {
      const entry = dynamic[cod];
      if (!entry) return null;
      return {
        codigo: Number(cod),
        nome: meta.N,
        municipio: meta.M,
        rio: meta.R,
        cota_inundacao: meta.C,
        nivel: entry.n,
        epoch: entry.t,
        sync,
      };
    }).filter(Boolean);
  }

  return ESTACOES.map((meta) => {
    const entry = dynamic[meta.codigo];
    if (!entry) return null;
    return {
      ...meta,
      nivel: entry.n,
      epoch: entry.t,
      sync,
    };
  }).filter(Boolean);
}

function parseHistorico(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  if (Array.isArray(raw[0])) {
    return raw.map(([codigo, nivel, epoch]) => ({ codigo, nivel, epoch }));
  }
  if (typeof raw[0] === 'object' && raw[0].codigo) {
    return raw.map((e) => ({ codigo: e.codigo, nivel: e.nivel, epoch: e.epoch }));
  }
  return [];
}

export function filterHistorico(historico, codigo, dias) {
  let filtered = historico.filter((h) => h.codigo === codigo);
  if (dias > 0) {
    const cutoff = Date.now() - dias * 86400000;
    filtered = filtered.filter((h) => h.epoch >= cutoff);
  }
  return filtered;
}
