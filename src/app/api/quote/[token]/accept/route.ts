import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeNextBillingDate } from '@/lib/billing-engine';

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { signerName, selectedVariants } = await request.json();

    if (!signerName?.trim()) {
      return NextResponse.json({ error: 'Signature / Full Name is required to sign and accept quotation' }, { status: 400 });
    }

    const sub = await prisma.subscription.findUnique({
      where: { shareToken: params.token },
      include: {
        plan: true,
        customer: true,
        lines: {
          include: { product: true, variant: true },
        },
      },
    });

    if (!sub) {
      return NextResponse.json({ error: 'Quotation not found or link has expired' }, { status: 404 });
    }

    if (sub.status === 'ACTIVE') {
      return NextResponse.json({ error: 'This quotation has already been accepted and activated.' }, { status: 400 });
    }

    const now = new Date();
    const nextBilling = computeNextBillingDate(now, sub.plan.frequency);

    await prisma.$transaction(async (tx) => {
      // If variant adjustments were toggled by customer, update line items
      if (selectedVariants && typeof selectedVariants === 'object') {
        for (const [lineId, variantId] of Object.entries(selectedVariants)) {
          if (variantId) {
            const variant = await tx.productVariant.findUnique({ where: { id: variantId as string } });
            const line = await tx.subscriptionLine.findUnique({ where: { id: lineId } });
            if (variant && line) {
              const basePrice = line.unitPrice; // or recalculate
              // Update variant and price
              await tx.subscriptionLine.update({
                where: { id: lineId },
                data: {
                  variantId: variant.id,
                },
              });
            }
          }
        }
      }

      // Convert to ACTIVE subscription
      await tx.subscription.update({
        where: { id: sub.id },
        data: {
          status: 'ACTIVE',
          startDate: now,
          nextBillingDate: nextBilling,
        },
      });

      // Record ERP Audit Log
      await tx.auditLog.create({
        data: {
          subscriptionId: sub.id,
          actorId: sub.customerId,
          action: 'STATE_CHANGE',
          details: `Quotation accepted online via 1-Click Buy by "${signerName.trim()}". Converted from ${sub.status} to ACTIVE. Next billing scheduled for ${nextBilling.toISOString().split('T')[0]}.`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      subscriptionNumber: sub.subscriptionNumber,
      message: 'Quotation successfully accepted and subscription activated!',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to accept quotation' }, { status: 500 });
  }
}

