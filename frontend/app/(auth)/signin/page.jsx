"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../../lib/auth';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (_e) {
      setErr('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-4">Sign in</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border p-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {err ? <div className="text-red-600 text-sm">{err}</div> : null}
        <button disabled={loading} className="bg-black text-white px-3 py-2 w-full" type="submit">{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
      <div className="mt-3 text-sm">
        New here? <a className="text-blue-600 underline" href="/signup">Create an account</a>
      </div>
    </div>
  );
}


