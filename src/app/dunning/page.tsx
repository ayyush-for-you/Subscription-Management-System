import React from 'react';
import { prisma } from '@/lib/prisma';
import { AppLayout } from '@/components/AppLayout';
import { Header } from '@/components/Header';
import { DunningTrackerView } from './DunningTrackerView';

export const dynamic = 'force-dynamic';

export default async function DunningPage() {
  const now = new Date();

  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: 'OVERDUE',
      balanceDue: { gt: 0 },
    },
    include: {
      customer: true,
      subscription: true,
    },
    orderBy: { dueDate: 'asc' },
  });

  const serialized = overdueInvoices.map((inv) => {
    const daysPastDue = Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customer.name,
      customerEmail: inv.customer.email,
      customerCompany: inv.customer.companyName,
      subscriptionId: inv.subscriptionId,
      subscriptionNumber: inv.subscription.subscriptionNumber,
      subscriptionStatus: inv.subscription.status,
      dueDate: inv.dueDate.toISOString(),
      balanceDue: inv.balanceDue,
      dunningStage: inv.dunningStage,
      daysPastDue,
    };
  });

  return (
    <AppLayout>
      <Header
        title="Automated Dunning & Overdue Recovery"
        subtitle="Rule-based overdue escalation sequence (Day 3, Day 7, Day 14 Auto-Pause) to recover revenue"
      />

      <main className="flex-1 p-8 overflow-y-auto space-y-8">
        <DunningTrackerView initialInvoices={serialized} />
      </main>
    </AppLayout>
  );
}

