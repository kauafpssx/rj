import { CONFIG } from './config.js';

export async function requestNotificacao(estacao) {
  if (!('Notification' in window)) return;

  const last = localStorage.getItem(CONFIG.NOTIFICATION_KEY);
  const today = new Date().toDateString();
  if (last === today) return;

  if (Notification.permission === 'granted') {
    enviarNotificacao(estacao);
    localStorage.setItem(CONFIG.NOTIFICATION_KEY, today);
  } else if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      enviarNotificacao(estacao);
      localStorage.setItem(CONFIG.NOTIFICATION_KEY, today);
    }
  }
}

function enviarNotificacao(estacao) {
  new Notification(`🌊 ${estacao.nome}`, {
    body: `Nível: ${estacao.nivel.toFixed(2)}m | ${estacao.municipio}`,
    icon: './favicon.ico',
  });
}
