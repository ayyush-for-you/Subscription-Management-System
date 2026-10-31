import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { AppLayout } from '@/components/AppLayout';
import { Header } from '@/components/Header';
import { FilePlus2 } from 'lucide-react';
import { SubscriptionsTable } from './SubscriptionsTable';

export const dynamic = 'force-dynamic';

export default async function SubscriptionsPage() {
  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      plan: true,
      lines: {
        include: { product: true, variant: true },
      },
      discount: true,
      invoices: {
        take: 1,
        orderBy: { issueDate: 'desc' },
      },
    },
  });

  const serialized = subscriptions.map((s) => {
    let subtotal = s.lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
    if (s.discount) {
      if (s.discount.discountType === 'PERCENTAGE') {
        subtotal -= (subtotal * s.discount.value) / 100;
      } else {
        subtotal -= s.discount.value;
      }
    }
    return {
      id: s.id,
      subscriptionNumber: s.subscriptionNumber,
      customerName: s.customer.name,
      customerEmail: s.customer.email,
      customerCompany: s.customer.companyName,
      planName: s.plan.name,
      frequency: s.plan.frequency,
      status: s.status,
      startDate: s.startDate.toISOString(),
      nextBillingDate: s.nextBillingDate ? s.nextBillingDate.toISOString() : null,
      paymentTerms: s.paymentTerms,
      shareToken: s.shareToken,
      calculatedTotal: Math.max(0, subtotal),
    };
  });

  return (
    <AppLayout>
      <Header
        title="Subscriptions & Lifecycle Pipeline"
        subtitle="End-to-end management of active contracts, leads, quotes, and billing schedules"
      />

      <main className="flex-1 p-8 overflow-y-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">All Subscriptions ({subscriptions.length})</h2>
            <p className="text-xs text-slate-500">Filter, search, and execute lifecycle state transitions</p>
          </div>
          <Link
            href="/quotes/new"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>Create New Quotation</span>
          </Link>
        </div>

        <SubscriptionsTable initialData={serialized} />
      </main>
    </AppLayout>
  );
}

