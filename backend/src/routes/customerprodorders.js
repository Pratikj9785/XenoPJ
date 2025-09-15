const express = require('express');
const prisma = require('../services/prismaClient');
const auth = require('../middleware/auth');

const router = express.Router();

// Utility to fetch tenant id once per request
async function getTenantId(shopId) {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { tenantId: true },
  });
  return shop?.tenantId;
}

// -------------------- Customers --------------------
router.post('/customers', auth, async (req, res) => {
  try {
    const { shopId, records = [] } = req.body;
    if (!shopId || !Array.isArray(records)) {
      return res.status(400).json({ message: 'shopId and records[] required' });
    }

    const tenantId = await getTenantId(shopId);
    let inserted = 0,
      updated = 0;

    for (const c of records) {
      const result = await prisma.customer.upsert({
        where: {
          shopId_shopifyId: { shopId, shopifyId: BigInt(c.shopifyId) },
        },
        update: {
          email: c.email,
          firstName: c.firstName,
          lastName: c.lastName,
          totalSpent: c.totalSpent || 0,
          ordersCount: c.ordersCount || 0,
        },
        create: {
          tenantId,
          shopId,
          shopifyId: BigInt(c.shopifyId),
          email: c.email,
          firstName: c.firstName,
          lastName: c.lastName,
          totalSpent: c.totalSpent || 0,
          ordersCount: c.ordersCount || 0,
        },
      });
      if (result.createdAt?.getTime() === result.updatedAt?.getTime()) inserted++;
      else updated++;
    }

    res.json({ inserted, updated });
  } catch (error) {
    console.error('Error inserting customers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// -------------------- Products --------------------
router.post('/products', auth, async (req, res) => {
  try {
    const { shopId, records = [] } = req.body;
    if (!shopId || !Array.isArray(records)) {
      return res.status(400).json({ message: 'shopId and records[] required' });
    }
    const tenantId = await getTenantId(shopId);
    let inserted = 0,
      updated = 0;

    for (const p of records) {
      const result = await prisma.product.upsert({
        where: {
          shopId_shopifyId: { shopId, shopifyId: BigInt(p.shopifyId) },
        },
        update: {
          title: p.title,
          status: p.status,
          vendor: p.vendor,
          productType: p.productType,
          priceMin: p.priceMin,
          priceMax: p.priceMax,
        },
        create: {
          tenantId,
          shopId,
          shopifyId: BigInt(p.shopifyId),
          title: p.title,
          status: p.status,
          vendor: p.vendor,
          productType: p.productType,
          priceMin: p.priceMin,
          priceMax: p.priceMax,
        },
      });
      if (result.createdAt?.getTime() === result.updatedAt?.getTime()) inserted++;
      else updated++;
    }

    res.json({ inserted, updated });
  } catch (error) {
    console.error('Error inserting products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// -------------------- Orders --------------------
router.post('/orders', auth, async (req, res) => {
  try {
    const { shopId, records = [] } = req.body;
    if (!shopId || !Array.isArray(records)) {
      return res.status(400).json({ message: 'shopId and records[] required' });
    }
    const tenantId = await getTenantId(shopId);
    let inserted = 0,
      updated = 0;

    for (const o of records) {
      // map customer
      let customerId = null;
      if (o.customerShopifyId) {
        const cust = await prisma.customer.findUnique({
          where: {
            shopId_shopifyId: { shopId, shopifyId: BigInt(o.customerShopifyId) },
          },
          select: { id: true },
        });
        customerId = cust?.id || null;
      }

      const order = await prisma.order.upsert({
        where: {
          shopId_shopifyId: { shopId, shopifyId: BigInt(o.shopifyId) },
        },
        update: {
          customerId,
          currency: o.currency,
          totalPrice: o.totalPrice || 0,
          subtotalPrice: o.subtotalPrice,
          totalTax: o.totalTax,
          totalDiscount: o.totalDiscount,
          processedAt: o.processedAt ? new Date(o.processedAt) : null,
        },
        create: {
          tenantId,
          shopId,
          shopifyId: BigInt(o.shopifyId),
          customerId,
          currency: o.currency,
          totalPrice: o.totalPrice || 0,
          subtotalPrice: o.subtotalPrice,
          totalTax: o.totalTax,
          totalDiscount: o.totalDiscount,
          processedAt: o.processedAt ? new Date(o.processedAt) : null,
        },
      });

      // Replace line items
      await prisma.orderLineItem.deleteMany({ where: { orderId: order.id } });

      const lineItems = o.lineItems || [];
      for (const li of lineItems) {
        // map product
        let productId = null;
        if (li.productShopifyId) {
          const prod = await prisma.product.findUnique({
            where: {
              shopId_shopifyId: { shopId, shopifyId: BigInt(li.productShopifyId) },
            },
            select: { id: true },
          });
          productId = prod?.id || null;
        }

        await prisma.orderLineItem.create({
          data: {
            orderId: order.id,
            productId,
            variantId: li.variantId ? BigInt(li.variantId) : null,
            quantity: li.quantity,
            price: li.price,
            title: li.title,
          },
        });
      }

      if (order.createdAt?.getTime() === order.updatedAt?.getTime()) inserted++;
      else updated++;
    }

    res.json({ inserted, updated });
  } catch (error) {
    console.error('Error inserting orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
