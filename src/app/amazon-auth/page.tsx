'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AmazonAuthPage() {
  const [error, setError] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  // Get user_id from URL query params
  useEffect(() => {
    const idFromUrl = searchParams.get("user_id");
    if (idFromUrl) {
      setUserId(idFromUrl);
    } else {
      setError("Missing user ID in URL.");
      setLoading(false);
    }
  }, [searchParams]);

  // Auto get access token and redirect
  useEffect(() => {
    const handleGetAccessToken = async () => {
      if (!userId) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_SERVER_URL}/getAccessToken?user_id=${userId}`
        );
        const data = await response.json();

        if (response.ok) {
          window.location.href = 'https://solutionproviderportal.amazon.com/';
        } else {
          setError(JSON.stringify(data, null, 2));
        }
      } catch (err: any) {
        setError(err.message || "Unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      handleGetAccessToken();
    }
  }, [userId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white-900">
      {loading ? (
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      ) : error ? (
        <pre className="p-3 bg-red-900 text-red-400 rounded text-sm overflow-x-auto max-w-xl">
          {error}
        </pre>
      ) : null}
    </div>
  );
}
