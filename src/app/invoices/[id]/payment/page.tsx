import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AppLayout } from '@/components/AppLayout';
import { Header } from '@/components/Header';
import { RegisterPaymentForm } from './RegisterPaymentForm';

export const dynamic = 'force-dynamic';

export default async function RegisterPaymentPage({
  params,
}: {
  params: { id: string };
}) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      subscription: true,
    },
  });

  if (!invoice) {
    notFound();
  }

  return (
    <AppLayout>
      <Header
        title={`Register Payment for ${invoice.invoiceNumber}`}
        subtitle={`Cash reconciliation, ledger balance update, and automatic subscription resumption`}
      />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <RegisterPaymentForm invoice={JSON.parse(JSON.stringify(invoice))} />
        </div>
      </main>
    </AppLayout>
  );
}

