const express = require('express');
const cors = require('cors');
const { PORT, ALLOWED_ORIGINS } = require('./config');

const aguaRoutes = require('./modules/agua/routes');
const climaRoutes = require('./modules/clima/routes');
const liveRoutes = require('./modules/live/routes');

const app = express();

app.use(cors({
  origin(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error('Origem não permitida'));
  },
}));

app.get('/', (req, res) => res.json({ status: 'ok' }));

app.use('/agua', aguaRoutes);
app.use('/clima', climaRoutes);
app.use('/live', liveRoutes);

app.listen(PORT, () => {
  console.log(`[server] rodando na porta ${PORT}`);
});
