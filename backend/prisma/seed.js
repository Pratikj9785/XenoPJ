const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create a demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { id: 'demo-tenant' },
    update: {},
    create: {
      id: 'demo-tenant',
      name: 'Demo Tenant',
      emailDomain: 'demo.com',
    },
  });

  // Create a demo shop (replace with your dev store + token)
  const shop = await prisma.shop.upsert({
    where: { shopDomain: 'demo-shop.myshopify.com' },
    update: {},
    create: {
      id: 'demo-shop',
      tenantId: tenant.id,
      shopDomain: 'demo-shop.myshopify.com',
      accessToken: process.env.SHOPIFY_ACCESS_TOKEN || 'dummy-token',
      name: 'Demo Shop',
      currency: 'USD',
      timezone: 'UTC',
    },
  });

  console.log('Seeded tenant:', tenant);
  console.log('Seeded shop:', shop);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
