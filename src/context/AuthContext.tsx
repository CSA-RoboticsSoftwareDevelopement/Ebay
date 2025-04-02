'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;

// ✅ Define User Type
type User = {
  id: string;
  email: string;
  is_admin: number;
  username: string;
};

// ✅ Define AuthContext Type
type AuthContextType = {
  user: User | null;
  loading: boolean;
  authToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
};

// ✅ Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ Auth Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null); // ✅ Store token
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false); // ✅ Fix hydration mismatch
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ✅ Check Authentication Status
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
  
      // Fetch cookies from API
      const cookieResponse = await axios.get(`${BACKEND_SERVER_URL}/api/auth/get-cookies`, {
        withCredentials: true,
      });
  
      // Extract auth_token correctly from response
      const storedToken = cookieResponse.data?.cookies?.auth_token;
  
      if (storedToken) {
        document.cookie = `auth_token=${storedToken}; path=/`; // Store in cookies
        setAuthToken(storedToken);
      }
  
      // Call session API with token
      const response = await axios.get(`${BACKEND_SERVER_URL}/api/auth/session`, {
        withCredentials: true,
        headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
      });
  
      if (response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
  
      if (response.data.token) {
        setAuthToken(response.data.token);
        localStorage.setItem('auth_token', response.data.token);
      }
    } catch (error) {
      console.error('❌ Authentication check failed:', error);
      setUser(null);
      setAuthToken(null);
      localStorage.removeItem('auth_token'); // Ensure clearing on failure
    } finally {
      setLoading(false);
    }
  }, []);
  
  // ✅ Run checkAuth() when component mounts
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ✅ Login Function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${BACKEND_SERVER_URL}}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      console.log('🔹 Login Success:', response.data.user);
      setUser(response.data.user);
      setAuthToken(response.data.token); // ✅ Store token in state
      router.push('/dashboard');
    } catch (error) {
      console.error('❌ Login failed:', error);
      toast.error('Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout Function
  const logout = async () => {
    try {
      await axios.post(`${BACKEND_SERVER_URL}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      setAuthToken(null); // ✅ Clear token on logout
      router.push('/login');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      toast.error('Logout failed. Try again.');
    }
  };

  if (!isMounted) return null; // ✅ Fix hydration mismatch

  return (
    <AuthContext.Provider value={{ user, loading, authToken, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Custom Hook to Use Auth
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
