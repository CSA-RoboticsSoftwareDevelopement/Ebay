"use client";

import { useEffect, useState } from "react";
import { AuthProvider } from "@/context/AuthContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ✅ Prevent rendering until client-side hydration is complete
  if (!isMounted) return null;

  return <AuthProvider>{children}</AuthProvider>;
}
