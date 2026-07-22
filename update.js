const agua = require('./modules/agua');
const clima = require('./modules/clima');
const live = require('./modules/live');

const MODULOS = [
  { nome: 'agua', coletar: agua.coletar },
  { nome: 'clima', coletar: clima.coletar },
  { nome: 'live', coletar: live.coletar },
];

async function run() {
  const resultados = await Promise.allSettled(MODULOS.map((m) => m.coletar()));

  let falhas = 0;
  resultados.forEach((r, i) => {
    if (r.status === 'rejected') {
      falhas++;
      console.error(`[update] ${MODULOS[i].nome} falhou:`, r.reason?.message || r.reason);
    }
  });

  console.log(`[update] finalizado: ${MODULOS.length - falhas}/${MODULOS.length} módulos ok.`);
  process.exit(falhas === MODULOS.length ? 1 : 0);
}

run();
