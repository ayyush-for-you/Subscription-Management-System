import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AppLayout } from '@/components/AppLayout';
import { Header } from '@/components/Header';
import { getSession } from '@/lib/auth';
import { SubscriptionDetailView } from './SubscriptionDetailView';

export const dynamic = 'force-dynamic';

export default async function SubscriptionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();

  const subscription = await prisma.subscription.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      plan: true,
      lines: {
        include: {
          product: true,
          variant: true,
        },
      },
      discount: true,
      invoices: {
        orderBy: { issueDate: 'desc' },
      },
      auditLogs: {
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: { name: true, role: true },
          },
        },
      },
    },
  });

  if (!subscription) {
    notFound();
  }

  return (
    <AppLayout>
      <Header
        title={`Subscription ${subscription.subscriptionNumber}`}
        subtitle={`Lifecycle state, itemized contract lines, and audit timeline for ${subscription.customer.name}`}
      />

      <main className="flex-1 p-8 overflow-y-auto space-y-8">
        <SubscriptionDetailView
          subscription={JSON.parse(JSON.stringify(subscription))}
          currentUser={session ? { name: session.name, role: session.role } : null}
        />
      </main>
    </AppLayout>
  );
}

