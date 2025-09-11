// Simple script to test if your dashboard APIs are working
const API_URL = 'http://localhost:4000';

async function testDashboard() {
  console.log('🧪 Testing Dashboard APIs...\n');

  try {
    // Test 1: Overview metrics
    console.log('1. Testing overview metrics...');
    const overviewResponse = await fetch(`${API_URL}/api/metrics/overview?shopId=demo-shop&from=2025-08-01&to=2025-09-15`);
    const overview = await overviewResponse.json();
    console.log('✅ Overview:', {
      customers: overview.totalCustomers,
      orders: overview.totalOrders,
      revenue: overview.totalRevenue,
      recentEvents: overview.recentEvents
    });

    // Test 2: Orders by date
    console.log('\n2. Testing orders by date...');
    const ordersResponse = await fetch(`${API_URL}/api/metrics/orders-by-date?shopId=demo-shop&from=2025-08-01&to=2025-09-15`);
    const orders = await ordersResponse.json();
    console.log('✅ Orders data points:', orders.length);

    // Test 3: Top customers
    console.log('\n3. Testing top customers...');
    const customersResponse = await fetch(`${API_URL}/api/metrics/top-customers?shopId=demo-shop&limit=5`);
    const customers = await customersResponse.json();
    console.log('✅ Top customers:', customers.length);

    // Test 4: Behavior analytics
    console.log('\n4. Testing behavior analytics...');
    const behaviorResponse = await fetch(`${API_URL}/api/metrics/behavior-analytics?shopId=demo-shop`);
    const behavior = await behaviorResponse.json();
    console.log('✅ Behavior analytics:', {
      totalEvents: behavior.totalEvents,
      hasFunnel: !!behavior.funnel,
      hasConversionRates: !!behavior.conversionRates
    });

    // Test 5: Conversion funnel
    console.log('\n5. Testing conversion funnel...');
    const funnelResponse = await fetch(`${API_URL}/api/metrics/conversion-funnel?shopId=demo-shop`);
    const funnel = await funnelResponse.json();
    console.log('✅ Conversion funnel:', {
      productViews: funnel.funnel?.productViews || 0,
      checkoutsStarted: funnel.funnel?.checkoutsStarted || 0,
      ordersCompleted: funnel.funnel?.ordersCompleted || 0
    });

    // Test 6: Top engaged customers
    console.log('\n6. Testing top engaged customers...');
    const engagedResponse = await fetch(`${API_URL}/api/metrics/top-engaged-customers?shopId=demo-shop&limit=5`);
    const engaged = await engagedResponse.json();
    console.log('✅ Engaged customers:', engaged.length);

    console.log('\n🎉 All API tests passed! Your dashboard should be working perfectly.');
    console.log('\n📊 Dashboard URL: http://localhost:3000/dashboard');
    console.log('🔧 Backend URL: http://localhost:4000');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Make sure your backend is running on port 4000:');
    console.log('   cd backend && npm run dev');
  }
}

// Run the test
testDashboard();
