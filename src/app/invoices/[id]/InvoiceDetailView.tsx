'use client';

import React from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';
import { ActivityChatter } from '@/components/ActivityChatter';
import {
  Download,
  Printer,
  DollarSign,
  Calendar,
  Building,
  User,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

interface InvoiceDetailViewProps {
  invoice: any;
  currentUser: { name: string; role: string } | null;
}

export function InvoiceDetailView({ invoice, currentUser }: InvoiceDetailViewProps) {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold font-mono text-slate-900">{invoice.invoiceNumber}</h2>
          <StatusBadge status={invoice.status} type="invoice" />
          {invoice.dunningStage > 0 && invoice.balanceDue > 0 && (
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
              Dunning Stage {invoice.dunningStage}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2.5">
          <a
            href={`/api/invoices/${invoice.id}/pdf`}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </a>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          {invoice.balanceDue > 0 && (
            <Link
              href={`/invoices/${invoice.id}/payment`}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <DollarSign className="w-4 h-4" />
              <span>Register Payment</span>
            </Link>
          )}
        </div>
      </div>

      {/* Official Invoice Sheet */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-12 space-y-8 print:p-0 print:border-none print:shadow-none">
        {/* Header Branding */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-8">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">BRIGHTLOOP SOFTWARE</span>
            </div>
            <p className="text-xs text-slate-400">100 Enterprise Way, Suite 400 • billing@brightloop.com</p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <h1 className="text-2xl font-bold font-mono text-slate-900">{invoice.invoiceNumber}</h1>
            <p className="text-xs text-slate-500">
              Subscription Contract: <strong className="text-slate-800">{invoice.subscription.subscriptionNumber}</strong>
            </p>
          </div>
        </div>

        {/* Invoice Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
          <div>
            <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">Billed To</span>
            <p className="font-bold text-slate-900 text-sm">{invoice.customer.name}</p>
            <p className="text-slate-600">{invoice.customer.companyName || 'Corporate Client'}</p>
            <p className="text-slate-500">{invoice.customer.email}</p>
          </div>

          <div>
            <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">Issue Date</span>
            <p className="font-bold text-slate-900 text-sm">
              {new Date(invoice.issueDate).toLocaleDateString()}
            </p>
          </div>

          <div>
            <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">Due Date</span>
            <p className="font-bold text-slate-900 text-sm">
              {new Date(invoice.dueDate).toLocaleDateString()}
            </p>
            <p className="text-slate-500">Terms: {invoice.subscription.paymentTerms}</p>
          </div>

          <div>
            <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">Balance Due</span>
            <p className={`font-bold text-lg ${invoice.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              ${invoice.balanceDue.toFixed(2)}
            </p>
            <p className="text-slate-400">Total: ${invoice.totalAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">Item & Description</th>
                <th className="py-3 px-4">Variant Spec</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Tax Rate</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.subscription.lines.map((line: any) => (
                <tr key={line.id}>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {line.product.name}
                    <span className="block text-[11px] text-slate-400 font-normal">{line.product.type}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {line.variant?.variantName || 'Standard Base'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-medium text-slate-700">{line.quantity}</td>
                  <td className="py-3.5 px-4 text-right text-slate-600">${line.unitPrice.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-right text-slate-600">{line.taxRate.toFixed(2)}%</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    ${(line.quantity * line.unitPrice).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <div className="w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">${invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Promotional Discount:</span>
                <span className="font-semibold">-${invoice.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Sales Tax:</span>
              <span className="font-semibold text-slate-800">${invoice.taxAmount.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
              <span>Total Amount:</span>
              <span>${invoice.totalAmount.toFixed(2)}</span>
            </div>
            <div
              className={`p-3 rounded-xl flex justify-between text-xs font-bold ${
                invoice.balanceDue > 0
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              <span>Balance Due:</span>
              <span>${invoice.balanceDue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payments History Block */}
        <div className="pt-8 border-t border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">Payments Received Against Invoice</h3>
          {invoice.payments.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No payments recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Method</th>
                    <th className="py-2.5 px-4">Reference Note</th>
                    <th className="py-2.5 px-4 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.payments.map((p: any) => (
                    <tr key={p.id}>
                      <td className="py-2.5 px-4 text-slate-600">
                        {new Date(p.paymentDate).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{p.paymentMethod}</td>
                      <td className="py-2.5 px-4 text-slate-500 font-mono">{p.referenceNote || 'Direct Settlement'}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-600">
                        ${p.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Bottom ERP Activity Chatter */}
      <ActivityChatter
        invoiceId={invoice.id}
        initialLogs={invoice.auditLogs}
        currentUser={currentUser}
      />
    </div>
  );
}

