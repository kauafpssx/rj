const axios = require('axios');
const path = require('node:path');
const { ESTACOES, DATA_DIR } = require('../../config');
const { writeJSON } = require('../../lib/storage');

const CLIMA_API = 'https://api.open-meteo.com/v1/forecast';

const CLIMA_DIR = path.join(DATA_DIR, 'clima');
const CLIMA_PATH = path.join(CLIMA_DIR, 'clima.json');

const WEATHER_LABELS = {
  0: 'Céu limpo', 1: 'Poucas nuvens', 2: 'Parc. nublado', 3: 'Nublado',
  45: 'Neblina', 48: 'Neblina densa',
  51: 'Garoa fraca', 53: 'Garoa', 55: 'Garoa forte',
  56: 'Garoa gelada', 57: 'Garoa gelada forte',
  61: 'Chuva fraca', 63: 'Chuva', 65: 'Chuva forte',
  66: 'Chuva gelada', 67: 'Chuva gelada forte',
  71: 'Neve fraca', 73: 'Neve', 75: 'Neve forte', 77: 'Granizo fino',
  80: 'Pancadas fracas', 81: 'Pancadas', 82: 'Pancadas fortes',
  85: 'Pancadas de neve', 86: 'Pancadas de neve fortes',
  95: 'Tempestade', 96: 'Tempestade c/ granizo', 99: 'Tempestade c/ granizo forte',
};

async function fetchClima() {
  const lats = ESTACOES.map((e) => e.lat).join(',');
  const lons = ESTACOES.map((e) => e.lon).join(',');
  const url = `${CLIMA_API}?latitude=${lats}&longitude=${lons}&current=temperature_2m,weather_code,wind_speed_10m,wind_gusts_10m,precipitation&hourly=precipitation_probability&forecast_days=1&timezone=America%2FSao_Paulo`;
  const { data } = await axios.get(url, { timeout: 15000 });
  if (!Array.isArray(data) || data.length !== ESTACOES.length) {
    throw new Error('resposta inválida da Open-Meteo');
  }

  const clima = {};
  for (let i = 0; i < ESTACOES.length; i++) {
    const e = ESTACOES[i];
    const r = data[i];
    const cur = r.current;
    const hourIdx = r.hourly.time.indexOf(`${cur.time.slice(0, 13)}:00`);
    const chuvaProb = hourIdx >= 0 ? r.hourly.precipitation_probability[hourIdx] : null;

    clima[e.codigo] = {
      t: cur.temperature_2m,
      w: cur.weather_code,
      c: WEATHER_LABELS[cur.weather_code] || 'Indefinido',
      v: cur.wind_speed_10m,
      vr: cur.wind_gusts_10m,
      p: cur.precipitation,
      pp: chuvaProb,
    };
  }

  return clima;
}

async function coletar() {
  console.log('[clima] buscando Open-Meteo...');
  const clima = await fetchClima();
  writeJSON(CLIMA_PATH, { s: new Date().toISOString(), c: clima });
  console.log('[clima] concluído!');
}

module.exports = { coletar, CLIMA_DIR, CLIMA_PATH };
