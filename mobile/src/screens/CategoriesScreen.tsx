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
import { categoryApi } from "../services/api";
import type { Category, CreateCategoryRequest } from "../types";

export function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: "",
    icon: "",
    color: "#3B82F6",
  });

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const { data } = await categoryApi.getAll();
      setCategories(data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load categories");
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
    setEditCategory(null);
    setFormData({ name: "", icon: "", color: "#3B82F6" });
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditCategory(cat);
    setFormData({
      name: cat.name,
      icon: cat.icon || "",
      color: cat.color || "#3B82F6",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }
    try {
      if (editCategory) {
        await categoryApi.update(editCategory.id, formData);
      } else {
        await categoryApi.create(formData);
      }
      setShowModal(false);
      await fetchData();
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Operation failed");
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete", "Delete this category?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await categoryApi.delete(id);
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

  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6",
    "#F97316",
  ];

  const renderItem = ({ item, index }: { item: Category; index: number }) => (
    <TouchableOpacity
      style={styles.catItem}
      onPress={() => openEdit(item)}
      onLongPress={() => handleDelete(item.id)}
    >
      <View
        style={[
          styles.colorDot,
          { backgroundColor: item.color || COLORS[index % COLORS.length] },
        ]}
      />
      <Text style={styles.catName}>{item.name}</Text>
      {item.icon && <Text style={styles.catIcon}>{item.icon}</Text>}
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
        <Text style={styles.title}>Categories</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreate}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No categories yet</Text>
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
              {editCategory ? "Edit Category" : "New Category"}
            </Text>

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(t) => setFormData({ ...formData, name: t })}
              placeholder="e.g. Food, Transport"
            />

            <Text style={styles.label}>Icon</Text>
            <TextInput
              style={styles.input}
              value={formData.icon || ""}
              onChangeText={(t) => setFormData({ ...formData, icon: t })}
              placeholder="Optional icon"
            />

            <Text style={styles.label}>Color</Text>
            <View style={styles.colorRow}>
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    formData.color === color && styles.colorSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, color })}
                />
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
                  {editCategory ? "Update" : "Create"}
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
  catItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  catName: { flex: 1, fontSize: 15, fontWeight: "500", color: "#111827" },
  catIcon: { fontSize: 16, color: "#9CA3AF" },
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
  colorRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  colorOption: { width: 36, height: 36, borderRadius: 18 },
  colorSelected: { borderWidth: 3, borderColor: "#111827" },
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
