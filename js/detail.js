import { getStatusColor, getStatusText, getTrendArrow } from './config.js?v=4';
import { formatTime } from './utils.js?v=4';

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
}

const WEATHER_ICONS = {
  0: 'fa-sun', 1: 'fa-cloud-sun', 2: 'fa-cloud-sun', 3: 'fa-cloud',
  45: 'fa-smog', 48: 'fa-smog',
  51: 'fa-cloud-rain', 53: 'fa-cloud-rain', 55: 'fa-cloud-rain',
  56: 'fa-cloud-meatball', 57: 'fa-cloud-meatball',
  61: 'fa-cloud-showers-heavy', 63: 'fa-cloud-showers-heavy', 65: 'fa-cloud-showers-heavy',
  66: 'fa-cloud-meatball', 67: 'fa-cloud-meatball',
  71: 'fa-snowflake', 73: 'fa-snowflake', 75: 'fa-snowflake', 77: 'fa-snowflake',
  80: 'fa-cloud-showers-heavy', 81: 'fa-cloud-showers-heavy', 82: 'fa-cloud-showers-heavy',
  85: 'fa-snowflake', 86: 'fa-snowflake',
  95: 'fa-bolt', 96: 'fa-bolt', 99: 'fa-bolt',
};

export function renderClima(estacao, clima) {
  const el = document.getElementById('detailClima');
  if (!el) return;

  const c = clima?.[estacao.codigo];
  if (!c) {
    el.innerHTML = '';
    return;
  }

  const icon = WEATHER_ICONS[c.w] || 'fa-cloud';
  el.innerHTML = `
    <div class="clima-item"><i class="fas ${icon}"></i> ${c.c}</div>
    <div class="clima-item"><i class="fas fa-temperature-half"></i> ${c.t.toFixed(1)}°C</div>
    <div class="clima-item"><i class="fas fa-wind"></i> ${c.v.toFixed(0)} km/h${c.vr ? ` (${c.vr.toFixed(0)})` : ''}</div>
    ${c.pp != null ? `<div class="clima-item"><i class="fas fa-umbrella"></i> ${c.pp}% chuva</div>` : ''}
  `;
}

export function calcTendencia(estacao, historico, janelaHoras = 1) {
  const hist = historico.filter((h) => h.codigo === estacao.codigo);
  if (hist.length < 2) return 0;

  const last = hist[hist.length - 1];
  const alvo = last.epoch - janelaHoras * 3600000;

  let ref = hist[0];
  for (let i = hist.length - 2; i >= 0; i--) {
    ref = hist[i];
    if (hist[i].epoch <= alvo) break;
  }

  const diff = last.nivel - ref.nivel;
  const hours = (last.epoch - ref.epoch) / 3600000;
  if (hours < 0.25) return 0;
  return diff / hours;
}
