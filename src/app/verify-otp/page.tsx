'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0); // <-- NEW: countdown timer
  const otpSentRef = useRef(false);
  const { checkAuth } = useAuth();

  useEffect(() => {
    if (emailFromQuery && !otpSentRef.current) {
      setEmail(emailFromQuery);
      sendOtp(emailFromQuery);
      otpSentRef.current = true;
    }
  }, [emailFromQuery]);

  // NEW: Countdown logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const sendOtp = async (emailToSend: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_SERVER_URL}/post_login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToSend }),
      });
      console.log('📧 OTP sent to:', emailToSend);
    } catch (err) {
      console.error('❌ Failed to send OTP', err);
      setMessage('Failed to send OTP. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setMessage('');
    setCountdown(10); // <-- NEW: start countdown at 10
    try {
      await sendOtp(email);
      setMessage('📨 OTP resent successfully!');
    } catch (err: any) {
      setMessage(err.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_SERVER_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'OTP verification failed');

      sessionStorage.setItem("authToken", data.auth_token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      await checkAuth();

      setMessage('✅ OTP verified! Redirecting...');
      setTimeout(() => router.push('/dashboard'), 1000);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="card max-w-md w-full p-6 shadow-md rounded-md bg-white">
        <h1 className="text-2xl font-bold mb-6 text-center">Two-Step Verification</h1>

        <input type="hidden" value={email} />

        <div className="mb-4">
          <input
            type="text"
            className="input w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </div>

        <div className="mb-2 text-left text-sm text-gray-500">
          <span>Didn’t receive the OTP? </span>
          <button
            onClick={handleResendOtp}
            disabled={resending}
            className="text-yellow-500 font-medium hover:underline"
          >
            {resending ? 'Resending...' : 'Resend OTP'}
          </button>
        </div>

        {/* NEW: Show countdown */}
        {countdown > 0 && (
          <div className="mb-4 text-left text-xs text-gray-400">
             Resend available in: <span className="font-medium">{countdown}s</span>
          </div>
        )}

        <button
          className="btn btn-primary w-full text-base py-2"
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>

        {message && <div className="mt-4 text-center text-sm text-red-600">{message}</div>}
      </div>
    </div>
  );
}
