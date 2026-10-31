'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/StatusBadge';
import { ActivityChatter, AuditLogItem } from '@/components/ActivityChatter';
import {
  CheckCircle2,
  Share2,
  Receipt,
  PauseCircle,
  PlayCircle,
  XCircle,
  Building,
  User,
  Calendar,
  CreditCard,
  Tag,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface SubscriptionDetailViewProps {
  subscription: any;
  currentUser: { name: string; role: string } | null;
}

export function SubscriptionDetailView({
  subscription,
  currentUser,
}: SubscriptionDetailViewProps) {
  const router = useRouter();
  const [sub, setSub] = useState(subscription);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const stages = ['DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'PAUSED', 'CLOSED'];

  const currentStageIndex = stages.indexOf(sub.status);

  const handleTransition = async (newStatus: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/subscriptions/${sub.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setSub({ ...sub, status: newStatus });
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/billing/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: sub.id }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Invoice generated: ${data.invoicesCreated?.join(', ')}`);
        router.refresh();
      } else {
        alert(data.error || 'Failed to generate invoice');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const shareUrl = sub.shareToken ? `${typeof window !== 'undefined' ? window.location.origin : ''}/quote/${sub.shareToken}` : null;

  const copyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
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
  const totalTax = sub.lines.reduce((sum: number, l: any) => sum + (l.quantity * l.unitPrice * (l.taxRate / 100)), 0);
  const total = taxable + totalTax;

  return (
    <div className="space-y-8">
      {/* Top Status & State Transition Ribbon */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold font-mono text-slate-900">{sub.subscriptionNumber}</h2>
            <StatusBadge status={sub.status} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {sub.status === 'DRAFT' && (
              <button
                onClick={() => handleTransition('QUOTATION')}
                disabled={isLoading}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Send as Quotation
              </button>
            )}

            {sub.status === 'QUOTATION' && (
              <>
                {shareUrl && (
                  <button
                    onClick={copyShareLink}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedLink ? 'Link Copied!' : 'Copy 1-Click Quote Link'}</span>
                  </button>
                )}
                <button
                  onClick={() => handleTransition('ACTIVE')}
                  disabled={isLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  Activate Contract
                </button>
              </>
            )}

            {sub.status === 'ACTIVE' && (
              <>
                <button
                  onClick={handleGenerateInvoice}
                  disabled={isLoading}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Generate Invoice</span>
                </button>
                <button
                  onClick={() => handleTransition('PAUSED')}
                  disabled={isLoading}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold transition-colors"
                >
                  <PauseCircle className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
                <button
                  onClick={() => handleTransition('CLOSED')}
                  disabled={isLoading}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel Contract</span>
                </button>
              </>
            )}

            {sub.status === 'PAUSED' && (
              <button
                onClick={() => handleTransition('ACTIVE')}
                disabled={isLoading}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Resume Subscription</span>
              </button>
            )}
          </div>
        </div>

        {/* State Machine Ribbon Progression */}
        <div className="pt-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            State Machine Lifecycle:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {stages.map((st, i) => {
              const isCurrent = sub.status === st;
              const isPassed = currentStageIndex > i && sub.status !== 'PAUSED';
              return (
                <div
                  key={st}
                  className={`px-3 py-2 rounded-xl text-center border text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-500/30'
                      : isPassed
                      ? 'bg-slate-50 text-slate-700 border-slate-200'
                      : 'bg-slate-50/50 text-slate-400 border-slate-200/60'
                  }`}
                >
                  <span>{st}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Shareable Link Banner for Quotations */}
      {sub.status === 'QUOTATION' && shareUrl && (
        <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Share2 className="w-4 h-4 text-indigo-600" />
              <h4 className="font-bold text-slate-900 text-sm">Public 1-Click Buy Quotation Link Ready</h4>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Send this signed URL to the customer. They can review products, customize variants in real-time, and digitally sign to activate.
            </p>
            <p className="text-[11px] font-mono text-indigo-700 mt-1 break-all">{shareUrl}</p>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={copyShareLink}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              {copiedLink ? 'Copied to Clipboard!' : 'Copy Link'}
            </button>
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors"
              title="Open Public View in New Tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Contract Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase">
            <User className="w-4 h-4 text-indigo-500" />
            <span>Customer Profile</span>
          </div>
          <p className="text-sm font-bold text-slate-900 mt-2">{sub.customer.name}</p>
          <p className="text-xs text-slate-500">{sub.customer.companyName || 'Individual'}</p>
          <p className="text-xs text-slate-400">{sub.customer.email}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase">
            <Tag className="w-4 h-4 text-emerald-500" />
            <span>Subscription Plan</span>
          </div>
          <p className="text-sm font-bold text-slate-900 mt-2">{sub.plan.name}</p>
          <p className="text-xs text-slate-500 uppercase font-mono">{sub.plan.frequency} Cycle</p>
          <p className="text-xs text-slate-400">Min Qty: {sub.plan.minQuantity}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>Billing Schedule</span>
          </div>
          <p className="text-sm font-bold text-slate-900 mt-2">
            {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString() : 'N/A'}
          </p>
          <p className="text-xs text-slate-500">Terms: {sub.paymentTerms}</p>
          <p className="text-xs text-slate-400">
            Started: {new Date(sub.startDate).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase">
            <CreditCard className="w-4 h-4 text-purple-500" />
            <span>Billing Cycle Value</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">${total.toFixed(2)}</p>
          <p className="text-xs text-slate-500">
            {sub.discount ? `Discount: ${sub.discount.code}` : 'No discount applied'}
          </p>
        </div>
      </div>

      {/* Itemized Line Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Contract Line Items & Variants</h3>
          <span className="text-xs text-slate-400 font-medium">{sub.lines.length} items configured</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Product Name</th>
                <th className="px-6 py-3">Variant Specification</th>
                <th className="px-6 py-3">Quantity</th>
                <th className="px-6 py-3">Unit Price</th>
                <th className="px-6 py-3">Tax Rate</th>
                <th className="px-6 py-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sub.lines.map((line: any) => (
                <tr key={line.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-3.5 font-semibold text-slate-800">
                    {line.product.name}
                    <span className="block text-[11px] text-slate-400 font-normal">{line.product.type}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    {line.variant ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-medium text-[11px] border border-indigo-200">
                        {line.variant.variantName} (+${line.variant.priceAdjustment.toFixed(2)})
                      </span>
                    ) : (
                      <span className="text-slate-400">Standard Base</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-slate-700">{line.quantity}</td>
                  <td className="px-6 py-3.5 text-slate-600">${line.unitPrice.toFixed(2)}</td>
                  <td className="px-6 py-3.5 text-slate-600">{line.taxRate.toFixed(2)}%</td>
                  <td className="px-6 py-3.5 font-bold text-slate-900 text-right">
                    ${(line.quantity * line.unitPrice).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary Footer */}
        <div className="bg-slate-50/70 p-6 border-t border-slate-100 flex justify-end">
          <div className="w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Lines Subtotal:</span>
              <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
            </div>
            {sub.discount && (
              <div className="flex justify-between text-rose-600">
                <span>Applied Discount ({sub.discount.code}):</span>
                <span className="font-semibold">-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax:</span>
              <span className="font-semibold text-slate-800">${totalTax.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
              <span>Cycle Total:</span>
              <span className="text-indigo-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices History for this Subscription */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Generated Invoices ({sub.invoices.length})</h3>
          <Link href="/invoices" className="text-xs font-semibold text-indigo-600 hover:underline">
            View All Invoices
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Invoice #</th>
                <th className="px-6 py-3">Issue Date</th>
                <th className="px-6 py-3">Due Date</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Balance Due</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sub.invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-6 text-center text-slate-400">
                    No invoices generated for this subscription yet.
                  </td>
                </tr>
              ) : (
                sub.invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5 font-bold font-mono text-indigo-600">
                      <Link href={`/invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {new Date(inv.issueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-800">${inv.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-3.5 font-semibold text-rose-600">${inv.balanceDue.toFixed(2)}</td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom ERP-Style Activity Chatter */}
      <ActivityChatter
        subscriptionId={sub.id}
        initialLogs={sub.auditLogs}
        currentUser={currentUser}
      />
    </div>
  );
}

