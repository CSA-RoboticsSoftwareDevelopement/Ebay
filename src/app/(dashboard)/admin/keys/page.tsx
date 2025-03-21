'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

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
  const [isLoading, setIsLoading] = useState(true);
  const [expiresInDays, setExpiresInDays] = useState('30');
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Fetch keys on component mount
  useEffect(() => {
    fetchKeys();
  }, []);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchKeys();
    }
  }, [user]); // Runs when user is updated
  

  // Fetch keys from API
  const fetchKeys = async () => {
    if (!user) return; // Ensure user exists before making the request
  
    try {
      setIsLoading(true);
  
      const response = await axios.get('/api/admin/keys', {
        headers: {
          "Content-Type": "application/json",
          "x-user-role": user.role || "GUEST", // Ensure role is provided
        },
      });
  
      // Ensure keys is always an array, even if the API response doesn't return it properly
      setKeys(Array.isArray(response.data.keys) ? response.data.keys : []); // Safe check
    } catch (error: any) {
      console.error('Error fetching keys:', error);
  
      if (error.response?.status === 403) {
        toast.error('You do not have permission to view signup keys.');
        router.push('/dashboard'); // Redirect if unauthorized
      } else {
        toast.error('Failed to fetch signup keys.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  
  
  // Generate new key
  const generateKey = async () => {
    if (!user) {
      toast.error("You are not authorized to generate keys.");
      return;
    }
  
    // Log user role and id for debugging purposes
  
    try {
      setIsGenerating(true);
  
      // Send request to backend to generate the signup key
      const response = await axios.post(
        "http://localhost:5000/api/generate-signup-key", // Backend endpoint
        {
          expiresAt: new Date(Date.now() + parseInt(expiresInDays) * 24 * 60 * 60 * 1000), // Expiration date based on days
          userId: user.name, // Pass user id in the request body
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-user-role": user.role || "GUEST", // Pass user role in the request headers
          },
        }
      );
  
      // Successfully generated key
      toast.success("Signup key generated successfully!");
      setKeys([response.data.key, ...keys]); // Ensure the key is treated as a single item and not an array
      fetchKeys(); // Refresh the list of keys  
    } catch (error: any) {
      console.error("Error generating key:", error);
  
      // Handle specific error cases
      if (error.response?.status === 403) {
        toast.error("You do not have permission to generate signup keys.");
        router.push("/dashboard"); // Redirect to dashboard if permission is denied
      } else {
        toast.error("Failed to generate signup key.");
      }
    } finally {
      setIsGenerating(false); // Reset the loading state
    }
  };  

  // Delete key
  const deleteKey = async (id: string) => {
    if (!user) {
      toast.error("You are not authorized to delete keys.");
      return;
    }
  
    try {
      // Send a DELETE request to the correct backend URL
      await axios.delete('http://localhost:5000/api/delete-signup-key', {
        headers: {
          "Content-Type": "application/json",
          "x-user-role": user.role || "GUEST", // Pass user role in headers
        },
        data: {
          id, // Send the key ID in the request body
        },
      });
  
      toast.success("Signup key deleted successfully!");
  
      // Remove the deleted key from the state
      setKeys(keys.filter((key) => key.id !== id));
    } catch (error: any) {
      console.error("Error deleting key:", error);
  
      if (error.response?.status === 403) {
        toast.error("You do not have permission to delete signup keys.");
        router.push("/dashboard"); // Redirect if unauthorized
      } else if (error.response?.status === 404) {
        toast.error("Signup key not found.");
      } else {
        toast.error("Failed to delete signup key.");
      }
    }
  };
  
  

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Signup Keys</h1>
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="expiresInDays" className="block text-sm font-medium text-neutral-gray-700 mb-1">
              Expires In (days)
            </label>
            <input
              id="expiresInDays"
              type="number"
              min="1"
              max="365"
              className="input w-24"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
            />
          </div>
          <button
            onClick={generateKey}
            disabled={isGenerating}
            className="btn btn-primary"
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-neutral-gray-200">
            <thead className="bg-neutral-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-gray-500 uppercase tracking-wider">
                  Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-gray-500 uppercase tracking-wider">
                  Expires At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-gray-200">
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-neutral-gray-500">
                    No signup keys found. Generate one to get started.
                  </td>
                </tr>
              ) : (
                keys.map((key) => (
                  <tr key={key.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {key.key}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          key.isUsed
                            ? 'bg-neutral-gray-100 text-neutral-gray-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {key.isUsed ? 'Used' : 'Available'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-gray-500">
                      {key.createdBy || 'System'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-gray-500">
                      {formatDate(key.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-gray-500">
                      {formatDate(key.expiresAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
  onClick={() => deleteKey(key.id)}
  className={`text-red-600 ${key.isUsed ? 'text-gray-400 cursor-not-allowed' : 'hover:text-red-900'}`}
  disabled={key.isUsed}
>
  Delete
</button>

                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 