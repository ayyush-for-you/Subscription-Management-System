'use client';

import React, { useState } from 'react';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Calendar,
  CreditCard,
  Tag,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export function CustomerSubscriptionCard({ sub }: { sub: any }) {
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  const handleSupportRequest = async (type: string) => {
    try {
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: sub.id,
          action: 'NOTE_ADDED',
          details: `[CUSTOMER PORTAL REQUEST] Customer submitted a request for "${type}". Assigned account manager notified.`,
        }),
      });
      setRequestStatus(`Your request for "${type}" has been forwarded to your Brightloop account manager!`);
      setTimeout(() => setRequestStatus(null), 5000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Calculations
  const subtotal = sub.lines.reduce((sum: number, l: any) => sum + l.quantity * l.unitPrice, 0);
  let discountAmount = 0;
  if (sub.discount) {
    if (sub.discount.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * sub.discount.value) / 100;
    } else {
      discountAmount = Math.min(subtotal, sub.discount.value);
    }
  }
  const taxable = Math.max(0, subtotal - discountAmount);
  const totalTax = sub.lines.reduce((sum: number, l: any) => sum + l.quantity * l.unitPrice * (l.taxRate / 100), 0);
  const total = taxable + totalTax;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-6">
      {requestStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{requestStatus}</span>
        </div>
      )}

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-bold font-mono text-slate-900">{sub.subscriptionNumber}</h3>
            <StatusBadge status={sub.status} />
          </div>
          <p className="text-xs text-slate-500">
            {sub.plan.name} • <span className="font-semibold uppercase">{sub.plan.frequency} Cycle</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleSupportRequest('Plan Upgrade / Expansion')}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            Request Upgrade
          </button>
          <button
            onClick={() => handleSupportRequest('Contract Pause / Review')}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-medium transition-colors"
          >
            Pause Request
          </button>
        </div>
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
            Billing Renewal
          </span>
          <p className="font-bold text-slate-900 text-sm">
            {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString() : 'Active'}
          </p>
          <p className="text-slate-500">Terms: {sub.paymentTerms}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
            Cycle Investment
          </span>
          <p className="font-bold text-slate-900 text-sm">${total.toFixed(2)}</p>
          <p className="text-slate-500">
            {sub.discount ? `Voucher: ${sub.discount.code}` : 'Standard tier'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
            Contract Started
          </span>
          <p className="font-bold text-slate-900 text-sm">
            {new Date(sub.startDate).toLocaleDateString()}
          </p>
          <p className="text-slate-500">Service Status: 99.99% SLA</p>
        </div>
      </div>

      {/* Line Items */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 mb-2.5">Included Services & Feature Variants:</h4>
        <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
          {sub.lines.map((line: any) => (
            <div key={line.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50/50">
              <div>
                <span className="font-bold text-slate-800">{line.product.name}</span>
                {line.variant && (
                  <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {line.variant.variantName}
                  </span>
                )}
                <span className="block text-[11px] text-slate-400">{line.product.notes}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-slate-700">Qty: {line.quantity} × </span>
                <span className="font-bold text-slate-900 font-mono">${line.unitPrice.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

