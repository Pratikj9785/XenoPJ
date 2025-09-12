exports.config = {
  dbUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'secret',
  appUrl: process.env.APP_URL || 'http://localhost:4000',
  // Prefer Shopify API Secret for webhook HMAC verification; fallback to WEBHOOK_SECRET for legacy setups
  shopifyApiSecret: process.env.SHOPIFY_API_SECRET,
  webhookSecret: process.env.WEBHOOK_SECRET || process.env.SHOPIFY_API_SECRET || 'webhook-secret',
};
