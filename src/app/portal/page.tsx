import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Calendar,
  CreditCard,
  Repeat,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { CustomerSubscriptionCard } from './CustomerSubscriptionCard';

export const dynamic = 'force-dynamic';

export default async function CustomerPortalHomePage() {
  const session = await getSession();

  // If customer is logged in, show their subscriptions. If admin/staff is viewing portal, show demo customer's or own
  const customerId = session?.role === 'CUSTOMER' ? session.id : (await prisma.user.findFirst({ where: { role: 'CUSTOMER' } }))?.id;

  const subscriptions = await prisma.subscription.findMany({
    where: { customerId },
    include: {
      plan: true,
      lines: {
        include: { product: true, variant: true },
      },
      discount: true,
      invoices: {
        orderBy: { issueDate: 'desc' },
        take: 3,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Self-Service Hub
            </span>
          </div>
          <h1 className="text-2xl font-bold mt-2">Welcome back, {session?.name}</h1>
          <p className="text-xs text-slate-300">
            Manage your Brightloop Cloud subscriptions, review upcoming billing dates, and inspect your invoices.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Link
            href="/portal/invoices"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
          >
            View Invoices & Pay
          </Link>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Your Active & Pending Subscriptions</h2>
          <p className="text-xs text-slate-500">Live service contracts and automated renewal schedules</p>
        </div>

        {subscriptions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
            <Repeat className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No active subscriptions found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You do not have any active subscriptions registered to your account yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {subscriptions.map((sub) => (
              <CustomerSubscriptionCard key={sub.id} sub={JSON.parse(JSON.stringify(sub))} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

