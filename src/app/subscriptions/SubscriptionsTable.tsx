'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/StatusBadge';
import { ActionMenu, ActionMenuItem } from '@/components/ActionMenu';
import {
  Search,
  Calendar,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Share2,
  Receipt,
  XCircle,
  Eye,
  Copy,
} from 'lucide-react';

interface SubscriptionRow {
  id: string;
  subscriptionNumber: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string | null;
  planName: string;
  frequency: string;
  status: string;
  startDate: string;
  nextBillingDate: string | null;
  paymentTerms: string;
  shareToken?: string | null;
  calculatedTotal: number;
}

interface SubscriptionsTableProps {
  initialData: SubscriptionRow[];
}

export function SubscriptionsTable({ initialData }: SubscriptionsTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const statuses = ['ALL', 'ACTIVE', 'QUOTATION', 'CONFIRMED', 'PAUSED', 'DRAFT', 'CLOSED'];

  const handleStatusChange = async (subId: string, newStatus: string, reason?: string) => {
    try {
      const res = await fetch(`/api/subscriptions/${subId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reason }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateInvoice = async (subId: string) => {
    try {
      const res = await fetch('/api/billing/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Invoice generated: ${data.invoicesCreated?.join(', ') || 'Done'}`);
        router.refresh();
      } else {
        alert(data.error || 'Failed to generate invoice');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/quote/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 3000);
  };

  const filtered = initialData.filter((sub) => {
    const matchesSearch =
      sub.subscriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.customerCompany && sub.customerCompany.toLowerCase().includes(searchTerm.toLowerCase())) ||
      sub.planName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || sub.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search & Status Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Status Filter Pills */}
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

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search subscriptions, clients, plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {copiedToken && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Public 1-Click Quotation link copied to clipboard!</span>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Subscription #</th>
                <th className="px-6 py-3.5">Customer & Entity</th>
                <th className="px-6 py-3.5">Plan Tier</th>
                <th className="px-6 py-3.5">Billing Terms</th>
                <th className="px-6 py-3.5">Next Billing</th>
                <th className="px-6 py-3.5">Cycle Value</th>
                <th className="px-6 py-3.5">Lifecycle Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No subscriptions match your query.
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => {
                  const menuItems: ActionMenuItem[] = [
                    {
                      label: 'View Subscription Detail',
                      icon: <Eye className="w-4 h-4" />,
                      href: `/subscriptions/${sub.id}`,
                    },
                  ];

                  if (sub.status === 'ACTIVE') {
                    menuItems.push({
                      label: 'Generate Invoice Now',
                      icon: <Receipt className="w-4 h-4 text-indigo-600" />,
                      onClick: () => handleGenerateInvoice(sub.id),
                    });
                    menuItems.push({
                      label: 'Pause Subscription',
                      icon: <PauseCircle className="w-4 h-4 text-amber-600" />,
                      onClick: () => handleStatusChange(sub.id, 'PAUSED', 'Manual pause requested'),
                    });
                    menuItems.push({
                      label: 'Close / Cancel Contract',
                      icon: <XCircle className="w-4 h-4 text-rose-600" />,
                      danger: true,
                      onClick: () => handleStatusChange(sub.id, 'CLOSED', 'Customer contract terminated'),
                    });
                  } else if (sub.status === 'PAUSED') {
                    menuItems.push({
                      label: 'Resume Subscription',
                      icon: <PlayCircle className="w-4 h-4 text-emerald-600" />,
                      onClick: () => handleStatusChange(sub.id, 'ACTIVE', 'Reactivated by staff'),
                    });
                  } else if (sub.status === 'QUOTATION') {
                    if (sub.shareToken) {
                      menuItems.push({
                        label: 'Copy Public Quote Link',
                        icon: <Share2 className="w-4 h-4 text-indigo-600" />,
                        onClick: () => handleCopyLink(sub.shareToken!),
                      });
                    }
                    menuItems.push({
                      label: 'Confirm & Activate',
                      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
                      onClick: () => handleStatusChange(sub.id, 'ACTIVE', 'Confirmed by sales'),
                    });
                  } else if (sub.status === 'DRAFT') {
                    menuItems.push({
                      label: 'Convert to Quotation',
                      icon: <CheckCircle2 className="w-4 h-4 text-amber-600" />,
                      onClick: () => handleStatusChange(sub.id, 'QUOTATION', 'Quote sent to prospect'),
                    });
                  }

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                        <Link href={`/subscriptions/${sub.id}`} className="hover:underline">
                          {sub.subscriptionNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{sub.customerName}</div>
                        <div className="text-[11px] text-slate-400">
                          {sub.customerCompany || sub.customerEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-700">{sub.planName}</span>
                        <div className="text-[10px] text-slate-400 uppercase font-mono">{sub.frequency}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{sub.paymentTerms}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {sub.nextBillingDate ? (
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{new Date(sub.nextBillingDate).toLocaleDateString()}</span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        ${sub.calculatedTotal.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {sub.status === 'QUOTATION' && sub.shareToken && (
                            <button
                              onClick={() => handleCopyLink(sub.shareToken!)}
                              title="Copy Shareable 1-Click Quote Link"
                              className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-50 border border-indigo-200"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
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

