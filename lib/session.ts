import { cookies } from 'next/headers';

export async function setSession(userId: number, role: string, customerId?: number) {
  const cookieStore = await cookies();
  cookieStore.set('userId', userId.toString(), { httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
  cookieStore.set('role', role, { httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
  if (customerId) {
    cookieStore.set('customerId', customerId.toString(), { httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  const role = cookieStore.get('role')?.value;
  const customerId = cookieStore.get('customerId')?.value;

  if (!userId || !role) {
    return null;
  }

  return {
    userId: parseInt(userId),
    role,
    customerId: customerId ? parseInt(customerId) : undefined,
  };
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('userId');
  cookieStore.delete('role');
  cookieStore.delete('customerId');
}
