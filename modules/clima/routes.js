const express = require('express');
const { readJSON } = require('../../lib/storage');
const { CLIMA_PATH } = require('./index');

const router = express.Router();

router.get('/', (req, res) => {
  const clima = readJSON(CLIMA_PATH, null);
  if (!clima) return res.status(404).json({ error: 'clima ainda não coletado' });
  res.json(clima);
});

module.exports = router;
