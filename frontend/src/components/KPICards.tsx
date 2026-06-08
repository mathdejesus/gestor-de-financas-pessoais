import type { DashboardSummary } from '../types';

interface KPICardsProps {
  summary: DashboardSummary;
}

export function KPICards({ summary }: KPICardsProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const cards = [
    {
      label: 'Total Balance',
      value: formatCurrency(summary.totalBalance),
      color: summary.totalBalance >= 0 ? 'text-green-600' : 'text-red-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Total Income',
      value: formatCurrency(summary.totalIncome),
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(summary.totalExpenses),
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Savings Rate',
      value: `${summary.savingsRate}%`,
      color: summary.savingsRate >= 0 ? 'text-blue-600' : 'text-red-600',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <div key={card.label} className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <p className="text-sm font-medium text-gray-500">{card.label}</p>
          <p className={`mt-2 text-2xl font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200 sm:col-span-2 lg:col-span-2">
        <div className="flex gap-8">
          <div>
            <p className="text-sm font-medium text-gray-500">Transactions</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{summary.transactionCount}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Categories</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{summary.categoryCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
