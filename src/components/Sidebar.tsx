'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Repeat,
  FilePlus2,
  Receipt,
  AlertTriangle,
  Package,
  Layers,
  Settings,
  Users,
  ExternalLink,
  LogOut,
  Zap,
} from 'lucide-react';
import { SessionUser } from '@/lib/types';

interface SidebarProps {
  user?: SessionUser | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Executive Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'SaaS Metrics Cockpit', href: '/metrics', icon: TrendingUp },
    { name: 'Subscriptions', href: '/subscriptions', icon: Repeat },
    { name: 'Quotation Builder', href: '/quotes/new', icon: FilePlus2 },
    { name: 'Invoices & Billing', href: '/invoices', icon: Receipt },
    { name: 'Dunning & Recovery', href: '/dunning', icon: AlertTriangle },
  ];

  const adminNav = [
    { name: 'Products & Variants', href: '/admin/products', icon: Package },
    { name: 'Subscription Plans', href: '/admin/plans', icon: Layers },
    { name: 'Taxes & Discounts', href: '/admin/settings', icon: Settings },
    { name: 'Staff Management', href: '/admin/staff', icon: Users },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
        <Link href="/dashboard" className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-tight">Brightloop</span>
            <span className="ml-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              BSMS
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Operations Backbone
          </p>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Administration Section */}
        {user?.role === 'ADMIN' && (
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              System Administration
            </p>
            <nav className="space-y-1">
              {adminNav.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Portals & Switches */}
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Portals & Views
          </p>
          <nav className="space-y-1">
            <Link
              href="/portal"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-emerald-400 hover:bg-emerald-950/30 border border-emerald-500/20 transition-all"
            >
              <div className="flex items-center space-x-3">
                <ExternalLink className="w-4 h-4" />
                <span>Customer Portal</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                Client
              </span>
            </Link>
          </nav>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="min-w-0 flex-1 mr-2">
            <p className="text-xs font-semibold text-white truncate">
              {user?.name || 'Staff User'}
            </p>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="text-[10px] text-slate-400 truncate">{user?.email || 'sales@brightloop.com'}</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300">
                {user?.role || 'STAFF'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

