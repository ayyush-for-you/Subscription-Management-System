'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  CreditCard,
  Building,
  User,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface PublicQuoteViewProps {
  subscription: any;
}

export function PublicQuoteView({ subscription }: PublicQuoteViewProps) {
  const [sub, setSub] = useState(subscription);
  const [signerName, setSignerName] = useState('');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    subscription.lines.forEach((l: any) => {
      init[l.id] = l.variantId || '';
    });
    return init;
  });

  const [isActivated, setIsActivated] = useState(sub.status === 'ACTIVE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleVariantToggle = (lineId: string, newVariantId: string) => {
    setSelectedVariants((prev) => ({ ...prev, [lineId]: newVariantId }));
  };

  // Recalculate dynamic line pricing based on client variant selections
  let dynamicLinesSubtotal = 0;
  const computedLines = sub.lines.map((line: any) => {
    const currentVariantId = selectedVariants[line.id];
    const variantObj = line.product.variants.find((v: any) => v.id === currentVariantId);
    const unitPrice = line.product.salesPrice + (variantObj ? variantObj.priceAdjustment : 0);
    const subtotal = line.quantity * unitPrice;
    dynamicLinesSubtotal += subtotal;
    return {
      ...line,
      currentVariantId,
      variantObj,
      unitPrice,
      subtotal,
    };
  });

  let discountAmount = 0;
  if (sub.discount) {
    if (sub.discount.discountType === 'PERCENTAGE') {
      discountAmount = (dynamicLinesSubtotal * sub.discount.value) / 100;
    } else {
      discountAmount = Math.min(dynamicLinesSubtotal, sub.discount.value);
    }
  }

  const taxableSubtotal = Math.max(0, dynamicLinesSubtotal - discountAmount);
  const totalTax = computedLines.reduce((sum: number, l: any) => sum + (l.subtotal * (l.taxRate / 100)), 0);
  const dynamicGrandTotal = taxableSubtotal + totalTax;

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim()) {
      setError('Please provide your full legal name for digital signature.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/quote/${sub.shareToken}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signerName: signerName.trim(),
          selectedVariants,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to accept quote');
      }

      setIsActivated(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Brand Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Brightloop Software</h1>
            <p className="text-xs text-slate-400">Official Subscription Proposal & Service Agreement</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-800 text-indigo-400 border border-slate-700">
            Ref: {sub.subscriptionNumber}
          </span>
          <div className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified 1-Click Offer</span>
          </div>
        </div>
      </div>

      {/* Activated State Banner */}
      {isActivated ? (
        <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-3xl p-8 text-center space-y-4 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-bold text-white">Subscription Activated!</h2>
          <p className="text-xs text-slate-300 max-w-lg mx-auto">
            Thank you, <strong className="text-white">{signerName || sub.customer.name}</strong>. Your subscription{' '}
            <span className="font-mono font-bold text-emerald-400">{sub.subscriptionNumber}</span> is now fully active.
            Your dedicated cloud environment and ERP access are provisioned.
          </p>
          <div className="pt-4 flex justify-center space-x-4">
            <Link
              href="/portal"
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg transition-all"
            >
              <span>Access Customer Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Executive Summary Card */}
          <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-slate-700/80 p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/60 pb-6">
              <div>
                <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                  Prepared For
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{sub.customer.name}</h2>
                <p className="text-xs text-slate-300">{sub.customer.companyName || 'Individual Entity'}</p>
                <p className="text-xs text-slate-400">{sub.customer.email}</p>
              </div>

              <div className="text-left md:text-right space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Plan & Terms
                </span>
                <p className="text-sm font-bold text-white mt-1">{sub.plan.name}</p>
                <p className="text-xs text-slate-300 uppercase font-mono">{sub.plan.frequency} Billing</p>
                <p className="text-xs text-slate-400">Payment Terms: {sub.paymentTerms}</p>
              </div>
            </div>

            {/* Interactive Product & Variant Configurator */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">Review Included Services & Live Variant Selection</h3>
                  <p className="text-xs text-slate-400">
                    You can toggle optional feature variants below; pricing will adjust dynamically in real time.
                  </p>
                </div>
                <span className="text-xs font-medium text-indigo-400 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Interactive Offer</span>
                </span>
              </div>

              <div className="space-y-3">
                {computedLines.map((line: any) => (
                  <div
                    key={line.id}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/80 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-white text-sm">{line.product.name}</h4>
                        <p className="text-xs text-slate-400">{line.product.notes}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400">Qty: {line.quantity} × </span>
                        <span className="text-sm font-bold text-white font-mono">
                          ${line.unitPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Variant Option Pills */}
                    {line.product.variants && line.product.variants.length > 0 && (
                      <div className="pt-2 border-t border-slate-800">
                        <span className="block text-[11px] font-semibold text-slate-400 mb-2">
                          Available Variants & Add-ons:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {line.product.variants.map((v: any) => {
                            const isSelected = line.currentVariantId === v.id;
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => handleVariantToggle(line.id, v.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-500/30 font-semibold'
                                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                                }`}
                              >
                                {v.variantName} {v.priceAdjustment > 0 ? `(+${v.priceAdjustment.toFixed(0)})` : ''}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Roll-up */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Recurring Investment
                </span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-white font-mono">
                    ${dynamicGrandTotal.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400 uppercase font-mono">
                    / {sub.plan.frequency}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Includes line subtotal (${dynamicLinesSubtotal.toFixed(2)}), tax (${totalTax.toFixed(2)})
                  {discountAmount > 0 ? `, and promotional discount (-$${discountAmount.toFixed(2)})` : ''}
                </p>
              </div>

              {sub.expiryDate && (
                <div className="flex items-center space-x-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
                  <Calendar className="w-4 h-4" />
                  <span>Valid through: {new Date(sub.expiryDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Digital Acceptance Form */}
            <form onSubmit={handleAccept} className="pt-4 border-t border-slate-700/80 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {error}
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700 space-y-3">
                <label className="block text-xs font-semibold text-white">
                  Digital Signature & Agreement Acceptance (SF-1)
                </label>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  By entering your full name below and clicking "Accept & Activate Subscription", you agree to Brightloop Software's Terms of Service and authorize recurring billing under the {sub.paymentTerms} terms.
                </p>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Enter your full legal name (e.g. Tony Harrison)"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full pl-3 pr-3 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !signerName.trim()}
                className="w-full py-3.5 px-6 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Activating Contract...' : 'Accept & Activate Subscription (1-Click Buy)'}</span>
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

