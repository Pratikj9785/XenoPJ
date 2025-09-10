const prisma = require('./prismaClient');
const { shopifyFetch, shopifyFetchRaw, parseNextPageInfo } = require('./shopify');

async function paginate(shop, path, initialQuery, arrayKey) {
  const results = [];
  let query = { ...initialQuery };
  while (true) {
    const { json, link } = await shopifyFetchRaw(shop.shopDomain, shop.accessToken, path, query);
    const items = json[arrayKey] || [];
    results.push(...items);
    const next = parseNextPageInfo(link);
    if (!next) break;
    query = { limit: String(initialQuery.limit || 250), page_info: next };
  }
  return results;
}

async function upsertCustomers(shop, customers) {
  for (const c of customers) {
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
}

async function upsertProducts(shop, products) {
  for (const p of products) {
    let priceMin = null;
    let priceMax = null;
    if (Array.isArray(p.variants) && p.variants.length > 0) {
      const prices = p.variants.map(v => Number(v.price)).filter(n => !Number.isNaN(n));
      if (prices.length > 0) {
        priceMin = Math.min(...prices);
        priceMax = Math.max(...prices);
      }
    }

    await prisma.product.upsert({
      where: { shopId_shopifyId: { shopId: shop.id, shopifyId: BigInt(p.id) } },
      update: {
        title: p.title,
        status: p.status,
        vendor: p.vendor || null,
        productType: p.product_type || null,
        priceMin: priceMin,
        priceMax: priceMax,
      },
      create: {
        tenantId: shop.tenantId,
        shopId: shop.id,
        shopifyId: BigInt(p.id),
        title: p.title,
        status: p.status,
        vendor: p.vendor || null,
        productType: p.product_type || null,
        priceMin: priceMin,
        priceMax: priceMax,
      },
    });
  }
}

async function upsertOrders(shop, orders) {
  for (const o of orders) {
    let customerId = null;
    if (o.customer && o.customer.id) {
      const cust = await prisma.customer.findUnique({
        where: { shopId_shopifyId: { shopId: shop.id, shopifyId: BigInt(o.customer.id) } },
      });
      if (cust) customerId = cust.id;
    }

    const order = await prisma.order.upsert({
      where: { shopId_shopifyId: { shopId: shop.id, shopifyId: BigInt(o.id) } },
      update: {
        customerId,
        currency: o.currency || null,
        totalPrice: o.total_price || 0,
        subtotalPrice: o.subtotal_price || null,
        totalTax: o.total_tax || null,
        totalDiscount: o.total_discounts || null,
        processedAt: o.processed_at ? new Date(o.processed_at) : null,
      },
      create: {
        tenantId: shop.tenantId,
        shopId: shop.id,
        shopifyId: BigInt(o.id),
        customerId,
        currency: o.currency || null,
        totalPrice: o.total_price || 0,
        subtotalPrice: o.subtotal_price || null,
        totalTax: o.total_tax || null,
        totalDiscount: o.total_discounts || null,
        processedAt: o.processed_at ? new Date(o.processed_at) : null,
      },
    });

    await prisma.orderLineItem.deleteMany({ where: { orderId: order.id } });
    for (const li of o.line_items || []) {
      let productId = null;
      if (li.product_id) {
        const prod = await prisma.product.findUnique({
          where: { shopId_shopifyId: { shopId: shop.id, shopifyId: BigInt(li.product_id) } },
        });
        if (prod) productId = prod.id;
      }

      await prisma.orderLineItem.create({
        data: {
          orderId: order.id,
          productId,
          variantId: li.variant_id ? BigInt(li.variant_id) : null,
          quantity: li.quantity,
          price: li.price,
          title: li.title || null,
        },
      });
    }
  }
}

async function fullSync(shopId) {
  const shop = await prisma.shop.findUniqueOrThrow({ where: { id: shopId } });

  const customers = await paginate(shop, 'customers', { limit: 250 }, 'customers');
  await upsertCustomers(shop, customers);

  const products = await paginate(shop, 'products', { limit: 250 }, 'products');
  await upsertProducts(shop, products);

  const orders = await paginate(shop, 'orders', { limit: 250, status: 'any' }, 'orders');
  await upsertOrders(shop, orders);

  await prisma.shop.update({ where: { id: shop.id }, data: { lastSyncedAt: new Date() } });
  return { ok: true };
}

async function deltaSync(shopId) {
  const shop = await prisma.shop.findUniqueOrThrow({ where: { id: shopId } });
  const since = shop.lastSyncedAt ? new Date(shop.lastSyncedAt) : null;
  const updated_at_min = since ? since.toISOString() : null;

  const custQuery = updated_at_min ? { limit: 250, updated_at_min } : { limit: 250 };
  const customers = await paginate(shop, 'customers', custQuery, 'customers');
  await upsertCustomers(shop, customers);

  const prodQuery = updated_at_min ? { limit: 250, updated_at_min } : { limit: 250 };
  const products = await paginate(shop, 'products', prodQuery, 'products');
  await upsertProducts(shop, products);

  const orderQuery = updated_at_min ? { limit: 250, status: 'any', updated_at_min } : { limit: 250, status: 'any' };
  const orders = await paginate(shop, 'orders', orderQuery, 'orders');
  await upsertOrders(shop, orders);

  await prisma.shop.update({ where: { id: shop.id }, data: { lastSyncedAt: new Date() } });
  return { ok: true };
}

module.exports = { fullSync, deltaSync };
