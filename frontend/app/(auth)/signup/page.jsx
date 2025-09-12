"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setToken } from '../../../lib/auth';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopDomain, setShopDomain] = useState('');
  const [shopName, setShopName] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, shopDomain, shopName })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || 'Registration failed');
      }
      const data = await res.json();
      if (data?.token) {
        setToken(data.token);
      }
      router.push('/dashboard');
    } catch (e) {
      setErr(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-4">Create your account</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border p-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <input className="w-full border p-2" placeholder="Shop domain (your-shop.myshopify.com)" value={shopDomain} onChange={e=>setShopDomain(e.target.value)} />
        <input className="w-full border p-2" placeholder="Shop name" value={shopName} onChange={e=>setShopName(e.target.value)} />
        {err ? <div className="text-red-600 text-sm">{err}</div> : null}
        <button disabled={loading} className="bg-black text-white px-3 py-2 w-full" type="submit">{loading ? 'Creating account...' : 'Sign up'}</button>
      </form>
      <div className="mt-3 text-sm">
        Already have an account? <a className="text-blue-600 underline" href="/signin">Sign in</a>
      </div>
    </div>
  );
}


