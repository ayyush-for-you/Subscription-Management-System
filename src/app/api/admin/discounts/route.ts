import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { code, discountType, value, minPurchaseAmount, maxUses } = await request.json();

    if (!code || value === undefined) {
      return NextResponse.json({ error: 'Code and value are required' }, { status: 400 });
    }

    const discount = await prisma.discount.create({
      data: {
        code: code.trim().toUpperCase(),
        discountType: discountType || 'PERCENTAGE',
        value: parseFloat(value),
        minPurchaseAmount: minPurchaseAmount ? parseFloat(minPurchaseAmount) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
      },
    });

    return NextResponse.json(discount);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create discount' }, { status: 500 });
  }
}

