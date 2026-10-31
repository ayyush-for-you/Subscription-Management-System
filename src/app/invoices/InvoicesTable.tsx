'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/StatusBadge';
import { ActionMenu, ActionMenuItem } from '@/components/ActionMenu';
import {
  Search,
  Download,
  DollarSign,
  Eye,
  AlertTriangle,
  Calendar,
  CreditCard,
} from 'lucide-react';

interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string | null;
  subscriptionNumber: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  balanceDue: number;
  status: string;
  dunningStage: number;
  paymentCount: number;
}

interface InvoicesTableProps {
  initialData: InvoiceRow[];
}

export function InvoicesTable({ initialData }: InvoicesTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const statuses = ['ALL', 'CONFIRMED', 'PAID', 'OVERDUE', 'DRAFT'];

  const filtered = initialData.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.subscriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.customerCompany && inv.customerCompany.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = selectedStatus === 'ALL' || inv.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Status Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedStatus === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search invoice #, customer, sub..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Invoice #</th>
                <th className="px-6 py-3.5">Customer & Entity</th>
                <th className="px-6 py-3.5">Contract Ref</th>
                <th className="px-6 py-3.5">Issue Date</th>
                <th className="px-6 py-3.5">Due Date</th>
                <th className="px-6 py-3.5">Total Amount</th>
                <th className="px-6 py-3.5">Balance Due</th>
                <th className="px-6 py-3.5">Lifecycle</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  const menuItems: ActionMenuItem[] = [
                    {
                      label: 'View Invoice Details',
                      icon: <Eye className="w-4 h-4" />,
                      href: `/invoices/${inv.id}`,
                    },
                    {
                      label: 'Download PDF Invoice',
                      icon: <Download className="w-4 h-4 text-slate-600" />,
                      href: `/api/invoices/${inv.id}/pdf`,
                    },
                  ];

                  if (inv.balanceDue > 0) {
                    menuItems.push({
                      label: 'Register Payment',
                      icon: <DollarSign className="w-4 h-4 text-emerald-600" />,
                      href: `/invoices/${inv.id}/payment`,
                    });
                  }

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                        <Link href={`/invoices/${inv.id}`} className="hover:underline">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">{inv.customerName}</span>
                        <span className="block text-[11px] text-slate-400">
                          {inv.customerCompany || inv.customerEmail}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600">{inv.subscriptionNumber}</td>
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
                        <div className="flex items-center space-x-1.5">
                          <StatusBadge status={inv.status} />
                          {inv.dunningStage > 0 && inv.balanceDue > 0 && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                              Stage {inv.dunningStage}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <a
                            href={`/api/invoices/${inv.id}/pdf`}
                            title="Download PDF"
                            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          {inv.balanceDue > 0 && (
                            <Link
                              href={`/invoices/${inv.id}/payment`}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200"
                            >
                              Pay
                            </Link>
                          )}
                          <ActionMenu items={menuItems} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

