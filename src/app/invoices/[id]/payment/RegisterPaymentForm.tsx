'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DollarSign, CreditCard, ArrowLeft, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

interface RegisterPaymentFormProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    balanceDue: number;
    customer: {
      name: string;
      email: string;
      companyName?: string | null;
    };
    subscription: {
      id: string;
      subscriptionNumber: string;
      status: string;
    };
  };
}

export function RegisterPaymentForm({ invoice }: RegisterPaymentFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState(invoice.balanceDue.toString());
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [referenceNote, setReferenceNote] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`/api/invoices/${invoice.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          paymentMethod,
          referenceNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push(`/invoices/${invoice.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const parsedAmount = parseFloat(amount) || 0;
  const remainingAfter = Math.max(0, invoice.balanceDue - parsedAmount);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Payment Registration Modal</h2>
          <p className="text-xs text-slate-500">Record inbound settlement against {invoice.invoiceNumber}</p>
        </div>
        <Link
          href={`/invoices/${invoice.id}`}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </Link>
      </div>

      {isSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center space-x-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Payment registered successfully! Updating ledger and redirecting...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Invoice Balance Summary Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">Customer</span>
          <p className="font-bold text-slate-800 mt-0.5">{invoice.customer.name}</p>
          <p className="text-slate-500">{invoice.customer.companyName || invoice.customer.email}</p>
        </div>
        <div className="text-right">
          <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">Outstanding Balance</span>
          <p className="text-lg font-bold text-rose-600 mt-0.5">${invoice.balanceDue.toFixed(2)}</p>
          <p className="text-slate-400">Total Invoice: ${invoice.totalAmount.toFixed(2)}</p>
        </div>
      </div>

      {/* Subscription Dunning Hold Notice */}
      {invoice.subscription.status === 'PAUSED' && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start space-x-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block">Automated Service Re-activation Active (SF-3)</strong>
            <span>
              Subscription {invoice.subscription.subscriptionNumber} is currently PAUSED. Settling this invoice in full will automatically reactivate the subscription back to ACTIVE.
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Credit Card">Credit Card (Stripe / Auth0)</option>
            <option value="Bank Transfer">Bank Wire Transfer (ACH / SEPA)</option>
            <option value="Stripe">Stripe Direct Checkout</option>
            <option value="Check">Corporate Check</option>
            <option value="Cash">Cash / Direct Deposit</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Settlement Amount ($)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <input
              type="number"
              step="0.01"
              max={invoice.balanceDue}
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs font-bold text-slate-900 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Remaining balance after this transaction: <strong>${remainingAfter.toFixed(2)}</strong>
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Transaction Reference / Payment Memo
          </label>
          <input
            type="text"
            placeholder="e.g. Stripe txn_3Mpq892LKh or Wire Ref #89281"
            value={referenceNote}
            onChange={(e) => setReferenceNote(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
          <Link
            href={`/invoices/${invoice.id}`}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading || parsedAmount <= 0}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : `Confirm Payment of $${parsedAmount.toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  );
}

