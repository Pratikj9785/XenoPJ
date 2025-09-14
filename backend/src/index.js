const app = require("./app");
const scheduler = require("./services/scheduler");

(async () => {
  try {
    await scheduler.schedulePeriodicSync();
    console.log("Scheduler initialized successfully");
  } catch (err) {
    console.error("Scheduler init failed:", err);
  }
})();

module.exports = app;
