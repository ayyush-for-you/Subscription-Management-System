import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { status, reason } = await request.json();
    const sub = await prisma.subscription.findUnique({
      where: { id: params.id },
    });

    if (!sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    const oldStatus = sub.status;
    const updated = await prisma.subscription.update({
      where: { id: params.id },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        subscriptionId: sub.id,
        actorId: session.id,
        action: 'STATE_CHANGE',
        details: `Status transitioned from ${oldStatus} to ${status}${reason ? `. Reason: ${reason}` : ''}.`,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update status' }, { status: 500 });
  }
}

