'use client';
import { useState, useEffect } from 'react';
import { getOverview, getTopCustomers, getOrdersByDate } from '../../lib/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [top, setTop] = useState([]);
  const [series, setSeries] = useState([]);
  const [from, setFrom] = useState('2025-08-01');
  const [to, setTo] = useState('2025-09-09');
  const shopId = 'demo-shop';

  useEffect(() => {
    const range = { from, to };
    getOverview(shopId, range).then(setOverview);
    getTopCustomers(shopId, 5).then(setTop);
    getOrdersByDate(shopId, range).then((rows) => {
      // Normalize API rows to recharts format
      const data = rows.map((r) => ({
        day: r.day || r.day?.toString?.(),
        orders: Number(r.orders || 0),
        revenue: Number(r.revenue || 0),
      }));
      setSeries(data);
    });
  }, [from, to]);

  if (!overview) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="mt-2 flex gap-3 items-center">
        <label>
          From: <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label>
          To: <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2">
        <div>Total Customers: {overview.totalCustomers}</div>
        <div>Total Orders: {overview.totalOrders}</div>
        <div>Total Revenue: {overview.totalRevenue}</div>
      </div>

      <h2 className="mt-6 font-bold">Orders & Revenue</h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#8884d8" dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h2 className="mt-6 font-bold">Top Customers</h2>
      <ul>
        {top.map((c) => (
          <li key={c.id}>
            {c.firstName} {c.lastName} ({c.email}) - Spent {c.totalSpent}
          </li>
        ))}
      </ul>
    </div>
  );
}
