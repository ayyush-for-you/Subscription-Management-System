import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !['admin', 'staff'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const required = ['name', 'email'];
    if (required.some((field) => !String(data[field] || '').trim())) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const customer = await prisma.customer.create({
      data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      customerType: data.customerType,
      status: data.status || 'active',
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'A customer with that email already exists' }, { status: 409 });
    }
    console.error('Failed to create customer', error);
    return NextResponse.json({ error: 'Unable to create customer' }, { status: 500 });
  }
}
