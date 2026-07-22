const express = require('express');
const { readJSON } = require('../../lib/storage');
const { LIVE_PATH } = require('./index');

const router = express.Router();

router.get('/', (req, res) => {
  const live = readJSON(LIVE_PATH, null);
  if (!live) return res.status(404).json({ error: 'live ainda não coletada' });
  res.json(live);
});

module.exports = router;
