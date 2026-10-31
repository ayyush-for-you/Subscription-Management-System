import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { AppLayout } from '@/components/AppLayout';
import { Header } from '@/components/Header';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Repeat,
  DollarSign,
  AlertTriangle,
  FilePlus2,
  Receipt,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Calendar,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Compute real-time KPIs
  const activeSubsCount = await prisma.subscription.count({
    where: { status: 'ACTIVE' },
  });

  const pausedSubsCount = await prisma.subscription.count({
    where: { status: 'PAUSED' },
  });

  // Calculate MRR from active subscriptions
  const activeSubs = await prisma.subscription.findMany({
    where: { status: 'ACTIVE' },
    include: {
      plan: true,
      lines: true,
      discount: true,
    },
  });

  let totalMRR = 0;
  for (const sub of activeSubs) {
    let subTotal = 0;
    for (const line of sub.lines) {
      subTotal += line.quantity * line.unitPrice;
    }
    if (sub.discount) {
      if (sub.discount.discountType === 'PERCENTAGE') {
        subTotal -= (subTotal * sub.discount.value) / 100;
      } else {
        subTotal -= sub.discount.value;
      }
    }
    subTotal = Math.max(0, subTotal);

    // Normalize to monthly
    switch (sub.plan.frequency) {
      case 'DAILY':
        totalMRR += subTotal * 30;
        break;
      case 'WEEKLY':
        totalMRR += subTotal * 4.33;
        break;
      case 'YEARLY':
        totalMRR += subTotal / 12;
        break;
      case 'MONTHLY':
      default:
        totalMRR += subTotal;
        break;
    }
  }

  // Calculate Overdue Capital
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: 'OVERDUE',
      balanceDue: { gt: 0 },
    },
  });

  const totalOverdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  // Fetch recent subscriptions
  const recentSubscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: {
      customer: true,
      plan: true,
      lines: true,
    },
  });

  // Fetch recent audit activity
  const recentLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: {
      actor: true,
    },
  });

  return (
    <AppLayout>
      <Header
        title="Executive Operations Dashboard"
        subtitle="Real-time financial telemetry, recurring billing status, and collections overview"
      />

      <main className="flex-1 p-8 overflow-y-auto space-y-8">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Active Subscriptions */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Contracts
              </span>
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <Repeat className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-slate-900">{activeSubsCount}</p>
              <div className="flex items-center text-xs text-emerald-600 mt-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                <span>Operational & Generating Revenue</span>
              </div>
            </div>
          </div>

          {/* Monthly Recurring Revenue (MRR) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Monthly MRR
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-slate-900">
                ${totalMRR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center text-xs text-slate-500 mt-1 font-medium">
                <span>ARR: ${(totalMRR * 12).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>

          {/* Overdue Accounts Receivable */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-rose-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Overdue Receivables
              </span>
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-rose-600">
                ${totalOverdueAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center text-xs text-rose-600 mt-1 font-medium">
                <span>{overdueInvoices.length} past-due invoices</span>
              </div>
            </div>
          </div>

          {/* Paused Accounts / Dunning Hold */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Paused (Dunning Hold)
              </span>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-amber-600">{pausedSubsCount}</p>
              <div className="flex items-center text-xs text-slate-500 mt-1 font-medium">
                <span>Services temporarily suspended</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Launchpad & Workflows */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold">Quick Operations Launchpad</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Rapidly trigger sales quotations, inspect collection bottlenecks, or view full SaaS metrics.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/quotes/new"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold shadow-md transition-colors"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>New Quotation</span>
            </Link>
            <Link
              href="/invoices"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Receipt className="w-4 h-4" />
              <span>Invoices Ledger</span>
            </Link>
            <Link
              href="/dunning"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Dunning Queue</span>
            </Link>
          </div>
        </div>

        {/* Grid: Recent Subscriptions & Live Activity Chatter */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subscriptions Table (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Recent Subscriptions & Contracts</h3>
                <p className="text-xs text-slate-500">Latest agreements across all customer segments</p>
              </div>
              <Link
                href="/subscriptions"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3">Subscription #</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Plan Tier</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Next Billing</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentSubscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-indigo-600 font-mono">
                        <Link href={`/subscriptions/${sub.id}`}>{sub.subscriptionNumber}</Link>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-slate-800">{sub.customer.name}</div>
                        <div className="text-[11px] text-slate-400">{sub.customer.companyName || sub.customer.email}</div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="font-medium text-slate-700">{sub.plan.name}</span>
                        <div className="text-[10px] text-slate-400 uppercase">{sub.plan.frequency}</div>
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">
                        {sub.nextBillingDate ? (
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{new Date(sub.nextBillingDate).toLocaleDateString()}</span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Link
                          href={`/subscriptions/${sub.id}`}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Chatter Timeline (1 Col) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm">ERP Event Stream</h3>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Live</span>
            </div>

            <div className="mt-4 flex-1 space-y-4 overflow-y-auto max-h-[380px]">
              {recentLogs.map((log) => (
                <div key={log.id} className="text-xs border-l-2 border-indigo-500 pl-3 py-0.5 space-y-0.5">
                  <p className="text-slate-800 font-medium leading-relaxed">{log.details}</p>
                  <p className="text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-600">{log.action}</span> •{' '}
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}

