const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a demo tenant and shop
  const tenant = await prisma.tenant.upsert({
    where: { id: 'demo-tenant' },
    update: {},
    create: {
      id: 'demo-tenant',
      name: 'Demo Tenant',
      emailDomain: 'demo.com',
    },
  });

  const shop = await prisma.shop.upsert({
    where: { id: 'demo-shop' },
    update: {},
    create: {
      id: 'demo-shop',
      tenantId: tenant.id,
      shopDomain: 'demo-shop.myshopify.com',
      accessToken: 'demo-access-token',
      name: 'Demo Shop',
      isActive: true,
    },
  });

  // Create some demo customers with engagement scores
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { shopId_shopifyId: { shopId: shop.id, shopifyId: BigInt(1) } },
      update: {},
      create: {
        tenantId: tenant.id,
        shopId: shop.id,
        shopifyId: BigInt(1),
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        totalSpent: 450.00,
        ordersCount: 8,
        engagementScore: 85.5,
      },
    }),
    prisma.customer.upsert({
      where: { shopId_shopifyId: { shopId: shop.id, shopifyId: BigInt(2) } },
      update: {},
      create: {
        tenantId: tenant.id,
        shopId: shop.id,
        shopifyId: BigInt(2),
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        totalSpent: 680.00,
        ordersCount: 12,
        engagementScore: 92.3,
      },
    }),
    prisma.customer.upsert({
      where: { shopId_shopifyId: { shopId: shop.id, shopifyId: BigInt(3) } },
      update: {},
      create: {
        tenantId: tenant.id,
        shopId: shop.id,
        shopifyId: BigInt(3),
        email: 'mike.wilson@example.com',
        firstName: 'Mike',
        lastName: 'Wilson',
        totalSpent: 320.00,
        ordersCount: 5,
        engagementScore: 67.8,
      },
    }),
    prisma.customer.upsert({
      where: { shopId_shopifyId: { shopId: shop.id, shopifyId: BigInt(4) } },
      update: {},
      create: {
        tenantId: tenant.id,
        shopId: shop.id,
        shopifyId: BigInt(4),
        email: 'sarah.jones@example.com',
        firstName: 'Sarah',
        lastName: 'Jones',
        totalSpent: 890.00,
        ordersCount: 15,
        engagementScore: 95.1,
      },
    }),
    prisma.customer.upsert({
      where: { shopId_shopifyId: { shopId: shop.id, shopifyId: BigInt(5) } },
      update: {},
      create: {
        tenantId: tenant.id,
        shopId: shop.id,
        shopifyId: BigInt(5),
        email: 'alex.brown@example.com',
        firstName: 'Alex',
        lastName: 'Brown',
        totalSpent: 210.00,
        ordersCount: 3,
        engagementScore: 45.2,
      },
    }),
  ]);

  // Create some demo products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { shopId_shopifyId: { shopId: shop.id, shopifyId: BigInt(1) } },
      update: {},
      create: {
        tenantId: tenant.id,
        shopId: shop.id,
        shopifyId: BigInt(1),
        title: 'Premium Cotton T-Shirt',
        status: 'active',
        vendor: 'Fashion Co',
        productType: 'clothing',
        priceMin: 25.00,
        priceMax: 35.00,
      },
    }),
    prisma.product.upsert({
      where: { shopId_shopifyId: { shopId: shop.id, shopifyId: BigInt(2) } },
      update: {},
      create: {
        tenantId: tenant.id,
        shopId: shop.id,
        shopifyId: BigInt(2),
        title: 'Wireless Bluetooth Headphones',
        status: 'active',
        vendor: 'Tech Corp',
        productType: 'electronics',
        priceMin: 99.00,
        priceMax: 129.00,
      },
    }),
    prisma.product.upsert({
      where: { shopId_shopifyId: { shopId: shop.id, shopifyId: BigInt(3) } },
      update: {},
      create: {
        tenantId: tenant.id,
        shopId: shop.id,
        shopifyId: BigInt(3),
        title: 'Organic Coffee Beans',
        status: 'active',
        vendor: 'Coffee Roasters',
        productType: 'food',
        priceMin: 15.00,
        priceMax: 22.00,
      },
    }),
    prisma.product.upsert({
      where: { shopId_shopifyId: { shopId: shop.id, shopifyId: BigInt(4) } },
      update: {},
      create: {
        tenantId: tenant.id,
        shopId: shop.id,
        shopifyId: BigInt(4),
        title: 'Leather Wallet',
        status: 'active',
        vendor: 'Leather Works',
        productType: 'accessories',
        priceMin: 45.00,
        priceMax: 65.00,
      },
    }),
  ]);

  // Create some demo orders with different dates
  const orderDates = [
    new Date('2025-08-01'),
    new Date('2025-08-05'),
    new Date('2025-08-10'),
    new Date('2025-08-15'),
    new Date('2025-08-20'),
    new Date('2025-08-25'),
    new Date('2025-08-30'),
    new Date('2025-09-02'),
    new Date('2025-09-05'),
    new Date('2025-09-08'),
  ];

  const orders = [];
  for (let i = 0; i < 10; i++) {
    const customer = customers[i % customers.length];
    const orderDate = orderDates[i];
    
    orders.push(await prisma.order.upsert({
      where: { shopId_shopifyId: { shopId: shop.id, shopifyId: BigInt(i + 1) } },
      update: {},
      create: {
        tenantId: tenant.id,
        shopId: shop.id,
        shopifyId: BigInt(i + 1),
        customerId: customer.id,
        currency: 'USD',
        totalPrice: Math.floor(Math.random() * 200) + 50,
        subtotalPrice: Math.floor(Math.random() * 180) + 45,
        totalTax: Math.floor(Math.random() * 15) + 5,
        processedAt: orderDate,
      },
    }));
  }

  // Create some custom events for analytics
  const eventTypes = ['product_viewed', 'cart_abandoned', 'checkout_started', 'order_completed'];
  
  for (let i = 0; i < 20; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    await prisma.customEvent.upsert({
      where: { id: `demo-event-${i + 1}` },
      update: {},
      create: {
        id: `demo-event-${i + 1}`,
        tenantId: tenant.id,
        shopId: shop.id,
        eventType: eventType,
        customerId: customer.id,
        eventData: {
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
          productId: Math.floor(Math.random() * 4) + 1,
          value: Math.floor(Math.random() * 100) + 20,
        },
      },
    });
  }

  console.log('Seeding completed successfully!');
  console.log(`Created ${customers.length} customers`);
  console.log(`Created ${products.length} products`);
  console.log(`Created ${orders.length} orders`);
  console.log(`Created 20 custom events`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });