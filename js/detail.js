import { getStatusColor, getStatusText, getTrendArrow } from './config.js';
import { formatTime } from './utils.js';

export function renderDetalhe(estacao, historico) {
  const pct = (estacao.nivel / estacao.cota_inundacao) * 100;
  const color = getStatusColor(pct);
  const tendencia = calcTendencia(estacao, historico);
  const trendDir = tendencia > 0.001 ? 'subindo' : tendencia < -0.001 ? 'descendo' : 'estável';
  const trendClass = tendencia > 0.001 ? 'trend-up' : tendencia < -0.001 ? 'trend-down' : 'trend-stable';
  const trendIcon = getTrendArrow(tendencia);
  const trendAbs = Math.abs(tendencia).toFixed(2);

  document.getElementById('detailLocation').textContent = estacao.municipio;
  document.getElementById('detailRiver').textContent = estacao.rio;
  document.getElementById('detailLevelValue').textContent = estacao.nivel.toFixed(2);
  document.getElementById('detailLevelValue').style.color = `var(--${color})`;

  const tendenciaEl = document.getElementById('detailTendencia');
  if (Math.abs(tendencia) < 0.001) {
    tendenciaEl.innerHTML = `<span class="${trendClass}"><i class="fas fa-minus"></i> Estável</span>`;
  } else {
    tendenciaEl.innerHTML = `<span class="${trendClass}"><i class="fas fa-${trendIcon}"></i> ${trendAbs} cm/h (${trendDir})</span>`;
  }

  const badge = document.getElementById('statusBadge');
  badge.textContent = getStatusText(pct);
  badge.className = `status-badge ${color}`;

  document.getElementById('statusCota').textContent = `${pct.toFixed(1)}% da cota`;
  document.getElementById('detailMedicao').textContent = formatTime(estacao.epoch);
  document.getElementById('detailCotaValor').textContent = `${estacao.cota_inundacao.toFixed(2)}m`;

  if (estacao.sync) {
    document.getElementById('detailSync').textContent = estacao.sync;
  } else {
    document.getElementById('detailSync').textContent = '--';
  }
}

export function calcTendencia(estacao, historico) {
  const hist = historico.filter((h) => h.codigo === estacao.codigo);
  if (hist.length < 2) return 0;
  const last = hist[hist.length - 1];
  const prev = hist[hist.length - 2];
  const diff = last.nivel - prev.nivel;
  const hours = (last.epoch - prev.epoch) / 3600000;
  if (hours < 0.01) return 0;
  return diff / hours;
}
