const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function getOverview(shopId, { from, to }) {
  const r = await fetch(`${API_URL}/api/metrics/overview?shopId=${shopId}&from=${from}&to=${to}`);
  return r.json();
}

export async function getTopCustomers(shopId, limit) {
  const r = await fetch(`${API_URL}/api/metrics/top-customers?shopId=${shopId}&limit=${limit}`);
  return r.json();
}

export async function getOrdersByDate(shopId, { from, to }) {
  const r = await fetch(`${API_URL}/api/metrics/orders-by-date?shopId=${shopId}&from=${from}&to=${to}`);
  return r.json();
}