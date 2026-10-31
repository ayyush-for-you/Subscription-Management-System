import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

export default async function PaymentsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const where = session.role === 'customer' && session.customerId
    ? { customerId: session.customerId }
    : {};

  const payments = await prisma.payment.findMany({
    where,
    include: { customer: true, invoice: true },
    orderBy: { paymentDate: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">Track all payment transactions</p>
        </div>
        {['admin', 'staff'].includes(session.role) && (
          <Link href="/dashboard/payments/new" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Record Payment
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
              {session.role !== 'customer' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction Ref</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{payment.reference}</td>
                {session.role !== 'customer' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{payment.customer.name}</td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {payment.invoice ? (
                    <Link href={`/dashboard/invoices/${payment.invoice.id}`} className="text-blue-600 hover:underline">
                      {payment.invoice.number}
                    </Link>
                  ) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">₹{payment.amount.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{payment.paymentMethod.replace('_', ' ')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.transactionRef || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
