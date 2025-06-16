'use client';

import Link from 'next/link';
import { useState } from 'react';
import axios from 'axios';

const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;
const COGNITO_DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
const REDIRECT_URI = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI;


export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [signupKey, setSignupKey] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // ✅ Added missing `loading` state


  // const handleLogin = (provider: 'Google' | 'Facebook') => {
  //   const loginUrl = `${COGNITO_DOMAIN}/oauth2/authorize?` +
  //     new URLSearchParams({
  //       response_type: 'code',
  //       client_id: CLIENT_ID!,
  //       redirect_uri: REDIRECT_URI!,
  //       identity_provider: provider,
  //       scope: 'openid profile email',
  //       state: 'signup',

  //     });

  //   window.location.href = loginUrl;
  // };

  const handleLogin = (provider: 'Google' | 'Facebook') => {
  // Ensure signupKey is available here, e.g., from state
  const stateParam = `signup|${signupKey}`; // Pass the signupKey here

  const loginUrl = `${COGNITO_DOMAIN}/oauth2/authorize?` +
    new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID!,
      redirect_uri: REDIRECT_URI!,
      identity_provider: provider,
      scope: 'openid profile email',
      state: stateParam, // Use the combined state
    });

  window.location.href = loginUrl;
};

  // ✅ Validate Signup Key with API
  const validateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!signupKey.trim()) {
      setError('Signup key is required');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${BACKEND_SERVER_URL}/api/validate-key`, {
        signupKey,
      });

      if (response.data.valid) {
        setStep(2);
      } else {
        setError('Invalid signup key. Please try again or contact support.');
      }
    } catch (err) {
      setError('Invalid signup key. Please try again or contact support.');
      console.error('Key validation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Signup Form Submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${BACKEND_SERVER_URL}/api/signup`, {
        signupKey,
        email,
        password,
        name,
      });

      console.log('Signup successful:', response.data);
      window.location.href = '/login'; // Redirect to login page
    } catch (err: Error | unknown) {
      console.error('Signup error:', err);
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setError(errorResponse.response?.data?.message || 'An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Create your Resale account</h1>

      </div>



{step === 2 && (
  <>
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

  </>
)}

      {error && (
        <div className="bg-error/10 text-error p-4 rounded-md mb-6">
          {error}
        </div>
      )}

        <p className="text-neutral-gray-600 mt-2">
          {step === 1 ? 'Enter your signup key to get started' : 'Complete your account information'}
        </p>


      {step === 1 ? (
        <form onSubmit={validateKey}>
          <div className="mb-6">
            <label htmlFor="signupKey" className="label">Signup Key</label>
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
              Don&apos;t have a key? Contact your administrator or support.
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
            <label htmlFor="name" className="label">Full Name</label>
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
            <label htmlFor="password" className="label">Password</label>
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
            <label htmlFor="confirmPassword" className="label">Confirm Password</label>
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
