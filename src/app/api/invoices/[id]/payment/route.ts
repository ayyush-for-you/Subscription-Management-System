import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { handlePaymentReactivation } from '@/lib/dunning-engine';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    const { amount, paymentMethod, referenceNote } = await request.json();

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: 'Valid payment amount is required' }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: { customer: true, subscription: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check customer authorization: customers can only pay their own invoices
    if (session?.role === 'CUSTOMER' && session.id !== invoice.customerId) {
      return NextResponse.json({ error: 'Unauthorized to pay this invoice' }, { status: 403 });
    }

    const newBalance = Math.max(0, Math.round((invoice.balanceDue - numericAmount) * 100) / 100);
    const newStatus = newBalance <= 0.01 ? 'PAID' : invoice.status;

    const payment = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: numericAmount,
          paymentMethod: paymentMethod || 'Credit Card',
          referenceNote: referenceNote || null,
        },
      });

      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          balanceDue: newBalance,
          status: newStatus,
          dunningStage: newBalance <= 0.01 ? 0 : invoice.dunningStage,
        },
      });

      await tx.auditLog.create({
        data: {
          invoiceId: invoice.id,
          subscriptionId: invoice.subscriptionId,
          actorId: session?.id || null,
          action: 'PAYMENT_RECEIVED',
          details: `Payment of $${numericAmount.toFixed(2)} received via ${paymentMethod || 'Credit Card'}. Remaining balance: $${newBalance.toFixed(2)}. Status: ${newStatus}.`,
        },
      });

      return p;
    });

    // If fully paid, reactivate any paused subscription associated with this invoice
    if (newBalance <= 0.01) {
      await handlePaymentReactivation(invoice.id);
    }

    return NextResponse.json({ success: true, payment, newBalance, status: newStatus });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Payment registration failed' }, { status: 500 });
  }
}

