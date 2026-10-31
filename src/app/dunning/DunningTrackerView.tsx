'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Send,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface OverdueInvoiceItem {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string | null;
  subscriptionId: string;
  subscriptionNumber: string;
  subscriptionStatus: string;
  dueDate: string;
  balanceDue: number;
  dunningStage: number;
  daysPastDue: number;
}

interface DunningTrackerViewProps {
  initialInvoices: OverdueInvoiceItem[];
}

export function DunningTrackerView({ initialInvoices }: DunningTrackerViewProps) {
  const router = useRouter();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [isRunning, setIsRunning] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleRunDunning = async () => {
    setIsRunning(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/dunning/run', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setFeedback(
          `Dunning evaluation completed: ${data.evaluatedInvoices} evaluated, ${data.stage3SubscriptionsPaused} paused, ${data.stage1RemindersSent + data.stage2UrgentNoticesSent} notices sent.`
        );
        router.refresh();
      } else {
        setFeedback(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleManualReminder = async (invoiceId: string, stage: number) => {
    try {
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId,
          action: 'DUNNING_TRIGGERED',
          details: `Manual Dunning Notice (Stage ${stage}) dispatched by finance staff to recover overdue balance.`,
        }),
      });
      alert('Manual overdue notice dispatched and logged to audit trail!');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Aging Buckets Calculations
  const bucket1 = invoices.filter((i) => i.daysPastDue <= 7);
  const bucket2 = invoices.filter((i) => i.daysPastDue > 7 && i.daysPastDue <= 14);
  const bucket3 = invoices.filter((i) => i.daysPastDue > 14);

  const totalAtRisk = invoices.reduce((sum, i) => sum + i.balanceDue, 0);

  return (
    <div className="space-y-8">
      {/* Sequence Rules Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              Rule-Based Overdue Recovery
            </span>
            <h2 className="text-base font-bold mt-2">Brightloop 3-Stage Automated Dunning Engine (SF-3)</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Automated escalation recovers cash flow while shielding staff from manual email chasing.
            </p>
          </div>

          <button
            onClick={handleRunDunning}
            disabled={isRunning}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running Rules...' : 'Execute Dunning Run'}</span>
          </button>
        </div>

        {/* Visual Sequence Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
            <span className="text-[11px] font-bold text-amber-300 uppercase">Stage 1: Day 3 Past Due</span>
            <p className="text-xs font-semibold text-white mt-1">Friendly Reminder Email</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Gentle automated email reminder with invoice breakdown.</p>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
            <span className="text-[11px] font-bold text-orange-300 uppercase">Stage 2: Day 7 Past Due</span>
            <p className="text-xs font-semibold text-white mt-1">Urgent Notice + Direct Pay Link</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Payment gateway link sent; flagged in staff collection cockpit.</p>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
            <span className="text-[11px] font-bold text-rose-400 uppercase">Stage 3: Day 14+ Past Due</span>
            <p className="text-xs font-semibold text-white mt-1">Automatic Subscription Pause</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Contract flipped to PAUSED until payment is registered.</p>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-900 text-xs font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Debt Aging Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
            1–7 Days (Stage 1)
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            ${bucket1.reduce((sum, i) => sum + i.balanceDue, 0).toFixed(2)}
          </p>
          <p className="text-xs text-slate-500">{bucket1.length} accounts in friendly reminder stage</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">
            8–14 Days (Stage 2)
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            ${bucket2.reduce((sum, i) => sum + i.balanceDue, 0).toFixed(2)}
          </p>
          <p className="text-xs text-slate-500">{bucket2.length} accounts with urgent notice dispatched</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
            15+ Days (Stage 3 Paused)
          </span>
          <p className="text-2xl font-bold text-rose-600 mt-2">
            ${bucket3.reduce((sum, i) => sum + i.balanceDue, 0).toFixed(2)}
          </p>
          <p className="text-xs text-slate-500">{bucket3.length} accounts under active service suspension</p>
        </div>
      </div>

      {/* Collections Action Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Active Dunning Queue ({invoices.length})</h3>
            <p className="text-xs text-slate-400">Total capital at risk: ${totalAtRisk.toFixed(2)}</p>
          </div>
          <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl">
            {invoices.length} Overdue Receivables
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Invoice #</th>
                <th className="px-6 py-3.5">Customer & Entity</th>
                <th className="px-6 py-3.5">Contract #</th>
                <th className="px-6 py-3.5">Days Past Due</th>
                <th className="px-6 py-3.5">Dunning Stage</th>
                <th className="px-6 py-3.5">Sub Status</th>
                <th className="px-6 py-3.5">Overdue Balance</th>
                <th className="px-6 py-3.5 text-right">Escalation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-400">
                    No overdue accounts! Dunning queue is clean.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                      <Link href={`/invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-400">{inv.customerCompany || inv.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600">
                      <Link href={`/subscriptions/${inv.subscriptionId}`} className="hover:underline">
                        {inv.subscriptionNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-rose-600">{inv.daysPastDue} days</span>
                      <span className="block text-[10px] text-slate-400">
                        Due: {new Date(inv.dueDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.dunningStage >= 3
                            ? 'bg-rose-100 text-rose-800'
                            : inv.dunningStage === 2
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        Stage {inv.dunningStage}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.subscriptionStatus === 'PAUSED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {inv.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ${inv.balanceDue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleManualReminder(inv.id, inv.dunningStage || 1)}
                          title="Dispatch Urgent Reminder Email"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                        <Link
                          href={`/invoices/${inv.id}/payment`}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition-colors"
                        >
                          Settle
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

