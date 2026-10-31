import { NextRequest, NextResponse } from 'next/server';
import { createUser, validatePassword } from '@/lib/auth';
import { setSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, company, phone } = await request.json();

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Create user with customer role
    const user = await createUser(email, password, name, 'customer');

    // Create customer record
    const customer = await prisma.customer.create({
      data: {
        userId: user.id,
        name,
        email,
        phone: phone || null,
        company: company || null,
        status: 'active',
      },
    });

    await setSession(user.id, user.role, customer.id);

    return NextResponse.json({
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
