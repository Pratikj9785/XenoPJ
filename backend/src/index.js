const app = require('./app');
const { config } = require('./config');
const scheduler = require('./services/scheduler');

const PORT = process.env.PORT || 4000;

// Export app for Vercel serverless functions
module.exports = app;

// Only listen locally (e.g. dev)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, async () => {
    console.log(`Backend running at http://localhost:${PORT}`);
    await scheduler.schedulePeriodicSync();
    console.log('Scheduler initialized successfully');
  });
}
