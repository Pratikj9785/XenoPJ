'use client';
import { useState, useEffect } from 'react';
import { 
  getOverview, 
  getTopCustomers, 
  getOrdersByDate, 
  getBehaviorAnalytics, 
  getTopEngagedCustomers, 
  getConversionFunnel,
  simulateEvents 
} from '../../lib/api';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [top, setTop] = useState([]);
  const [series, setSeries] = useState([]);
  const [behaviorAnalytics, setBehaviorAnalytics] = useState(null);
  const [engagedCustomers, setEngagedCustomers] = useState([]);
  const [conversionFunnel, setConversionFunnel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState('2025-08-01');
  const [to, setTo] = useState('2025-09-09');
  const shopId = 'demo-shop';

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const range = { from, to };
      
      // Load all dashboard data
      const [overviewData, topCustomers, ordersData, behaviorData, engagedData, funnelData] = await Promise.all([
        getOverview(shopId, range),
        getTopCustomers(shopId, 5),
        getOrdersByDate(shopId, range),
        getBehaviorAnalytics(shopId, range),
        getTopEngagedCustomers(shopId, 10),
        getConversionFunnel(shopId)
      ]);

      setOverview(overviewData);
      setTop(topCustomers);
      setBehaviorAnalytics(behaviorData);
      setEngagedCustomers(engagedData);
      setConversionFunnel(funnelData);

      // Normalize orders data for charts
      const normalizedOrders = ordersData.map((r) => ({
        day: r.day || r.day?.toString?.(),
        orders: Number(r.orders || 0),
        revenue: Number(r.revenue || 0),
      }));
      setSeries(normalizedOrders);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [from, to]);

  const handleSimulateEvents = async () => {
    try {
      await simulateEvents(shopId);
      alert('Events simulated successfully! Refresh to see updated data.');
      loadDashboardData();
    } catch (error) {
      alert('Error simulating events: ' + error.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl">Loading dashboard...</div>
    </div>
  );

  if (!overview) return <div>Error loading dashboard data</div>;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Xeno Analytics Dashboard</h1>
        <button
          onClick={handleSimulateEvents}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Simulate Events
        </button>
      </div>

      {/* Date Range Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2">
            <span className="font-medium">From:</span>
            <input 
              type="date" 
              value={from} 
              onChange={(e) => setFrom(e.target.value)}
              className="border rounded px-3 py-1"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-medium">To:</span>
            <input 
              type="date" 
              value={to} 
              onChange={(e) => setTo(e.target.value)}
              className="border rounded px-3 py-1"
            />
          </label>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-gray-900">{overview.totalCustomers}</div>
          <div className="text-sm text-gray-600">Total Customers</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
          <div className="text-2xl font-bold text-gray-900">{overview.totalOrders}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
          <div className="text-2xl font-bold text-gray-900">${overview.totalRevenue}</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
          <div className="text-2xl font-bold text-gray-900">{overview.recentEvents || 0}</div>
          <div className="text-sm text-gray-600">Recent Events (24h)</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Orders & Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4">Orders & Revenue Trend</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={series} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#3B82F6" name="Orders" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" name="Revenue ($)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Funnel */}
        {conversionFunnel && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Conversion Funnel</h2>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={[
                  { name: 'Product Views', value: conversionFunnel.funnel.productViews },
                  { name: 'Checkouts Started', value: conversionFunnel.funnel.checkoutsStarted },
                  { name: 'Orders Completed', value: conversionFunnel.funnel.ordersCompleted }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Customer Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Customers by Spend */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4">Top Customers by Spend</h2>
          <div className="space-y-3">
            {top.map((customer, index) => (
              <div key={customer.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">
                    {customer.firstName} {customer.lastName}
                  </div>
                  <div className="text-sm text-gray-600">{customer.email}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">${customer.totalSpent}</div>
                  <div className="text-sm text-gray-500">{customer.ordersCount} orders</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Engaged Customers */}
        {engagedCustomers.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Most Engaged Customers</h2>
            <div className="space-y-3">
              {engagedCustomers.slice(0, 5).map((customer) => (
                <div key={customer.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">
                      {customer.firstName} {customer.lastName}
                    </div>
                    <div className="text-sm text-gray-600">{customer.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">{customer.engagementScore?.toFixed(1) || 0}</div>
                    <div className="text-sm text-gray-500">Engagement Score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Behavior Analytics */}
      {behaviorAnalytics && behaviorAnalytics.totalEvents > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4">Customer Behavior Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{behaviorAnalytics.funnel.productViews}</div>
              <div className="text-sm text-gray-600">Product Views</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{behaviorAnalytics.funnel.cartAbandonments}</div>
              <div className="text-sm text-gray-600">Cart Abandonments</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{behaviorAnalytics.funnel.ordersCompleted}</div>
              <div className="text-sm text-gray-600">Orders Completed</div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded">
              <div className="text-lg font-semibold text-blue-700">
                {behaviorAnalytics.conversionRates.viewToCart.toFixed(1)}%
              </div>
              <div className="text-sm text-blue-600">View to Cart</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded">
              <div className="text-lg font-semibold text-orange-700">
                {behaviorAnalytics.conversionRates.cartToCheckout.toFixed(1)}%
              </div>
              <div className="text-sm text-orange-600">Cart to Checkout</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded">
              <div className="text-lg font-semibold text-green-700">
                {behaviorAnalytics.conversionRates.checkoutToOrder.toFixed(1)}%
              </div>
              <div className="text-sm text-green-600">Checkout to Order</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
