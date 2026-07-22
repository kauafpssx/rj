import { CONFIG } from './config.js?v=4';

export async function fetchDados() {
  try {
    const dadosRes = await fetch(CONFIG.DADOS_PATH, { cache: 'no-store' });

    let estacoes = [];

    if (dadosRes.ok) {
      const dados = await dadosRes.json();
      estacoes = mergeEstacoes(dados);
    } else {
      console.warn('dados.json não encontrado');
    }

    return { estacoes };
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    throw err;
  }
}

export async function fetchClima() {
  try {
    const res = await fetch(CONFIG.CLIMA_PATH, { cache: 'no-store' });
    if (!res.ok) return {};
    const dados = await res.json();
    return dados.c || {};
  } catch (err) {
    console.error('Erro ao carregar clima:', err);
    return {};
  }
}

const HISTORICO_CACHE_TTL = 60 * 1000;

function getHistoricoCache(codigo) {
  try {
    const cached = JSON.parse(sessionStorage.getItem(`rj_hist_${codigo}`) || 'null');
    if (cached && Date.now() - cached.t < HISTORICO_CACHE_TTL) return cached.data;
  } catch {
    // ignora cache corrompido
  }
  return null;
}

function setHistoricoCache(codigo, data) {
  try {
    sessionStorage.setItem(`rj_hist_${codigo}`, JSON.stringify({ data, t: Date.now() }));
  } catch {
    // sessionStorage cheio/indisponível, ignora
  }
}

export async function fetchHistorico(codigo) {
  const cached = getHistoricoCache(codigo);
  if (cached) return cached;

  try {
    const res = await fetch(`${CONFIG.HISTORICO_BASE}${codigo}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const raw = await res.json();
    if (!Array.isArray(raw)) return [];
    const historico = raw.map(([nivel, epoch]) => ({ codigo, nivel, epoch }));
    setHistoricoCache(codigo, historico);
    return historico;
  } catch (err) {
    console.error(`Erro ao carregar histórico da estação ${codigo}:`, err);
    return [];
  }
}

function mergeEstacoes(dados) {
  const dynamic = dados.e || {};

  return Object.entries(dados.m || {}).map(([cod, meta]) => {
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
    };
  }).filter(Boolean);
}

export function filterHistorico(historico, codigo, dias) {
  let filtered = historico.filter((h) => h.codigo === codigo);
  if (dias > 0) {
    const cutoff = Date.now() - dias * 86400000;
    filtered = filtered.filter((h) => h.epoch >= cutoff);
  }
  return filtered;
}
