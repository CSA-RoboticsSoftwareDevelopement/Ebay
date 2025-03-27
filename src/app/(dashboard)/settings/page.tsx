'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import Swal from "sweetalert2"; // ✅ Import SweetAlert2

type EbayProfile = {
  username: string;
  email: string;
  access_token?: string; // ✅ Store token from DB
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
};


export default function Settings() {
  const { user, authToken } = useAuth(); // ✅ Move useAuth() here (inside component)
  const [ebayProfile, setEbayProfile] = useState<EbayProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('account');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);


  useEffect(() => {
    const fetchEbayProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!user || !user.id) {
          console.error("❌ No user ID found in session");
          setError("Not authenticated. Please login again.");
          return;
        }

        console.log('✅ User ID:', user.id);
        console.log('✅ Token:', authToken);

        const profileResponse = await axios.get(
          `http://localhost:5000/api/ebay/profile?user_id=${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (profileResponse.data?.ebayProfile?.access_token) {
          setEbayProfile(profileResponse.data.ebayProfile);
        } else {
          setEbayProfile(null);
        }

        console.log('✅ eBay Profile:', profileResponse.data);
      } catch (error) {
        console.error('❌ Failed to load eBay profile:', error);
        setError(((error as any).response?.data?.error as string) || 'Failed to load eBay profile');
        setEbayProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEbayProfile();
  }, [user, authToken]); // ✅ Depend on user and authToken


  const handleDisconnectEbay = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will disconnect your eBay account!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, disconnect it!",
    });

    if (!result.isConfirmed) return;

    try {
      setIsLoading(true);

      if (!user || !user.id) {
        throw new Error("User ID not found. Please login again.");
      }

      await axios.delete("http://localhost:5000/api/ebay/disconnect", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        data: { user_id: user.id },
      });

      setEbayProfile(null);
      Swal.fire("Disconnected!", "Your eBay account has been removed.", "success");
    } catch (error) {
      console.error("❌ Failed to disconnect eBay account:", error);
      Swal.fire("Error", "Failed to disconnect eBay account.", "error");
    } finally {
      setIsLoading(false);
    }
  };






  // ✅ Listen for messages from the popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.status === "success") {
        console.log("✅ eBay authentication successful!");
        window.location.href = "/settings"; // ✅ Redirect parent page
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // ✅ Connect to eBay function
  const handleConnectEbay = async () => {
    try {
      setIsLoading(true);
  
      // ✅ Move `useAuth()` inside the component
      const userId = user?.id; // ✅ Get user ID safely
  
      if (!userId) {
        throw new Error("User ID not found. Please log in.");
      }
  
      // ✅ Send request with userId
      const response = await axios.get(`/api/ebay/auth-url?user_id=${userId}`);
  
      if (!response.data.url) throw new Error("Invalid OAuth URL from server");
  
      // ✅ Open popup AFTER fetching URL (prevents blank popup issue)
      const popup = window.open(
        response.data.url, // ✅ eBay OAuth URL
        "eBayOAuth",
        "width=600,height=700,resizable=yes,scrollbars=yes"
      );
  
      if (!popup) throw new Error("Popup blocked. Please allow pop-ups.");
    } catch (error) {
      console.error("❌ Error connecting to eBay:", error);
      toast.error("Failed to connect eBay account.");
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
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab
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

      {/* Account Settings Tab */}
      <div className="mt-6">



        {activeTab === 'account' && (
          <div className="space-y-6">
            {/* Profile section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-medium mb-4">Profile Information</h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value="John Doe"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value="johndoe@example.com"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    readOnly
                  />
                </div>
                <button
                  type="button"
                  className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed"
                  disabled
                >
                  Save Changes
                </button>
              </form>
            </div>

            {/* Password section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-medium mb-4">Change Password</h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value="********"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value="********"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value="********"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    readOnly
                  />
                </div>
                <button
                  type="button"
                  className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed"
                  disabled
                >
                  Change Password
                </button>
              </form>
            </div>
          </div>


        )}



        {/* Notifications Settings Tab */}
        {activeTab === 'notifications' && (
         <div className="bg-white rounded-lg p-6 shadow-sm">
         <h2 className="text-lg font-medium mb-4">Notification Preferences</h2>
         <div className="space-y-4">
           {/* Order Updates */}
           <div className="flex items-center justify-between">
             <div>
               <h3 className="text-sm font-medium text-gray-700">Order Updates</h3>
               <p className="text-sm text-gray-500">Receive notifications about order updates</p>
             </div>
             <button
               type="button"
               className="bg-blue-600 relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
               disabled
             >
               <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
             </button>
           </div>
       
           {/* Promotions */}
           <div className="flex items-center justify-between">
             <div>
               <h3 className="text-sm font-medium text-gray-700">Promotions</h3>
               <p className="text-sm text-gray-500">Receive notifications about promotions</p>
             </div>
             <button
               type="button"
               className="bg-gray-200 relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
               disabled
             >
               <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
             </button>
           </div>
       
           {/* Security Alerts */}
           <div className="flex items-center justify-between">
             <div>
               <h3 className="text-sm font-medium text-gray-700">Security Alerts</h3>
               <p className="text-sm text-gray-500">Receive notifications about security issues</p>
             </div>
             <button
               type="button"
               className="bg-blue-600 relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
               disabled
             >
               <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
             </button>
           </div>
       
           {/* New Features */}
           <div className="flex items-center justify-between">
             <div>
               <h3 className="text-sm font-medium text-gray-700">New Features</h3>
               <p className="text-sm text-gray-500">Receive notifications about new features</p>
             </div>
             <button
               type="button"
               className="bg-gray-200 relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
               disabled
             >
               <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
             </button>
           </div>
         </div>
       </div>
       
        )}

        {/* eBay Integration Tab */}
        {activeTab === 'integrations' && (
          <div className="card p-4 bg-white shadow rounded-lg">
            <h2 className="text-lg font-semibold mb-4">eBay Account</h2>

            <div className="flex items-center mb-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${ebayProfile?.access_token
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                  }`}
              >
                {ebayProfile?.access_token ? "Connected" : "Disconnected"}
              </span>
            </div>

            {ebayProfile?.access_token ? (
              <div className="space-y-3">
                <button
                  onClick={handleDisconnectEbay}
                  disabled={isLoading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {isLoading ? "Disconnecting..." : "Disconnect eBay Account"}
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectEbay}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isLoading ? "Redirecting..." : "Connect eBay Account"}
              </button>
            )}
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
         <div className="card p-4 bg-white shadow rounded-lg">
         <h2 className="text-lg font-semibold mb-4">Preferences</h2>
         <p className="text-gray-600">Customize your application experience.</p>
         
         <div className="mt-4">
           <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
           <select
             className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 cursor-not-allowed bg-gray-100"
             
           >
             <option value="light" selected>Light Mode</option>
             <option value="dark">Dark Mode</option>
           </select>
         </div>
       </div>
       
        )}
      </div>
    </div>

  );
}
