'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  name: string;
  href: string;
  icon: (props: { className: string }) => React.ReactNode;
  adminOnly?: boolean;
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        {...props}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
        />
      </svg>
    ),
  },
  {
    name: 'Products',
    href: '/products',
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        {...props}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
        />
      </svg>
    ),
  },
  {
    name: 'Admin Keys',
    href: '/admin/keys',
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        {...props}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
        />
      </svg>
    ),
    adminOnly: true, // ✅ Only show if user is admin
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        {...props}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // ✅ Ensure `is_admin` is treated as a number (not a string)
  const isAdmin = user?.is_admin === 1; // ✅ Ensure comparison is with `1`

  return (
    <div className="h-full bg-primary-black text-white w-64 flex-shrink-0">
      <div className="p-4 border-b border-neutral-gray-800">
        <Link href="/dashboard" className="flex items-center">
          <span className="text-primary-yellow font-bold text-2xl">Resale</span>
        </Link>
      </div>
      <nav className="mt-6 px-2">
        <ul className="space-y-1">
          {navigation
            .filter((item) => !item.adminOnly || (item.adminOnly && isAdmin))
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary-yellow text-primary-black font-medium'
                        : 'text-neutral-gray-300 hover:bg-neutral-gray-800'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-primary-black' : 'text-neutral-gray-400'
                      }`}
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>
      <div className="absolute bottom-0 w-64 p-4 border-t border-neutral-gray-800">
        {user ? (
          <div className="flex flex-col">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-neutral-gray-700 flex items-center justify-center text-sm font-medium">
                {user.name ? user.name.charAt(0) : user.email.charAt(0)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{user.name || 'User'}</p>
                <p className="text-xs text-neutral-gray-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="w-full text-sm text-neutral-gray-300 hover:text-white py-2 px-3 rounded-md hover:bg-neutral-gray-800 transition-colors"
            >
              Log Out
            </button>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-neutral-gray-700 flex items-center justify-center text-sm font-medium">
              ?
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Guest</p>
              <Link href="/login" className="text-xs text-primary-yellow">
                Log In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
