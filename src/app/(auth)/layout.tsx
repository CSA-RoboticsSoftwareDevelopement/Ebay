import Link from 'next/link';
import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-primary-black text-white py-4">
        <div className="container mx-auto px-4">
          <Link href="/" className="text-primary-yellow font-bold text-2xl">
            Resale
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-neutral-gray-500 text-sm">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} Resale. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 