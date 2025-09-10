const express = require('express');
const prisma = require('../services/prismaClient');
const { fullSync, deltaSync } = require('../services/ingest');

const router = express.Router();

// Trigger ingestion (full-sync or delta)
router.post('/run', async (req, res) => {
  try {
    const { shopId, type } = req.body;

    const job = await prisma.ingestionJob.create({
      data: { tenantId: 'demo-tenant', shopId, type, status: 'pending', startedAt: new Date() },
    });

    if (type === 'full-sync' || type === 'delta') {
      await prisma.ingestionJob.update({ where: { id: job.id }, data: { status: 'running' } });
      try {
        if (type === 'full-sync') {
          await fullSync(shopId);
        } else {
          await deltaSync(shopId);
        }
        await prisma.ingestionJob.update({ where: { id: job.id }, data: { status: 'success', finishedAt: new Date() } });
      } catch (err) {
        console.error(err);
        await prisma.ingestionJob.update({ where: { id: job.id }, data: { status: 'failed', finishedAt: new Date(), detail: { error: String(err) } } });
      }
    }

    res.json(job);
  } catch (e) {
    console.error(e);
    res.status(500).send('error');
  }
});

module.exports = router;
