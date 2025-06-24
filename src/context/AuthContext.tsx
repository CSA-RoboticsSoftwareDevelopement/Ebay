// import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import { toast } from "react-hot-toast";

// // It's better to get environment variables in a way that doesn't depend on Next.js specifics
// // If this is a client-side component, you might need to ensure NEXT_PUBLIC prefix is used correctly
// // or pass it down via props if running in a different environment.
// const BACKEND_SERVER_URL = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_BACKEND_SERVER_URL : '';

// type User = {
//   id: string;
//   email: string;
//   is_admin: number;
//   username: string;
//   // Password should ideally not be part of user object in frontend
//   // Consider removing 'password' from this type if it's never needed client-side
// };

// type AuthContextType = {
//   user: User | null;
//   loading: boolean;
//   authToken: string | null;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => void;
//   checkAuth: () => Promise<void>;
//   setAuthTokenAndUser: (token: string, userData: User) => void; // New function to update context
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [authToken, setAuthToken] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [isMounted, setIsMounted] = useState(false);
//   const router = useRouter();

//   // Effect to ensure the component is mounted before interacting with browser APIs
//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   // Function to set auth token and user data in state and session storage
//   const setAuthTokenAndUser = useCallback((token: string, userData: User) => {
//     setAuthToken(token);
//     setUser(userData);
//     sessionStorage.setItem('authToken', token);
//     // Store the entire user object as a JSON string
//     sessionStorage.setItem('user', JSON.stringify(userData));
//     // Removed individual userEmail and userId as they are now part of the 'user' object
//   }, []);

//   // Function to check authentication status, prioritizing session storage
// const checkAuth = useCallback(async () => {
//   setLoading(true);

//   try {
//     const storedToken = sessionStorage.getItem("authToken");
//     const storedUserString = sessionStorage.getItem("user");

//     if (storedToken && storedUserString) {
//       try {
//         const parsedUser: User = JSON.parse(storedUserString);
//         setAuthToken(storedToken);
//         setUser(parsedUser);
//         setLoading(false);
//         return;
//       } catch (parseError) {
//         console.error("❌ Failed to parse stored user data:", parseError);
//       }
//     }

//     if (storedToken) {
//       console.log("🔹 Validating session with backend...");
//       const response = await axios.get(`${BACKEND_SERVER_URL}/api/auth/session`, {
//         headers: { Authorization: `Bearer ${storedToken}` },
//       });

//       if (response.data.user) {
//         setUser(response.data.user);
//         setAuthToken(storedToken); // Reuse existing token
//         sessionStorage.setItem("user", JSON.stringify(response.data.user));
//         console.log("✅ Session restored from backend");
//       } else {
//         console.warn("⚠️ No valid session found.");
//         sessionStorage.clear();
//         setUser(null);
//         setAuthToken(null);
//       }
//     } else {
//       sessionStorage.clear();
//       setUser(null);
//       setAuthToken(null);
//     }
//   } catch (error) {
//     console.error("❌ checkAuth failed:", error);
//     sessionStorage.clear();
//     setUser(null);
//     setAuthToken(null);
//   } finally {
//     setLoading(false);
//   }
// }, []);


//   // Effect to run checkAuth when the component mounts
//   useEffect(() => {
//     if (isMounted) { // Only run checkAuth after the component has mounted
//       checkAuth();
//     }
//   }, [checkAuth, isMounted]);

//   const login = async (email: string, password: string) => {
//     setLoading(true); // Start loading on login attempt
//     try {
//       const response = await axios.post(
//         `${BACKEND_SERVER_URL}/api/auth/login`,
//         { email, password }
//       );

//       console.log("🔹 Login Success:", response.data.user);
//       setAuthTokenAndUser(response.data.token, response.data.user);
//       toast.success("Logged in successfully!");
//       router.push("/dashboard");
//     } catch (error) {
//       console.error("❌ Login failed:", error);
//       toast.error("Login failed. Please check your credentials.");
//     } finally {
//       setLoading(false); // Stop loading regardless of success or failure
//     }
//   };

//   const logout = async () => {
//     setLoading(true); // Start loading on logout attempt
//     try {
//       // Include the auth token in Authorization header for logout
//       await axios.post(
//         `${BACKEND_SERVER_URL}/api/auth/logout`,
//         {},
//         {
//           headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
//         }
//       );
//       setUser(null);
//       setAuthToken(null);
//       sessionStorage.removeItem('authToken');
//       sessionStorage.removeItem('user'); // Remove the stored user object
//       toast.success("Logged out successfully!");
//       router.push("/login");
//     } catch (error) {
//       console.error("❌ Logout failed:", error);
//       toast.error("Logout failed. Please try again.");
//     } finally {
//       setLoading(false); // Stop loading regardless of success or failure
//     }
//   };

//   // Only render children if the component has mounted
//   if (!isMounted) {
//     return null;
//   }

//   return (
//     <AuthContext.Provider value={{ user, loading, authToken, login, logout, checkAuth, setAuthTokenAndUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// }


"use client"; // This directive is important for client components in Next.js 13+

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL; // Next.js handles this automatically for client components

type User = {
  id: string;
  email: string;
  is_admin: boolean; // Changed to boolean
  username: string;
  // Consider if you really need `password` here. It's generally not stored on the client.
  // password?: string; // Optional if you have it in backend response but don't need it on frontend
};

type AuthContextType = {
  user: User | null;
  loading: boolean; // Renamed from isLoading for consistency with your variable name
  authToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setAuthTokenAndUser: (token: string, userData: User) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Initial state is true because we're checking auth
  const [isMounted, setIsMounted] = useState(false); // To prevent hydration issues
  const router = useRouter();

  // Effect to ensure the component is mounted before interacting with browser APIs
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Function to set auth token and user data in state and session storage
  const setAuthTokenAndUser = useCallback((token: string, userData: User) => {
    setAuthToken(token);
    // Ensure is_admin is boolean if your backend sends it as a number
    const processedUserData: User = {
      ...userData,
      is_admin: typeof userData.is_admin === 'number' ? Boolean(userData.is_admin) : userData.is_admin
    };
    setUser(processedUserData);
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('user', JSON.stringify(processedUserData));
  }, []);

  // Function to check authentication status, prioritizing session storage
  const checkAuth = useCallback(async () => {
    setLoading(true); // Ensure loading is true at the start of checkAuth

    try {
      if (!isMounted) { // Do not proceed if not mounted yet
        return;
      }

      const storedToken = sessionStorage.getItem("authToken");
      const storedUserString = sessionStorage.getItem("user");

      if (storedToken && storedUserString) {
        try {
          const parsedUser: User = JSON.parse(storedUserString);
          // Ensure is_admin is boolean when parsing from storage
          const processedParsedUser: User = {
            ...parsedUser,
            is_admin: typeof parsedUser.is_admin === 'number' ? Boolean(parsedUser.is_admin) : parsedUser.is_admin
          };
          setAuthToken(storedToken);
          setUser(processedParsedUser);
          console.log("✅ Session restored from Session Storage.");
          setLoading(false); // Set loading to false here if successful from storage
          return; // Exit early if successfully loaded from storage
        } catch (parseError) {
          console.error("❌ Failed to parse stored user data:", parseError);
          // If parse fails, clear only the problematic items
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('user');
        }
      }

      // If no valid data in session storage or parse failed, try backend session check
      if (storedToken) { // Only attempt backend if we have a token to send
        console.log("🔹 Validating session with backend...");
        const response = await axios.get(`${BACKEND_SERVER_URL}/api/auth/session`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (response.data.user) {
          // Ensure is_admin is boolean when receiving from backend
          const backendUser: User = {
            ...response.data.user,
            is_admin: typeof response.data.user.is_admin === 'number' ? Boolean(response.data.user.is_admin) : response.data.user.is_admin
          };
          setUser(backendUser);
          setAuthToken(storedToken); // Reuse existing token
          sessionStorage.setItem("user", JSON.stringify(backendUser)); // Update stored user data
          console.log("✅ Session restored from backend.");
        } else {
          console.warn("⚠️ Backend reported no valid session found.");
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('user');
          setUser(null);
          setAuthToken(null);
        }
      } else {
        // No token at all, ensure states are null
        setUser(null);
        setAuthToken(null);
      }
    } catch (error) {
      console.error("❌ checkAuth failed during backend validation:", error);
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
      setUser(null);
      setAuthToken(null);
    } finally {
      setLoading(false); // Ensure loading is always set to false at the end
    }
  }, [isMounted]); // Dependency on isMounted to ensure browser APIs are ready

  // Effect to run checkAuth when the component mounts
  useEffect(() => {
    if (isMounted) {
      checkAuth();
    }
  }, [isMounted, checkAuth]); // Add checkAuth to dependencies as it's a useCallback

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${BACKEND_SERVER_URL}/api/auth/login`,
        { email, password }
      );

      console.log("🔹 Login Success:", response.data.user);
      setAuthTokenAndUser(response.data.token, response.data.user);
      toast.success("Logged in successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("❌ Login failed:", error);
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${BACKEND_SERVER_URL}/api/auth/logout`,
        {},
        {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
        }
      );
      setUser(null);
      setAuthToken(null);
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
      toast.success("Logged out successfully!");
      router.push("/login");
    } catch (error) {
      console.error("❌ Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Do not return null when not mounted. Let `loading` handle the initial state.
  // The `if (!isMounted)` check at the top of checkAuth is sufficient.

  return (
    <AuthContext.Provider value={{ user, loading, authToken, login, logout, checkAuth, setAuthTokenAndUser }}>
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