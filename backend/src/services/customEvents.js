const prisma = require('./prismaClient');

class CustomEventsService {
  // Track cart abandonment events
  async trackCartAbandoned(shopId, customerId, cartValue, cartItems) {
    try {
      const event = await prisma.customEvent.create({
        data: {
          tenantId: await this.getTenantId(shopId),
          shopId,
          eventType: 'cart_abandoned',
          customerId,
          eventData: {
            cartValue,
            cartItems,
            timestamp: new Date(),
            itemsCount: cartItems.length
          }
        }
      });

      console.log(`Cart abandonment tracked for customer ${customerId} in shop ${shopId}`);
      return event;
    } catch (error) {
      console.error('Error tracking cart abandonment:', error);
      throw error;
    }
  }

  // Track checkout started events
  async trackCheckoutStarted(shopId, customerId, checkoutValue, checkoutItems) {
    try {
      const event = await prisma.customEvent.create({
        data: {
          tenantId: await this.getTenantId(shopId),
          shopId,
          eventType: 'checkout_started',
          customerId,
          eventData: {
            checkoutValue,
            checkoutItems,
            timestamp: new Date(),
            itemsCount: checkoutItems.length
          }
        }
      });

      console.log(`Checkout started tracked for customer ${customerId} in shop ${shopId}`);
      return event;
    } catch (error) {
      console.error('Error tracking checkout started:', error);
      throw error;
    }
  }

  // Track product view events
  async trackProductView(shopId, customerId, productId, productTitle) {
    try {
      const event = await prisma.customEvent.create({
        data: {
          tenantId: await this.getTenantId(shopId),
          shopId,
          eventType: 'product_viewed',
          customerId,
          eventData: {
            productId,
            productTitle,
            timestamp: new Date()
          }
        }
      });

      console.log(`Product view tracked: ${productTitle} by customer ${customerId}`);
      return event;
    } catch (error) {
      console.error('Error tracking product view:', error);
      throw error;
    }
  }

  // Track customer engagement score
  async calculateEngagementScore(customerId, shopId) {
    try {
      const events = await prisma.customEvent.findMany({
        where: {
          customerId,
          shopId
        },
        orderBy: { createdAt: 'desc' }
      });

      let score = 0;
      const eventWeights = {
        'product_viewed': 1,
        'cart_abandoned': -2,
        'checkout_started': 5,
        'order_completed': 10
      };

      events.forEach(event => {
        score += eventWeights[event.eventType] || 0;
      });

      // Update customer engagement score
      await prisma.customer.update({
        where: { id: customerId },
        data: { engagementScore: score }
      });

      return score;
    } catch (error) {
      console.error('Error calculating engagement score:', error);
      throw error;
    }
  }

  // Get customer behavior analytics
  async getCustomerBehaviorAnalytics(shopId, dateRange = {}) {
    try {
      const { from, to } = dateRange;
      const whereClause = { shopId };
      
      if (from && to) {
        whereClause.createdAt = {
          gte: new Date(from),
          lte: new Date(to)
        };
      }

      const events = await prisma.customEvent.findMany({
        where: whereClause,
        include: {
          customer: {
            select: {
              email: true,
              firstName: true,
              lastName: true
            }
          }
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

      return {
        eventSummary,
        funnel,
        conversionRates,
        totalEvents: events.length
      };
    } catch (error) {
      console.error('Error getting customer behavior analytics:', error);
      throw error;
    }
  }

  // Get top performing customers by engagement
  async getTopEngagedCustomers(shopId, limit = 10) {
    try {
      const customers = await prisma.customer.findMany({
        where: { shopId },
        orderBy: { engagementScore: 'desc' },
        take: limit,
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

      return customers;
    } catch (error) {
      console.error('Error getting top engaged customers:', error);
      throw error;
    }
  }

  // Helper method to get tenant ID from shop ID
  async getTenantId(shopId) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { tenantId: true }
    });
    return shop?.tenantId;
  }

  // Simulate real-time events (for demo purposes)
  async simulateEvents(shopId) {
    const customers = await prisma.customer.findMany({
      where: { shopId },
      take: 5
    });

    if (customers.length === 0) {
      console.log('No customers found to simulate events');
      return;
    }

    const events = [
      { type: 'product_viewed', weight: 0.6 },
      { type: 'cart_abandoned', weight: 0.2 },
      { type: 'checkout_started', weight: 0.15 },
      { type: 'order_completed', weight: 0.05 }
    ];

    for (let i = 0; i < 10; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      
      if (Math.random() < randomEvent.weight) {
        await this.trackCustomEvent(shopId, customer.id, randomEvent.type);
      }
    }

    console.log('Simulated events completed');
  }

  // Generic method to track custom events
  async trackCustomEvent(shopId, customerId, eventType, eventData = {}) {
    try {
      const event = await prisma.customEvent.create({
        data: {
          tenantId: await this.getTenantId(shopId),
          shopId,
          eventType,
          customerId,
          eventData: {
            ...eventData,
            timestamp: new Date()
          }
        }
      });

      return event;
    } catch (error) {
      console.error(`Error tracking ${eventType} event:`, error);
      throw error;
    }
  }
}

module.exports = new CustomEventsService();
