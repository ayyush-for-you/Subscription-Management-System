'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Repeat, Receipt } from 'lucide-react';

export function PortalNav() {
  const pathname = usePathname();

  const links = [
    { name: 'My Subscriptions', href: '/portal', icon: Repeat },
    { name: 'My Invoices & Payments', href: '/portal/invoices', icon: Receipt },
  ];

  return (
    <nav className="flex items-center space-x-1">
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isActive
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

