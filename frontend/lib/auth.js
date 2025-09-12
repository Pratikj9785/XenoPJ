export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('xeno_token');
}

export function setToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('xeno_token', token);
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('xeno_token');
}

export async function login(email, password) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('Invalid credentials');
  const data = await res.json();
  setToken(data.token);
  return data;
}

export function getShopIdFromToken() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    return payload.storeId || payload.shopId || null;
  } catch (_e) {
    return null;
  }
}

export function getUserFromToken() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    return payload || null;
  } catch (_e) {
    return null;
  }
}


