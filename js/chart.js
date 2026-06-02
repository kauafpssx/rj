import { CONFIG, getStatusColor } from './config.js';
import { pad } from './utils.js';
import { filterHistorico } from './api.js';

export function renderChart(estacao, historico, chartRange, chartInstance) {
  const dias = chartRange;
  const filtered = filterHistorico(historico, estacao.codigo, dias);

  const loading = document.getElementById('chartLoading');

  if (filtered.length < 2) {
    loading.style.display = 'flex';
    loading.querySelector('span').textContent = 'Dados insuficientes para o gráfico';
    return chartInstance;
  }
  loading.style.display = 'none';

  const labels = filtered.map((h) => {
    const d = new Date(h.epoch);
    return dias <= 1
      ? `${pad(d.getHours())}:${pad(d.getMinutes())}`
      : `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const data = filtered.map((h) => h.nivel);

  const canvas = document.getElementById('chart');
  const ctx = canvas.getContext('2d');

  if (chartInstance) chartInstance.destroy();

  const pct = (estacao.nivel / estacao.cota_inundacao) * 100;
  const grad = ctx.createLinearGradient(0, 0, 0, 400);
  const c = pct >= 100 ? 'red' : pct >= 80 ? 'orange' : pct >= 50 ? 'yellow' : 'green';
  const colorHex = CONFIG.COLORS[c];
  grad.addColorStop(0, colorHex + '80');
  grad.addColorStop(1, colorHex + '10');

  const newChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: estacao.nome,
        data,
        borderColor: colorHex,
        backgroundColor: grad,
        fill: true,
        tension: 0.2,
        pointRadius: 2,
        pointHoverRadius: 5,
        pointBackgroundColor: colorHex,
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        annotation: {
          annotations: {
            floodLine: {
              type: 'line',
              yMin: estacao.cota_inundacao,
              yMax: estacao.cota_inundacao,
              borderColor: CONFIG.COLORS.red + '80',
              borderWidth: 2,
              borderDash: [6, 4],
              label: {
                display: true,
                content: `Inundação ${estacao.cota_inundacao.toFixed(2)}m`,
                position: 'end',
                backgroundColor: CONFIG.COLORS.red + '30',
                color: CONFIG.COLORS.red,
                font: { size: 11 },
              },
            },
          },
        },
        tooltip: {
          backgroundColor: 'rgba(20,25,35,0.95)',
          titleColor: '#f5f6fa',
          bodyColor: '#a0a4b0',
          borderColor: 'rgba(255,255,255,0.12)',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => `${ctx.parsed.y.toFixed(2)}m`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: '#a0a4b0', maxTicksLimit: dias <= 1 ? 12 : 10, font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
        y: {
          ticks: { color: '#a0a4b0', font: { size: 10 }, callback: (v) => `${v.toFixed(1)}m` },
          grid: { color: 'rgba(255,255,255,0.08)' },
        },
      },
    },
  });

  renderStats(data, filtered.length);
  return newChart;
}

function renderStats(vals, count) {
  if (vals.length === 0) {
    document.getElementById('chartStats').innerHTML = '';
    return;
  }
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  document.getElementById('chartStats').innerHTML = `
    <span>Mín: <span class="stat-val">${min.toFixed(2)}m</span></span>
    <span>Méd: <span class="stat-val">${avg.toFixed(2)}m</span></span>
    <span>Máx: <span class="stat-val">${max.toFixed(2)}m</span></span>
    <span>Leituras: <span class="stat-val">${count}</span></span>
  `;
}
