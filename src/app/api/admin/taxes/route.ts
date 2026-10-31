import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { name, rate, region } = await request.json();

    if (!name || rate === undefined) {
      return NextResponse.json({ error: 'Name and tax rate are required' }, { status: 400 });
    }

    const taxRule = await prisma.taxRule.create({
      data: {
        name,
        rate: parseFloat(rate),
        region: region || 'GLOBAL',
        active: true,
      },
    });

    return NextResponse.json(taxRule);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create tax rule' }, { status: 500 });
  }
}

