import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import PrintButton from '@/components/PrintButton';

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id: parseInt(id) },
    include: {
      customer: true,
      subscription: { include: { plan: true } },
      lines: true,
      payments: {
        orderBy: { paymentDate: 'desc' },
      },
    },
  });

  if (!invoice) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/invoices" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{invoice.number}</h1>
            <p className="text-gray-600 mt-1">Invoice Details</p>
          </div>
        </div>
        <PrintButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Status</p>
          <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
            invoice.status === 'partially_paid' ? 'bg-yellow-100 text-yellow-800' :
            invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
            invoice.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {invoice.status.replace('_', ' ')}
          </span>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-gray-900">₹{invoice.total.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
          <p className="text-2xl font-bold text-green-600">₹{invoice.amountPaid.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Outstanding</p>
          <p className="text-2xl font-bold text-orange-600">₹{invoice.outstanding.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-8 print:shadow-none">
        <div className="border-b pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
              <p className="text-gray-600 mt-1">Brightloop Software</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-lg">{invoice.number}</p>
              <p className="text-sm text-gray-600">Date: {format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}</p>
              <p className="text-sm text-gray-600">Due: {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
            <p className="font-medium">{invoice.customer.name}</p>
            <p className="text-sm text-gray-600">{invoice.customer.company}</p>
            <p className="text-sm text-gray-600">{invoice.customer.email}</p>
            <p className="text-sm text-gray-600">{invoice.customer.phone}</p>
            {invoice.customer.address && (
              <p className="text-sm text-gray-600 mt-2">
                {[invoice.customer.address, invoice.customer.city, invoice.customer.state, invoice.customer.country]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
          </div>
          <div>
            {invoice.subscription && (
              <>
                <h3 className="font-semibold text-gray-900 mb-2">Subscription:</h3>
                <Link href={`/dashboard/subscriptions/${invoice.subscription.id}`} className="text-blue-600 hover:underline">
                  {invoice.subscription.number}
                </Link>
                <p className="text-sm text-gray-600">{invoice.subscription.plan.name}</p>
              </>
            )}
            {invoice.billingPeriodStart && invoice.billingPeriodEnd && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Billing Period:</h3>
                <p className="text-sm text-gray-600">
                  {format(new Date(invoice.billingPeriodStart), 'MMM dd, yyyy')} - {format(new Date(invoice.billingPeriodEnd), 'MMM dd, yyyy')}
                </p>
              </div>
            )}
          </div>
        </div>

        <table className="min-w-full mb-8">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tax</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoice.lines.map((line) => (
              <tr key={line.id}>
                <td className="px-4 py-3 text-sm">{line.description}</td>
                <td className="px-4 py-3 text-sm text-center">{line.quantity}</td>
                <td className="px-4 py-3 text-sm text-right">₹{line.unitPrice.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-sm text-right">{line.taxRate}%</td>
                <td className="px-4 py-3 text-sm font-semibold text-right">₹{line.total.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Tax:</span>
              <span className="font-semibold">₹{invoice.taxAmount.toLocaleString('en-IN')}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Discount:</span>
                <span className="font-semibold text-red-600">-₹{invoice.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between py-3 border-t-2 border-gray-300">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-lg font-bold text-blue-600">₹{invoice.total.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-2 bg-green-50 px-3 rounded">
              <span className="text-gray-700">Paid:</span>
              <span className="font-semibold text-green-600">₹{invoice.amountPaid.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-2 bg-orange-50 px-3 rounded mt-1">
              <span className="text-gray-700">Outstanding:</span>
              <span className="font-semibold text-orange-600">₹{invoice.outstanding.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {invoice.payments.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Payment History</h2>
          <div className="space-y-2">
            {invoice.payments.map((payment) => (
              <div key={payment.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{payment.reference}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(payment.paymentDate), 'MMM dd, yyyy')} - {payment.paymentMethod.replace('_', ' ')}
                  </p>
                  {payment.transactionRef && (
                    <p className="text-xs text-gray-500">Ref: {payment.transactionRef}</p>
                  )}
                </div>
                <p className="font-semibold text-green-600">₹{payment.amount.toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
