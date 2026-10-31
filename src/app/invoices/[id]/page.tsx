import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AppLayout } from '@/components/AppLayout';
import { Header } from '@/components/Header';
import { getSession } from '@/lib/auth';
import { InvoiceDetailView } from './InvoiceDetailView';

export const dynamic = 'force-dynamic';

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      subscription: {
        include: {
          plan: true,
          lines: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      },
      payments: {
        orderBy: { paymentDate: 'desc' },
      },
      auditLogs: {
        orderBy: { createdAt: 'desc' },
        include: {
          actor: { select: { name: true, role: true } },
        },
      },
    },
  });

  if (!invoice) {
    notFound();
  }

  return (
    <AppLayout>
      <Header
        title={`Invoice ${invoice.invoiceNumber}`}
        subtitle={`Billing ledger statement, payments log, and PDF receipt generator`}
      />

      <main className="flex-1 p-8 overflow-y-auto space-y-8">
        <InvoiceDetailView
          invoice={JSON.parse(JSON.stringify(invoice))}
          currentUser={session ? { name: session.name, role: session.role } : null}
        />
      </main>
    </AppLayout>
  );
}

