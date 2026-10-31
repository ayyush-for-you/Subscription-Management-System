import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function ReportsPage() {
  const session = await getSession();
  if (!session || !['admin', 'staff'].includes(session.role)) redirect('/dashboard');

  const [invoices, payments, subscriptions, products] = await Promise.all([
    prisma.invoice.findMany({ include: { customer: true } }),
    prisma.payment.findMany(),
    prisma.subscription.findMany({ include: { customer: true, plan: true } }),
    prisma.product.findMany({ include: { subscriptionLines: true } }),
  ]);

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const outstanding = invoices
    .filter((i) => !['paid', 'cancelled'].includes(i.status))
    .reduce((sum, i) => sum + i.outstanding, 0);
  const activeSubscriptions = subscriptions.filter((s) => s.status === 'active').length;
  const monthlyRevenue = subscriptions
    .filter((s) => s.status === 'active' && s.billingFrequency === 'monthly')
    .reduce((sum, s) => sum + s.total, 0);

  const productRevenue = products.map((product) => ({
    name: product.name,
    revenue: product.subscriptionLines.reduce((sum, line) => sum + line.total, 0),
  })).sort((a, b) => b.revenue - a.revenue);

  const overdueInvoices = invoices.filter((i) => i.status === 'overdue');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">Financial and business analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Revenue Collected</p>
          <p className="text-3xl font-bold text-green-600">₹{totalRevenue.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Outstanding Revenue</p>
          <p className="text-3xl font-bold text-orange-600">₹{outstanding.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Active Subscriptions</p>
          <p className="text-3xl font-bold text-blue-600">{activeSubscriptions}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Monthly Recurring Revenue</p>
          <p className="text-3xl font-bold text-purple-600">₹{monthlyRevenue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Product-wise Revenue</h3>
          <div className="space-y-3">
            {productRevenue.slice(0, 10).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{item.name}</span>
                <span className="text-sm font-semibold text-gray-900">₹{item.revenue.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Overdue Invoices</h3>
          {overdueInvoices.length === 0 ? (
            <p className="text-gray-500">No overdue invoices</p>
          ) : (
            <div className="space-y-3">
              {overdueInvoices.map((invoice) => (
                <div key={invoice.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{invoice.number}</p>
                    <p className="text-xs text-gray-500">{invoice.customer.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-red-600">₹{invoice.outstanding.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['bank_transfer', 'upi', 'card', 'cash'].map((method) => {
            const methodPayments = payments.filter((p) => p.paymentMethod === method);
            const total = methodPayments.reduce((sum, p) => sum + p.amount, 0);
            return (
              <div key={method} className="border rounded-lg p-4">
                <p className="text-xs text-gray-600 capitalize mb-1">{method.replace('_', ' ')}</p>
                <p className="text-xl font-bold text-gray-900">₹{total.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-500">{methodPayments.length} transactions</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
