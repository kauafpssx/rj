const express = require('express');
const { readJSON } = require('../../lib/storage');
const { DADOS_PATH, historicoPath } = require('./index');
const { ESTACOES } = require('../../config');

const router = express.Router();

router.get('/dados', (req, res) => {
  const dados = readJSON(DADOS_PATH, null);
  if (!dados) return res.status(404).json({ error: 'dados ainda não coletados' });
  res.json(dados);
});

router.get('/historico/:codigo', (req, res) => {
  const codigo = Number(req.params.codigo);
  const valido = ESTACOES.some((e) => e.codigo === codigo);
  if (!valido) return res.status(404).json({ error: 'estação desconhecida' });

  const historico = readJSON(historicoPath(codigo), []);
  res.json(historico);
});

module.exports = router;
