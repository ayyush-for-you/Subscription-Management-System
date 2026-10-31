import { format } from 'date-fns';

interface RecentActivityProps {
  subscriptions: any[];
  payments: any[];
  overdueInvoices: any[];
}

export default function RecentActivity({ subscriptions, payments, overdueInvoices }: RecentActivityProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Subscriptions</h3>
        <div className="space-y-3">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-sm">{sub.customer.name}</p>
                <p className="text-xs text-gray-500">{sub.plan.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">₹{sub.total.toLocaleString('en-IN')}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  sub.status === 'active' ? 'bg-green-100 text-green-800' :
                  sub.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {sub.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Payments</h3>
        <div className="space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-sm">{payment.customer.name}</p>
                <p className="text-xs text-gray-500">{format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600">₹{payment.amount.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-500">{payment.paymentMethod.replace('_', ' ')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Overdue Invoices</h3>
        <div className="space-y-3">
          {overdueInvoices.length === 0 ? (
            <p className="text-sm text-gray-500">No overdue invoices</p>
          ) : (
            overdueInvoices.map((invoice) => (
              <div key={invoice.id} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-sm">{invoice.customer.name}</p>
                  <p className="text-xs text-gray-500">{invoice.number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-600">₹{invoice.outstanding.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-500">Due: {format(new Date(invoice.dueDate), 'MMM dd')}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
