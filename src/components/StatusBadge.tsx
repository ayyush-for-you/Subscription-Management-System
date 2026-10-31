import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'subscription' | 'invoice';
}

export function StatusBadge({ status, type = 'subscription' }: StatusBadgeProps) {
  const normalized = status.toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      case 'ACTIVE':
      case 'PAID':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20';
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20';
      case 'QUOTATION':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20';
      case 'PAUSED':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20 animate-pulse';
      case 'OVERDUE':
        return 'bg-red-50 text-red-700 border-red-200 ring-red-500/20 font-semibold';
      case 'DRAFT':
        return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/20';
      case 'CLOSED':
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-500 border-gray-200 ring-gray-500/20';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ring-1 ring-inset ${getStyle()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {normalized}
    </span>
  );
}

