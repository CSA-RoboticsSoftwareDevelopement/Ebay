'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AmazonAuthPage() {
  const [tokenData, setTokenData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  // ✅ Get user_id from URL query params
  useEffect(() => {
    const idFromUrl = searchParams.get("user_id");
    if (idFromUrl) {
      setUserId(idFromUrl);
      console.log("✅ Got user_id from URL:", idFromUrl);
    } else {
      console.error("❌ No user_id in URL");
      setError("Missing user ID in URL.");
    }
    setLoading(false);
  }, [searchParams]);

  const handleGetAccessToken = async () => {
    if (!userId) {
      setError("User ID not found.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_SERVER_URL}/getAccessToken?user_id=${userId}`
      );
      const data = await response.json();

      if (response.ok) {
        setTokenData(data);
        setError('');
        window.location.href = 'https://solutionproviderportal.amazon.com/';
      } else {
        setError(JSON.stringify(data, null, 2));
      }
    } catch (err: any) {
      console.error("❌ Fetch error:", err);
      setError(err.message || "Unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-900 text-white">
      <div className="max-w-xl w-full bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Amazon SP-API Access Token</h2>

        <button
          onClick={handleGetAccessToken}
          disabled={loading || !userId}
          className="px-4 py-2 bg-yellow-500 text-black font-medium rounded hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : "Get Amazon Access Token"}
        </button>

        {tokenData && (
          <pre className="mt-4 p-3 bg-gray-900 text-green-400 rounded text-sm overflow-x-auto">
            {JSON.stringify(tokenData, null, 2)}
          </pre>
        )}

        {error && (
          <pre className="mt-4 p-3 bg-red-900 text-red-400 rounded text-sm overflow-x-auto">
            {error}
          </pre>
        )}
      </div>
    </div>
  );
}
