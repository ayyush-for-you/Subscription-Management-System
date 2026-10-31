import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  const settings = await prisma.companySetting.findFirst();
  return NextResponse.json(settings || {});
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  
  const existing = await prisma.companySetting.findFirst();
  
  let settings;
  if (existing) {
    settings = await prisma.companySetting.update({
      where: { id: existing.id },
      data,
    });
  } else {
    settings = await prisma.companySetting.create({ data });
  }

  return NextResponse.json(settings);
}
