import { NextResponse } from 'next/server';
import { runAutomatedDunningEngine } from '@/lib/dunning-engine';
import { getSession } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getSession();
    if (!session || session.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized. Staff or Admin access required.' }, { status: 403 });
    }

    const result = await runAutomatedDunningEngine();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Dunning run failed' }, { status: 500 });
  }
}

