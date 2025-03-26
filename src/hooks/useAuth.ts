import { createContext, useContext } from 'react';

// Define user type
export type User = {
  auth_token: any;
  id: string;
  email: string;
  name: string | null;
  is_admin: number;
  createdAt?: string;
  updatedAt?: string;
};

// Define auth context type
export type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, signupKey: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
};

// Create auth context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 

