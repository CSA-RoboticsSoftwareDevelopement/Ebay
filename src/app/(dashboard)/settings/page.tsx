'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';

type EbayProfile = {
  username: string;
  email: string;
  isConnected: boolean;
  token?: string; // ✅ Store token from DB
};

export default function Settings() {
  const router = useRouter();
  const [ebayProfile, setEbayProfile] = useState<EbayProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('account');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Fetch eBay Profile on Mount (Get token from DB)
  useEffect(() => {
    const fetchEbayProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // ✅ Get user ID from session
        const sessionResponse = await axios.get('/api/auth/session');
        const userId = sessionResponse.data?.userId;

        if (!userId) {
          setError("Not authenticated. Please login again.");
          return;
        }

        // ✅ Fetch eBay profile & token from DB
        const profileResponse = await axios.get(`/api/ebay/profile?userId=${userId}`);
        setEbayProfile(profileResponse.data);
      } catch (error: any) {
        console.error('❌ Failed to load eBay profile:', error);
        setError(error.response?.data?.error || 'Failed to load eBay profile');
        setEbayProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEbayProfile();
  }, []);

  // ✅ Connect to eBay
  const handleConnectEbay = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/ebay/auth-url');
      if (response.data.url) {
        window.location.href = response.data.url; // Redirect to eBay OAuth
      } else {
        throw new Error("Invalid OAuth URL from server");
      }
    } catch (error) {
      toast.error("Failed to connect eBay account.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Disconnect from eBay
  const handleDisconnectEbay = async () => {
    try {
      setIsLoading(true);
      await axios.delete('/api/ebay/profile');
      setEbayProfile(null);
      toast.success('eBay account disconnected successfully');
    } catch (error) {
      toast.error("Failed to disconnect eBay account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {['account', 'notifications', 'integrations', 'preferences'].map((tab) => (
            <button
              key={tab}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-primary-yellow text-primary-black'
                  : 'border-transparent text-neutral-gray-500 hover:text-neutral-gray-700 hover:border-neutral-gray-300'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      // Add Modal state
      const [showTokenModal, setShowTokenModal] = useState(false);
      
      // Add copy token function
      const copyTokenToClipboard = async () => {
        if (ebayProfile?.token) {
          try {
            await navigator.clipboard.writeText(ebayProfile.token);
            toast.success('Token copied to clipboard');
          } catch (error) {
            toast.error('Failed to copy token');
          }
        }
      };

      {/* eBay Integration Tab */}
      {activeTab === 'integrations' && (
        <div className="card p-4 bg-white shadow rounded-lg">
          <h2 className="text-lg font-semibold mb-4">eBay Account</h2>

          {ebayProfile?.isConnected ? (
            <div className="space-y-3">
              <p className="text-green-600 font-medium">✅ Connected to eBay</p>
              <button
                onClick={() => setShowTokenModal(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
              >
                View Auth Token
              </button>
              <button
                onClick={handleDisconnectEbay}
                disabled={isLoading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {isLoading ? 'Disconnecting...' : 'Disconnect eBay Account'}
              </button>

              {/* Token Modal */}
              {showTokenModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                    <h3 className="text-lg font-semibold mb-4">eBay Auth Token</h3>
                    {ebayProfile.token && (
                      <div className="bg-gray-100 p-3 rounded mb-4 relative group">
                        <p className="text-sm break-all pr-8">{ebayProfile.token}</p>
                        <button
                          onClick={copyTokenToClipboard}
                          className="absolute right-2 top-2 p-2 text-gray-500 hover:text-gray-700"
                          title="Copy to clipboard"
                        >
                          📋
                        </button>
                      </div>
                    )}
                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowTokenModal(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleConnectEbay}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Redirecting...' : 'Connect eBay Account'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
