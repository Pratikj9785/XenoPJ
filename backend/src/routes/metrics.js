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

    // Get recent custom events count (if customEvent model exists)
    let recentEvents = 0;
    try {
      recentEvents = await prisma.customEvent.count({
        where: {
          shopId,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });
    } catch (error) {
      console.log('CustomEvent model not available yet:', error.message);
      recentEvents = 0;
    }

    res.json({ 
      totalCustomers, 
      totalOrders, 
      totalRevenue: revenueAgg._sum.totalPrice || 0,
      recentEvents
    });
  } catch (e) {
    console.error(e);
    res.status(500).send('error');
  }
});

router.get('/orders-by-date', async (req, res) => {
  try {
    const { shopId, from, to } = req.query;
    
    // Use Prisma's type-safe query instead of raw SQL
    const whereClause = { shopId };
    if (from && to) {
      whereClause.processedAt = {
        gte: new Date(from),
        lte: new Date(to)
      };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { processedAt: 'asc' },
      select: {
        processedAt: true,
        totalPrice: true
      }
    });

    // Group orders by date
    const ordersByDate = orders.reduce((acc, order) => {
      const date = order.processedAt?.toISOString().split('T')[0] || 'Unknown';
      if (!acc[date]) {
        acc[date] = { day: date, orders: 0, revenue: 0 };
      }
      acc[date].orders++;
      acc[date].revenue += parseFloat(order.totalPrice);
      return acc;
    }, {});

    res.json(Object.values(ordersByDate));
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
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        totalSpent: true,
        ordersCount: true,
        engagementScore: true,
        // Exclude shopifyId to avoid BigInt serialization issues
      }
    });
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('error');
  }
});

// Get customer behavior analytics
router.get('/behavior-analytics', async (req, res) => {
  try {
    const { shopId, from, to } = req.query;
    
    // Check if CustomEvent model exists
    try {
      await prisma.customEvent.findFirst();
    } catch (error) {
      return res.json({
        eventSummary: {},
        funnel: { productViews: 0, cartAbandonments: 0, checkoutsStarted: 0, ordersCompleted: 0 },
        conversionRates: { viewToCart: 0, cartToCheckout: 0, checkoutToOrder: 0 },
        totalEvents: 0,
        message: 'CustomEvent model not available yet'
      });
    }

    const whereClause = { shopId };
    if (from && to) {
      whereClause.createdAt = {
        gte: new Date(from),
        lte: new Date(to)
      };
    }

    const events = await prisma.customEvent.findMany({
      where: whereClause,
      select: {
        eventType: true,
        createdAt: true
      }
    });

    // Aggregate event types
    const eventSummary = events.reduce((acc, event) => {
      if (!acc[event.eventType]) {
        acc[event.eventType] = 0;
      }
      acc[event.eventType]++;
      return acc;
    }, {});

    // Calculate conversion funnel
    const funnel = {
      productViews: eventSummary.product_viewed || 0,
      cartAbandonments: eventSummary.cart_abandoned || 0,
      checkoutsStarted: eventSummary.checkout_started || 0,
      ordersCompleted: eventSummary.order_completed || 0
    };

    // Calculate conversion rates
    const conversionRates = {
      viewToCart: funnel.productViews > 0 ? (funnel.checkoutsStarted / funnel.productViews) * 100 : 0,
      cartToCheckout: funnel.cartAbandonments > 0 ? (funnel.checkoutsStarted / (funnel.cartAbandonments + funnel.checkoutsStarted)) * 100 : 0,
      checkoutToOrder: funnel.checkoutsStarted > 0 ? (funnel.ordersCompleted / funnel.checkoutsStarted) * 100 : 0
    };

    res.json({
      eventSummary,
      funnel,
      conversionRates,
      totalEvents: events.length
    });
  } catch (error) {
    console.error('Error fetching behavior analytics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get top engaged customers
router.get('/top-engaged-customers', async (req, res) => {
  try {
    const { shopId, limit = 10 } = req.query;
    
    // Check if CustomEvent model exists
    try {
      await prisma.customEvent.findFirst();
    } catch (error) {
      return res.json([]);
    }
    
    const customers = await prisma.customer.findMany({
      where: { shopId },
      orderBy: { engagementScore: 'desc' },
      take: parseInt(limit),
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        engagementScore: true,
        totalSpent: true,
        ordersCount: true
      }
    });

    res.json(customers);
  } catch (error) {
    console.error('Error fetching top engaged customers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get conversion funnel data
router.get('/conversion-funnel', async (req, res) => {
  try {
    const { shopId } = req.query;
    
    // Check if CustomEvent model exists
    try {
      await prisma.customEvent.findFirst();
    } catch (error) {
      return res.json({
        funnel: { productViews: 0, cartAbandonments: 0, checkoutsStarted: 0, ordersCompleted: 0 },
        conversionRates: { viewToCart: 0, cartToCheckout: 0, checkoutToOrder: 0 }
      });
    }

    const events = await prisma.customEvent.findMany({
      where: { shopId },
      select: {
        eventType: true
      }
    });

    // Aggregate event types
    const eventSummary = events.reduce((acc, event) => {
      if (!acc[event.eventType]) {
        acc[event.eventType] = 0;
      }
      acc[event.eventType]++;
      return acc;
    }, {});

    // Calculate conversion funnel
    const funnel = {
      productViews: eventSummary.product_viewed || 0,
      cartAbandonments: eventSummary.cart_abandoned || 0,
      checkoutsStarted: eventSummary.checkout_started || 0,
      ordersCompleted: eventSummary.order_completed || 0
    };

    // Calculate conversion rates
    const conversionRates = {
      viewToCart: funnel.productViews > 0 ? (funnel.checkoutsStarted / funnel.productViews) * 100 : 0,
      cartToCheckout: funnel.cartAbandonments > 0 ? (funnel.checkoutsStarted / (funnel.cartAbandonments + funnel.checkoutsStarted)) * 100 : 0,
      checkoutToOrder: funnel.checkoutsStarted > 0 ? (funnel.ordersCompleted / funnel.checkoutsStarted) * 100 : 0
    };
    
    res.json({
      funnel,
      conversionRates
    });
  } catch (error) {
    console.error('Error fetching conversion funnel:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Simulate custom events (for demo purposes)
router.post('/simulate-events', async (req, res) => {
  try {
    const { shopId } = req.body;
    
    // Check if CustomEvent model exists
    try {
      await prisma.customEvent.findFirst();
    } catch (error) {
      return res.status(400).json({ 
        message: 'CustomEvent model not available yet. Please run database migration first.' 
      });
    }

    // Get existing customers
    const customers = await prisma.customer.findMany({
      where: { shopId },
      select: { id: true }
    });

    if (customers.length === 0) {
      return res.status(400).json({ 
        message: 'No customers found. Please seed the database first.' 
      });
    }

    // Create some random events
    const eventTypes = ['product_viewed', 'cart_abandoned', 'checkout_started', 'order_completed'];
    
    for (let i = 0; i < 10; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      await prisma.customEvent.create({
        data: {
          tenantId: 'demo-tenant',
          shopId,
          eventType: eventType,
          customerId: customer.id,
          eventData: {
            timestamp: new Date(),
            productId: Math.floor(Math.random() * 4) + 1,
            value: Math.floor(Math.random() * 100) + 20,
          },
        },
      });
    }
    
    res.json({ message: 'Events simulated successfully' });
  } catch (error) {
    console.error('Error simulating events:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
