import React from 'react';
import { prisma } from '@/lib/prisma';
import { AppLayout } from '@/components/AppLayout';
import { Header } from '@/components/Header';
import { PlansManager } from './PlansManager';

export const dynamic = 'force-dynamic';

export default async function AdminPlansPage() {
  const plans = await prisma.plan.findMany({
    include: {
      subscriptions: {
        select: { id: true, status: true },
      },
    },
    orderBy: { basePrice: 'asc' },
  });

  return (
    <AppLayout>
      <Header
        title="Subscription Plans & Lifecycle Policies"
        subtitle="Configure billing frequencies (Daily, Weekly, Monthly, Yearly), baseline pricing, and pause policies"
      />

      <main className="flex-1 p-8 overflow-y-auto">
        <PlansManager initialPlans={JSON.parse(JSON.stringify(plans))} />
      </main>
    </AppLayout>
  );
}

