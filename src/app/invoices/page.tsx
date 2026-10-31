import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { AppLayout } from '@/components/AppLayout';
import { Header } from '@/components/Header';
import { InvoicesTable } from './InvoicesTable';

export const dynamic = 'force-dynamic';

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { issueDate: 'desc' },
    include: {
      customer: true,
      subscription: true,
      payments: true,
    },
  });

  const serialized = invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    customerName: inv.customer.name,
    customerEmail: inv.customer.email,
    customerCompany: inv.customer.companyName,
    subscriptionNumber: inv.subscription.subscriptionNumber,
    issueDate: inv.issueDate.toISOString(),
    dueDate: inv.dueDate.toISOString(),
    subtotal: inv.subtotal,
    discountAmount: inv.discountAmount,
    taxAmount: inv.taxAmount,
    totalAmount: inv.totalAmount,
    balanceDue: inv.balanceDue,
    status: inv.status,
    dunningStage: inv.dunningStage,
    paymentCount: inv.payments.length,
  }));

  return (
    <AppLayout>
      <Header
        title="Invoices & Recurring Billing Engine"
        subtitle="Manage transactional billing cycles, balance tracking, and cash reconciliation"
      />

      <main className="flex-1 p-8 overflow-y-auto space-y-6">
        <InvoicesTable initialData={serialized} />
      </main>
    </AppLayout>
  );
}

