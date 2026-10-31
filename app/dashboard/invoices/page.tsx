import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

export default async function InvoicesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const where = session.role === 'customer' && session.customerId
    ? { customerId: session.customerId }
    : {};

  const invoices = await prisma.invoice.findMany({
    where,
    include: { customer: true, subscription: true },
    orderBy: { invoiceDate: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">Manage and track invoices</p>
        </div>
        {['admin', 'staff'].includes(session.role) && (
          <Link href="/dashboard/invoices/new" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
              {session.role !== 'customer' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outstanding</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/dashboard/invoices/${invoice.id}`} className="text-blue-600 hover:underline font-medium">
                    {invoice.number}
                  </Link>
                </td>
                {session.role !== 'customer' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{invoice.customer.name}</td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{invoice.total.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">₹{invoice.amountPaid.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">₹{invoice.outstanding.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'partially_paid' ? 'bg-yellow-100 text-yellow-800' :
                    invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    invoice.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {invoice.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
