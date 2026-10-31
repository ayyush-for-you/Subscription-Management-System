import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import CustomerTable from '@/components/CustomerTable';

export default async function CustomersPage() {
  const session = await getSession();
  if (!session || !['admin', 'staff'].includes(session.role)) {
    redirect('/dashboard');
  }

  let customers;
  try {
    customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch {
    throw new Error('Customer data is temporarily unavailable. Please try again.');
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage your customer database</p>
        </div>
        <Link
          href="/dashboard/customers/new"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Link>
      </div>

      <CustomerTable customers={customers} />
    </div>
  );
}
