'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Function to set a cookie manually
  const setCookie = (name: string, value: string, days: number) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; Secure; SameSite=Strict`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Ensures cookies are sent/received
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      // Store auth_token in cookies manually
      setCookie('auth_token', data.auth_token, 7); // Expires in 7 days

      // Redirect to dashboard or home page
      router.push('/dashboard');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          <label htmlFor="email" className="label">
            Email Address
          </label>
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
            <label htmlFor="password" className="label">
              Password
            </label>
            <Link href="/forgot-password" className="text-sm">
              Forgot password?
            </Link>
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
