'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Play, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter();
  const [isRunningBilling, setIsRunningBilling] = useState(false);
  const [isRunningDunning, setIsRunningDunning] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleRunBilling = async () => {
    setIsRunningBilling(true);
    setNotification(null);
    try {
      const res = await fetch('/api/billing/run', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setNotification({
          type: 'success',
          message: `Billing Job Done: ${data.invoicesCreated?.length || 0} invoice(s) generated, ${data.skippedAlreadyBilled || 0} skipped (idempotent).`,
        });
        router.refresh();
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to run billing job' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setIsRunningBilling(false);
      setTimeout(() => setNotification(null), 6000);
    }
  };

  const handleRunDunning = async () => {
    setIsRunningDunning(true);
    setNotification(null);
    try {
      const res = await fetch('/api/dunning/run', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setNotification({
          type: 'success',
          message: `Dunning Evaluation Done: ${data.evaluatedInvoices || 0} evaluated, ${data.stage3SubscriptionsPaused || 0} paused, ${data.stage1RemindersSent + data.stage2UrgentNoticesSent} reminders queued.`,
        });
        router.refresh();
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to run dunning evaluation' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setIsRunningDunning(false);
      setTimeout(() => setNotification(null), 6000);
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 px-8 py-4">
      {notification && (
        <div
          className={`mb-3 p-3 rounded-xl text-xs font-medium flex items-center justify-between border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Run Billing Engine Button */}
          <button
            onClick={handleRunBilling}
            disabled={isRunningBilling}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all disabled:opacity-50"
            title="Idempotent Recurring Billing Run across all active subscriptions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunningBilling ? 'animate-spin' : ''}`} />
            <span>{isRunningBilling ? 'Running Billing...' : 'Trigger Billing Run'}</span>
          </button>

          {/* Run Dunning Engine Button */}
          <button
            onClick={handleRunDunning}
            disabled={isRunningDunning}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-all disabled:opacity-50"
            title="Evaluate overdue invoices and auto-pause accounts at Day 14"
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${isRunningDunning ? 'animate-spin' : ''}`} />
            <span>{isRunningDunning ? 'Evaluating...' : 'Run Dunning Engine'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

