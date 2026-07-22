import { CONFIG, getStatusColor } from './config.js?v=4';
import { pad } from './utils.js?v=4';
import { filterHistorico } from './api.js?v=4';

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
    return dias === 1
      ? `${pad(d.getHours())}:${pad(d.getMinutes())}`
      : `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const data = filtered.map((h) => h.nivel);

  const canvas = document.getElementById('chart');
  const ctx = canvas.getContext('2d');

  if (chartInstance) chartInstance.destroy();

  const pct = (estacao.nivel / estacao.cota_inundacao) * 100;
  const grad = ctx.createLinearGradient(0, 0, 0, 400);
  const colorHex = CONFIG.COLORS[getStatusColor(pct)];
  grad.addColorStop(0, colorHex + '60');
  grad.addColorStop(1, colorHex + '05');

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
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: colorHex,
        pointHoverBorderColor: '#080f1a',
        pointHoverBorderWidth: 2,
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
              borderColor: '#f8717180',
              borderWidth: 1.5,
              borderDash: [6, 4],
              label: {
                display: true,
                content: `Inundação ${estacao.cota_inundacao.toFixed(2)}m`,
                position: 'end',
                backgroundColor: 'rgba(248,113,113,0.15)',
                color: '#f87171',
                font: { size: 10, family: 'JetBrains Mono' },
              },
            },
          },
        },
        tooltip: {
          backgroundColor: 'rgba(11,22,38,0.95)',
          titleColor: '#eaf0f6',
          titleFont: { size: 11, family: 'Sora', weight: '600' },
          bodyColor: '#7f95b0',
          bodyFont: { size: 11, family: 'JetBrains Mono' },
          borderColor: 'rgba(240,180,41,0.12)',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 6,
          displayColors: false,
          callbacks: {
            title: (items) => items[0].label,
            label: (ctx) => `${ctx.parsed.y.toFixed(2)}m`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: '#4a5f78', maxTicksLimit: dias === 1 ? 10 : 8, font: { size: 9, family: 'JetBrains Mono' } },
          grid: { color: 'rgba(240,180,41,0.04)' },
        },
        y: {
          ticks: { color: '#4a5f78', font: { size: 9, family: 'JetBrains Mono' }, callback: (v) => `${v.toFixed(1)}` },
          grid: { color: 'rgba(240,180,41,0.06)' },
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
    <span>Reg: <span class="stat-val">${count}</span></span>
  `;
}
