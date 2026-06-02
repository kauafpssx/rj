import { CONFIG } from './config.js';

export async function fetchDados() {
  try {
    const [dadosRes, histRes] = await Promise.all([
      fetch(CONFIG.DADOS_PATH),
      fetch(CONFIG.HISTORICO_PATH),
    ]);

    let estacoes = [];
    let historico = [];

    if (dadosRes.ok) {
      const dados = await dadosRes.json();
      estacoes = (dados.estacoes || []).map((e) => ({ ...e, sync: dados.sync }));
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
