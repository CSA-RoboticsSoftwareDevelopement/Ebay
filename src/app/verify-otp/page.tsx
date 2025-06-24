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
  const otpSentRef = useRef(false);
  const { checkAuth } = useAuth();


useEffect(() => {
  if (emailFromQuery && !otpSentRef.current) {
    setEmail(emailFromQuery);
    sendOtp(emailFromQuery);
    otpSentRef.current = true;
  }
}, [emailFromQuery]);


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

    await checkAuth(); // 🔁 refresh context with new user

    setMessage('OTP verified! Redirecting...');
    setTimeout(() => router.push('/dashboard'), 1000);
  } catch (err) {
    setMessage(err.message);
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="card max-w-md mx-auto mt-10 p-6 shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Verify OTP</h1>

      {/* Hidden email input */}
      <input type="hidden" value={email} />

      <div className="mb-4">
        <label className="label">OTP</label>
        <input
          type="text"
          className="input w-full"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
      </div>

      <button className="btn btn-primary w-full" onClick={handleVerify} disabled={loading}>
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>

      {message && <div className="mt-4 text-center text-sm text-red-600">{message}</div>}
    </div>
  );
}
