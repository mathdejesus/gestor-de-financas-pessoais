import { useState, useCallback } from 'preact/hooks';
import { reportApi } from '../services/api';
import type { ReportResponse } from '../types';

export function useReports() {
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = useCallback(async (startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await reportApi.generateFinancialReport({ startDate, endDate });
      setReport(data);
    } catch (err: any) {
      setError(err?.message || 'Falha ao gerar relatório');
    } finally {
      setLoading(false);
    }
  }, []);

  return { report, loading, error, generateReport };
}