import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validatePasswordPolicy, hashPassword, setSessionCookie } from '@/lib/auth';
import { Role } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { email, password, name, companyName } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const policyCheck = validatePasswordPolicy(password);
    if (!policyCheck.valid) {
      return NextResponse.json({ error: policyCheck.message }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        name,
        companyName: companyName || null,
        role: 'CUSTOMER',
      },
    });

    await setSessionCookie({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      companyName: user.companyName,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Signup error' }, { status: 500 });
  }
}

