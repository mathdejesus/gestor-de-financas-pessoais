import { useState, useMemo } from 'preact/hooks';
import { useReports } from '../hooks/useReports';
import { format } from 'date-fns';
import type { CategoryReportItem, MonthlyReportItem } from '../types';

export function ReportsPage() {
  const { report, loading, error, generateReport } = useReports();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Default to last 3 months
  const defaultStartDate = useMemo(
    () => format(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    []
  );
  const defaultEndDate = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const handleGenerateReport = () => {
    generateReport(startDate || defaultStartDate, endDate || defaultEndDate);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const getTypeLabel = (type: string) => (type === 'INCOME' ? 'Receita' : 'Despesa');

  const getTypeBadgeClass = (type: string) =>
    type === 'INCOME' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Gerando relatório...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios Financeiros</h1>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Inicial</label>
            <input
              type="date"
              value={startDate}
              onInput={e => setStartDate((e.target as HTMLInputElement).value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Final</label>
            <input
              type="date"
              value={endDate}
              onInput={e => setEndDate((e.target as HTMLInputElement).value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {report && (
        <div className="space-y-6">
          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Receitas</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(report.totalIncome)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Despesas</div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(report.totalExpense)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Saldo</div>
              <div
                className={`text-2xl font-bold ${report.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {formatCurrency(report.balance)}
              </div>
            </div>
          </div>

          {/* Por Categoria */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Resumo por Categoria</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Categoria</th>
                    <th className="text-left py-2 px-4">Tipo</th>
                    <th className="text-right py-2 px-4">Valor</th>
                    <th className="text-right py-2 px-4">Qtd</th>
                  </tr>
                </thead>
                <tbody>
                  {report.byCategory.map((item: CategoryReportItem, index: number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{item.categoryName}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded text-sm ${getTypeBadgeClass(item.type)}`}
                        >
                          {getTypeLabel(item.type)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">{formatCurrency(item.amount)}</td>
                      <td className="py-3 px-4 text-right">{item.transactionCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Por Mês */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Evolução Mensal</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Mês</th>
                    <th className="text-right py-2 px-4">Receitas</th>
                    <th className="text-right py-2 px-4">Despesas</th>
                    <th className="text-right py-2 px-4">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {report.byMonth.map((item: MonthlyReportItem, index: number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{item.month}</td>
                      <td className="py-3 px-4 text-right text-green-600">
                        {formatCurrency(item.income)}
                      </td>
                      <td className="py-3 px-4 text-right text-red-600">
                        {formatCurrency(item.expense)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-semibold ${item.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {formatCurrency(item.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!report && !loading && !error && (
        <div className="text-center py-12 text-gray-500">
          Configure os filtros acima e clique em "Gerar Relatório" para ver os dados.
        </div>
      )}
    </div>
  );
}
