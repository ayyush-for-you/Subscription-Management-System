'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Receipt,
  CreditCard,
  Percent,
  BarChart3,
  UserCog,
  Settings,
  Calendar,
  Layers,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles: string[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'staff', 'customer'] },
  { name: 'Customers', href: '/dashboard/customers', icon: Users, roles: ['admin', 'staff'] },
  { name: 'Products', href: '/dashboard/products', icon: Package, roles: ['admin', 'staff'] },
  { name: 'Plans', href: '/dashboard/plans', icon: Layers, roles: ['admin', 'staff'] },
  { name: 'Quotations', href: '/dashboard/quotations', icon: FileText, roles: ['admin', 'staff'] },
  { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: Calendar, roles: ['admin', 'staff', 'customer'] },
  { name: 'Invoices', href: '/dashboard/invoices', icon: Receipt, roles: ['admin', 'staff', 'customer'] },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCard, roles: ['admin', 'staff', 'customer'] },
  { name: 'Discounts', href: '/dashboard/discounts', icon: Percent, roles: ['admin'] },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, roles: ['admin', 'staff'] },
  { name: 'Billing', href: '/dashboard/billing', icon: Calendar, roles: ['admin', 'staff'] },
  { name: 'Staff', href: '/dashboard/staff', icon: UserCog, roles: ['admin'] },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['admin'] },
];

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Brightloop</h1>
        <p className="text-gray-400 text-sm mt-1">Subscription Manager</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <p className="text-gray-400 text-xs">Role: <span className="text-white font-medium capitalize">{role}</span></p>
      </div>
    </div>
  );
}
