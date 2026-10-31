import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

export default async function SubscriptionsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const where = session.role === 'customer' && session.customerId
    ? { customerId: session.customerId }
    : {};

  const subscriptions = await prisma.subscription.findMany({
    where,
    include: { customer: true, plan: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-600 mt-1">Manage customer subscriptions</p>
        </div>
        {['admin', 'staff'].includes(session.role) && (
          <Link href="/dashboard/subscriptions/new" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Subscription
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
              {session.role !== 'customer' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subscriptions.map((sub) => (
              <tr key={sub.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/dashboard/subscriptions/${sub.id}`} className="text-blue-600 hover:underline font-medium">
                    {sub.number}
                  </Link>
                </td>
                {session.role !== 'customer' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sub.customer.name}</td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sub.plan.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{format(new Date(sub.startDate), 'MMM dd, yyyy')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{sub.total.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    sub.status === 'active' ? 'bg-green-100 text-green-800' :
                    sub.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    sub.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link href={`/dashboard/subscriptions/${sub.id}`} className="text-blue-600 hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
