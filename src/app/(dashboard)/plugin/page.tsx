"use client";

import { useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link"; // Ensure you're using Next.js
const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;
import { FiPlus, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";
import { FiZap, FiSearch, FiPackage, FiStar } from "react-icons/fi";

const getPluginIcon = (name: string) => {
  switch (name.toLowerCase()) {
    case "product finder":
      return <FiSearch className="text-yellow-400 text-xl" />;
    case "product optimization":
      return <FiStar className="text-yellow-400 text-xl" />;
    case "find seller":
      return <FiPackage className="text-yellow-400 text-xl" />;
    default:
      return <FiZap className="text-yellow-400 text-xl" />;
  }
};

console.log(BACKEND_SERVER_URL);
interface Plugin {
  id: number;
  name: string;
  description: string;
  price: string;
  comingSoon?: boolean;
  plugin_id: string;  // Make sure this is included as it's in the backend data
  installed: boolean;
}


const pluginList: Plugin[] = [
  {
    id: 1,
    name: "Product Finder",
    description: "Easily find high-demand products to sell in your store.",
    price: "$0",
    plugin_id: "",
    installed: false
  },
  {
    id: 2,
    name: "Product Optimization",
    description: "Enhance your listings with AI-optimized titles and prices.",
    price: "$19.99",
    comingSoon: true,
    plugin_id: "",
    installed: false
  },
];

export default function PluginPage() {
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const [installed, setInstalled] = useState<number[]>([]);
  const [loadingPlugins, setLoadingPlugins] = useState(false);
  const [loadingPluginId, setLoadingPluginId] = useState<number | null>(null);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // "all", "paid", "installed"
 // installedIds is a number array like [1, 2]

  // ✅ Fetch installed plugin IDs from backend
  interface Plugin {
    id: number;
    description: ReactNode;
    name: ReactNode;
    plugin_id: string;
    installed: boolean;
  }

  useEffect(() => {
    const fetchPlugins = async () => {
      if (!user) return;
      setLoadingPlugins(true);
      try {
        const res = await fetch(`${BACKEND_SERVER_URL}/api/plugin/${user.id}`);
        const data = await res.json();
        const installedIds = (data.plugins as Plugin[])
          .filter((p) => p.installed)
          .map((p) => Number(p.plugin_id)); // Convert to number

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
    if (!fromModal) setLoadingPluginId(id); // `id` should be a number

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
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: result.error || "Failed to toggle plugin",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setInstalled((prev) =>
        install ? [...prev, id] : prev.filter((pid) => pid !== id)
      );

      window.dispatchEvent(new Event("plugin-toggled"));

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `${plugin.name} ${install ? "installed" : "uninstalled"}`,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: "#000",
        color: "#fff",
        customClass: {
          popup: "swal2-toast-dark",
        },
      });
    } catch (error) {
      console.error("❌ Toggle failed:", error);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Something went wrong",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: "#000",
        color: "#fff",
        customClass: {
          popup: "swal2-toast-dark",
        },
      });
    } finally {
      if (!fromModal) setLoadingPluginId(null); // Reset loading state
    }
  };

  if (loading || loadingPlugins) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="">
      <nav className="text-sm text-gray-400 mb-4">
        <ol className="list-reset flex">
          <li>
            <Link href="/" className="hover:underline text-primary-yellow">
              Home
            </Link>
          </li>
          <li>
            <span className="mx-2">/</span>
          </li>
          <li className="text-white">Marketplace</li>
        </ol>
      </nav>

      <h1 className="text-2xl font-bold mb-6 text-left text-white">
        Plugin Marketplace
      </h1>
      <div className="bg-neutral-800 rounded-xl shadow-md p-4 border border-gray-200">
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-neutral-800 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-yellow focus:border-primary-yellow sm:text-sm"
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
              className="block w-full px-4 py-2 border border-gray-300 rounded-md text-sm text-white bg-neutral-800 focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400"
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

      <div className=" mt-5 flex flex-wrap gap-4 ">
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
                className={`relative group w-full max-w-xs rounded-2xl p-4 border transition-all duration-300 overflow-hidden shadow-sm ${
                  plugin.comingSoon
                    ? "bg-black text-white border-gray-300 cursor-not-allowed"
                    : "bg-black hover:shadow-lg hover:scale-[1.01]"
                }`}
                style={{
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                }}
              >
                {/* Shine effect */}
                {/* {!plugin.comingSoon && (
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition duration-300">
                    <div className="absolute -top-1/2 left-1/2 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-10 transform rotate-12 blur-2xl animate-pulse"></div>
                  </div>
                )} */}

                {/* Installed badge */}
                {isInstalled && (
                  <span className="absolute top-2 right-2 bg-green-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">
                    Installed
                  </span>
                )}

                {/* Card content */}
                <div className="space-y-3 z-10 relative">
                  <div className="flex items-center gap-2 text-base font-semibold text-white">
                    {getPluginIcon(plugin.name)}
                    <span className="truncate">{plugin.name}</span>
                  </div>

                  <p className="text-sm text-gray-600 leading-snug line-clamp-3">
                    {plugin.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`inline-block font-medium px-2 py-0.5 rounded-full ${
                        plugin.price === "$0"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {plugin.price === "$0" ? "Free" : plugin.price}
                    </span>

                    {plugin.comingSoon && (
                      <span className="text-gray-400 font-medium">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>

                {/* Action button */}
                <div className="mt-4 z-10 relative">
                  {plugin.comingSoon ? (
                    <button
                      disabled
                      className="w-full py-1.5 text-sm rounded-xl bg-gray-300 text-gray-500 font-medium cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  ) : (
                    <button
  onClick={() => setSelectedPlugin(plugin as unknown as Plugin)} // Removed `null` and cast `plugin` to `Plugin`
  className={`w-full py-1.5 text-sm rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
    isInstalled
      ? "bg-red-600 text-white hover:bg-red-700"
      : "bg-yellow-400 text-black hover:bg-yellow-500"
  }`}
  disabled={loadingPluginId === plugin.id} // Disable button if the current plugin is loading
>
  {loadingPluginId === plugin.id ? (
    <div className="flex items-center">
      <svg
        className="animate-spin h-5 w-5 mr-2 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5h3l-4 4-4-4h3a5 5 0 005-5h3a8 8 0 01-8 8z"
        />
      </svg>
      {isInstalled ? "Uninstalling..." : "Installing..."}
    </div>
  ) : isInstalled ? (
    <>
      <FiTrash2 className="text-sm" />
      Uninstall
    </>
  ) : (
    <>
      <FiPlus className="text-base" />
      Install
    </>
  )}
</button>

                  )}
                </div>
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
            <h2 className="text-2xl font-bold">{selectedPlugin?.name}</h2>
            <p className="text-gray-700">{selectedPlugin?.description}</p>
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
