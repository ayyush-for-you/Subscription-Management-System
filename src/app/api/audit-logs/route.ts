import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const { subscriptionId, invoiceId, action, details } = await request.json();

    if (!details) {
      return NextResponse.json({ error: 'Details are required' }, { status: 400 });
    }

    const log = await prisma.auditLog.create({
      data: {
        subscriptionId: subscriptionId || null,
        invoiceId: invoiceId || null,
        actorId: session?.id || null,
        action: action || 'NOTE_ADDED',
        details,
      },
      include: {
        actor: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(log);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save audit log' }, { status: 500 });
  }
}

