'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, Percent, Plus, Globe, CheckCircle2, AlertCircle } from 'lucide-react';

interface DiscountItem {
  id: string;
  code: string;
  discountType: string;
  value: number;
  minPurchaseAmount?: number | null;
  maxUses?: number | null;
  currentUses: number;
}

interface TaxItem {
  id: string;
  name: string;
  rate: number;
  region?: string | null;
  active: boolean;
}

export function SettingsManager({
  initialDiscounts,
  initialTaxes,
}: {
  initialDiscounts: DiscountItem[];
  initialTaxes: TaxItem[];
}) {
  const router = useRouter();
  const [discounts, setDiscounts] = useState(initialDiscounts);
  const [taxes, setTaxes] = useState(initialTaxes);

  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);

  // Discount Form
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [value, setValue] = useState('');
  const [minPurchase, setMinPurchase] = useState('');
  const [maxUses, setMaxUses] = useState('');

  // Tax Form
  const [taxName, setTaxName] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [region, setRegion] = useState('US');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          discountType,
          value,
          minPurchaseAmount: minPurchase || null,
          maxUses: maxUses || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDiscounts([...discounts, data]);
      setShowDiscountModal(false);
      setCode('');
      setValue('');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/taxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: taxName,
          rate: taxRate,
          region,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTaxes([...taxes, data]);
      setShowTaxModal(false);
      setTaxName('');
      setTaxRate('');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Discounts Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Promotional Discounts Engine</h3>
              <p className="text-xs text-slate-400">Coupon rules and usage caps</p>
            </div>
          </div>
          <button
            onClick={() => setShowDiscountModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Discount</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Format</th>
                <th className="px-6 py-3">Benefit</th>
                <th className="px-6 py-3">Min Purchase</th>
                <th className="px-6 py-3">Usage Counter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {discounts.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-3.5 font-bold font-mono text-indigo-600">{d.code}</td>
                  <td className="px-6 py-3.5 text-slate-600 font-semibold">{d.discountType}</td>
                  <td className="px-6 py-3.5 font-bold text-emerald-600">
                    {d.discountType === 'PERCENTAGE' ? `${d.value}% Off` : `$${d.value.toFixed(2)} Off`}
                  </td>
                  <td className="px-6 py-3.5 text-slate-600">
                    {d.minPurchaseAmount ? `$${d.minPurchaseAmount.toFixed(2)}` : 'No Minimum'}
                  </td>
                  <td className="px-6 py-3.5 text-slate-600">
                    <span className="font-semibold text-slate-800">{d.currentUses}</span>
                    {d.maxUses ? ` / ${d.maxUses} max` : ' (Unlimited)'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Taxes Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-emerald-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Regional Tax Brackets</h3>
              <p className="text-xs text-slate-400">Jurisdiction rates rolled up into recurring billing</p>
            </div>
          </div>
          <button
            onClick={() => setShowTaxModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Tax Rate</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Tax Name</th>
                <th className="px-6 py-3">Regional Bracket</th>
                <th className="px-6 py-3">Rate (%)</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {taxes.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-slate-900">{t.name}</td>
                  <td className="px-6 py-3.5 text-slate-600 font-mono">{t.region || 'GLOBAL'}</td>
                  <td className="px-6 py-3.5 font-bold text-slate-800">{t.rate.toFixed(2)}%</td>
                  <td className="px-6 py-3.5">
                    <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Create Discount Voucher</h3>
              <button onClick={() => setShowDiscountModal(false)} className="text-slate-400">✕</button>
            </div>
            {error && <div className="text-xs text-rose-600">{error}</div>}
            <form onSubmit={handleCreateDiscount} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH30"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 font-mono uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="20"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Purchase ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="500"
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Redemptions</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowDiscountModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md"
                >
                  Save Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tax Modal */}
      {showTaxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add Tax Bracket</h3>
              <button onClick={() => setShowTaxModal(false)} className="text-slate-400">✕</button>
            </div>
            {error && <div className="text-xs text-rose-600">{error}</div>}
            <form onSubmit={handleCreateTax} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Bracket Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. California State Tax"
                  value={taxName}
                  onChange={(e) => setTaxName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="7.25"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Region Code</label>
                  <input
                    type="text"
                    placeholder="US / EU / APAC"
                    value={region}
                    onChange={(e) => setRegion(e.target.value.toUpperCase())}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 uppercase"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowTaxModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-md"
                >
                  Save Tax Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

