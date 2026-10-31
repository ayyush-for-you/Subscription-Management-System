import { Users, Package, Calendar, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

interface StatsProps {
  stats: {
    totalCustomers: number;
    totalProducts: number;
    activeSubscriptions: number;
    totalSubscriptions: number;
    mrr: number;
    totalRevenue: number;
    outstanding: number;
    overdueInvoices: number;
  };
}

export default function DashboardStats({ stats }: StatsProps) {
  const cards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-purple-500',
    },
    {
      title: 'Active Subscriptions',
      value: stats.activeSubscriptions,
      icon: Calendar,
      color: 'bg-green-500',
    },
    {
      title: 'Total Subscriptions',
      value: stats.totalSubscriptions,
      icon: Calendar,
      color: 'bg-indigo-500',
    },
    {
      title: 'Monthly Recurring Revenue',
      value: `₹${stats.mrr.toLocaleString('en-IN')}`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: 'bg-cyan-500',
    },
    {
      title: 'Outstanding Amount',
      value: `₹${stats.outstanding.toLocaleString('en-IN')}`,
      icon: AlertCircle,
      color: 'bg-orange-500',
    },
    {
      title: 'Overdue Invoices',
      value: stats.overdueInvoices,
      icon: AlertCircle,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
