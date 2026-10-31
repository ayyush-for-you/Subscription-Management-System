'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Download,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';

interface CustomerInvoiceItem {
  id: string;
  invoiceNumber: string;
  subscriptionNumber: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  balanceDue: number;
  status: string;
  dunningStage: number;
}

export function CustomerInvoicesView({
  initialInvoices,
}: {
  initialInvoices: CustomerInvoiceItem[];
}) {
  const router = useRouter();
  const [invoices, setInvoices] = useState(initialInvoices);

  // Payment Modal State
  const [payingInvoice, setPayingInvoice] = useState<CustomerInvoiceItem | null>(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [referenceNote, setReferenceNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState('');

  const openPayModal = (inv: CustomerInvoiceItem) => {
    setPayingInvoice(inv);
    setAmount(inv.balanceDue.toString());
    setError('');
    setReferenceNote('');
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;

    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`/api/invoices/${payingInvoice.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          paymentMethod,
          referenceNote: referenceNote || 'Online Customer Portal Settlement',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');

      setSuccessMsg(`Payment of $${parseFloat(amount).toFixed(2)} processed successfully!`);
      setPayingInvoice(null);
      router.refresh();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Contract Ref</th>
                <th className="px-6 py-4">Issue Date</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Balance Due</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No invoices recorded for your account.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600">
                      {inv.subscriptionNumber}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(inv.issueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(inv.dueDate).toLocaleDateString()}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">${inv.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 font-bold">
                      {inv.balanceDue > 0 ? (
                        <span className="text-rose-600">${inv.balanceDue.toFixed(2)}</span>
                      ) : (
                        <span className="text-emerald-600">$0.00 (Settled)</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={inv.status} type="invoice" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <a
                          href={`/api/invoices/${inv.id}/pdf`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </a>

                        {inv.balanceDue > 0 && (
                          <button
                            onClick={() => openPayModal(inv)}
                            className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay Online</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Online Payment Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Pay Invoice {payingInvoice.invoiceNumber}</h3>
                <p className="text-xs text-slate-400">Secure 256-bit encrypted card/bank checkout</p>
              </div>
              <button onClick={() => setPayingInvoice(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                {error}
              </div>
            )}

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Balance Due:</span>
              <span className="text-lg font-bold text-rose-600 font-mono">
                ${payingInvoice.balanceDue.toFixed(2)}
              </span>
            </div>

            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white"
                >
                  <option value="Credit Card">Credit Card (Stripe Checkout)</option>
                  <option value="Bank Transfer">Direct Bank Wire (ACH / SEPA)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pay Amount ($)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={payingInvoice.balanceDue}
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-bold text-slate-900 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Note / Reference (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Card ending 4242"
                  value={referenceNote}
                  onChange={(e) => setReferenceNote(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Authorizing...' : `Pay $${parseFloat(amount || '0').toFixed(2)} Now`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

