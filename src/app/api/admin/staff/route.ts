import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, validatePasswordPolicy, hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required for staff provisioning' }, { status: 403 });
    }

    const { name, email, role, password, companyName } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and initial password are required' }, { status: 400 });
    }

    const policy = validatePasswordPolicy(password);
    if (!policy.valid) {
      return NextResponse.json({ error: policy.message }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const staff = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        role: role === 'ADMIN' ? 'ADMIN' : 'STAFF',
        passwordHash,
        companyName: companyName || 'Brightloop Internal Staff',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyName: true,
        createdAt: true,
      },
    });

    return NextResponse.json(staff);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create staff member' }, { status: 500 });
  }
}

