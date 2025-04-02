'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';


const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;

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

  // For line 55, replace 'any' with a proper type
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    try {
      const res = await fetch(`${BACKEND_SERVER_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ Sends cookies with request
        body: JSON.stringify({ email, password }),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
  
      console.log('🔹 Login Success:', data.user);
  
      const token = data.auth_token;
      if (token) {
        // ✅ Store token in cookies
        document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax${
          window.location.protocol === 'https:' ? '; Secure' : ''
        }`;
  
        console.log('🔐 Token stored in cookies');
      } else {
        console.warn('⚠️ No auth_token received from API');
      }
  
      // ✅ Redirect to dashboard after successful login
      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('❌ Login Error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
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
          {/* Don't have an account? */}
          <p>Don&apos;t have an account? <Link href="/signup">Sign up</Link></p>
        </p>
      </div>
    </div>
  );
}
