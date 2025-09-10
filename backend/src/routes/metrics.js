const express = require('express');
const prisma = require('../services/prismaClient');
const router = express.Router();

router.get('/overview', async (req, res) => {
  try {
    const { shopId, from, to } = req.query;
    const totalCustomers = await prisma.customer.count({ where: { shopId } });
    const totalOrders = await prisma.order.count({
      where: { shopId, processedAt: { gte: new Date(from), lte: new Date(to) } },
    });
    const revenueAgg = await prisma.order.aggregate({
      _sum: { totalPrice: true },
      where: { shopId, processedAt: { gte: new Date(from), lte: new Date(to) } },
    });
    res.json({ totalCustomers, totalOrders, totalRevenue: revenueAgg._sum.totalPrice || 0 });
  } catch (e) {
    console.error(e);
    res.status(500).send('error');
  }
});

router.get('/orders-by-date', async (req, res) => {
  try {
    const { shopId, from, to } = req.query;
    const rows = await prisma.$queryRawUnsafe(
      `SELECT date_trunc('day', "processedAt") AS day,
              COUNT(*)::int AS orders,
              COALESCE(SUM("totalPrice"), 0) AS revenue
       FROM "Order"
       WHERE "shopId" = $1 AND "processedAt" BETWEEN $2 AND $3
       GROUP BY 1
       ORDER BY 1`,
      shopId,
      from,
      to
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('error');
  }
});

router.get('/top-customers', async (req, res) => {
  try {
    const { shopId, limit = 5 } = req.query;
    const rows = await prisma.customer.findMany({
      where: { shopId },
      orderBy: { totalSpent: 'desc' },
      take: Number(limit),
    });
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('error');
  }
});

module.exports = router;
