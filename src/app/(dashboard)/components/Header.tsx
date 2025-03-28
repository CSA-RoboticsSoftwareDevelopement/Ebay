'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter(); // ✅ Move useRouter inside the function

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New user registered', time: '2 min ago', read: false },
    { id: 3, message: 'Backup completed successfully', time: '30 min ago', read: false },
    { id: 4, message: 'New support ticket received', time: '1 hour ago', read: false },
    { id: 5, message: 'Scheduled maintenance in 24 hours', time: '3 hours ago', read: false },
    { id: 6, message: 'Subscription renewal reminder', time: '1 day ago', read: false },
    { id: 7, message: 'API rate limit exceeded', time: '2 days ago', read: false },
  ]);

  const { user, logout } = useAuth();
  const username = user?.username || 'User Name';

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of your account.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#ffc300',
      confirmButtonText: 'Yes, log me out',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      if (user) {
        logout();
      } else {
        router.push('/'); // ✅ Ensure router is properly used
      }
    }
  };

  // Mark notification as read
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  // Delete a notification
  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    setIsNotificationOpen(false);
  };

  return (
    <header className="bg-white border-b border-neutral-gray-200 h-16">
      <div className="h-full px-4 flex items-center justify-between ">
         {/* Left Section - Adds space for Sidebar Button */}
         <div className="flex-1 flex items-center">
          <h1 className="text-xl font-semibold text-center mt-2 ml-12 md:ml-0">Dashboard</h1> {/* ✅ Added margin to avoid overlap */}
        </div>
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              className="p-2 text-neutral-gray-500 hover:text-primary-black rounded-full hover:bg-neutral-gray-100 relative"
              aria-label="Notifications"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
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
              {/* Unread Notification Indicator */}
              {notifications.some(n => !n.read) && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-2 z-10 border border-neutral-gray-200">
                <div className="px-4 py-2 text-sm font-semibold text-gray-700 border-b flex justify-between">
                  <span>Notifications</span>
                  {notifications.length > 0 && (
                    <button onClick={markAllAsRead} className="text-primary-black text-xs hover:underline">
                      Mark all as read
                    </button>
                  )}
                </div>

                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div key={notification.id} className={`px-4 py-2 text-sm flex justify-between items-center ${notification.read ? 'text-gray-500' : 'text-black font-semibold'}`}>
                      <div className="flex flex-col">
                        <span>{notification.message}</span>
                        <span className="text-xs text-gray-400">{notification.time}</span>
                      </div>
                      <div className="flex space-x-4">
                        {!notification.read && (
                          <button
                            className="text-primary-yellow hover:text-blue-700"
                            onClick={() => markAsRead(notification.id)}
                            aria-label="Mark as read"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </button>
                        )}
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteNotification(notification.id)}
                          aria-label="Delete notification"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">No new notifications</div>
                )}
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-neutral-gray-200">
                <Link href="/settings" className="block px-4 py-2 text-sm text-neutral-gray-700 hover:bg-neutral-gray-100" onClick={() => setIsProfileOpen(false)}>Your Profile</Link>
                <Link href="/settings" className="block px-4 py-2 text-sm text-neutral-gray-700 hover:bg-neutral-gray-100" onClick={() => setIsProfileOpen(false)}>Settings</Link>
                <div className="border-t border-neutral-gray-200 my-1"></div>
                <button className="block w-full text-left px-4 py-2 text-sm text-neutral-gray-700 hover:bg-neutral-gray-100" onClick={handleLogout}>Sign out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
