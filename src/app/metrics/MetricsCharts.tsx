'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

interface MetricsChartsProps {
  mrr: number;
  arr: number;
  arpu: number;
  debt1to7: number;
  debt8to14: number;
  debt15plus: number;
}

export function MetricsCharts({
  mrr,
  arr,
  arpu,
  debt1to7,
  debt8to14,
  debt15plus,
}: MetricsChartsProps) {
  // 6-Month MRR Historical Trajectory
  const revenueData = [
    { month: 'May', mrr: Math.round(mrr * 0.65) },
    { month: 'Jun', mrr: Math.round(mrr * 0.72) },
    { month: 'Jul', mrr: Math.round(mrr * 0.81) },
    { month: 'Aug', mrr: Math.round(mrr * 0.88) },
    { month: 'Sep', mrr: Math.round(mrr * 0.94) },
    { month: 'Oct (Current)', mrr: Math.round(mrr) },
  ];

  // Debt Aging Categories
  const debtData = [
    { name: '1–7 Days (Reminder)', value: debt1to7, color: '#f59e0b' },
    { name: '8–14 Days (Urgent)', value: debt8to14, color: '#ea580c' },
    { name: '15+ Days (Auto-Paused)', value: debt15plus, color: '#e11d48' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* MRR Growth Trajectory Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
        <div className="mb-4">
          <h3 className="font-bold text-slate-800 text-sm">Monthly Recurring Revenue (MRR) Trajectory</h3>
          <p className="text-xs text-slate-400">Trailing 6-month organic growth curve</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMRR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'MRR']}
                contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="mrr" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorMRR)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Overdue Debt Aging Distribution */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
        <div className="mb-4">
          <h3 className="font-bold text-slate-800 text-sm">Aged Debt Distribution (Capital at Risk)</h3>
          <p className="text-xs text-slate-400">Aging buckets driving automated dunning escalation</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={debtData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Capital Overdue']}
                contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {debtData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

