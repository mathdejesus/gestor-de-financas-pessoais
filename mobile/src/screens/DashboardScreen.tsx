import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { dashboardApi } from "../services/api";
import type {
  DashboardSummary,
  MonthlySummary,
  CategorySummary,
} from "../types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function DashboardScreen() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [monthly, setMonthly] = useState<MonthlySummary[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [summaryRes, monthlyRes, categoryRes] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getMonthlySummary(6),
        dashboardApi.getCategorySummary(),
      ]);
      setSummary(summaryRes.data);
      setMonthly(monthlyRes.data);
      setCategories(categoryRes.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
  ];

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={fetchData}>
          Tap to retry
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Dashboard</Text>

      {summary && (
        <View style={styles.kpiGrid}>
          <View style={[styles.kpiCard, { backgroundColor: "#ECFDF5" }]}>
            <Text style={styles.kpiLabel}>Balance</Text>
            <Text
              style={[
                styles.kpiValue,
                { color: summary.totalBalance >= 0 ? "#059669" : "#DC2626" },
              ]}
            >
              {formatCurrency(summary.totalBalance)}
            </Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: "#ECFDF5" }]}>
            <Text style={styles.kpiLabel}>Income</Text>
            <Text style={[styles.kpiValue, { color: "#059669" }]}>
              {formatCurrency(summary.totalIncome)}
            </Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: "#FEF2F2" }]}>
            <Text style={styles.kpiLabel}>Expenses</Text>
            <Text style={[styles.kpiValue, { color: "#DC2626" }]}>
              {formatCurrency(summary.totalExpenses)}
            </Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: "#EFF6FF" }]}>
            <Text style={styles.kpiLabel}>Savings</Text>
            <Text style={[styles.kpiValue, { color: "#2563EB" }]}>
              {summary.savingsRate}%
            </Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Overview</Text>
        {monthly.map((m, i) => {
          const maxValue =
            Math.max(...monthly.map((x) => Math.max(x.income, x.expenses))) ||
            1;
          const incomeWidth = Math.min((m.income / maxValue) * 100, 100);
          const expenseWidth = Math.min((m.expenses / maxValue) * 100, 100);

          return (
            <View key={i} style={styles.barRow}>
              <Text style={styles.barLabel}>{m.month}</Text>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    { width: `${incomeWidth}%`, backgroundColor: "#10B981" },
                  ]}
                />
              </View>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    { width: `${expenseWidth}%`, backgroundColor: "#EF4444" },
                  ]}
                />
              </View>
              <View style={styles.barValues}>
                <Text style={[styles.barValue, { color: "#10B981" }]}>
                  +{formatCurrency(m.income)}
                </Text>
                <Text style={[styles.barValue, { color: "#EF4444" }]}>
                  -{formatCurrency(m.expenses)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expenses by Category</Text>
        {categories.length === 0 ? (
          <Text style={styles.emptyText}>No data available</Text>
        ) : (
          categories.map((cat, i) => (
            <View key={i} style={styles.categoryRow}>
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: cat.color || COLORS[i % COLORS.length] },
                ]}
              />
              <Text style={styles.categoryName}>{cat.categoryName}</Text>
              <Text style={styles.categoryValue}>
                {formatCurrency(cat.total)}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  errorText: {
    fontSize: 16,
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 8,
  },
  retryText: {
    fontSize: 14,
    color: "#2563EB",
    textDecorationLine: "underline",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  kpiCard: { width: (SCREEN_WIDTH - 42) / 2, padding: 16, borderRadius: 12 },
  kpiLabel: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
  kpiValue: { fontSize: 20, fontWeight: "bold", marginTop: 4 },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  barRow: { marginBottom: 12 },
  barLabel: { fontSize: 12, color: "#6B7280", marginBottom: 4 },
  barContainer: {
    flexDirection: "row",
    gap: 4,
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  bar: { height: 8, borderRadius: 4 },
  barValues: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  barValue: { fontSize: 11 },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
  },
  categoryDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  categoryName: { flex: 1, fontSize: 14, color: "#374151" },
  categoryValue: { fontSize: 14, fontWeight: "600", color: "#111827" },
  emptyText: { textAlign: "center", color: "#9CA3AF", paddingVertical: 20 },
});
