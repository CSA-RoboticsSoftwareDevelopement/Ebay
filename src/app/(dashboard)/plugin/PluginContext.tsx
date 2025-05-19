// src/context/PluginContext.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;

type PluginContextType = {
  installedPluginIds: number[];
  refreshPlugins: () => Promise<void>;
};

const PluginContext = createContext<PluginContextType>({
  installedPluginIds: [],
  refreshPlugins: async () => {},
});

export const PluginProvider = ({ children }) => {
  const { user } = useAuth();
  const [installedPluginIds, setInstalledPluginIds] = useState<number[]>([]);

  const fetchInstalledPlugins = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${BACKEND_SERVER_URL}/api/plugin/${user.id}`);
      const data = await res.json();
      const installed = data.plugins
        .filter((p) => p.installed)
        .map((p) => Number(p.plugin_id));
      setInstalledPluginIds(installed);
    } catch (err) {
      console.error("Failed to fetch installed plugins:", err);
    }
  };

  useEffect(() => {
    fetchInstalledPlugins();
    window.addEventListener("plugin-toggled", fetchInstalledPlugins); // ✅ update on install/uninstall
    return () => window.removeEventListener("plugin-toggled", fetchInstalledPlugins);
  }, [user]);

  return (
    <PluginContext.Provider
      value={{ installedPluginIds, refreshPlugins: fetchInstalledPlugins }}
    >
      {children}
    </PluginContext.Provider>
  );
};

export const usePluginContext = () => useContext(PluginContext);
