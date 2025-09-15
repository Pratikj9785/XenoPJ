const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const auth = require('./routes/auth');
const shops = require('./routes/shops');
const ingest = require('./routes/ingest');
const metrics = require('./routes/metrics');
const webhooks = require('./routes/webhooks');
const fake = require('./routes/fake');

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || '*',
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: false,
}));

// Mount webhooks BEFORE json parser to preserve raw body for HMAC verification
app.use('/webhooks', webhooks);

// JSON parser for the rest of the app
app.use(bodyParser.json({ limit: '5mb' }));

app.use('/api/auth', auth);
app.use('/api', shops);
app.use('/api/ingest', ingest);
app.use('/api/metrics', metrics);
app.use('/api/fake', fake);

app.get('/health', (_, res) => res.json({ ok: true }));

module.exports = app;
