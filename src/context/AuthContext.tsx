import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;

type User = {
  id: string;
  email: string;
  is_admin: number;
  username: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  authToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getAuthTokenFromCookies = () => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as { [key: string]: string });

    return cookies['auth_token'] || null;
  };

  // ✅ Wrap checkAuth in useCallback
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const storedToken = getAuthTokenFromCookies();
      if (storedToken) {
        setAuthToken(storedToken);
      }

      const response = await axios.get(`${BACKEND_SERVER_URL}/api/auth/session`, {
        withCredentials: true,
        headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
      });

      setUser(response.data.user);
      if (response.data.token) {
        setAuthToken(response.data.token);
        document.cookie = `auth_token=${response.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax${
          window.location.protocol === 'https:' ? '; Secure' : ''
        }`;
      }
    } catch (error) {
      console.error('❌ Authentication check failed:', error);
      setUser(null);
      setAuthToken(null);
    } finally {
      setLoading(false);
    }
  }, []); // ✅ Dependencies array ensures it's memoized properly

  // ✅ Use checkAuth inside useEffect
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${BACKEND_SERVER_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      console.log("🔹 Login Success:", response.data.user);
      setUser(response.data.user);
      setAuthToken(response.data.token);
      router.push("/dashboard");
    } catch (error) {
      console.error("❌ Login failed:", error);
      toast.error("Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${BACKEND_SERVER_URL}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      setAuthToken(null);
      router.push("/login");
    } catch (error) {
      console.error("❌ Logout failed:", error);
      toast.error("Logout failed. Try again.");
    }
  };

  if (!isMounted) return null;

  return (
    <AuthContext.Provider value={{ user, loading, authToken, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
