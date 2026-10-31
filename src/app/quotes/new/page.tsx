import React from 'react';
import { prisma } from '@/lib/prisma';
import { AppLayout } from '@/components/AppLayout';
import { Header } from '@/components/Header';
import { QuoteBuilderForm } from './QuoteBuilderForm';

export const dynamic = 'force-dynamic';

export default async function NewQuotePage() {
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    select: { id: true, name: true, email: true, companyName: true },
    orderBy: { name: 'asc' },
  });

  const plans = await prisma.plan.findMany({
    orderBy: { basePrice: 'asc' },
  });

  const products = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { name: 'asc' },
  });

  const taxRules = await prisma.taxRule.findMany({
    where: { active: true },
  });

  const discounts = await prisma.discount.findMany({
    select: { code: true, discountType: true, value: true },
  });

  return (
    <AppLayout>
      <Header
        title="Quotation Builder & Offer Generator"
        subtitle="Configure custom plans, add product variants with dynamic deltas, and generate signed 1-Click Buy links"
      />

      <main className="flex-1 p-8 overflow-y-auto">
        <QuoteBuilderForm
          customers={customers}
          plans={plans}
          products={products}
          taxRules={taxRules}
          discounts={discounts}
        />
      </main>
    </AppLayout>
  );
}

