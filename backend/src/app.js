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

// Add a root route for testing
app.get('/', (_, res) => res.json({ 
  message: 'Xeno Analytics API', 
  version: '1.0.0',
  endpoints: {
    auth: '/api/auth/*',
    shops: '/api/shops, /api/tenants',
    metrics: '/api/metrics/*',
    ingest: '/api/ingest/*',
    fake: '/api/fake/* (POST only)',
    webhooks: '/webhooks/*',
    health: '/health'
  }
}));

// Add a test route for fake endpoints
app.get('/api/fake', (_, res) => res.json({
  message: 'Fake data endpoints - POST only',
  endpoints: {
    customers: 'POST /api/fake/customers',
    products: 'POST /api/fake/products', 
    orders: 'POST /api/fake/orders'
  },
  example: {
    url: 'POST /api/fake/customers',
    headers: {
      'Authorization': 'Bearer <your-jwt-token>',
      'Content-Type': 'application/json'
    },
    body: {
      shopId: '<your-shop-id>',
      records: [
        {
          shopifyId: 101,
          email: 'amy@demo.io',
          firstName: 'Amy',
          lastName: 'Lee',
          totalSpent: 123.4,
          ordersCount: 5
        }
      ]
    }
  }
}));

module.exports = app;
