'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Package, Layers, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProductItem {
  id: string;
  name: string;
  type: string;
  salesPrice: number;
  costPrice: number;
  notes?: string | null;
  variants: Array<{
    id: string;
    variantName: string;
    priceAdjustment: number;
  }>;
}

export function ProductsManager({ initialProducts }: { initialProducts: ProductItem[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('Software');
  const [salesPrice, setSalesPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [variants, setVariants] = useState<Array<{ variantName: string; priceAdjustment: number }>>([
    { variantName: 'Standard Edition', priceAdjustment: 0 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddVariantRow = () => {
    setVariants([...variants, { variantName: '', priceAdjustment: 0 }]);
  };

  const handleRemoveVariantRow = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          salesPrice,
          costPrice,
          notes,
          variants: variants.filter((v) => v.variantName.trim().length > 0),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      setProducts([...products, data]);
      setShowModal(false);
      setName('');
      setSalesPrice('');
      setCostPrice('');
      setNotes('');
      setVariants([{ variantName: 'Standard Edition', priceAdjustment: 0 }]);
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
          <h2 className="text-base font-bold text-slate-900">Products & Add-ons ({products.length})</h2>
          <p className="text-xs text-slate-500">Configure base items and attach brand variant options</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Product</span>
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => {
          const margin = p.salesPrice > 0 ? ((p.salesPrice - p.costPrice) / p.salesPrice) * 100 : 0;
          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4 hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {p.type}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{p.name}</h3>
                  </div>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    ${p.salesPrice.toFixed(2)}
                  </span>
                </div>

                {p.notes && <p className="text-xs text-slate-500 leading-relaxed">{p.notes}</p>}

                {/* Economics */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Cost Price</span>
                    <span className="font-semibold text-slate-700">${p.costPrice.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Gross Margin</span>
                    <span className="font-bold text-emerald-600">{margin.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Variants List */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Configured Variants ({p.variants.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {p.variants.map((v) => (
                      <span
                        key={v.id}
                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {v.variantName}
                        {v.priceAdjustment > 0 && (
                          <strong className="text-indigo-600 ml-1">(+${v.priceAdjustment.toFixed(0)})</strong>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Create New Product & Variants</h3>
                <p className="text-xs text-slate-500">Add service or software product with brand variant price deltas</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brightloop CRM Suite"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white"
                  >
                    <option value="Software">Software</option>
                    <option value="Service">Service</option>
                    <option value="Add-on">Add-on</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sales Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="999.00"
                    value={salesPrice}
                    onChange={(e) => setSalesPrice(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="300.00"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Operational details, SLA notes, or features..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Variants Setup */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Variants (e.g. Odoo Brand +$560)</span>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="text-xs text-indigo-600 font-semibold hover:underline flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Variant</span>
                  </button>
                </div>

                {variants.map((v, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Variant Name (e.g. Odoo Brand)"
                      value={v.variantName}
                      onChange={(e) => {
                        const updated = [...variants];
                        updated[i].variantName = e.target.value;
                        setVariants(updated);
                      }}
                      className="flex-1 text-xs rounded-lg border border-slate-200 p-2 bg-slate-50"
                    />
                    <div className="w-32 flex items-center space-x-1">
                      <span className="text-xs text-slate-400">+$</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="560.00"
                        value={v.priceAdjustment}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[i].priceAdjustment = parseFloat(e.target.value) || 0;
                          setVariants(updated);
                        }}
                        className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-slate-50"
                      />
                    </div>
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVariantRow(i)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
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
                  {isSubmitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

