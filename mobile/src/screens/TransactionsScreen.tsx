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
import { transactionApi, categoryApi } from "../services/api";
import type { Transaction, Category, CreateTransactionRequest } from "../types";

export function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(
    null,
  );
  const [formData, setFormData] = useState<CreateTransactionRequest>({
    description: "",
    amount: 0,
    transactionType: "EXPENSE",
    transactionDate: new Date().toISOString().split("T")[0],
    categoryId: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [txRes, catRes] = await Promise.all([
        transactionApi.getAll(),
        categoryApi.getAll(),
      ]);
      setTransactions(txRes.data);
      setCategories(catRes.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load transactions");
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

  const openCreate = () => {
    setEditTransaction(null);
    setFormData({
      description: "",
      amount: 0,
      transactionType: "EXPENSE",
      transactionDate: new Date().toISOString().split("T")[0],
      categoryId: null,
    });
    setShowModal(true);
  };

  const openEdit = (tx: Transaction) => {
    setEditTransaction(tx);
    setFormData({
      description: tx.description || "",
      amount: tx.amount,
      transactionType: tx.transactionType,
      transactionDate: tx.transactionDate,
      categoryId: tx.categoryId,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editTransaction) {
        await transactionApi.update(editTransaction.id, formData);
      } else {
        await transactionApi.create(formData);
      }
      setShowModal(false);
      await fetchData();
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Operation failed");
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete", "Delete this transaction?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await transactionApi.delete(id);
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

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const renderItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={styles.txItem}
      onPress={() => openEdit(item)}
      onLongPress={() => handleDelete(item.id)}
    >
      <View style={styles.txLeft}>
        <View
          style={[
            styles.txTypeDot,
            {
              backgroundColor:
                item.transactionType === "INCOME" ? "#10B981" : "#EF4444",
            },
          ]}
        />
        <View>
          <Text style={styles.txDesc}>
            {item.description || "No description"}
          </Text>
          <Text style={styles.txMeta}>
            {item.categoryName || "Uncategorized"} • {item.transactionDate}
          </Text>
        </View>
      </View>
      <Text
        style={[
          styles.txAmount,
          { color: item.transactionType === "INCOME" ? "#059669" : "#DC2626" },
        ]}
      >
        {item.transactionType === "INCOME" ? "+" : "-"}
        {formatCurrency(item.amount)}
      </Text>
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
        <Text style={styles.title}>Transactions</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreate}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No transactions yet</Text>
        }
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
              {editTransaction ? "Edit Transaction" : "New Transaction"}
            </Text>

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              value={formData.description}
              onChangeText={(t) => setFormData({ ...formData, description: t })}
              placeholder="Description"
            />

            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              value={formData.amount ? formData.amount.toString() : ""}
              onChangeText={(t) =>
                setFormData({ ...formData, amount: parseFloat(t) || 0 })
              }
              placeholder="0.00"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Type</Text>
            <View style={styles.typeRow}>
              {(["EXPENSE", "INCOME"] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    formData.transactionType === type &&
                      styles.typeButtonActive,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, transactionType: type })
                  }
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.transactionType === type &&
                        styles.typeButtonTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryRow}>
              <TouchableOpacity
                style={[
                  styles.catButton,
                  formData.categoryId === null && styles.catButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, categoryId: null })}
              >
                <Text
                  style={[
                    styles.catButtonText,
                    formData.categoryId === null && styles.catButtonTextActive,
                  ]}
                >
                  None
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.catButton,
                    formData.categoryId === cat.id && styles.catButtonActive,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, categoryId: cat.id })
                  }
                >
                  <Text
                    style={[
                      styles.catButtonText,
                      formData.categoryId === cat.id &&
                        styles.catButtonTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>
                  {editTransaction ? "Update" : "Create"}
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
  txItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  txLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  txTypeDot: { width: 8, height: 8, borderRadius: 4 },
  txDesc: { fontSize: 15, fontWeight: "500", color: "#111827" },
  txMeta: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: "600" },
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
    maxHeight: "80%",
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
  typeRow: { flexDirection: "row", gap: 10 },
  typeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  typeButtonActive: { backgroundColor: "#EFF6FF", borderColor: "#2563EB" },
  typeButtonText: { color: "#6B7280", fontWeight: "500" },
  typeButtonTextActive: { color: "#2563EB" },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  catButtonActive: { backgroundColor: "#EFF6FF", borderColor: "#2563EB" },
  catButtonText: { fontSize: 13, color: "#6B7280" },
  catButtonTextActive: { color: "#2563EB" },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 20 },
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
