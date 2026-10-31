import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { name, basePrice, frequency, minQuantity, autoClose, canPause } = await request.json();

    if (!name || basePrice === undefined) {
      return NextResponse.json({ error: 'Plan name and base price are required' }, { status: 400 });
    }

    const plan = await prisma.plan.create({
      data: {
        name,
        basePrice: parseFloat(basePrice),
        frequency: frequency || 'MONTHLY',
        minQuantity: parseInt(minQuantity) || 1,
        autoClose: Boolean(autoClose),
        canPause: canPause !== undefined ? Boolean(canPause) : true,
      },
    });

    return NextResponse.json(plan);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create plan' }, { status: 500 });
  }
}

