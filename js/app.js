import { ESTACOES, CONFIG } from './config.js';
import { showToast } from './utils.js';
import { requestNotificacao } from './notification.js';
import { fetchDados } from './api.js';
import { renderCarousel, updateCardActive, scrollToActive } from './carousel.js';
import { renderDetalhe } from './detail.js';
import { renderChart } from './chart.js';

const state = {
  estacoes: [],
  historico: [],
  activeIndex: 0,
  chart: null,
  chartRange: 1,
};

function setActive(i) {
  if (i < 0) i = 0;
  if (i >= state.estacoes.length) i = state.estacoes.length - 1;
  if (i === state.activeIndex) return;
  state.activeIndex = i;

  updateCardActive(i);
  scrollToActive(i);

  const estacao = state.estacoes[i];
  renderDetalhe(estacao, state.historico);
  state.chart = renderChart(estacao, state.historico, state.chartRange, state.chart);

  requestNotificacao(estacao);
}

function setupCarouselButtons() {
  document.getElementById('carouselPrev').addEventListener('click', () => setActive(state.activeIndex - 1));
  document.getElementById('carouselNext').addEventListener('click', () => setActive(state.activeIndex + 1));
}

function setupKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') setActive(state.activeIndex - 1);
    if (e.key === 'ArrowRight') setActive(state.activeIndex + 1);
  });
}

function setupTouchSwipe() {
  const detail = document.getElementById('detailSection');
  let startX = 0;
  detail.addEventListener('touchstart', (e) => { startX = e.changedTouches[0].screenX; }, { passive: true });
  detail.addEventListener('touchend', (e) => {
    const diff = startX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      setActive(state.activeIndex + (diff > 0 ? 1 : -1));
    }
  }, { passive: true });
}

function setupChartFilters() {
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.chartRange = parseInt(btn.dataset.range);
      const estacao = state.estacoes[state.activeIndex];
      state.chart = renderChart(estacao, state.historico, state.chartRange, state.chart);
    });
  });
}

async function init() {
  try {
    const data = await fetchDados();
    state.estacoes = data.estacoes.sort((a, b) => {
      const idxA = ESTACOES.findIndex((e) => e.codigo === a.codigo);
      const idxB = ESTACOES.findIndex((e) => e.codigo === b.codigo);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });
    state.historico = data.historico;

    if (!state.estacoes.length) {
      showToast('Nenhuma estação encontrada. Verifique se o cron já foi executado.');
      return;
    }

    renderCarousel(state.estacoes, 0, setActive);
    renderDetalhe(state.estacoes[0], state.historico);
    state.chart = renderChart(state.estacoes[0], state.historico, state.chartRange, state.chart);
    requestNotificacao(state.estacoes[0]);

    setupCarouselButtons();
    setupKeyboard();
    setupTouchSwipe();
    setupChartFilters();
  } catch (err) {
    document.querySelector('.app').innerHTML = `
      <div class="detail-card" style="text-align:center;padding:48px 24px;margin-top:40px;">
        <i class="fas fa-exclamation-triangle" style="font-size:2.5rem;color:var(--red);margin-bottom:12px;"></i>
        <p style="color:var(--text-dim);font-size:0.85rem;font-family:'JetBrains Mono',monospace;">${err.message}</p>
        <p style="color:var(--text-muted);font-size:0.7rem;margin-top:12px;">Tente novamente mais tarde</p>
      </div>`;
  }
}

document.addEventListener('DOMContentLoaded', init);
