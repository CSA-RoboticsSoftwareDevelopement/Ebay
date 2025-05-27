"use client";

import React from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { usePathname } from "next/navigation";
import { PluginProvider } from "./plugin/PluginContext";
 // ✅ Added

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

const generateBreadcrumbs = () => {
  let segments = pathname.split("/").filter(Boolean);

  // Check if the path is inside admin/keys/plans or admin/keys/pricing
  // Adjust the exact path check as per your route structure
  if (
    segments[0] === "admin" &&
    segments[1] === "keys" &&
    (segments[2] === "plans" || segments[2] === "pricing")
  ) {
    // Remove "keys" segment
    segments = [segments[0], ...segments.slice(2)];
  }

  const breadcrumbs = [
    { title: "Home", href: "/" },
    ...segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const title = segment.charAt(0).toUpperCase() + segment.slice(1);
      return {
        title: decodeURIComponent(title.replace(/-/g, " ")),
        href,
        current: index === segments.length - 1,
      };
    }),
  ];

  return breadcrumbs;
};

  return (
    <PluginProvider> {/* ✅ Wrap in provider */}
      <div className="flex h-screen bg-black text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header breadcrumbs={generateBreadcrumbs()} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </PluginProvider>
  );
}
