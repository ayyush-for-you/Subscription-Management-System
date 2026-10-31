import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !['admin', 'staff'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find active subscriptions due for billing
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: 'active',
      nextBillingDate: {
        lte: today,
      },
    },
    include: {
      customer: true,
      plan: true,
      lines: {
        include: {
          product: true,
        },
      },
    },
  });

  const results = {
    processed: 0,
    failed: 0,
    invoices: [] as any[],
  };

  for (const subscription of subscriptions) {
    try {
      // Check if invoice already exists for this billing period
      const existingInvoice = await prisma.invoice.findFirst({
        where: {
          subscriptionId: subscription.id,
          billingPeriodStart: subscription.nextBillingDate,
        },
      });

      if (existingInvoice) {
        continue; // Skip if invoice already exists
      }

      // Generate invoice number
      const invoiceCount = await prisma.invoice.count();
      const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, '0')}`;

      // Calculate billing period
      const billingStart = subscription.nextBillingDate || today;
      let billingEnd = new Date(billingStart);
      
      switch (subscription.billingFrequency) {
        case 'daily':
          billingEnd = addDays(billingStart, 1);
          break;
        case 'weekly':
          billingEnd = addWeeks(billingStart, 1);
          break;
        case 'monthly':
          billingEnd = addMonths(billingStart, 1);
          break;
        case 'yearly':
          billingEnd = addYears(billingStart, 1);
          break;
      }

      // Create invoice
      const invoice = await prisma.invoice.create({
        data: {
          number: invoiceNumber,
          customerId: subscription.customerId,
          subscriptionId: subscription.id,
          invoiceDate: today,
          dueDate: addDays(today, 30),
          billingPeriodStart: billingStart,
          billingPeriodEnd: billingEnd,
          subtotal: subscription.subtotal,
          taxAmount: subscription.taxAmount,
          discount: subscription.discount,
          total: subscription.total,
          amountPaid: 0,
          outstanding: subscription.total,
          status: 'confirmed',
          lines: {
            create: subscription.lines.map((line) => ({
              description: `${line.product.name} (${subscription.billingFrequency})`,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              taxRate: line.taxRate,
              discount: line.discount,
              total: line.total,
            })),
          },
        },
      });

      // Update next billing date
      let nextBillingDate = new Date(billingEnd);
      switch (subscription.billingFrequency) {
        case 'daily':
          nextBillingDate = addDays(billingEnd, 1);
          break;
        case 'weekly':
          nextBillingDate = addWeeks(billingEnd, 1);
          break;
        case 'monthly':
          nextBillingDate = addMonths(billingEnd, 1);
          break;
        case 'yearly':
          nextBillingDate = addYears(billingEnd, 1);
          break;
      }

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { nextBillingDate },
      });

      results.processed++;
      results.invoices.push(invoice);
    } catch (error) {
      console.error(`Failed to process subscription ${subscription.id}:`, error);
      results.failed++;
    }
  }

  // Close expired subscriptions with auto-close enabled
  const expiredSubscriptions = await prisma.subscription.findMany({
    where: {
      status: 'active',
      expiryDate: {
        lte: today,
      },
    },
    include: {
      plan: true,
    },
  });

  for (const sub of expiredSubscriptions) {
    if (sub.plan.autoClose) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: 'closed' },
      });
    }
  }

  return NextResponse.json({
    success: true,
    message: `Processed ${results.processed} subscriptions, ${results.failed} failed`,
    ...results,
  });
}
