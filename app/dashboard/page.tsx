import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardStats from '@/components/DashboardStats';
import RevenueChart from '@/components/RevenueChart';
import RecentActivity from '@/components/RecentActivity';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // For customers, show their portal
  if (session.role === 'customer') {
    redirect('/dashboard/portal');
  }

  const [
    totalCustomers,
    totalProducts,
    subscriptions,
    invoices,
    recentPayments,
  ] = await Promise.all([
    prisma.customer.count({ where: { status: 'active' } }),
    prisma.product.count({ where: { status: 'active' } }),
    prisma.subscription.findMany({
      include: { customer: true, plan: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.invoice.findMany({
      include: { customer: true },
      orderBy: { invoiceDate: 'desc' },
    }),
    prisma.payment.findMany({
      include: { customer: true, invoice: true },
      orderBy: { paymentDate: 'desc' },
      take: 5,
    }),
  ]);

  const activeSubscriptions = subscriptions.filter((s) => s.status === 'active').length;
  const totalSubscriptions = subscriptions.length;

  const mrr = subscriptions
    .filter((s) => s.status === 'active' && s.billingFrequency === 'monthly')
    .reduce((sum, s) => sum + s.total, 0);

  const totalRevenue = invoices
    .filter((i) => ['paid', 'partially_paid'].includes(i.status))
    .reduce((sum, i) => sum + i.amountPaid, 0);

  const outstanding = invoices
    .filter((i) => !['paid', 'cancelled'].includes(i.status))
    .reduce((sum, i) => sum + i.outstanding, 0);

  const overdueInvoices = invoices.filter((i) => 
    i.status === 'overdue'
  ).length;

  // Calculate monthly revenue for chart
  const monthlyRevenue = await prisma.$queryRaw<Array<{ month: string; revenue: number }>>`
    SELECT 
      strftime('%Y-%m', paymentDate) as month,
      SUM(amount) as revenue
    FROM Payment
    WHERE paymentDate >= date('now', '-6 months')
    GROUP BY month
    ORDER BY month
  `;

  const stats = {
    totalCustomers,
    totalProducts,
    activeSubscriptions,
    totalSubscriptions,
    mrr,
    totalRevenue,
    outstanding,
    overdueInvoices,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your subscription business</p>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={monthlyRevenue} />
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Subscription Status</h3>
          <div className="space-y-3">
            {['active', 'paused', 'closed'].map((status) => {
              const count = subscriptions.filter((s) => s.status === status).length;
              const percentage = totalSubscriptions > 0 ? (count / totalSubscriptions) * 100 : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium capitalize">{status}</span>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        status === 'active' ? 'bg-green-500' :
                        status === 'paused' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <RecentActivity
        subscriptions={subscriptions.slice(0, 5)}
        payments={recentPayments}
        overdueInvoices={invoices.filter((i) => i.status === 'overdue').slice(0, 5)}
      />
    </div>
  );
}
