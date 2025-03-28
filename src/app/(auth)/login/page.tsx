'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false); // ✅ Fix: Prevent hydration mismatch

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ Sends cookies with request
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      console.log('🔹 Login Success:', data.user);

      // ✅ Redirect to dashboard after successful login
      router.push('/dashboard');
    } catch (err: any) {
      console.error('❌ Login Error:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if(useAuth().user) router.push('/dashboard');

  // ✅ Prevent rendering until hydration is complete
  if (!isMounted) return null;

  return (
    <div className="card">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Log in to Resale</h1>
        <p className="text-neutral-gray-600 mt-2">
          Enter your credentials to access your account
        </p>
      </div>

      {error && (
        <div className="bg-error/10 text-error p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="label">Email Address</label>
          <input
            id="email"
            type="email"
            className="input w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="password" className="label">Password</label>
            <Link href="/forgot-password" className="text-sm">Forgot password?</Link>
          </div>
          <input
            id="password"
            type="password"
            className="input w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-neutral-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary-yellow font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
