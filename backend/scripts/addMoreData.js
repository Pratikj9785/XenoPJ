const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addMoreData() {
  console.log('Adding more demo data...');

  const shop = await prisma.shop.findUnique({
    where: { id: 'demo-shop' }
  });

  if (!shop) {
    console.log('Demo shop not found. Please run seed script first.');
    return;
  }

  // Add more customers
  const newCustomers = await Promise.all([
    prisma.customer.create({
      data: {
        tenantId: shop.tenantId,
        shopId: shop.id,
        shopifyId: BigInt(100),
        email: 'emma.davis@example.com',
        firstName: 'Emma',
        lastName: 'Davis',
        totalSpent: 1200.00,
        ordersCount: 18,
        engagementScore: 98.7,
      },
    }),
    prisma.customer.create({
      data: {
        tenantId: shop.tenantId,
        shopId: shop.id,
        shopifyId: BigInt(101),
        email: 'david.lee@example.com',
        firstName: 'David',
        lastName: 'Lee',
        totalSpent: 750.00,
        ordersCount: 11,
        engagementScore: 89.2,
      },
    }),
    prisma.customer.create({
      data: {
        tenantId: shop.tenantId,
        shopId: shop.id,
        shopifyId: BigInt(102),
        email: 'lisa.taylor@example.com',
        firstName: 'Lisa',
        lastName: 'Taylor',
        totalSpent: 450.00,
        ordersCount: 7,
        engagementScore: 76.5,
      },
    }),
  ]);

  // Add more orders for the new customers
  const newOrders = await Promise.all([
    prisma.order.create({
      data: {
        tenantId: shop.tenantId,
        shopId: shop.id,
        shopifyId: BigInt(200),
        customerId: newCustomers[0].id,
        currency: 'USD',
        totalPrice: 150.00,
        subtotalPrice: 135.00,
        totalTax: 15.00,
        processedAt: new Date('2025-09-10'),
      },
    }),
    prisma.order.create({
      data: {
        tenantId: shop.tenantId,
        shopId: shop.id,
        shopifyId: BigInt(201),
        customerId: newCustomers[1].id,
        currency: 'USD',
        totalPrice: 95.00,
        subtotalPrice: 85.00,
        totalTax: 10.00,
        processedAt: new Date('2025-09-11'),
      },
    }),
    prisma.order.create({
      data: {
        tenantId: shop.tenantId,
        shopId: shop.id,
        shopifyId: BigInt(202),
        customerId: newCustomers[2].id,
        currency: 'USD',
        totalPrice: 75.00,
        subtotalPrice: 68.00,
        totalTax: 7.00,
        processedAt: new Date('2025-09-12'),
      },
    }),
  ]);

  // Add more custom events
  const eventTypes = ['product_viewed', 'cart_abandoned', 'checkout_started', 'order_completed'];
  const allCustomers = await prisma.customer.findMany({
    where: { shopId: shop.id }
  });

  for (let i = 0; i < 15; i++) {
    const customer = allCustomers[Math.floor(Math.random() * allCustomers.length)];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    await prisma.customEvent.create({
      data: {
        tenantId: shop.tenantId,
        shopId: shop.id,
        eventType: eventType,
        customerId: customer.id,
        eventData: {
          timestamp: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000), // Random time in last 3 days
          productId: Math.floor(Math.random() * 4) + 1,
          value: Math.floor(Math.random() * 150) + 30,
        },
      },
    });
  }

  console.log('Added more demo data successfully!');
  console.log(`Added ${newCustomers.length} new customers`);
  console.log(`Added ${newOrders.length} new orders`);
  console.log(`Added 15 new custom events`);
}

addMoreData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
