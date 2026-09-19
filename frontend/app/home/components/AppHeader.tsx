'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, CloudSync, Bell, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AppHeaderProps {
  title?: string;
  description?: string;
  subtitle?: string;
  statusBadge?: React.ReactNode;
  icon?: React.ReactNode;
}

export default function AppHeader({ title, description, subtitle, statusBadge, icon }: AppHeaderProps) {
  const [profile, setProfile] = useState<{name: string, businessName: string} | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch user profile
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setProfile(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setIsProfileOpen(false);
    // Add real sign out logic here later (e.g. fetch('/api/auth/logout', { method: 'POST' }))
    router.push('/');
  };

  return (
    <header className="h-[72px] shrink-0 bg-[var(--surface)] border-b border-[var(--border)] px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Page Title & Context */}
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2 bg-[var(--surface-low)] rounded-lg border border-[var(--divider)]">
            {icon}
          </div>
        )}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <h1 className="text-[18px] font-semibold text-[var(--text-primary)] tracking-tight">
              {title || 'VoiceMate'}
            </h1>
            {statusBadge && (
              <div className="mt-0.5">{statusBadge}</div>
            )}
          </div>
          {(description || subtitle) && (
            <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
              {subtitle || description}
            </p>
          )}
        </div>
      </div>

      {/* Right: Actions & Status */}
      <div className="flex items-center gap-6">
        {/* Global Search */}
        <div className="relative group hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors" />
          </div>
          <input
            type="text"
            className="block w-64 pl-10 pr-3 py-2 border border-[var(--border)] rounded-md leading-5 bg-[var(--surface-low)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:bg-[var(--surface)] focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] sm:text-[13px] transition-all"
            placeholder="Search SKUs, commands..."
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-[10px] font-semibold text-[var(--text-muted)] tracking-wider">⌘K</span>
          </div>
        </div>

        <div className="w-[1px] h-6 bg-[var(--divider)] hidden md:block"></div>

        {/* Sync & Notifications */}
        <div className="flex items-center gap-4">
          <button className="relative p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-md hover:bg-[var(--surface-hover)]" title="All changes synced">
            <CloudSync className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--success)] rounded-full"></span>
          </button>
          <button className="relative p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-md hover:bg-[var(--surface-hover)]">
            <Bell className="w-5 h-5" />
          </button>
        </div>

        <div className="w-[1px] h-6 bg-[var(--divider)]"></div>

        {/* User Profile */}
        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="text-right hidden sm:block">
              <p className="text-[13px] font-medium text-[var(--text-primary)] leading-tight group-hover:text-[var(--primary)] transition-colors">
                {profile ? profile.name : "Suresh R."}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] font-medium">Supervisor</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[var(--primary)] to-blue-400 flex items-center justify-center text-white font-semibold text-[13px] shadow-sm">
              {profile ? profile.name.charAt(0).toUpperCase() : "S"}
            </div>
          </div>
          
          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-[var(--divider)] mb-1 sm:hidden">
                <p className="text-[13px] font-medium text-[var(--text-primary)]">
                  {profile ? profile.name : "Suresh R."}
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">Supervisor</p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-[13px] text-[var(--danger)] hover:bg-[var(--danger)]/5 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
