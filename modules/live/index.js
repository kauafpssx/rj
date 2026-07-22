const axios = require('axios');
const path = require('node:path');
const { DATA_DIR } = require('../../config');
const { writeJSON } = require('../../lib/storage');

const SOURCE_URL = 'http://www.pordosolguaiba.com.br/';
const FALLBACK_CHANNEL = 'UCqI8nU3-dstxAS3YCXhKuPg';

const LIVE_DIR = path.join(DATA_DIR, 'live');
const LIVE_PATH = path.join(LIVE_DIR, 'live.json');

function extractVideoId(html) {
  const clean = html.replace(/<!--[\s\S]*?-->/g, '');
  const start = clean.search(/C[âa]mera\s*1/i);
  if (start === -1) return null;

  const rest = clean.slice(start);
  const endOffset = rest.slice(1).search(/C[âa]mera\s*2/i);
  const section = endOffset === -1 ? rest : rest.slice(0, endOffset + 1);

  const ids = [...section.matchAll(/embed\/([a-zA-Z0-9_-]{6,20})["'?]/g)].map((m) => m[1]);
  return ids.find((id) => id !== 'live_stream') || null;
}

async function coletar() {
  console.log('[live] verificando câmera ativa...');
  const { data: html } = await axios.get(SOURCE_URL, {
    timeout: 15000,
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' },
  });

  const videoId = extractVideoId(html);
  writeJSON(LIVE_PATH, {
    videoId: videoId || null,
    fallbackChannel: FALLBACK_CHANNEL,
    s: new Date().toISOString(),
  });

  console.log(videoId ? `[live] concluído! videoId=${videoId}` : '[live] não encontrou câmera 1, usando fallback.');
}

module.exports = { coletar, LIVE_DIR, LIVE_PATH };
