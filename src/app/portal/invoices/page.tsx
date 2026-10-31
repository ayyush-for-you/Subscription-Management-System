import React from 'react';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { CustomerInvoicesView } from './CustomerInvoicesView';

export const dynamic = 'force-dynamic';

export default async function CustomerInvoicesPage() {
  const session = await getSession();

  const customerId = session?.role === 'CUSTOMER' ? session.id : (await prisma.user.findFirst({ where: { role: 'CUSTOMER' } }))?.id;

  const invoices = await prisma.invoice.findMany({
    where: { customerId },
    include: {
      subscription: true,
      payments: true,
    },
    orderBy: { issueDate: 'desc' },
  });

  const serialized = invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    subscriptionNumber: inv.subscription.subscriptionNumber,
    issueDate: inv.issueDate.toISOString(),
    dueDate: inv.dueDate.toISOString(),
    totalAmount: inv.totalAmount,
    balanceDue: inv.balanceDue,
    status: inv.status,
    dunningStage: inv.dunningStage,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Invoices & Online Payments</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Download PDF receipts, inspect balance statements, and make instant online payments
        </p>
      </div>

      <CustomerInvoicesView initialInvoices={serialized} />
    </div>
  );
}

