'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user } = useAuth();
  const username = user?.username || ' User Name'; // Default to 'User' if username is not available
  return (
    <header className="bg-white border-b border-neutral-gray-200 h-16">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="p-2 text-neutral-gray-500 hover:text-primary-black rounded-full hover:bg-neutral-gray-100"
            aria-label="Notifications"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
          </button>
          <div className="relative">
            <button
              type="button"
              className="flex items-center space-x-2"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              aria-label="User menu"
              aria-expanded={isProfileOpen}
            >
              <div className="w-8 h-8 rounded-full bg-neutral-gray-200 flex items-center justify-center text-sm font-medium">
                U
              </div>
              <span className="hidden md:block text-sm font-medium">{username}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 text-neutral-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-neutral-gray-200">
                <Link
                  href="/settings/profile"
                  className="block px-4 py-2 text-sm text-neutral-gray-700 hover:bg-neutral-gray-100"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Your Profile
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm text-neutral-gray-700 hover:bg-neutral-gray-100"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Settings
                </Link>
                <div className="border-t border-neutral-gray-200 my-1"></div>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-neutral-gray-700 hover:bg-neutral-gray-100"
                  onClick={() => {
                    setIsProfileOpen(false);
                    // Logout logic will be implemented later
                    console.log('Logout clicked');
                  }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}