"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";
const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;

// ✅ Separate Icon Components
const DashboardIcon = ({ className = "w-5 h-5 mr-3 text-current" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
    />
  </svg>
);

const InventoryIcon = ({ className = "w-5 h-5 mr-3 text-current" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
    />
  </svg>
);

const SettingsIcon = ({ className = "w-5 h-5 mr-3 text-current" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);
const PricingIcon = ({ className = "w-5 h-5 mr-3 text-current" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v12m0-12a4 4 0 100 8 4 4 0 100-8z"
    />
  </svg>
);

const PluginIcon = ({ className = "w-5 h-5 mr-3 text-current" }) => (
  <svg
    className={className}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      d="M6 12c.263 0 .524-.06.767-.175a2 2 0 0 0 .65-.491c.186-.21.333-.46.433-.734.1-.274.15-.568.15-.864a2.4 2.4 0 0 0 .586 1.591c.375.422.884.659 1.414.659.53 0 1.04-.237 1.414-.659A2.4 2.4 0 0 0 12 9.736a2.4 2.4 0 0 0 .586 1.591c.375.422.884.659 1.414.659.53 0 1.04-.237 1.414-.659A2.4 2.4 0 0 0 16 9.736c0 .295.052.588.152.861s.248.521.434.73a2 2 0 0 0 .649.488 1.809 1.809 0 0 0 1.53 0 2.03 2.03 0 0 0 .65-.488c.185-.209.332-.457.433-.73.1-.273.152-.566.152-.861 0-.974-1.108-3.85-1.618-5.121A.983.983 0 0 0 17.466 4H6.456a.986.986 0 0 0-.93.645C5.045 5.962 4 8.905 4 9.736c.023.59.241 1.148.611 1.567.37.418.865.667 1.389.697Zm0 0c.328 0 .651-.091.94-.266A2.1 2.1 0 0 0 7.66 11h.681a2.1 2.1 0 0 0 .718.734c.29.175.613.266.942.266.328 0 .651-.091.94-.266.29-.174.537-.427.719-.734h.681a2.1 2.1 0 0 0 .719.734c.289.175.612.266.94.266.329 0 .652-.091.942-.266.29-.174.536-.427.718-.734h.681c.183.307.43.56.719.734.29.174.613.266.941.266a1.819 1.819 0 0 0 1.06-.351M6 12a1.766 1.766 0 0 1-1.163-.476M5 12v7a1 1 0 0 0 1 1h2v-5h3v5h7a1 1 0 0 0 1-1v-7m-5 3v2h2v-2h-2Z"
    />
  </svg>
);

const AdminIcon = ({ className = "w-5 h-5 mr-3 text-current" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
    />
  </svg>
);

const productFinderIcon = ({ className = "w-5 h-5 mr-3 text-current" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
    />
  </svg>
);

const OrdersIcon = ({ className = "w-5 h-5 mr-3 text-current" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
    />
  </svg>
);

interface NavItem {
  name: string;
  href: string;
  icon: (props: { className?: string }) => React.ReactNode;
  adminOnly?: boolean;
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { name: "Orders", href: "/orders", icon: OrdersIcon },
  { name: "Inventory", href: "/inventory", icon: InventoryIcon },
  { name: "Products Finder", href: "/productFinder", icon: productFinderIcon },
  { name: "Admin Keys", href: "/admin/keys", icon: AdminIcon, adminOnly: true },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
  { name: "Plugin", href: "/plugin", icon: PluginIcon }, // 👈 replaced SettingsIcon
  { name: "Pricing", href: "/admin/keys/pricing", icon: PricingIcon },
];

export default function Sidebar() {
  const { user, logout, checkAuth } = useAuth();
  const pathname = usePathname();
  // Admin check is used in the navigation filtering below
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pluginUpdateTrigger, setPluginUpdateTrigger] = useState(0);
  const [isProductFinderEnabled, setIsProductFinderEnabled] = useState<
    null | boolean
  >(null);
  useEffect(() => {
    const fetchPluginStatus = async () => {
      try {
        const res = await fetch(`${BACKEND_SERVER_URL}/api/plugin/${user?.id}`);
        const data = await res.json();
        const plugin = data.plugins?.find(
          (p: any) => p.plugin_id === 1 && p.user_id === user?.id
        );
        setIsProductFinderEnabled(plugin?.installed === 1);
      } catch (err) {
        console.error("Failed to fetch plugin status:", err);
      }
    };

    fetchPluginStatus(); // initial fetch

    const handlePluginToggled = () => {
      fetchPluginStatus(); // refetch when toggled
    };

    window.addEventListener("plugin-toggled", handlePluginToggled);

    return () => {
      window.removeEventListener("plugin-toggled", handlePluginToggled);
    };
  }, [user?.id]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#ffc300",
      confirmButtonText: "Yes, log me out",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      logout();
    }
  };

  // Ensure Sidebar updates after login
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      {/* Sidebar Toggle Button (Only visible when sidebar is closed) */}
      {!isSidebarOpen && (
        <button
          className="md:hidden fixed top-4 left-4 bg-primary-yellow p-2 rounded-md text-black shadow-lg z-50"
          onClick={() => setIsSidebarOpen(true)}
        >
          ☰
        </button>
      )}

      {/* Sidebar Overlay (for mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 bg-primary-black text-white w-64 transform transition-transform z-50 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:relative md:flex md:flex-col md:w-64 h-screen shadow-lg`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-neutral-gray-800 flex justify-between">
          <Link
            href="/dashboard"
            className="text-primary-yellow font-bold text-2xl"
          >
            Resale
          </Link>
          {/* Close button for mobile */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            ✖
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6 px-2 flex-grow">
          <ul className="space-y-1">
            {navigation
              .filter((item) => {
                if (
                  item.name === "Products Finder" &&
                  isProductFinderEnabled === false
                )
                  return false;
                if (item.adminOnly && !user?.is_admin) return false;
                return true;
              })

              .map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                        isActive
                          ? "bg-primary-yellow text-primary-black font-medium"
                          : "text-neutral-gray-300 hover:bg-neutral-gray-800"
                      }`}
                      onClick={() => setIsSidebarOpen(false)} // ✅ Close sidebar on click
                    >
                      <span className="mr-3"></span>
                      {item.icon && item.icon({})}
                      {item.name}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </nav>

        {/* User Profile & Logout */}
        <div className="absolute bottom-0 w-full p-4 border-t border-neutral-gray-800">
          {user ? (
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-neutral-gray-700 flex items-center justify-center text-sm font-medium">
                  {user.username?.charAt(0) ?? user.email?.charAt(0) ?? ""}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {user.username || "User"}
                  </p>
                  <p className="text-xs text-neutral-gray-400">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-3 py-1 text-sm hover:bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                  />
                </svg>
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-neutral-gray-700 flex items-center justify-center text-sm font-medium">
                ?
              </div>
              <div>
                <p className="text-sm font-medium">Guest</p>
                <Link href="/login" className="text-xs text-primary-yellow">
                  Log In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
