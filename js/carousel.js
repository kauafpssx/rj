import { getStatusColor } from './config.js';

export function renderCarousel(estacoes, activeIndex, onSelect) {
  const el = document.getElementById('carousel');
  el.innerHTML = estacoes.map((e, i) => cardHTML(e, i, i === activeIndex)).join('');

  el.querySelectorAll('.carousel-card').forEach((card) => {
    card.addEventListener('click', () => {
      const i = parseInt(card.dataset.index);
      onSelect(i);
    });
  });
}

function cardHTML(e, i, isActive) {
  const pct = (e.nivel / e.cota_inundacao) * 100;
  const color = getStatusColor(pct);
  return `
    <div class="carousel-card glass ${isActive ? 'active' : ''}" data-index="${i}">
      <div class="card-city">${e.municipio}</div>
      <div class="card-nivel">${e.nivel.toFixed(2)}<small>m</small></div>
      <span class="card-status-dot" style="background: var(--${color})"></span>
    </div>
  `;
}

export function updateCardActive(activeIndex) {
  document.querySelectorAll('.carousel-card').forEach((card, idx) => {
    card.classList.toggle('active', idx === activeIndex);
  });
}

export function scrollToActive(index) {
  const cards = document.querySelectorAll('.carousel-card');
  const card = cards[index];
  if (card) {
    card.scrollIntoView({ inline: 'center', block: 'nearest' });
  }
}
