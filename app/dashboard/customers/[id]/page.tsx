import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id: parseInt(id) },
    include: {
      subscriptions: {
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      },
      invoices: {
        orderBy: { invoiceDate: 'desc' },
      },
      payments: {
        orderBy: { paymentDate: 'desc' },
      },
    },
  });

  if (!customer) notFound();

  const totalPaid = customer.payments.reduce((sum, p) => sum + p.amount, 0);
  const totalOutstanding = customer.invoices
    .filter((i) => !['paid', 'cancelled'].includes(i.status))
    .reduce((sum, i) => sum + i.outstanding, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/customers" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-gray-600 mt-1">Customer Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Outstanding</p>
          <p className="text-2xl font-bold text-orange-600">₹{totalOutstanding.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Active Subscriptions</p>
          <p className="text-2xl font-bold text-blue-600">
            {customer.subscriptions.filter((s) => s.status === 'active').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{customer.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium">{customer.phone || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Company</p>
            <p className="font-medium">{customer.company || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Customer Type</p>
            <p className="font-medium capitalize">{customer.customerType || '-'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-600">Address</p>
            <p className="font-medium">
              {[customer.address, customer.city, customer.state, customer.country]
                .filter(Boolean)
                .join(', ') || '-'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Subscriptions</h2>
        <div className="space-y-3">
          {customer.subscriptions.length === 0 ? (
            <p className="text-gray-500">No subscriptions yet</p>
          ) : (
            customer.subscriptions.map((sub) => (
              <div key={sub.id} className="flex justify-between items-center border-b pb-3">
                <div>
                  <Link href={`/dashboard/subscriptions/${sub.id}`} className="font-medium text-blue-600 hover:underline">
                    {sub.number}
                  </Link>
                  <p className="text-sm text-gray-600">{sub.plan.name}</p>
                  <p className="text-xs text-gray-500">Started: {format(new Date(sub.startDate), 'MMM dd, yyyy')}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{sub.total.toLocaleString('en-IN')}</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    sub.status === 'active' ? 'bg-green-100 text-green-800' :
                    sub.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {sub.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Invoices</h2>
          <div className="space-y-2">
            {customer.invoices.slice(0, 5).map((invoice) => (
              <div key={invoice.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <Link href={`/dashboard/invoices/${invoice.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                    {invoice.number}
                  </Link>
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
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Payments</h2>
          <div className="space-y-2">
            {customer.payments.slice(0, 5).map((payment) => (
              <div key={payment.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="text-sm font-medium">{payment.reference}</p>
                  <p className="text-xs text-gray-500">{format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</p>
                </div>
                <p className="text-sm font-semibold text-green-600">₹{payment.amount.toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
