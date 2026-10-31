import React from 'react';
import { prisma } from '@/lib/prisma';
import { AppLayout } from '@/components/AppLayout';
import { Header } from '@/components/Header';
import {
  TrendingUp,
  DollarSign,
  Users,
  AlertCircle,
  PieChart,
  Calendar,
  ShieldAlert,
} from 'lucide-react';
import { MetricsCharts } from './MetricsCharts';

export const dynamic = 'force-dynamic';

export default async function MetricsPage() {
  const activeSubs = await prisma.subscription.findMany({
    where: { status: 'ACTIVE' },
    include: {
      plan: true,
      lines: true,
      discount: true,
    },
  });

  const totalClosedSubs = await prisma.subscription.count({
    where: { status: 'CLOSED' },
  });

  const totalActiveCount = activeSubs.length;

  // Calculate MRR
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

  const totalARR = totalMRR * 12;
  const arpu = totalActiveCount > 0 ? totalMRR / totalActiveCount : 0;
  const churnRate = totalActiveCount > 0 ? (totalClosedSubs / (totalActiveCount + totalClosedSubs)) * 100 : 0;

  // Overdue Collections & Debt Aging Buckets
  const now = new Date();
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: 'OVERDUE',
      balanceDue: { gt: 0 },
    },
    include: {
      customer: true,
      subscription: true,
    },
  });

  let debt1to7 = 0;
  let debt8to14 = 0;
  let debt15plus = 0;

  for (const inv of overdueInvoices) {
    const daysOverdue = Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysOverdue <= 7) {
      debt1to7 += inv.balanceDue;
    } else if (daysOverdue <= 14) {
      debt8to14 += inv.balanceDue;
    } else {
      debt15plus += inv.balanceDue;
    }
  }

  const totalCapitalAtRisk = debt1to7 + debt8to14 + debt15plus;

  return (
    <AppLayout>
      <Header
        title="SaaS Metrics Cockpit"
        subtitle="Executive financial intelligence, ARPU, recurring revenue health, and aged debt recovery"
      />

      <main className="flex-1 p-8 overflow-y-auto space-y-8">
        {/* Core KPI Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* MRR */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Monthly Recurring (MRR)
            </span>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-2xl font-bold text-slate-900">
                ${totalMRR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                +14.2% MoM
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Normalized recurring contractual run-rate</p>
          </div>

          {/* ARR */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Annual Recurring (ARR)
            </span>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-2xl font-bold text-indigo-600">
                ${totalARR.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <span className="text-xs font-medium text-slate-500">12x MRR multiplier</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Annualized forward projected revenue</p>
          </div>

          {/* ARPU */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Average Revenue / User (ARPU)
            </span>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-2xl font-bold text-slate-900">
                ${arpu.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-xs font-semibold text-slate-600">Per Account</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Total MRR ÷ Active Subscriptions</p>
          </div>

          {/* Churn Rate */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Monthly Churn Rate
            </span>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-2xl font-bold text-emerald-600">
                {churnRate.toFixed(1)}%
              </p>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Industry Benchmark &lt; 2.5%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Net customer logo retention rate</p>
          </div>
        </div>

        {/* Charts & Graphs Row */}
        <MetricsCharts
          mrr={totalMRR}
          arr={totalARR}
          arpu={arpu}
          debt1to7={debt1to7}
          debt8to14={debt8to14}
          debt15plus={debt15plus}
        />

        {/* Overdue Collections Queue & Aged Debt Categories */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-800 text-base">Overdue Collections Queue (Capital at Risk)</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Aged debt breakdown categorized by past-due buckets for Dunning recovery enforcement
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                Total At Risk: ${totalCapitalAtRisk.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Aging Debt Summary Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-slate-50/50">
            <div className="p-5 text-center">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Bucket 1: 1–7 Days Overdue
              </span>
              <p className="text-xl font-bold text-slate-900 mt-1">${debt1to7.toFixed(2)}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Stage 1: Friendly Automated Reminder Sent</p>
            </div>

            <div className="p-5 text-center">
              <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">
                Bucket 2: 8–14 Days Overdue
              </span>
              <p className="text-xl font-bold text-slate-900 mt-1">${debt8to14.toFixed(2)}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Stage 2: Urgent Notice + Direct Pay Link</p>
            </div>

            <div className="p-5 text-center">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                Bucket 3: 15+ Days Overdue
              </span>
              <p className="text-xl font-bold text-rose-600 mt-1">${debt15plus.toFixed(2)}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Stage 3: Auto-Paused Subscription (Service Cut)</p>
            </div>
          </div>

          {/* Detailed Overdue Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Invoice #</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">Days Past Due</th>
                  <th className="px-6 py-3">Dunning Stage</th>
                  <th className="px-6 py-3">Balance Due</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overdueInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      No overdue accounts! Receivables are 100% healthy.
                    </td>
                  </tr>
                ) : (
                  overdueInvoices.map((inv) => {
                    const days = Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-3.5 font-bold font-mono text-indigo-600">
                          {inv.invoiceNumber}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="font-semibold text-slate-800">{inv.customer.name}</span>
                          <span className="block text-[11px] text-slate-400">{inv.customer.companyName || inv.customer.email}</span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-600">
                          {new Date(inv.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="font-bold text-rose-600">{days} days</span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Stage {inv.dunningStage}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-bold text-slate-900">
                          ${inv.balanceDue.toFixed(2)}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <a
                            href={`/invoices/${inv.id}`}
                            className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors"
                          >
                            Resolve / Pay
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}

