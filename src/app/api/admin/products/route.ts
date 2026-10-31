import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { name, type, salesPrice, costPrice, notes, variants } = await request.json();

    if (!name || salesPrice === undefined) {
      return NextResponse.json({ error: 'Name and sales price are required' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        type: type || 'Software',
        salesPrice: parseFloat(salesPrice),
        costPrice: parseFloat(costPrice || '0'),
        notes: notes || null,
        variants: {
          create: (variants || []).map((v: any) => ({
            variantName: v.variantName,
            priceAdjustment: parseFloat(v.priceAdjustment || '0'),
          })),
        },
      },
      include: { variants: true },
    });

    return NextResponse.json(product);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create product' }, { status: 500 });
  }
}

