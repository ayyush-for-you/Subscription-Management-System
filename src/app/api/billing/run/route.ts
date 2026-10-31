import { NextResponse } from 'next/server';
import { runAutomatedBillingJob } from '@/lib/billing-engine';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    // Allow internal staff or admin
    if (!session || session.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized. Staff or Admin access required.' }, { status: 403 });
    }

    let targetSubscriptionId: string | undefined = undefined;
    try {
      const body = await request.json();
      targetSubscriptionId = body.subscriptionId;
    } catch {
      // no body, full run
    }

    const result = await runAutomatedBillingJob(targetSubscriptionId);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Billing job failed' }, { status: 500 });
  }
}

