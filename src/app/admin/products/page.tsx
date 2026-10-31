import React from 'react';
import { prisma } from '@/lib/prisma';
import { AppLayout } from '@/components/AppLayout';
import { Header } from '@/components/Header';
import { ProductsManager } from './ProductsManager';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { name: 'asc' },
  });

  return (
    <AppLayout>
      <Header
        title="Product Catalog & Variant Configurator"
        subtitle="Manage software services, base sales pricing, margin, and brand variant price adjustments"
      />

      <main className="flex-1 p-8 overflow-y-auto">
        <ProductsManager initialProducts={JSON.parse(JSON.stringify(products))} />
      </main>
    </AppLayout>
  );
}

