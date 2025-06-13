"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

// Heroicons (outline)
function DashboardIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5V6.75A2.25 2.25 0 0 1 5.25 4.5h3A2.25 2.25 0 0 1 10.5 6.75v6.75m0 0V17.25A2.25 2.25 0 0 1 8.25 19.5h-3A2.25 2.25 0 0 1 3 17.25V13.5zm7.5 0V6.75A2.25 2.25 0 0 1 12.75 4.5h3A2.25 2.25 0 0 1 18 6.75v6.75m0 0V17.25A2.25 2.25 0 0 1 15.75 19.5h-3A2.25 2.25 0 0 1 10.5 17.25V13.5z" />
    </svg>
  );
}
function CubeIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4a2 2 0 001-1.73z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.27 6.96L12 12.01l8.73-5.05" />
    </svg>
  );
}
function ReportIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-6 0h6m-6 0a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-6 0V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10" />
    </svg>
  );
}
function SettingIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.01c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.01 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.01 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.01c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.01c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.01-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.01-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.246.07 2.573-1.01z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
  );
}
function MenuIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
    </svg>
  );
}
function XIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function ShopIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isLoggedIn, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const renderAdminLinks = () => (
    <>
      <NavLink href="/admin" icon={<DashboardIcon className="w-5 h-5" />} text="Dashboard" />
      <NavLink href="/admin/products" icon={<CubeIcon className="w-5 h-5" />} text="Kelola Produk" />
      <NavLink href="/admin/orders" icon={<ReportIcon className="w-5 h-5" />} text="Kelola Pesanan" />
      <NavLink href="/admin/settings" icon={<SettingIcon className="w-5 h-5" />} text="Pengaturan" />
    </>
  );

  const renderUserLinks = () => (
    <>
      <NavLink href="/products" icon={<CubeIcon className="w-5 h-5" />} text="Belanja" />
      <NavLink href="/orders" icon={<ReportIcon className="w-5 h-5" />} text="Pesanan Saya" />
    </>
  );

  if (loading) {
    return (
      <nav className="backdrop-blur-lg bg-white/80 border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="backdrop-blur-lg bg-white/80 border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={isLoggedIn ? (user?.role === 'admin' ? '/admin' : '/products') : '/'} 
                className="flex-shrink-0">
            <span className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg shadow-lg flex items-center justify-center">
                <ShopIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-500">
                JualanOnline
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {isLoggedIn ? (
              <>
                {user?.role === 'admin' ? renderAdminLinks() : renderUserLinks()}
                
                {/* User Menu */}
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.role === 'admin' ? '✨ Admin: ' : ''}
                    {user?.fullName || user?.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="px-6 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 transition-all duration-200"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            {isLoggedIn ? (
              <button
                onClick={() => setOpen(!open)}
                className="p-2 rounded-lg hover:bg-gray-100/50 transition-colors"
              >
                {open ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-500"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu with Updated Styling */}
      {isLoggedIn && (
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            open ? "block" : "hidden"
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white/90 backdrop-blur-lg border-t border-gray-200">
            {user?.role === 'admin' ? (
              <>
                <MobileNavLink
                  href="/admin"
                  icon={<DashboardIcon className="w-5 h-5" />}
                  text="Dashboard"
                  onClick={() => setOpen(false)}
                />
                <MobileNavLink
                  href="/admin/products"
                  icon={<CubeIcon className="w-5 h-5" />}
                  text="Kelola Produk"
                  onClick={() => setOpen(false)}
                />
                <MobileNavLink
                  href="/admin/orders"
                  icon={<ReportIcon className="w-5 h-5" />}
                  text="Kelola Pesanan"
                  onClick={() => setOpen(false)}
                />
                <MobileNavLink
                  href="/admin/settings"
                  icon={<SettingIcon className="w-5 h-5" />}
                  text="Pengaturan"
                  onClick={() => setOpen(false)}
                />
              </>
            ) : (
              <>
                <MobileNavLink
                  href="/products"
                  icon={<CubeIcon className="w-5 h-5" />}
                  text="Belanja"
                  onClick={() => setOpen(false)}
                />
                <MobileNavLink
                  href="/orders"
                  icon={<ReportIcon className="w-5 h-5" />}
                  text="Pesanan Saya"
                  onClick={() => setOpen(false)}
                />
              </>
            )}
            
            {/* Mobile User Menu with Updated Styling */}
            <div className="pt-4 mt-2 border-t border-gray-200">
              <div className="px-4 py-2">
                <p className="text-sm font-medium text-gray-700">
                  {user?.role === 'admin' ? '✨ Admin: ' : ''}
                  {user?.fullName || user?.username}
                </p>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 rounded-full transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// Update NavLink styling
function NavLink({ href, icon, text }) {
  return (
    <Link
      href={href}
      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors duration-200"
    >
      <span className="text-teal-500">{icon}</span>
      <span className="ml-2">{text}</span>
    </Link>
  );
}

// Update MobileNavLink styling
function MobileNavLink({ href, icon, text, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-all duration-200"
    >
      <span className="text-teal-500">{icon}</span>
      <span className="ml-2">{text}</span>
    </Link>
  );
}