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
// Mount webhooks BEFORE JSON parser so raw body is available for HMAC verification
app.use('/webhooks', webhooks);
app.use(bodyParser.json({ limit: '5mb' }));

app.use('/api/auth', auth);
app.use('/api', shops);
app.use('/api/ingest', ingest);
app.use('/api/metrics', metrics);

app.get('/health', (_, res) => res.json({ ok: true }));

module.exports = app;
