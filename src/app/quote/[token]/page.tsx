import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PublicQuoteView } from './PublicQuoteView';

export const dynamic = 'force-dynamic';

export default async function PublicQuotePage({
  params,
}: {
  params: { token: string };
}) {
  const subscription = await prisma.subscription.findUnique({
    where: { shareToken: params.token },
    include: {
      customer: true,
      plan: true,
      lines: {
        include: {
          product: {
            include: { variants: true },
          },
          variant: true,
        },
      },
      discount: true,
    },
  });

  if (!subscription) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <PublicQuoteView subscription={JSON.parse(JSON.stringify(subscription))} />
      </div>
    </div>
  );
}

