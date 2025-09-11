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

// New advanced analytics APIs
export async function getBehaviorAnalytics(shopId, { from, to }) {
  const params = new URLSearchParams({ shopId });
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const r = await fetch(`${API_URL}/api/metrics/behavior-analytics?${params}`);
  return r.json();
}

export async function getTopEngagedCustomers(shopId, limit = 10) {
  const r = await fetch(`${API_URL}/api/metrics/top-engaged-customers?shopId=${shopId}&limit=${limit}`);
  return r.json();
}

export async function getConversionFunnel(shopId) {
  const r = await fetch(`${API_URL}/api/metrics/conversion-funnel?shopId=${shopId}`);
  return r.json();
}

export async function simulateEvents(shopId) {
  const r = await fetch(`${API_URL}/api/metrics/simulate-events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shopId })
  });
  return r.json();
}