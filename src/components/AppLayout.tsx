import React from 'react';
import { Sidebar } from './Sidebar';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // If customer attempts to access internal admin views, redirect to portal
  if (session.role === 'CUSTOMER') {
    redirect('/portal');
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar user={session} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

