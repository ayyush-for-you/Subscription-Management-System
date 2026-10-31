import React from 'react';
import { prisma } from '@/lib/prisma';
import { AppLayout } from '@/components/AppLayout';
import { Header } from '@/components/Header';
import { SettingsManager } from './SettingsManager';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const discounts = await prisma.discount.findMany({
    orderBy: { currentUses: 'desc' },
  });

  const taxRules = await prisma.taxRule.findMany({
    orderBy: { rate: 'asc' },
  });

  return (
    <AppLayout>
      <Header
        title="Discounts & Tax Configuration Rules"
        subtitle="Manage promotional discount codes, usage constraints, and regional tax brackets"
      />

      <main className="flex-1 p-8 overflow-y-auto">
        <SettingsManager
          initialDiscounts={JSON.parse(JSON.stringify(discounts))}
          initialTaxes={JSON.parse(JSON.stringify(taxRules))}
        />
      </main>
    </AppLayout>
  );
}

