'use client';

import { useState, useEffect } from 'react';
import { User, LogIn, LogOut, ChevronDown } from 'lucide-react';

export default function LoginButton() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  // Check session on mount and when focus returns
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUser({ email: data.email });
          }
        }
      } catch {
        // auth not configured — ignore
      } finally {
        setLoading(false);
      }
    }

    checkAuth();

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkAuth();
    });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch { /* ignore */ }
    setUser(null);
    setShowMenu(false);
    window.location.href = '/';
  };

  const handleClick = () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    setShowMenu(!showMenu);
  };

  const handleMenuAction = async (action: 'logout' | 'signin') => {
    setShowMenu(false);
    if (action === 'logout') {
      await handleLogout();
    } else {
      window.location.href = '/auth';
    }
  };

  if (loading) {
    return <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200" />;
  }

  // --- Logged in ---
  if (user) {
    return (
      <div className="relative">
        <button
          onClick={handleClick}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <User className="h-4 w-4 text-blue-600" />
          <span className="hidden sm:inline truncate max-w-[120px]">{user.email}</span>
          <ChevronDown className="h-3 w-3 text-gray-400" />
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-50">
              <div className="px-3 py-2 border-b text-xs text-gray-500 truncate">{user.email}</div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // --- Not logged in ---
  return (
    <button
      onClick={() => window.location.href = '/auth'}
      className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
    >
      <LogIn className="h-4 w-4" />
      <span>Sign In</span>
    </button>
  );
}
