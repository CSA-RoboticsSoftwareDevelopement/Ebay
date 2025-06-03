'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;
const COGNITO_DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
const REDIRECT_URI = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI;

export default function LoginPage() {
  const handleLogin = (provider: 'Google' | 'Facebook') => {
    const loginUrl = `${COGNITO_DOMAIN}/oauth2/authorize?` +
      new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID!,
        redirect_uri: REDIRECT_URI!,
        identity_provider: provider,
        scope: 'openid profile email',
        state: provider.toLowerCase(),
      });

    window.location.href = loginUrl;
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_SERVER_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      const token = data.auth_token;
      if (token) {
        document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax${
          window.location.protocol === 'https:' ? '; Secure' : ''
        }`;
      }

      router.push('/dashboard');
      setTimeout(() => window.location.reload(), 100);
    } catch (err: unknown) {
      console.error('❌ Login Error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="card max-w-md mx-auto mt-10 p-6 shadow-md rounded-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Log in to Resale</h1>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">{error}</div>
      )}

      {/* SOCIAL LOGIN */}
      <div className="flex flex-col gap-3 mb-6">
        <button
          onClick={() => handleLogin('Google')}
          className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-md py-2 hover:bg-gray-50 transition"
        >
          <img
            src="/assets/icons/google.png"
            alt="Google"
            width={37}
            height={20}
          />
          <span className="text-sm text-gray-700 font-medium">Continue with Google</span>
        </button>

        <button
          onClick={() => handleLogin('Facebook')}
          className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-md py-2 hover:bg-gray-50 transition"
        >
          <img
            src="/assets/icons/facebook.png"
            alt="Facebook"
            width={20}
            height={20}
          />
          <span className="text-sm text-gray-700 font-medium">Continue with Facebook</span>
        </button>
      </div>

      <div className="mt-4 mb-4 flex items-center gap-4">
        <div className="flex-grow border-t border-gray-300" />
        <span className="text-gray-500 text-sm">or continue with</span>
        <div className="flex-grow border-t border-gray-300" />
      </div>

      {/* EMAIL LOGIN */}
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

        <div className="mb-4">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="label">Password</label>
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
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

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p>Don&apos;t have an account? <Link href="/signup" className="text-blue-600 hover:underline">Sign up</Link></p>
      </div>
    </div>
  );
}
