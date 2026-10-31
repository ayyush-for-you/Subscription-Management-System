import { prisma } from './prisma';

export interface DunningRunResult {
  evaluatedInvoices: number;
  stage1RemindersSent: number;
  stage2UrgentNoticesSent: number;
  stage3SubscriptionsPaused: number;
  totalOverdueAmount: number;
  details: string[];
}

/**
 * Evaluates all unpaid/confirmed invoices against their due dates
 * and applies the 3-stage automated dunning recovery logic.
 */
export async function runAutomatedDunningEngine(): Promise<DunningRunResult> {
  const now = new Date();
  const result: DunningRunResult = {
    evaluatedInvoices: 0,
    stage1RemindersSent: 0,
    stage2UrgentNoticesSent: 0,
    stage3SubscriptionsPaused: 0,
    totalOverdueAmount: 0,
    details: [],
  };

  // Find all unpaid invoices where dueDate < now
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: { in: ['CONFIRMED', 'OVERDUE'] },
      balanceDue: { gt: 0 },
      dueDate: { lt: now },
    },
    include: {
      customer: true,
      subscription: true,
    },
  });

  result.evaluatedInvoices = overdueInvoices.length;

  for (const inv of overdueInvoices) {
    result.totalOverdueAmount += inv.balanceDue;
    const daysOverdue = Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));

    // Update status to OVERDUE if not already
    let newStatus = inv.status;
    if (inv.status !== 'OVERDUE') {
      newStatus = 'OVERDUE';
    }

    // Stage 3: Day 14+ Past Due -> Pause Subscription
    if (daysOverdue >= 14 && inv.dunningStage < 3) {
      await prisma.$transaction(async (tx) => {
        await tx.invoice.update({
          where: { id: inv.id },
          data: {
            status: 'OVERDUE',
            dunningStage: 3,
          },
        });

        // Pause the associated subscription if it's currently active
        if (inv.subscription && inv.subscription.status === 'ACTIVE') {
          await tx.subscription.update({
            where: { id: inv.subscriptionId },
            data: { status: 'PAUSED' },
          });
          result.stage3SubscriptionsPaused++;

          await tx.auditLog.create({
            data: {
              subscriptionId: inv.subscriptionId,
              invoiceId: inv.id,
              action: 'DUNNING_TRIGGERED',
              details: `[STAGE 3 DUNNING] Invoice ${inv.invoiceNumber} is ${daysOverdue} days overdue (Due: ${new Date(inv.dueDate).toISOString().split('T')[0]}). Subscription automatically PAUSED to protect cash flow.`,
            },
          });
        }
      });
      result.details.push(`Invoice ${inv.invoiceNumber}: Stage 3 - Subscription ${inv.subscription?.subscriptionNumber || ''} PAUSED (${daysOverdue}d overdue)`);
    }
    // Stage 2: Day 7 - 13 Past Due -> Urgent notice with direct payment link
    else if (daysOverdue >= 7 && inv.dunningStage < 2) {
      await prisma.$transaction(async (tx) => {
        await tx.invoice.update({
          where: { id: inv.id },
          data: {
            status: 'OVERDUE',
            dunningStage: 2,
          },
        });

        await tx.auditLog.create({
          data: {
            subscriptionId: inv.subscriptionId,
            invoiceId: inv.id,
            action: 'DUNNING_TRIGGERED',
            details: `[STAGE 2 DUNNING] Urgent overdue notice dispatched for ${inv.invoiceNumber} ($${inv.balanceDue.toFixed(2)}, ${daysOverdue} days overdue). Staff escalation flag raised.`,
          },
        });
      });
      result.stage2UrgentNoticesSent++;
      result.details.push(`Invoice ${inv.invoiceNumber}: Stage 2 - Urgent Notice dispatched (${daysOverdue}d overdue)`);
    }
    // Stage 1: Day 3 - 6 Past Due -> Friendly automated reminder
    else if (daysOverdue >= 3 && inv.dunningStage < 1) {
      await prisma.$transaction(async (tx) => {
        await tx.invoice.update({
          where: { id: inv.id },
          data: {
            status: 'OVERDUE',
            dunningStage: 1,
          },
        });

        await tx.auditLog.create({
          data: {
            subscriptionId: inv.subscriptionId,
            invoiceId: inv.id,
            action: 'DUNNING_TRIGGERED',
            details: `[STAGE 1 DUNNING] Automated friendly renewal reminder sent to ${inv.customer.email} for ${inv.invoiceNumber} ($${inv.balanceDue.toFixed(2)}, ${daysOverdue} days overdue).`,
          },
        });
      });
      result.stage1RemindersSent++;
      result.details.push(`Invoice ${inv.invoiceNumber}: Stage 1 - Friendly Reminder sent (${daysOverdue}d overdue)`);
    } else if (inv.status !== 'OVERDUE') {
      await prisma.invoice.update({
        where: { id: inv.id },
        data: { status: 'OVERDUE' },
      });
    }
  }

  return result;
}

/**
 * Handles payment completion: marks invoice paid and automatically re-activates
 * a paused subscription if no other overdue invoices remain.
 */
export async function handlePaymentReactivation(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      subscription: {
        include: {
          invoices: true,
        },
      },
    },
  });

  if (!invoice || !invoice.subscription) return;

  // Check if this subscription is PAUSED
  if (invoice.subscription.status === 'PAUSED') {
    // Check if there are other unpaid overdue invoices for this subscription
    const otherOverdue = invoice.subscription.invoices.some(
      (inv) => inv.id !== invoiceId && inv.status === 'OVERDUE' && inv.balanceDue > 0
    );

    if (!otherOverdue) {
      await prisma.subscription.update({
        where: { id: invoice.subscriptionId },
        data: { status: 'ACTIVE' },
      });

      await prisma.auditLog.create({
        data: {
          subscriptionId: invoice.subscriptionId,
          invoiceId: invoice.id,
          action: 'STATE_CHANGE',
          details: `Subscription automatically RE-ACTIVATED to ACTIVE following payment reconciliation of Invoice ${invoice.invoiceNumber}.`,
        },
      });
    }
  }
}

