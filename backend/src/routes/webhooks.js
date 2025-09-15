const express = require('express');
const crypto = require('crypto');
const prisma = require('../services/prismaClient');
const { config } = require('../config');

const router = express.Router();

function verifyHmac(raw, hmac) {
  const digest = crypto
    .createHmac('sha256', config.webhookSecret)
    .update(raw, 'utf8')
    .digest('base64');
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac));
  } catch (e) {
    return false;
  }
}

// Shopify will send raw JSON, so we need express.raw()
router.post('/:topic', express.raw({ type: '*/*' }), async (req, res) => {
  try {
    const topic = req.params.topic; // e.g. "orders/create"
    const hmac = req.header('X-Shopify-Hmac-Sha256') || '';
    const shopDomain = req.header('X-Shopify-Shop-Domain');
    const rawBody = req.body.toString('utf8');

    // if (!verifyHmac(rawBody, hmac)) {
    //   return res.status(401).send('Invalid HMAC');
    // }

    const shop = await prisma.shop.findUnique({ where: { shopDomain } });
    if (!shop) return res.status(404).send('Shop not registered');

    const payload = JSON.parse(rawBody);

    // Save raw event
    await prisma.webhookEvent.create({
      data: {
        tenantId: shop.tenantId,
        shopId: shop.id,
        topic,
        payload,
      },
    });

    // Basic upsert demo (extend as needed)
    if (topic.startsWith('customers')) {
      const c = payload;
      await prisma.customer.upsert({
        where: { shopId_shopifyId: { shopId: shop.id, shopifyId: BigInt(c.id) } },
        update: {
          email: c.email,
          firstName: c.first_name,
          lastName: c.last_name,
          totalSpent: c.total_spent || 0,
          ordersCount: c.orders_count || 0,
        },
        create: {
          tenantId: shop.tenantId,
          shopId: shop.id,
          shopifyId: BigInt(c.id),
          email: c.email,
          firstName: c.first_name,
          lastName: c.last_name,
          totalSpent: c.total_spent || 0,
          ordersCount: c.orders_count || 0,
        },
      });
    }

    if (topic.startsWith('orders')) {
      const o = payload;
      const processedAtStr = o.processed_at || o.closed_at || o.updated_at || o.created_at || null;
      await prisma.order.upsert({
        where: { shopId_shopifyId: { shopId: shop.id, shopifyId: BigInt(o.id) } },
        update: {
          totalPrice: o.total_price,
          processedAt: processedAtStr ? new Date(processedAtStr) : null,
        },
        create: {
          tenantId: shop.tenantId,
          shopId: shop.id,
          shopifyId: BigInt(o.id),
          totalPrice: o.total_price,
          processedAt: processedAtStr ? new Date(processedAtStr) : null,
        },
      });
    }

    if (topic.startsWith('products')) {
      const p = payload;
      await prisma.product.upsert({
        where: { shopId_shopifyId: { shopId: shop.id, shopifyId: BigInt(p.id) } },
        update: { title: p.title, status: p.status },
        create: {
          tenantId: shop.tenantId,
          shopId: shop.id,
          shopifyId: BigInt(p.id),
          title: p.title,
          status: p.status,
        },
      });
    }

    return res.send('ok');
  } catch (err) {
    console.error(err);
    return res.status(500).send('error');
  }
});

module.exports = router;
