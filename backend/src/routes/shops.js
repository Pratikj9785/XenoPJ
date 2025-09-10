const express = require('express');
const prisma = require('../services/prismaClient');

const router = express.Router();

// Create tenant (demo only, normally admin action)
router.post('/tenants', async (req, res) => {
  try {
    const { name, emailDomain } = req.body;
    const tenant = await prisma.tenant.create({
      data: { name, emailDomain },
    });
    res.json(tenant);
  } catch (e) {
    console.error(e);
    res.status(500).send('error');
  }
});

// Register a shop for a tenant
router.post('/shops', async (req, res) => {
  try {
    const { tenantId, shopDomain, accessToken } = req.body;
    const shop = await prisma.shop.create({
      data: { tenantId, shopDomain, accessToken },
    });
    res.json(shop);
  } catch (e) {
    console.error(e);
    res.status(500).send('error');
  }
});

// List all shops for a tenant
router.get('/shops', async (req, res) => {
  try {
    const { tenantId } = req.query;
    const shops = await prisma.shop.findMany({ where: { tenantId } });
    res.json(shops);
  } catch (e) {
    console.error(e);
    res.status(500).send('error');
  }
});

module.exports = router;
