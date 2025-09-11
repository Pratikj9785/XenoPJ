const app = require('./app');
const { config } = require('./config');
const scheduler = require('./services/scheduler');

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`Backend running at http://localhost:${PORT}`);
  
  // Initialize scheduler
  await scheduler.schedulePeriodicSync();
  console.log('Scheduler initialized successfully');
});
