exports.config = {
  dbUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'secret',
  appUrl: process.env.APP_URL || 'http://localhost:4000',
  webhookSecret: process.env.WEBHOOK_SECRET || 'webhook-secret',
};
