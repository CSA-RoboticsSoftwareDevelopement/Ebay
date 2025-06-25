/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';

export default function AmazonAuthPage() {
  const [tokenData, setTokenData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // const storedUser = localStorage.getItem('user');
        const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  console.log("amazon auth",user)

const handleGetAccessToken = async () => {
  if (!user || !user.email) {
    setError("User email not found.");
    return;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_SERVER_URL}/getAccessToken?email=${encodeURIComponent(user.email)}`
    );
    const data = await response.json();

    if (response.ok) {
      setTokenData(data);
      setError('');

      // ✅ Redirect this current popup window to Amazon in the SAME window
      window.location.href = 'https://solutionproviderportal.amazon.com/';
    } else {
      setError(JSON.stringify(data, null, 2));
    }
  } catch (err: any) {
    setError(err.message);
  }
};



  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-900 text-white">
      <div className="max-w-xl w-full bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Amazon SP-API Access Token</h2>

        {user && (
          <p className="mb-2 text-sm text-gray-400">Logged in as: {user.email}</p>
        )} 

        <button
          onClick={handleGetAccessToken}
          className="px-4 py-2 bg-yellow-500 text-black font-medium rounded hover:bg-yellow-400"
        >
          Get Amazon Access Token
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
