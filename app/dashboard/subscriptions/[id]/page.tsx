import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';

export default async function SubscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const subscription = await prisma.subscription.findUnique({
    where: { id: parseInt(id) },
    include: {
      customer: true,
      plan: true,
      lines: {
        include: { product: true },
      },
      invoices: {
        orderBy: { invoiceDate: 'desc' },
      },
    },
  });

  if (!subscription) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/subscriptions" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{subscription.number}</h1>
          <p className="text-gray-600 mt-1">Subscription Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Status</p>
          <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
            subscription.status === 'active' ? 'bg-green-100 text-green-800' :
            subscription.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
            subscription.status === 'closed' ? 'bg-gray-100 text-gray-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {subscription.status}
          </span>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-gray-900">₹{subscription.total.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Billing Frequency</p>
          <p className="text-xl font-semibold capitalize">{subscription.billingFrequency}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Next Billing</p>
          <p className="text-lg font-semibold">
            {subscription.nextBillingDate ? format(new Date(subscription.nextBillingDate), 'MMM dd, yyyy') : 'N/A'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Subscription Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <Link href={`/dashboard/customers/${subscription.customer.id}`} className="font-medium text-blue-600 hover:underline">
                {subscription.customer.name}
              </Link>
            </div>
            <div>
              <p className="text-sm text-gray-600">Plan</p>
              <p className="font-medium">{subscription.plan.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Start Date</p>
              <p className="font-medium">{format(new Date(subscription.startDate), 'MMM dd, yyyy')}</p>
            </div>
            {subscription.expiryDate && (
              <div>
                <p className="text-sm text-gray-600">Expiry Date</p>
                <p className="font-medium">{format(new Date(subscription.expiryDate), 'MMM dd, yyyy')}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Payment Terms</p>
              <p className="font-medium">{subscription.paymentTerms || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Plan Permissions</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Allow Pause</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                subscription.plan.allowPause ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {subscription.plan.allowPause ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Allow Renewal</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                subscription.plan.allowRenewal ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {subscription.plan.allowRenewal ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Allow Early Closure</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                subscription.plan.allowEarlyClosure ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {subscription.plan.allowEarlyClosure ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Auto Close</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                subscription.plan.autoClose ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {subscription.plan.autoClose ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Products & Services</h2>
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tax Rate</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subscription.lines.map((line) => (
              <tr key={line.id}>
                <td className="px-4 py-3 text-sm font-medium">{line.product.name}</td>
                <td className="px-4 py-3 text-sm">{line.quantity}</td>
                <td className="px-4 py-3 text-sm">₹{line.unitPrice.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-sm">{line.taxRate}%</td>
                <td className="px-4 py-3 text-sm">₹{line.discount.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-sm font-semibold">₹{line.total.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={5} className="px-4 py-3 text-right text-sm font-medium">Subtotal:</td>
              <td className="px-4 py-3 text-sm font-semibold">₹{subscription.subtotal.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td colSpan={5} className="px-4 py-3 text-right text-sm font-medium">Tax:</td>
              <td className="px-4 py-3 text-sm font-semibold">₹{subscription.taxAmount.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td colSpan={5} className="px-4 py-3 text-right text-sm font-medium">Discount:</td>
              <td className="px-4 py-3 text-sm font-semibold">₹{subscription.discount.toLocaleString('en-IN')}</td>
            </tr>
            <tr className="bg-blue-50">
              <td colSpan={5} className="px-4 py-3 text-right text-base font-bold">Total:</td>
              <td className="px-4 py-3 text-base font-bold text-blue-600">₹{subscription.total.toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Generated Invoices</h2>
        {subscription.invoices.length === 0 ? (
          <p className="text-gray-500">No invoices generated yet</p>
        ) : (
          <div className="space-y-2">
            {subscription.invoices.map((invoice) => (
              <div key={invoice.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <Link href={`/dashboard/invoices/${invoice.id}`} className="text-blue-600 hover:underline font-medium">
                    {invoice.number}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')} - Due: {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{invoice.total.toLocaleString('en-IN')}</p>
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
        )}
      </div>
    </div>
  );
}
