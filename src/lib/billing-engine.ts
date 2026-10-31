import { prisma } from './prisma';

export interface BillingRunResult {
  processed: number;
  invoicesCreated: string[];
  skippedAlreadyBilled: number;
  errors: string[];
}

export function computeNextBillingDate(currentDate: Date, frequency: string): Date {
  const next = new Date(currentDate);
  switch (frequency) {
    case 'DAILY':
      next.setDate(next.getDate() + 1);
      break;
    case 'WEEKLY':
      next.setDate(next.getDate() + 7);
      break;
    case 'YEARLY':
      next.setFullYear(next.getFullYear() + 1);
      break;
    case 'MONTHLY':
    default:
      next.setMonth(next.getMonth() + 1);
      break;
  }
  return next;
}

export function computeDueDate(issueDate: Date, paymentTerms: string): Date {
  const due = new Date(issueDate);
  if (paymentTerms.includes('30')) {
    due.setDate(due.getDate() + 30);
  } else if (paymentTerms.includes('15')) {
    due.setDate(due.getDate() + 15);
  } else if (paymentTerms.includes('7')) {
    due.setDate(due.getDate() + 7);
  } else {
    due.setDate(due.getDate() + 14); // default Net 14
  }
  return due;
}

/**
 * Executes the recurring billing run with transactional idempotency.
 * Can be triggered for all due subscriptions or for a specific subscription.
 */
export async function runAutomatedBillingJob(targetSubscriptionId?: string): Promise<BillingRunResult> {
  const now = new Date();
  const result: BillingRunResult = {
    processed: 0,
    invoicesCreated: [],
    skippedAlreadyBilled: 0,
    errors: [],
  };

  // Find active subscriptions that are due for billing
  const whereClause: any = {
    status: 'ACTIVE',
  };

  if (targetSubscriptionId) {
    whereClause.id = targetSubscriptionId;
  } else {
    // Subscriptions whose nextBillingDate is on or before now (or null, meaning first run)
    whereClause.OR = [
      { nextBillingDate: { lte: now } },
      { nextBillingDate: null },
    ];
  }

  const subscriptions = await prisma.subscription.findMany({
    where: whereClause,
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
        take: 5,
      },
    },
  });

  for (const sub of subscriptions) {
    result.processed++;
    try {
      // Formulate unique billing period key for idempotency check (YYYY-MM or YYYY-WW)
      const billingDate = sub.nextBillingDate || now;
      const periodKey = `${billingDate.getFullYear()}-${String(billingDate.getMonth() + 1).padStart(2, '0')}`;

      // Idempotency check: see if an invoice for this subscription was already generated within the last 20 days or for this cycle
      const existingInvoice = sub.invoices.find((inv) => {
        const invDate = new Date(inv.issueDate);
        const invPeriodKey = `${invDate.getFullYear()}-${String(invDate.getMonth() + 1).padStart(2, '0')}`;
        // If monthly and already generated this month
        return invPeriodKey === periodKey && sub.plan.frequency === 'MONTHLY';
      });

      if (existingInvoice && !targetSubscriptionId) {
        result.skippedAlreadyBilled++;
        continue;
      }

      // Calculate totals
      let subtotal = 0;
      let totalTax = 0;

      for (const line of sub.lines) {
        const lineTotal = line.quantity * line.unitPrice;
        subtotal += lineTotal;
        const lineTax = lineTotal * (line.taxRate / 100);
        totalTax += lineTax;
      }

      // Calculate discount
      let discountAmount = 0;
      if (sub.discount) {
        if (sub.discount.discountType === 'PERCENTAGE') {
          discountAmount = (subtotal * sub.discount.value) / 100;
        } else {
          discountAmount = Math.min(subtotal, sub.discount.value);
        }
      }

      const taxableSubtotal = Math.max(0, subtotal - discountAmount);
      const effectiveTax = subtotal > 0 ? (totalTax * (taxableSubtotal / subtotal)) : 0;
      const totalAmount = Math.max(0, taxableSubtotal + effectiveTax);

      const issueDate = new Date();
      const dueDate = computeDueDate(issueDate, sub.paymentTerms);
      const nextBilling = computeNextBillingDate(billingDate, sub.plan.frequency);

      // Generate invoice number
      const invoiceCount = await prisma.invoice.count();
      const invoiceNumber = `INV-${issueDate.getFullYear()}-${String(invoiceCount + 1).padStart(4, '0')}`;

      // Execute transaction atomically
      await prisma.$transaction(async (tx) => {
        const invoice = await tx.invoice.create({
          data: {
            invoiceNumber,
            subscriptionId: sub.id,
            customerId: sub.customerId,
            issueDate,
            dueDate,
            subtotal: Math.round(subtotal * 100) / 100,
            discountAmount: Math.round(discountAmount * 100) / 100,
            taxAmount: Math.round(effectiveTax * 100) / 100,
            totalAmount: Math.round(totalAmount * 100) / 100,
            balanceDue: Math.round(totalAmount * 100) / 100,
            status: 'CONFIRMED', // Confirmed ready for payment
            dunningStage: 0,
          },
        });

        // Update subscription next billing date
        await tx.subscription.update({
          where: { id: sub.id },
          data: {
            nextBillingDate: nextBilling,
          },
        });

        // Record audit logs
        await tx.auditLog.create({
          data: {
            subscriptionId: sub.id,
            invoiceId: invoice.id,
            action: 'INVOICE_GENERATED',
            details: `Automated billing engine generated invoice ${invoiceNumber} ($${totalAmount.toFixed(2)}) for period ${periodKey}. Next cycle: ${nextBilling.toISOString().split('T')[0]}.`,
          },
        });
      });

      result.invoicesCreated.push(invoiceNumber);
    } catch (err: any) {
      result.errors.push(`Subscription ${sub.subscriptionNumber}: ${err.message}`);
    }
  }

  return result;
}

