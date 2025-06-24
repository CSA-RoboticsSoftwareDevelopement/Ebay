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
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpSentText, setOtpSentText] = useState<string>('');

  const otpSentRef = useRef(false);
  const { checkAuth } = useAuth();

  useEffect(() => {
    if (emailFromQuery && !otpSentRef.current) {
      setEmail(emailFromQuery);
      setOtpSentText(`Sending OTP to ${emailFromQuery}...`); // 👈 Show immediately
      sendOtp(emailFromQuery);
      otpSentRef.current = true;
    }
  }, [emailFromQuery]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const sendOtp = async (emailToSend: string, isResend = false) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_SERVER_URL}/post_login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToSend }),
      });
      setOtpSentText(`${isResend ? 'A new OTP has been sent to' : 'An OTP has been sent to'} ${emailToSend}`);
    } catch {
      setOtpSentText('Failed to send OTP. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setCountdown(10);
    setOtpSentText(`Sending OTP to ${email}...`); // 👈 Immediate feedback for resend too
    await sendOtp(email, true);
    setResending(false);
  };

  const handleVerify = async () => {
    setLoading(true);
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
      router.push('/dashboard');
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="card max-w-md w-full p-6 shadow-md rounded-md bg-white">
        <h1 className="text-2xl font-bold mb-2 text-center">Two-Step Verification</h1>

        {/* ✅ Only this one statement */}
        {otpSentText && (
          <div className="text-center text-gray-600 text-sm mb-4">{otpSentText}</div>
        )}

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
          Didn’t receive the OTP?{' '}
          <button
            onClick={handleResendOtp}
            disabled={resending}
            className="text-yellow-500 font-medium hover:underline"
          >
            {resending ? 'Resending...' : 'Resend OTP'}
          </button>
        </div>

        {countdown > 0 && (
          <div className="mb-4 text-left text-xs text-gray-400">
            Resend available in <span className="font-medium">{countdown}s</span>
          </div>
        )}

        <button
          className="btn btn-primary w-full text-base py-2"
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </div>
    </div>
  );
}
