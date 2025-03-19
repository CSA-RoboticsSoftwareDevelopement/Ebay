'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [signupKey, setSignupKey] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signup, loading, error: authError } = useAuth();
  const [error, setError] = useState('');

  const validateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!signupKey.trim()) {
      setError('Signup key is required');
      return;
    }

    try {
      // For now, we'll just move to the next step
      // In a real implementation, we would validate the key with the server
      setStep(2);
    } catch (err) {
      setError('Invalid signup key. Please try again or contact support.');
      console.error('Key validation error:', err);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      await signup(email, password, name, signupKey);
    } catch (err) {
      // Error is handled by the auth hook
      console.error('Signup error:', err);
    }
  };

  return (
    <div className="card">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Create your Resale account</h1>
        <p className="text-neutral-gray-600 mt-2">
          {step === 1 
            ? 'Enter your signup key to get started' 
            : 'Complete your account information'}
        </p>
      </div>

      {(error || authError) && (
        <div className="bg-error/10 text-error p-4 rounded-md mb-6">
          {error || authError}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={validateKey}>
          <div className="mb-6">
            <label htmlFor="signupKey" className="label">
              Signup Key
            </label>
            <input
              id="signupKey"
              type="text"
              className="input w-full"
              value={signupKey}
              onChange={(e) => setSignupKey(e.target.value)}
              placeholder="Enter your signup key"
              required
              disabled={loading}
            />
            <p className="text-sm text-neutral-gray-500 mt-2">
              Don't have a key? Contact your administrator or support.
            </p>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Validating...' : 'Continue'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignup}>
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

          <div className="mb-4">
            <label htmlFor="name" className="label">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              className="input w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="label">
              Password
            </label>
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

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="input w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      )}

      <div className="mt-6 text-center">
        <p className="text-neutral-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-yellow font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
} 