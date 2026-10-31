import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function PlansPage() {
  const session = await getSession();
  if (!session || !['admin', 'staff'].includes(session.role)) redirect('/dashboard');

  const plans = await prisma.subscriptionPlan.findMany({
    where: { status: 'active' },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-600 mt-1">Configure subscription plans</p>
        </div>
        <Link href="/dashboard/plans/new" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Plan
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Price</span>
                <span className="text-lg font-bold text-blue-600">₹{plan.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Billing</span>
                <span className="text-sm font-medium capitalize">{plan.billingFrequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Min Quantity</span>
                <span className="text-sm font-medium">{plan.minimumQuantity}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {plan.allowPause && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Pausable</span>}
                {plan.allowRenewal && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Renewable</span>}
                {plan.autoClose && <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Auto Close</span>}
              </div>
            </div>
            <Link href={`/dashboard/plans/${plan.id}`} className="block mt-4 text-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
