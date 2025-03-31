'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type SignupKey = {
  id: string;
  key: string;
  isUsed: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
};

export default function AdminKeysPage() {
  const [keys, setKeys] = useState<SignupKey[]>([]);
  const [searchQuery, setSearchQuery] = useState(''); // 🔍 Search state
  const [isLoading, setIsLoading] = useState(true);
  const [expiresInDays, setExpiresInDays] = useState('30');
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  const { user } = useAuth(); 

  // ✅ Redirect non-admin users
  useEffect(() => {
    if (user && user.is_admin !== 1) {
      toast.error('Access denied. Only admins can manage signup keys.');
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.is_admin === 1) {
      fetchKeys();
    }
  }, [user]);

  const fetchKeys = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/admin/keys');
      
      // ✅ Fix: Adjust mapping based on API response
      const formattedKeys = response.data.keys.map((key: { id: any; key_value: any; status: string; created_by: any; created_at: any; expires_at: any; }) => ({
        id: key.id,
        key: key.key_value, // 🔥 Ensure this matches DB field
        isUsed: key.status !== 'Available',
        createdBy: key.created_by || "System",
        createdAt: key.created_at,
        expiresAt: key.expires_at
      }));
  
      setKeys(formattedKeys);
    } catch (error) {
      console.error("Error fetching keys:", error);
      toast.error("Failed to fetch signup keys.");
    } finally {
      setIsLoading(false);
    }
  };
  

  const generateKey = async () => {
  if (!user || user.is_admin !== 1) {
    toast.error("You are not authorized to generate keys.");
    return;
  }

  try {
    setIsGenerating(true);

    const response = await axios.post('/api/admin/keys', {
      expiresInDays: expiresInDays, // Ensure it's a number
      createdBy: user.username || "Admin", // ✅ Corrected payload key
    });

    if (response.data.success) {
      setKeys((prevKeys) => [response.data.key, ...prevKeys]);
      toast.success("Signup key generated successfully!");
    } else {
      toast.error("Failed to generate signup key.");
    }
  } catch (error) {
    console.error("Error generating key:", error);
    toast.error("Failed to generate signup key.");
  } finally {
    setIsGenerating(false);
  }
};

  

  const deleteKey = async (id: string) => {
    if (!user || user.is_admin !== 1) {
      toast.error("You are not authorized to delete keys.");
      return;
    }
    try {
      await axios.delete('/api/admin/keys', {
        headers: { "x-user-admin": user.is_admin?.toString() || "0" },
        data: { id },
      });
      
      toast.success("Signup key deleted successfully!");
      setKeys(keys.filter((key) => key.id !== id));
    } catch (error) {
      console.error("Error deleting key:", error);
      toast.error("Failed to delete signup key.");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  // 🔍 **Filter keys based on search query**
const filteredKeys = keys.filter((key) =>
  key?.key?.toLowerCase().includes(searchQuery.toLowerCase())
);


  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold">Signup Keys ({filteredKeys.length})</h1>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          {/* 🔍 Search Input */}
          <input
            type="text"
            placeholder="Search keys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm w-48"
          />

          {/* Generate Key Button */}
          <button
            onClick={generateKey}
            disabled={isGenerating}
            className="bg-primary-yellow text-black hover:bg-black hover:text-white px-4 py-2 rounded-md transition"
          >
            {isGenerating ? 'Generating...' : 'Generate Key'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p>Loading keys...</p>
        </div>
      ) : (
        <>
          {/* 📌 Card Layout for Mobile */}
          <div className="block md:hidden space-y-4">
            {filteredKeys.length === 0 ? (
              <p className="text-center text-gray-500">No signup keys found.</p>
            ) : (
              filteredKeys.map((key) => (
                <div key={key.id} className="bg-white rounded-lg shadow p-4">
                  <p className="text-lg font-semibold break-all">{key.key}</p>
                  <p className="text-sm text-gray-500 mt-2">Created By: {key.createdBy || 'System'}</p>
                  <p className="text-sm text-gray-500">Created At: {formatDate(key.createdAt)}</p>
                  <p className="text-sm text-gray-500">Expires At: {formatDate(key.expiresAt)}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${key.isUsed ? 'bg-gray-200 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                      {key.isUsed ? 'Used' : 'Available'}
                    </span>
                    <button
                      onClick={() => deleteKey(key.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 📌 Table Layout for Larger Screens */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires At</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredKeys.map((key) => (
                  <tr key={key.id}>
                    <td className="px-4 py-4 text-sm font-medium">{key.key}</td>
                    <td className="px-4 py-4 text-sm">{key.isUsed ? 'Used' : 'Available'}</td>
                    <td className="px-4 py-4 text-sm">{key.createdBy || 'System'}</td>
                    <td className="px-4 py-4 text-sm">{formatDate(key.createdAt)}</td>
                    <td className="px-4 py-4 text-sm">{formatDate(key.expiresAt)}</td>
                    <td className="px-4 py-4 text-right">
                      <button onClick={() => deleteKey(key.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
