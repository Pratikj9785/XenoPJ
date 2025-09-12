const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
import { getToken } from './auth';

function authHeaders() {
  const t = typeof window !== 'undefined' ? getToken() : null;
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function getOverview(shopId, { from, to }) {
  const r = await fetch(`${API_URL}/api/metrics/overview?shopId=${shopId}&from=${from}&to=${to}`, {
    headers: { ...authHeaders() },
  });
  return r.json();
}

export async function getTopCustomers(shopId, limit) {
  const r = await fetch(`${API_URL}/api/metrics/top-customers?shopId=${shopId}&limit=${limit}`, {
    headers: { ...authHeaders() },
  });
  return r.json();
}

export async function getOrdersByDate(shopId, { from, to }) {
  const r = await fetch(`${API_URL}/api/metrics/orders-by-date?shopId=${shopId}&from=${from}&to=${to}`, {
    headers: { ...authHeaders() },
  });
  return r.json();
}

// New advanced analytics APIs
export async function getBehaviorAnalytics(shopId, { from, to }) {
  const params = new URLSearchParams({ shopId });
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const r = await fetch(`${API_URL}/api/metrics/behavior-analytics?${params}`, {
    headers: { ...authHeaders() },
  });
  return r.json();
}

export async function getTopEngagedCustomers(shopId, limit = 10) {
  const r = await fetch(`${API_URL}/api/metrics/top-engaged-customers?shopId=${shopId}&limit=${limit}`, {
    headers: { ...authHeaders() },
  });
  return r.json();
}

export async function getConversionFunnel(shopId) {
  const r = await fetch(`${API_URL}/api/metrics/conversion-funnel?shopId=${shopId}`, {
    headers: { ...authHeaders() },
  });
  return r.json();
}

export async function simulateEvents(shopId) {
  const r = await fetch(`${API_URL}/api/metrics/simulate-events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ shopId })
  });
  return r.json();
}