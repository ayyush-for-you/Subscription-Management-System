import React from 'react';
import { prisma } from '@/lib/prisma';
import { AppLayout } from '@/components/AppLayout';
import { Header } from '@/components/Header';
import { StaffManager } from './StaffManager';

export const dynamic = 'force-dynamic';

export default async function AdminStaffPage() {
  const staffMembers = await prisma.user.findMany({
    where: {
      role: { in: ['ADMIN', 'STAFF'] },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      companyName: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <AppLayout>
      <Header
        title="Internal Staff Provisioning & RBAC"
        subtitle="Manage employee access control, system admins, sales reps, and finance leads"
      />

      <main className="flex-1 p-8 overflow-y-auto">
        <StaffManager initialStaff={JSON.parse(JSON.stringify(staffMembers))} />
      </main>
    </AppLayout>
  );
}

