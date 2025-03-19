'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function Settings() {
  const router = useRouter();
  
  // User state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    browser: false,
    pricing: true,
    inventory: true,
    marketUpdates: false,
    competitorChanges: true,
  });
  
  // eBay account state
  const [isConnected, setIsConnected] = useState(false);
  const [ebayUserId, setEbayUserId] = useState('');
  const [lastSync, setLastSync] = useState('');
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Theme settings
  const [theme, setTheme] = useState('system');
  const [dataRetention, setDataRetention] = useState('3months');
  
  // Tab state
  const [activeTab, setActiveTab] = useState('account');
  
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, this would be an API call to get user data
        const response = await axios.get('/api/user/profile');
        const { data } = response;
        
        setName(data.name || '');
        setEmail(data.email || '');
        setNotifications(data.notifications || {
          email: true,
          browser: false,
          pricing: true,
          inventory: true,
          marketUpdates: false,
          competitorChanges: true,
        });
        
        // Fetch eBay account data
        const ebayResponse = await axios.get('/api/user/ebay-accounts');
        const ebayAccounts = ebayResponse.data;
        
        if (ebayAccounts && ebayAccounts.length > 0) {
          setIsConnected(true);
          setEbayUserId(ebayAccounts[0].ebayUserId || '');
          setLastSync(new Date(ebayAccounts[0].updatedAt).toLocaleString() || '');
        }
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call to update user profile
      await axios.put('/api/user/profile', {
        name,
        email,
      });
      
      toast.success('Profile settings saved!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Call the API to change password
      await axios.put('/api/user/change-password', {
        currentPassword,
        newPassword,
      });
      
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.error || 'Failed to change password');
      } else {
        toast.error('Failed to change password');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNotificationChange = async (setting: string, checked: boolean) => {
    const updatedNotifications = { ...notifications, [setting]: checked };
    setNotifications(updatedNotifications);
    
    try {
      // In a real app, this would be an API call to update notification settings
      await axios.put('/api/user/notifications', {
        notifications: updatedNotifications,
      });
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast.error('Failed to update notification settings');
      // Revert the change on error
      setNotifications(notifications);
    }
  };
  
  const handleDisconnectEbay = async () => {
    if (confirm('Are you sure you want to disconnect your eBay account? This will stop syncing your data.')) {
      try {
        setIsLoading(true);
        
        // In a real app, this would be an API call to disconnect eBay account
        await axios.post('/api/ebay/disconnect');
        
        setIsConnected(false);
        setEbayUserId('');
        setLastSync('');
        toast.success('eBay account disconnected successfully');
      } catch (error) {
        console.error('Error disconnecting eBay:', error);
        toast.error('Failed to disconnect eBay account');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleConnectEbay = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, this would redirect to eBay OAuth
      const response = await axios.get('/api/ebay/auth-url');
      const { url } = response.data;
      
      window.location.href = url;
    } catch (error) {
      console.error('Error connecting to eBay:', error);
      toast.error('Failed to connect eBay account');
      setIsLoading(false);
    }
  };
  
  const handleSyncEbay = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call to sync eBay data
      await axios.post('/api/ebay/sync');
      
      setLastSync(new Date().toLocaleString());
      toast.success('eBay data synced successfully');
    } catch (error) {
      console.error('Error syncing eBay data:', error);
      toast.error('Failed to sync eBay data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);
    
    try {
      // In a real app, this would be an API call to update theme
      await axios.put('/api/user/settings', {
        theme: newTheme,
      });
    } catch (error) {
      console.error('Error updating theme:', error);
      toast.error('Failed to update theme');
    }
  };
  
  const handleDataRetentionChange = async (retention: string) => {
    setDataRetention(retention);
    
    try {
      // In a real app, this would be an API call to update data retention
      await axios.put('/api/user/settings', {
        dataRetention: retention,
      });
    } catch (error) {
      console.error('Error updating data retention:', error);
      toast.error('Failed to update data retention');
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-neutral-gray-500">Manage your account settings and preferences</p>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-neutral-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button 
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'account' 
                ? 'border-primary-yellow text-primary-black' 
                : 'border-transparent text-neutral-gray-500 hover:text-neutral-gray-700 hover:border-neutral-gray-300'
            }`}
            onClick={() => setActiveTab('account')}
          >
            Account
          </button>
          <button 
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications' 
                ? 'border-primary-yellow text-primary-black' 
                : 'border-transparent text-neutral-gray-500 hover:text-neutral-gray-700 hover:border-neutral-gray-300'
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          <button 
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'integrations' 
                ? 'border-primary-yellow text-primary-black' 
                : 'border-transparent text-neutral-gray-500 hover:text-neutral-gray-700 hover:border-neutral-gray-300'
            }`}
            onClick={() => setActiveTab('integrations')}
          >
            Integrations
          </button>
          <button 
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'preferences' 
                ? 'border-primary-yellow text-primary-black' 
                : 'border-transparent text-neutral-gray-500 hover:text-neutral-gray-700 hover:border-neutral-gray-300'
            }`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
        </nav>
      </div>
      
      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
            
            <form onSubmit={handleProfileSave}>
              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="name" className="label">Name</label>
                  <input
                    id="name"
                    type="text"
                    className="input w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="label">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    className="input w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary text-sm"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
          
          {/* Password Change */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Change Password</h2>
            
            <form onSubmit={handlePasswordChange}>
              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="currentPassword" className="label">Current Password</label>
                  <input
                    id="currentPassword"
                    type="password"
                    className="input w-full"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="label">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    className="input w-full"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="label">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="input w-full"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary text-sm"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="email-notifications"
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) => handleNotificationChange('email', e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-neutral-gray-300 text-primary-yellow focus:ring-primary-yellow"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="email-notifications" className="font-medium">Email Notifications</label>
                <p className="text-sm text-neutral-gray-500">Receive email notifications for important updates</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="browser-notifications"
                  type="checkbox"
                  checked={notifications.browser}
                  onChange={(e) => handleNotificationChange('browser', e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-neutral-gray-300 text-primary-yellow focus:ring-primary-yellow"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="browser-notifications" className="font-medium">Browser Notifications</label>
                <p className="text-sm text-neutral-gray-500">Get browser notifications when you're using the app</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="pricing-notifications"
                  type="checkbox"
                  checked={notifications.pricing}
                  onChange={(e) => handleNotificationChange('pricing', e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-neutral-gray-300 text-primary-yellow focus:ring-primary-yellow"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="pricing-notifications" className="font-medium">Pricing Alerts</label>
                <p className="text-sm text-neutral-gray-500">Get notified about significant price changes in your market</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="inventory-notifications"
                  type="checkbox"
                  checked={notifications.inventory}
                  onChange={(e) => handleNotificationChange('inventory', e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-neutral-gray-300 text-primary-yellow focus:ring-primary-yellow"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="inventory-notifications" className="font-medium">Inventory Alerts</label>
                <p className="text-sm text-neutral-gray-500">Get notified when your inventory levels are low</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="market-updates"
                  type="checkbox"
                  checked={notifications.marketUpdates}
                  onChange={(e) => handleNotificationChange('marketUpdates', e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-neutral-gray-300 text-primary-yellow focus:ring-primary-yellow"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="market-updates" className="font-medium">Market Updates</label>
                <p className="text-sm text-neutral-gray-500">Receive weekly insights about your market</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="competitor-changes"
                  type="checkbox"
                  checked={notifications.competitorChanges}
                  onChange={(e) => handleNotificationChange('competitorChanges', e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-neutral-gray-300 text-primary-yellow focus:ring-primary-yellow"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="competitor-changes" className="font-medium">Competitor Activity</label>
                <p className="text-sm text-neutral-gray-500">Get notified when competitors change their pricing strategy</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">eBay Account</h2>
          
          {isConnected ? (
            <div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-neutral-gray-100 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center">
                    <p className="font-medium">{ebayUserId}</p>
                    <span className="ml-2 px-2 py-0.5 bg-success/10 text-success text-xs font-medium rounded-full">Connected</span>
                  </div>
                  <p className="text-sm text-neutral-gray-500">Last sync: {lastSync}</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  className="btn btn-primary text-sm"
                  onClick={handleSyncEbay}
                  disabled={isLoading}
                >
                  {isLoading ? 'Syncing...' : 'Sync Now'}
                </button>
                <button
                  className="btn btn-outline text-sm"
                  onClick={handleDisconnectEbay}
                  disabled={isLoading}
                >
                  {isLoading ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-neutral-gray-600 mb-4">
                Connect your eBay seller account to import your listings and sales data.
              </p>
              <button
                className="btn btn-primary text-sm"
                onClick={handleConnectEbay}
                disabled={isLoading}
              >
                {isLoading ? 'Connecting...' : 'Connect eBay Account'}
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          {/* Theme Settings */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Theme Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="label">Application Theme</label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <input
                      id="theme-system"
                      name="theme"
                      type="radio"
                      checked={theme === 'system'}
                      onChange={() => handleThemeChange('system')}
                      className="w-4 h-4 text-primary-yellow focus:ring-primary-yellow"
                    />
                    <label htmlFor="theme-system" className="ml-3 text-sm">
                      System (follow device settings)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="theme-light"
                      name="theme"
                      type="radio"
                      checked={theme === 'light'}
                      onChange={() => handleThemeChange('light')}
                      className="w-4 h-4 text-primary-yellow focus:ring-primary-yellow"
                    />
                    <label htmlFor="theme-light" className="ml-3 text-sm">
                      Light
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="theme-dark"
                      name="theme"
                      type="radio"
                      checked={theme === 'dark'}
                      onChange={() => handleThemeChange('dark')}
                      className="w-4 h-4 text-primary-yellow focus:ring-primary-yellow"
                    />
                    <label htmlFor="theme-dark" className="ml-3 text-sm">
                      Dark
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Data Settings */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Data Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="label">Data Retention</label>
                <p className="text-sm text-neutral-gray-500 mb-2">Choose how long to keep your historical data</p>
                <select
                  value={dataRetention}
                  onChange={(e) => handleDataRetentionChange(e.target.value)}
                  className="input w-full"
                >
                  <option value="1month">1 Month</option>
                  <option value="3months">3 Months</option>
                  <option value="6months">6 Months</option>
                  <option value="1year">1 Year</option>
                  <option value="forever">Forever</option>
                </select>
              </div>
              
              <div>
                <button
                  className="btn btn-outline text-sm text-error hover:bg-error/10"
                  onClick={() => confirm('Are you sure you want to export all your data? This may take a while.') &&
                    toast.success('Your data export has started. You will receive an email when it\'s ready.')}
                >
                  Export All My Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 