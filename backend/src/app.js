const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const auth = require('./routes/auth');
const shops = require('./routes/shops');
const ingest = require('./routes/ingest');
const metrics = require('./routes/metrics');
const webhooks = require('./routes/webhooks');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

app.use('/api/auth', auth);
app.use('/api', shops);
app.use('/api/ingest', ingest);
app.use('/api/metrics', metrics);
app.use('/webhooks', webhooks);

app.get('/health', (_, res) => res.json({ ok: true }));

module.exports = app;
