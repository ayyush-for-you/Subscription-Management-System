'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  Share2,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface QuoteBuilderProps {
  customers: Array<{ id: string; name: string; email: string; companyName?: string | null }>;
  plans: Array<{ id: string; name: string; basePrice: number; frequency: string; minQuantity: number }>;
  products: Array<{
    id: string;
    name: string;
    type: string;
    salesPrice: number;
    variants: Array<{ id: string; variantName: string; priceAdjustment: number }>;
  }>;
  taxRules: Array<{ id: string; name: string; rate: number }>;
  discounts: Array<{ code: string; discountType: string; value: number }>;
}

interface LineItemForm {
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export function QuoteBuilderForm({
  customers,
  plans,
  products,
  taxRules,
  discounts,
}: QuoteBuilderProps) {
  const router = useRouter();

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [planId, setPlanId] = useState(plans[0]?.id || '');
  const [paymentTerms, setPaymentTerms] = useState('Net 15');
  const [validDays, setValidDays] = useState(15);
  const [discountCode, setDiscountCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Modal State
  const [createdQuote, setCreatedQuote] = useState<{
    id: string;
    subscriptionNumber: string;
    shareToken: string;
  } | null>(null);

  // Lines State
  const defaultProduct = products[0];
  const [lines, setLines] = useState<LineItemForm[]>([
    {
      productId: defaultProduct?.id || '',
      variantId: defaultProduct?.variants[0]?.id || '',
      quantity: 1,
      unitPrice: defaultProduct ? defaultProduct.salesPrice + (defaultProduct.variants[0]?.priceAdjustment || 0) : 0,
      taxRate: taxRules[0]?.rate || 8.25,
    },
  ]);

  const handleProductChange = (index: number, newProductId: string) => {
    const prod = products.find((p) => p.id === newProductId);
    if (!prod) return;

    const firstVariant = prod.variants[0];
    const newPrice = prod.salesPrice + (firstVariant ? firstVariant.priceAdjustment : 0);

    const updated = [...lines];
    updated[index] = {
      ...updated[index],
      productId: newProductId,
      variantId: firstVariant ? firstVariant.id : '',
      unitPrice: newPrice,
    };
    setLines(updated);
  };

  const handleVariantChange = (index: number, newVariantId: string) => {
    const currentLine = lines[index];
    const prod = products.find((p) => p.id === currentLine.productId);
    if (!prod) return;

    const variant = prod.variants.find((v) => v.id === newVariantId);
    const newPrice = prod.salesPrice + (variant ? variant.priceAdjustment : 0);

    const updated = [...lines];
    updated[index] = {
      ...updated[index],
      variantId: newVariantId,
      unitPrice: newPrice,
    };
    setLines(updated);
  };

  const handleAddLine = () => {
    const prod = products[0];
    const firstVariant = prod?.variants[0];
    setLines([
      ...lines,
      {
        productId: prod?.id || '',
        variantId: firstVariant ? firstVariant.id : '',
        quantity: 1,
        unitPrice: prod ? prod.salesPrice + (firstVariant ? firstVariant.priceAdjustment : 0) : 0,
        taxRate: taxRules[0]?.rate || 8.25,
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  // Calculations
  const linesSubtotal = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);

  let discountValue = 0;
  const appliedDiscount = discounts.find((d) => d.code === discountCode.trim().toUpperCase());
  if (appliedDiscount) {
    if (appliedDiscount.discountType === 'PERCENTAGE') {
      discountValue = (linesSubtotal * appliedDiscount.value) / 100;
    } else {
      discountValue = Math.min(linesSubtotal, appliedDiscount.value);
    }
  }

  const taxableAmount = Math.max(0, linesSubtotal - discountValue);
  const totalTax = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice * (l.taxRate / 100), 0);
  const grandTotal = taxableAmount + totalTax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/quotes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          planId,
          paymentTerms,
          validDays,
          discountCode: discountCode.trim() || undefined,
          lines,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create quotation');
      }

      setCreatedQuote({
        id: data.subscriptionId,
        subscriptionNumber: data.subscriptionNumber,
        shareToken: data.shareToken,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Success Modal / Banner */}
      {createdQuote && (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-sm space-y-4 animate-in fade-in-50">
          <div className="flex items-center space-x-3 text-emerald-800">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-bold text-base">Quotation {createdQuote.subscriptionNumber} Created Successfully!</h3>
              <p className="text-xs text-emerald-700">
                The public 1-click buy offer link is active with signed HMAC security.
              </p>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs font-mono text-slate-700 truncate w-full sm:w-auto">
              {window.location.origin}/quote/{createdQuote.shareToken}
            </span>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/quote/${createdQuote.shareToken}`);
                  alert('Copied to clipboard!');
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Copy Link
              </button>
              <a
                href={`/quote/${createdQuote.shareToken}`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                title="Open Public Customer View"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => router.push(`/subscriptions/${createdQuote.id}`)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold"
              >
                View in BSMS
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Customer & Plan Setup */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">
            1. Customer Account & Subscription Plan Agreement
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Customer Selector */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Customer Account
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.companyName ? `(${c.companyName})` : ''} - {c.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Plan Tier */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Base Subscription Plan
              </label>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (${p.basePrice}/{p.frequency})
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Terms */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Terms
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 7">Net 7 Days</option>
                <option value="Immediate">Due Upon Receipt</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Line Items & Live Variant Configurator */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">2. Products, Variants & Add-ons Configurator</h3>
              <p className="text-xs text-slate-400">Configure core product with brand variant price deltas</p>
            </div>
            <button
              type="button"
              onClick={handleAddLine}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product Line</span>
            </button>
          </div>

          <div className="p-6 space-y-4">
            {lines.map((line, idx) => {
              const currentProd = products.find((p) => p.id === line.productId);
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                >
                  {/* Product */}
                  <div className="md:col-span-4">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Product</label>
                    <select
                      value={line.productId}
                      onChange={(e) => handleProductChange(idx, e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-white"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (${p.salesPrice})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Variant */}
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Variant / Tier</label>
                    <select
                      value={line.variantId}
                      onChange={(e) => handleVariantChange(idx, e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-white"
                    >
                      {currentProd?.variants.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.variantName} (+${v.priceAdjustment})
                        </option>
                      ))}
                      {(!currentProd?.variants || currentProd.variants.length === 0) && (
                        <option value="">Default Standard</option>
                      )}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="md:col-span-1">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(e) => {
                        const updated = [...lines];
                        updated[idx].quantity = Math.max(1, parseInt(e.target.value) || 1);
                        setLines(updated);
                      }}
                      className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-white text-center"
                    />
                  </div>

                  {/* Unit Price */}
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Unit Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={line.unitPrice}
                      onChange={(e) => {
                        const updated = [...lines];
                        updated[idx].unitPrice = parseFloat(e.target.value) || 0;
                        setLines(updated);
                      }}
                      className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-white"
                    />
                  </div>

                  {/* Subtotal */}
                  <div className="md:col-span-1 text-right">
                    <span className="block text-[11px] font-semibold text-slate-500 mb-1">Total</span>
                    <span className="text-xs font-bold text-slate-900 block pt-2">
                      ${(line.quantity * line.unitPrice).toFixed(2)}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <div className="md:col-span-1 text-center">
                    <button
                      type="button"
                      disabled={lines.length <= 1}
                      onClick={() => handleRemoveLine(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Discounts & Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">3. Promotional Discount & Validity</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Discount Voucher Code (Optional)
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME20 or SCALE500"
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 font-mono uppercase bg-slate-50 focus:bg-white"
                />
              </div>
              {appliedDiscount && (
                <p className="text-xs text-emerald-600 font-medium mt-1">
                  ✓ Valid discount ({appliedDiscount.value}
                  {appliedDiscount.discountType === 'PERCENTAGE' ? '%' : '$'} off)
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quotation Validity Window
              </label>
              <select
                value={validDays}
                onChange={(e) => setValidDays(parseInt(e.target.value))}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white"
              >
                <option value={7}>Valid for 7 Days</option>
                <option value={15}>Valid for 15 Days (Recommended)</option>
                <option value={30}>Valid for 30 Days</option>
                <option value={60}>Valid for 60 Days</option>
              </select>
            </div>
          </div>

          {/* Pricing Roll-up Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">
              Financial Summary (Per Cycle)
            </h3>

            <div className="space-y-2.5 py-4 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Products & Add-ons Subtotal:</span>
                <span className="font-semibold text-slate-900">${linesSubtotal.toFixed(2)}</span>
              </div>
              {discountValue > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Applied Discount:</span>
                  <span className="font-semibold">-${discountValue.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Estimated Sales Tax:</span>
                <span className="font-semibold text-slate-900">${totalTax.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
                <span>Recurring Cycle Total:</span>
                <span className="text-indigo-600">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Share2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Generating Offer...' : 'Generate Quotation & Signed 1-Click Link'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

