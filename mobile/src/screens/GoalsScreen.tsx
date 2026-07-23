import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { goalApi } from "../services/api";
import {
  scheduleGoalReminder,
  sendGoalCompletedNotification,
} from "../utils/notifications";
import type { FinancialGoal, CreateGoalRequest } from "../types";

export function GoalsScreen() {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState<FinancialGoal | null>(null);
  const [formData, setFormData] = useState<CreateGoalRequest>({
    description: "",
    targetValue: 0,
  });
  const [currentValue, setCurrentValue] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const { data } = await goalApi.getAll();
      setGoals(data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load goals");
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

  React.useEffect(() => {
    goals.forEach((goal) => {
      if (goal.status === "ACTIVE" && goal.deadline) {
        const deadline = new Date(goal.deadline);
        const today = new Date();
        const daysRemaining = Math.ceil(
          (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysRemaining <= 7 && daysRemaining > 0) {
          scheduleGoalReminder(goal.description, daysRemaining);
        }
      }
    });
  }, [goals]);

  const openCreate = () => {
    setEditGoal(null);
    setFormData({ description: "", targetValue: 0 });
    setShowModal(true);
  };

  const openEdit = (goal: FinancialGoal) => {
    setEditGoal(goal);
    setFormData({
      description: goal.description,
      targetValue: goal.targetValue,
    });
    setCurrentValue(goal.currentValue);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.description.trim() || formData.targetValue <= 0) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    try {
      if (editGoal) {
        await goalApi.update(editGoal.id, { ...formData, currentValue });
      } else {
        await goalApi.create(formData);
      }
      setShowModal(false);
      await fetchData();
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Operation failed");
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete", "Delete this goal?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await goalApi.delete(id);
            await fetchData();
          } catch (err: any) {
            Alert.alert(
              "Error",
              err.response?.data?.error || "Failed to delete",
            );
          }
        },
      },
    ]);
  };

  const handleStatusUpdate = async (
    id: number,
    status: "COMPLETED" | "ABANDONED",
  ) => {
    try {
      await goalApi.update(id, { status });
      if (status === "COMPLETED") {
        const goal = goals.find((g) => g.id === id);
        if (goal) {
          await sendGoalCompletedNotification(goal.description);
        }
      }
      await fetchData();
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.error || "Failed to update status",
      );
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const getProgressColor = (pct: number) => {
    if (pct >= 100) return "#10B981";
    if (pct >= 60) return "#3B82F6";
    if (pct >= 30) return "#F59E0B";
    return "#EF4444";
  };

  const renderItem = ({ item }: { item: FinancialGoal }) => (
    <TouchableOpacity
      style={styles.goalCard}
      onPress={() => openEdit(item)}
      onLongPress={() => handleDelete(item.id)}
    >
      <View style={styles.goalHeader}>
        <Text style={styles.goalDesc} numberOfLines={1}>
          {item.description}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === "COMPLETED"
                  ? "#D1FAE5"
                  : item.status === "ABANDONED"
                    ? "#FEE2E2"
                    : "#DBEAFE",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  item.status === "COMPLETED"
                    ? "#065F46"
                    : item.status === "ABANDONED"
                      ? "#991B1B"
                      : "#1E40AF",
              },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(item.progressPercentage, 100)}%`,
                backgroundColor: getProgressColor(item.progressPercentage),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{item.progressPercentage}%</Text>
      </View>

      <View style={styles.goalInfo}>
        <Text style={styles.goalInfoText}>
          Saved: {formatCurrency(item.currentValue)}
        </Text>
        <Text style={styles.goalInfoText}>
          Target: {formatCurrency(item.targetValue)}
        </Text>
      </View>

      {item.estimatedCompletion && (
        <Text style={styles.estimate}>{item.estimatedCompletion}</Text>
      )}

      {item.status === "ACTIVE" && (
        <View style={styles.goalActions}>
          <TouchableOpacity
            onPress={() => handleStatusUpdate(item.id, "COMPLETED")}
          >
            <Text style={styles.completeBtn}>Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleStatusUpdate(item.id, "ABANDONED")}
          >
            <Text style={styles.abandonBtn}>Abandon</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Financial Goals</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreate}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={<Text style={styles.emptyText}>No goals yet</Text>}
      />

      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editGoal ? "Edit Goal" : "New Goal"}
            </Text>

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              value={formData.description}
              onChangeText={(t) => setFormData({ ...formData, description: t })}
              placeholder="e.g. Emergency fund"
            />

            <Text style={styles.label}>Target Amount</Text>
            <TextInput
              style={styles.input}
              value={
                formData.targetValue ? formData.targetValue.toString() : ""
              }
              onChangeText={(t) =>
                setFormData({ ...formData, targetValue: parseFloat(t) || 0 })
              }
              placeholder="0.00"
              keyboardType="numeric"
            />

            {editGoal && (
              <>
                <Text style={styles.label}>Current Amount</Text>
                <TextInput
                  style={styles.input}
                  value={currentValue.toString()}
                  onChangeText={(t) => setCurrentValue(parseFloat(t) || 0)}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>
                  {editGoal ? "Update" : "Create"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#111827" },
  addButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: { color: "#FFFFFF", fontWeight: "600" },
  goalCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  goalDesc: { fontSize: 16, fontWeight: "600", color: "#111827", flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: "600" },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: 8, borderRadius: 4 },
  progressText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    minWidth: 40,
  },
  goalInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  goalInfoText: { fontSize: 13, color: "#6B7280" },
  estimate: { fontSize: 12, color: "#2563EB", marginTop: 4 },
  goalActions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#E5E7EB",
  },
  completeBtn: { color: "#059669", fontWeight: "500", fontSize: 13 },
  abandonBtn: { color: "#9CA3AF", fontWeight: "500", fontSize: 13 },
  emptyText: { textAlign: "center", color: "#9CA3AF", marginTop: 40 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 24 },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  cancelButtonText: { color: "#374151", fontWeight: "500" },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#2563EB",
    alignItems: "center",
  },
  saveButtonText: { color: "#FFFFFF", fontWeight: "600" },
});
