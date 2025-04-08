"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;
import { FiPlus, FiTrash2 } from "react-icons/fi";

console.log(BACKEND_SERVER_URL);
type Plugin = {
  id: number;
  name: string;
  description: string;
  price: string; // Add this line
  comingSoon?: boolean;
};

const pluginList: Plugin[] = [
  {
    id: 1,
    name: "Product Finder",
    description: "Easily find high-demand products to sell in your store.",
    price: "$0",
  },
  {
    id: 2,
    name: "Find Seller",
    description: "Discover top sellers and analyze their strategies.",
    price: "$14.99", // still shown as "—" due to comingSoon
    comingSoon: true,
  },
  {
    id: 3,
    name: "Product Optimization",
    description: "Enhance your listings with AI-optimized titles and prices.",
    price: "$19.99", // still shown as "—" due to comingSoon
    comingSoon: true,
  },
];

export default function PluginPage() {
  const { user, loading } = useAuth();
  const isAdmin = user?.is_admin === 1;
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const [installed, setInstalled] = useState<number[]>([]);
  const [loadingPlugins, setLoadingPlugins] = useState(false);
  const [loadingPluginId, setLoadingPluginId] = useState<number | null>(null);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // "all", "paid", "installed"

  // ✅ Fetch installed plugin IDs from backend
  useEffect(() => {
    const fetchPlugins = async () => {
      if (!user) return;
      setLoadingPlugins(true);
      try {
        const res = await fetch(`${BACKEND_SERVER_URL}/api/plugin/${user.id}`);
        const data = await res.json();
        const installedIds = data.plugins
          .filter((p: any) => p.installed)
          .map((p: any) => p.plugin_id);
        setInstalled(installedIds);
      } catch (err) {
        console.error("Error fetching installed plugins:", err);
      } finally {
        setLoadingPlugins(false);
      }
    };

    if (!loading) {
      fetchPlugins(); // ✅ no isAdmin check
    }
  }, [user, loading]);

  const filteredPlugins = pluginList.filter((plugin) => {
    const matchesSearch =
      plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "paid") {
      return (
        plugin.price.trim().match(/\$\d+/) &&
        plugin.price !== "$0" &&
        matchesSearch
      );
    }

    if (filter === "installed") {
      return installed.includes(plugin.id) && matchesSearch;
    }

    return matchesSearch; // for "all"
  });

  // ✅ Toggle plugin installation via backend
  const togglePlugin = async (id: number, fromModal = false) => {
    const plugin = pluginList.find((p) => p.id === id);
    if (!plugin || plugin.comingSoon) return;

    const install = !installed.includes(id);
    if (!fromModal) setLoadingPluginId(id); // 👈 only show loading state on card if not from modal

    try {
      const res = await fetch(`${BACKEND_SERVER_URL}/api/plugin/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user?.id,
          plugin_id: plugin.id,
          plugin_name: plugin.name,
          install,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        console.error("Error toggling plugin:", result.error);
        return;
      }

      // 👇 Delay for 1s
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setInstalled((prev) =>
        install ? [...prev, id] : prev.filter((pid) => pid !== id)
      );

      window.dispatchEvent(new Event("plugin-toggled"));
    } catch (error) {
      console.error("❌ Toggle failed:", error);
    } finally {
      if (!fromModal) setLoadingPluginId(null); // 👈 reset only if needed
    }
  };

  if (loading || loadingPlugins) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-2 text-left">Plugin Marketplace</h1>
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search Bar */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              id="search"
              name="search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-yellow focus:border-primary-yellow sm:text-sm"
              placeholder="Search products"
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Buttons */}
          <div className="relative w-48">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="installed">Installed</option>
            </select>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Showing {filteredPlugins.length} of {pluginList.length} plugins
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {pluginList
          .filter((plugin) => {
            const matchesSearch =
              plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              plugin.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

            if (filter === "paid") {
              return (
                plugin.price.trim().match(/\$\d+/) &&
                plugin.price !== "$0" &&
                matchesSearch
              );
            }

            if (filter === "installed") {
              return installed.includes(plugin.id) && matchesSearch;
            }

            return matchesSearch; // for "all"
          })

          .map((plugin) => {
            const isInstalled = installed.includes(plugin.id);

            return (
              <div
                key={plugin.id}
                className={`relative max-w-sm w-full rounded-lg shadow-md p-6 flex flex-col transition-shadow ${
                  plugin.comingSoon
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white hover:shadow-lg"
                }`}
              >
                {/* 👇 Badge for Installed */}
                {isInstalled && (
                  <span className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                    Installed
                  </span>
                )}
                <div>
                  <h2 className="text-xl font-semibold mb-2">{plugin.name}</h2>
                  <p className="mb-2">{plugin.description}</p>
                  <p className="mb-4 font-medium text-sm text-gray-700">
                    Price: {plugin.price}
                  </p>
                </div>

                {plugin.comingSoon ? (
                  <button
                    disabled
                    className="px-4 py-2 rounded-xl bg-gray-300 text-gray-500 font-medium"
                  >
                    Coming Soon
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedPlugin(plugin)}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
                      installed.includes(plugin.id)
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-yellow-400 hover:bg-yellow-500"
                    }`}
                  >
                    {installed.includes(plugin.id) ? (
                      <>
                        <FiTrash2 className="text-lg" />
                        Uninstall
                      </>
                    ) : (
                      <>
                        <FiPlus className="text-lg" />
                        Get
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
      </div>
      {selectedPlugin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 relative">
            <button
              className="absolute top-3 right-4 text-gray-500 hover:text-black text-xl"
              onClick={() => setSelectedPlugin(null)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold">{selectedPlugin.name}</h2>
            <p className="text-gray-700">{selectedPlugin.description}</p>
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-1">Terms & Conditions</h3>
              <p className="text-sm text-gray-600">
                By installing this plugin, you agree to our usage policy, data
                access permissions, and any associated service terms. This
                plugin may collect usage statistics to improve functionality.
              </p>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <button
                onClick={() => setSelectedPlugin(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  setModalLoading(true);
                  await togglePlugin(selectedPlugin.id, true); // pass true to skip loadingPluginId
                  setModalLoading(false);
                  setSelectedPlugin(null);
                }}
                disabled={modalLoading}
                className={`px-4 py-2 rounded-lg font-medium ${
                  installed.includes(selectedPlugin.id)
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-yellow-400 hover:bg-yellow-500"
                }`}
              >
                {modalLoading
                  ? installed.includes(selectedPlugin.id)
                    ? "Uninstalling..."
                    : "Installing..."
                  : installed.includes(selectedPlugin.id)
                  ? "Uninstall"
                  : "Install"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
