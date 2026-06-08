import { useState, useEffect, useCallback } from 'react';
import { dashboardApi, reportApi } from '../services/api';
import { PeriodFilter, getPeriodDates } from '../components/PeriodFilter';
import { KPICards } from '../components/KPICards';
import { MonthlyChart, CategoryChart } from '../components/Charts';
import type { DashboardSummary, MonthlySummary, CategorySummary, PeriodType } from '../types';

export function DashboardPage() {
  const [period, setPeriod] = useState<PeriodType>('month');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [monthly, setMonthly] = useState<MonthlySummary[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (periodType: PeriodType) => {
    setIsLoading(true);
    setError(null);
    try {
      const { startDate, endDate } = getPeriodDates(periodType);
      const params = startDate && endDate ? { startDate, endDate } : undefined;

      const [summaryRes, monthlyRes, categoryRes] = await Promise.all([
        dashboardApi.getSummary(params),
        dashboardApi.getMonthlySummary(
          periodType === 'month' ? 6 : periodType === 'quarter' ? 12 : 24
        ),
        dashboardApi.getCategorySummary(params),
      ]);

      setSummary(summaryRes.data);
      setMonthly(monthlyRes.data);
      setCategories(categoryRes.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(period);
  }, [period, fetchData]);

  const handleExportCsv = async () => {
    try {
      const { startDate, endDate } = getPeriodDates(period);
      const params = startDate && endDate ? { startDate, endDate } : undefined;
      const response = await dashboardApi.exportCsv(params);

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'transactions.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export CSV');
    }
  };

  const handleExportPdf = async () => {
    try {
      const { startDate, endDate } = getPeriodDates(period);
      const params = startDate && endDate ? { startDate, endDate } : undefined;
      const response = await reportApi.generatePdf(params);

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'financial-report.pdf';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to generate PDF report');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-4">
          <PeriodFilter selected={period} onSelect={setPeriod} />
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Export CSV
          </button>
          <button
            onClick={handleExportPdf}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Export PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {summary && <KPICards summary={summary} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyChart data={monthly} />
        <CategoryChart data={categories} />
      </div>
    </div>
  );
}
