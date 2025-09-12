const cron = require('node-cron');
const prisma = require('./prismaClient');
const { deltaSync } = require('./ingest');

class Scheduler {
  constructor() {
    this.jobs = new Map();
  }

  // Schedule periodic sync for all active shops
  async schedulePeriodicSync() {
    console.log('Setting up periodic sync scheduler...');
    
    // Run every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      console.log('Running scheduled delta sync...');
      await this.runDeltaSyncForAllShops();
    });

    // Run full sync every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      console.log('Running scheduled full sync...');
      await this.runFullSyncForAllShops();
    });
  }

  async runDeltaSyncForAllShops() {
    try {
      const shops = await prisma.shop.findMany({
        where: { isActive: true },
        select: { id: true, shopDomain: true, tenantId: true }
      });

      for (const shop of shops) {
        try {
          console.log(`Running delta sync for shop: ${shop.shopDomain}`);
          
          // Create job record
          const job = await prisma.ingestionJob.create({
            data: {
              tenantId: shop.tenantId,
              shopId: shop.id,
              type: 'scheduled-delta',
              status: 'running',
              startedAt: new Date()
            }
          });

          // Run delta sync
          await deltaSync(shop.id);
          
          // Update job status
          await prisma.ingestionJob.update({
            where: { id: job.id },
            data: { 
              status: 'success', 
              finishedAt: new Date() 
            }
          });

          console.log(`Delta sync completed for shop: ${shop.shopDomain}`);
        } catch (error) {
          console.error(`Delta sync failed for shop ${shop.shopDomain}:`, error);
          
          // Update job status to failed (find latest running job for this shop)
          const latestRunning = await prisma.ingestionJob.findFirst({
            where: { shopId: shop.id, status: 'running' },
            orderBy: { startedAt: 'desc' }
          });
          if (latestRunning) {
            await prisma.ingestionJob.update({
              where: { id: latestRunning.id },
              data: { 
                status: 'failed', 
                finishedAt: new Date(),
                detail: { error: String(error) }
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Scheduled delta sync error:', error);
    }
  }

  async runFullSyncForAllShops() {
    try {
      const shops = await prisma.shop.findMany({
        where: { isActive: true },
        select: { id: true, shopDomain: true, tenantId: true }
      });

      for (const shop of shops) {
        try {
          console.log(`Running full sync for shop: ${shop.shopDomain}`);
          
          // Create job record
          const job = await prisma.ingestionJob.create({
            data: {
              tenantId: shop.tenantId,
              shopId: shop.id,
              type: 'scheduled-full',
              status: 'running',
              startedAt: new Date()
            }
          });

          // Run full sync (import fullSync from ingest service)
          const { fullSync } = require('./ingest');
          await fullSync(shop.id);
          
          // Update job status
          await prisma.ingestionJob.update({
            where: { id: job.id },
            data: { 
              status: 'success', 
              finishedAt: new Date() 
            }
          });

          console.log(`Full sync completed for shop: ${shop.shopDomain}`);
        } catch (error) {
          console.error(`Full sync failed for shop ${shop.shopDomain}:`, error);
          
          // Update job status to failed (find latest running job for this shop)
          const latestRunning = await prisma.ingestionJob.findFirst({
            where: { shopId: shop.id, status: 'running' },
            orderBy: { startedAt: 'desc' }
          });
          if (latestRunning) {
            await prisma.ingestionJob.update({
              where: { id: latestRunning.id },
              data: { 
                status: 'failed', 
                finishedAt: new Date(),
                detail: { error: String(error) }
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Scheduled full sync error:', error);
    }
  }

  // Schedule custom sync for a specific shop
  scheduleShopSync(shopId, interval = '*/30 * * * *') {
    const job = cron.schedule(interval, async () => {
      try {
        const shop = await prisma.shop.findUnique({
          where: { id: shopId },
          select: { shopDomain: true, tenantId: true }
        });

        if (!shop) {
          console.error(`Shop ${shopId} not found`);
          return;
        }

        console.log(`Running custom sync for shop: ${shop.shopDomain}`);
        await deltaSync(shopId);
      } catch (error) {
        console.error(`Custom sync failed for shop ${shopId}:`, error);
      }
    }, {
      scheduled: false
    });

    this.jobs.set(shopId, job);
    return job;
  }

  // Start custom sync job for a shop
  startShopSync(shopId, interval = '*/30 * * * *') {
    const existingJob = this.jobs.get(shopId);
    if (existingJob) {
      existingJob.start();
    } else {
      const job = this.scheduleShopSync(shopId, interval);
      job.start();
    }
  }

  // Stop custom sync job for a shop
  stopShopSync(shopId) {
    const job = this.jobs.get(shopId);
    if (job) {
      job.stop();
    }
  }

  // Get sync status for all shops
  async getSyncStatus() {
    const shops = await prisma.shop.findMany({
      select: {
        id: true,
        shopDomain: true,
        isActive: true,
        lastSyncAt: true,
        ingestionJobs: {
          take: 5,
          orderBy: { startedAt: 'desc' },
          select: {
            type: true,
            status: true,
            startedAt: true,
            finishedAt: true
          }
        }
      }
    });

    return shops.map(shop => ({
      ...shop,
      hasScheduledJob: this.jobs.has(shop.id)
    }));
  }
}

module.exports = new Scheduler();
