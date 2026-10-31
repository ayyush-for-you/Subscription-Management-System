'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Layers, Repeat, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface PlanItem {
  id: string;
  name: string;
  basePrice: number;
  frequency: string;
  minQuantity: number;
  autoClose: boolean;
  canPause: boolean;
  subscriptions: Array<{ id: string; status: string }>;
}

export function PlansManager({ initialPlans }: { initialPlans: PlanItem[] }) {
  const router = useRouter();
  const [plans, setPlans] = useState(initialPlans);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [frequency, setFrequency] = useState('MONTHLY');
  const [minQuantity, setMinQuantity] = useState('1');
  const [canPause, setCanPause] = useState(true);
  const [autoClose, setAutoClose] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          basePrice,
          frequency,
          minQuantity,
          canPause,
          autoClose,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create plan');
      }

      setPlans([...plans, { ...data, subscriptions: [] }]);
      setShowModal(false);
      setName('');
      setBasePrice('');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Subscription Plans ({plans.length})</h2>
          <p className="text-xs text-slate-500">Configure recurring billing frequencies and pause policies</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Plan Tier</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => {
          const activeSubCount = p.subscriptions.filter((s) => s.status === 'ACTIVE').length;
          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between hover:border-indigo-300 transition-all space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-mono">
                    {p.frequency}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    Min Qty: {p.minQuantity}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{p.name}</h3>
                  <div className="flex items-baseline space-x-1 mt-1">
                    <span className="text-2xl font-extrabold text-slate-900 font-mono">
                      ${p.basePrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400">/ {p.frequency.toLowerCase()}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Pause Allowed:</span>
                    <span className={p.canPause ? 'text-emerald-600 font-semibold' : 'text-slate-400'}>
                      {p.canPause ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Auto-Close on Expiry:</span>
                    <span className={p.autoClose ? 'text-amber-600 font-semibold' : 'text-slate-400'}>
                      {p.autoClose ? 'Auto-Terminates' : 'Auto-Renews'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Active Subscriptions:</span>
                <strong className="text-slate-900">{activeSubCount}</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Create Subscription Plan Tier</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Scale High Frequency"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Base Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="499.00"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Order Qty</label>
                <input
                  type="number"
                  min="1"
                  value={minQuantity}
                  onChange={(e) => setMinQuantity(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={canPause}
                    onChange={(e) => setCanPause(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-medium text-slate-700">Allow Customer / Dunning Pause</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={autoClose}
                    onChange={(e) => setAutoClose(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-medium text-slate-700">Auto-Close on End Date (otherwise auto-renew)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

