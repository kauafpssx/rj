import { CONFIG } from './config.js?v=4';

const WATCH_INTERVAL = 5 * 60 * 1000;

async function fetchLive() {
  try {
    const res = await fetch(CONFIG.LIVE_PATH, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Live: falhou buscar câmera ativa.', err.message);
    return null;
  }
}

function playerParams() {
  const origin = encodeURIComponent(location.origin);
  return `autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&iv_load_policy=3&enablejsapi=1&origin=${origin}`;
}

function embedUrl({ videoId, fallbackChannel }) {
  const params = playerParams();
  if (videoId) return `https://www.youtube.com/embed/${videoId}?${params}`;
  return `https://www.youtube.com/embed/live_stream?channel=${fallbackChannel}&${params}`;
}

function sendCommand(iframe, func, args = []) {
  iframe.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
}

function enforcePlayerState(iframe) {
  let tries = 0;
  const id = setInterval(() => {
    sendCommand(iframe, 'mute');
    sendCommand(iframe, 'playVideo');
    sendCommand(iframe, 'setPlaybackQuality', ['hd2160']);
    tries++;
    if (tries >= 10) clearInterval(id);
  }, 1500);
}

const LOADING_COVER_MS = 5000;

export function initLivePlayer() {
  const iframe = document.getElementById('liveIframe');
  const overlay = document.getElementById('liveOverlay');
  if (!iframe) return;

  let lastId = null;

  async function refresh() {
    const live = await fetchLive();
    if (!live) return;

    if (live.videoId === lastId) {
      sendCommand(iframe, 'playVideo');
      sendCommand(iframe, 'mute');
      return;
    }
    lastId = live.videoId;

    overlay?.classList.add('loading');
    iframe.src = embedUrl(live);
    iframe.addEventListener('load', () => {
      enforcePlayerState(iframe);
      setTimeout(() => overlay?.classList.remove('loading'), LOADING_COVER_MS);
    }, { once: true });
  }

  refresh();
  setInterval(refresh, WATCH_INTERVAL);
}
