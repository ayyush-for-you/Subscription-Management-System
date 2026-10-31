import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const {
      customerId,
      planId,
      paymentTerms,
      discountCode,
      lines,
      validDays,
    } = await request.json();

    if (!customerId || !planId || !lines || lines.length === 0) {
      return NextResponse.json({ error: 'Customer, Plan, and at least one line item are required.' }, { status: 400 });
    }

    // Check discount
    let discountId: string | null = null;
    if (discountCode) {
      const discount = await prisma.discount.findUnique({
        where: { code: discountCode.trim().toUpperCase() },
      });
      if (discount) {
        discountId = discount.id;
        await prisma.discount.update({
          where: { id: discount.id },
          data: { currentUses: { increment: 1 } },
        });
      }
    }

    // Generate Subscription number
    const subCount = await prisma.subscription.count();
    const currentYear = new Date().getFullYear();
    const subscriptionNumber = `SUB-${currentYear}-${String(subCount + 1).padStart(4, '0')}`;

    // Generate secure share token (crypto-random)
    const shareToken = `quote-tok-${crypto.randomBytes(16).toString('hex')}`;

    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(expiryDate.getDate() + (validDays || 15));

    const subscription = await prisma.$transaction(async (tx) => {
      const created = await tx.subscription.create({
        data: {
          subscriptionNumber,
          customerId,
          planId,
          status: 'QUOTATION',
          startDate: now,
          expiryDate,
          paymentTerms: paymentTerms || 'Net 15',
          discountId,
          shareToken,
          lines: {
            create: lines.map((l: any) => ({
              productId: l.productId,
              variantId: l.variantId || null,
              quantity: parseInt(l.quantity) || 1,
              unitPrice: parseFloat(l.unitPrice) || 0,
              taxRate: parseFloat(l.taxRate) || 0,
              subtotal: (parseInt(l.quantity) || 1) * (parseFloat(l.unitPrice) || 0),
            })),
          },
        },
        include: {
          customer: true,
          plan: true,
        },
      });

      await tx.auditLog.create({
        data: {
          subscriptionId: created.id,
          actorId: session.id,
          action: 'STATE_CHANGE',
          details: `Quotation created by ${session.name} with validity through ${expiryDate.toISOString().split('T')[0]}. Public share link generated.`,
        },
      });

      return created;
    });

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      subscriptionNumber: subscription.subscriptionNumber,
      shareToken: subscription.shareToken,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create quotation' }, { status: 500 });
  }
}

