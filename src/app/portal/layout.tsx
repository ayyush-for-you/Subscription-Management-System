import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Zap, Receipt, Repeat, LogOut, ArrowLeft, ShieldCheck } from 'lucide-react';
import { PortalNav } from './PortalNav';

export default async function CustomerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Customer Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/portal" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight">Brightloop</span>
                <span className="ml-1 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Customer Portal
                </span>
              </div>
            </Link>

            <PortalNav />
          </div>

          <div className="flex items-center space-x-4">
            {/* If staff or admin viewing portal, show shortcut to return to Executive dashboard */}
            {session.role !== 'CUSTOMER' && (
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Executive Cockpit</span>
              </Link>
            )}

            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-white">{session.name}</p>
              <p className="text-[11px] text-slate-400">{session.companyName || session.email}</p>
            </div>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                title="Log Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main portal body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

