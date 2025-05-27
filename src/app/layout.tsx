import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout"; // ✅ Import Client Component

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// ✅ Metadata must stay in Server Component
export const metadata: Metadata = {
  title: "Resale - Analytics for E-commerce Sellers",
  description: "Advanced analytics platform for e-commerce sellers",
  keywords:
    "eBay analytics, e-commerce analytics, seller tools, profit calculator, competitor analysis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-white antialiased ${inter.variable}`}>
        <ClientLayout>{children}</ClientLayout> {/* ✅ Wrap in Client Component */}
      </body>
    </html>
  );
}
