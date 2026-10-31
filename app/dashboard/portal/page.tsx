import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';

export default async function CustomerPortalPage() {
  const session = await getSession();
  if (!session || session.role !== 'customer' || !session.customerId) {
    redirect('/dashboard');
  }

  const [customer, subscriptions, invoices, payments] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: session.customerId },
    }),
    prisma.subscription.findMany({
      where: { customerId: session.customerId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.invoice.findMany({
      where: { customerId: session.customerId },
      orderBy: { invoiceDate: 'desc' },
    }),
    prisma.payment.findMany({
      where: { customerId: session.customerId },
      orderBy: { paymentDate: 'desc' },
    }),
  ]);

  const totalOutstanding = invoices
    .filter((i) => !['paid', 'cancelled'].includes(i.status))
    .reduce((sum, i) => sum + i.outstanding, 0);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {customer?.name}</h1>
        <p className="text-gray-600 mt-1">Your subscription dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Active Subscriptions</p>
          <p className="text-3xl font-bold text-blue-600">
            {subscriptions.filter((s) => s.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Paid</p>
          <p className="text-3xl font-bold text-green-600">₹{totalPaid.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Outstanding Balance</p>
          <p className="text-3xl font-bold text-orange-600">₹{totalOutstanding.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">My Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{customer?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium">{customer?.phone || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Company</p>
            <p className="font-medium">{customer?.company || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Location</p>
            <p className="font-medium">{customer?.city ? `${customer.city}, ${customer.country}` : '-'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">My Subscriptions</h2>
        <div className="space-y-3">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="flex justify-between items-center border-b pb-3">
              <div>
                <p className="font-medium">{sub.plan.name}</p>
                <p className="text-sm text-gray-600">{sub.number}</p>
                <p className="text-xs text-gray-500">
                  Started: {format(new Date(sub.startDate), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">₹{sub.total.toLocaleString('en-IN')}</p>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  sub.status === 'active' ? 'bg-green-100 text-green-800' :
                  sub.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {sub.status}
                </span>
                {sub.nextBillingDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Next billing: {format(new Date(sub.nextBillingDate), 'MMM dd, yyyy')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Invoices</h2>
          <div className="space-y-2">
            {invoices.slice(0, 5).map((invoice) => (
              <div key={invoice.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium text-sm">{invoice.number}</p>
                  <p className="text-xs text-gray-500">{format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">₹{invoice.total.toLocaleString('en-IN')}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link href="/dashboard/invoices" className="block mt-4 text-center text-blue-600 hover:underline text-sm">
            View All Invoices
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Payments</h2>
          <div className="space-y-2">
            {payments.slice(0, 5).map((payment) => (
              <div key={payment.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium text-sm">{payment.reference}</p>
                  <p className="text-xs text-gray-500">{format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</p>
                </div>
                <p className="text-sm font-semibold text-green-600">₹{payment.amount.toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
          <Link href="/dashboard/payments" className="block mt-4 text-center text-blue-600 hover:underline text-sm">
            View All Payments
          </Link>
        </div>
      </div>
    </div>
  );
}
