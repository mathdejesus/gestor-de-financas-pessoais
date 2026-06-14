import { h } from "preact";
import { useState } from "preact/hooks";
import { useCategories } from "../hooks/useCategories";
import type { CategoryResponse, CategoryRequest } from "../types";

export default function CategoryManager() {
  const {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryResponse | null>(null);
  const [formData, setFormData] = useState<CategoryRequest>({
    name: "",
    color: "#268bd2",
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({ name: "", color: "#268bd2" });
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({ name: "", color: "#268bd2" });
    setShowForm(true);
  };

  const handleEdit = (category: CategoryResponse) => {
    setEditingCategory(category);
    setFormData({ name: category.name, color: category.color || "#268bd2" });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
    setDeletingId(id);
    try {
      await deleteCategory(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await createCategory(formData);
      }
      resetForm();
    } catch (err) {
      console.error("Erro ao salvar categoria:", err);
      alert("Erro ao salvar categoria");
    }
  };

  const colorOptions = [
    "#268bd2",
    "#2aa198",
    "#859900",
    "#b58900",
    "#cb4b16",
    "#dc322f",
    "#d33682",
    "#6c71c4",
  ];

  if (loading && categories.length === 0) {
    return <div class="loading">Carregando categorias...</div>;
  }

  return (
    <div class="category-manager">
      <div class="list-header">
        <h2>Categorias</h2>
        <button class="btn btn-primary" onClick={handleCreate}>
          ➕ Nova Categoria
        </button>
      </div>

      {error && <div class="error-message">{error}</div>}

      {categories.length === 0 ? (
        <div class="empty-state">
          <p>📂 Nenhuma categoria criada</p>
          <button class="btn btn-primary" onClick={handleCreate}>
            Criar primeira categoria
          </button>
        </div>
      ) : (
        <div class="categories-grid">
          {categories.map((category) => (
            <div key={category.id} class="category-card">
              <div
                class="category-color"
                style={{ backgroundColor: category.color || "#268bd2" }}
              />
              <div class="category-info">
                <h3>{category.name}</h3>
                <p class="category-stats">
                  {category.transactionCount || 0} transações ·{" "}
                  {category.totalAmount || 0} total
                </p>
              </div>
              <div class="category-actions">
                <button
                  class="btn btn-sm btn-secondary"
                  onClick={() => handleEdit(category)}
                  disabled={deletingId === category.id}
                >
                  ✏️
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  onClick={() => handleDelete(category.id)}
                  disabled={deletingId === category.id}
                >
                  {deletingId === category.id ? "⏳" : "🗑️"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} class="category-form card modal-overlay">
          <div class="modal-content">
            <h2>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</h2>

            <div class="form-group">
              <label htmlFor="name">Nome *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => {
                  const target = e.target as HTMLInputElement;
                  setFormData((prev) => ({ ...prev, name: target.value }));
                }}
                placeholder="Ex: Alimentação, Transporte, Salário..."
                required
                autoFocus
              />
            </div>

            <div class="form-group">
              <label>Cor</label>
              <div class="color-picker">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    class={`color-option ${formData.color === color ? "selected" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData((prev) => ({ ...prev, color }))}
                    aria-label={color}
                  />
                ))}
              </div>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => {
                  const target = e.target as HTMLInputElement;
                  setFormData((prev) => ({ ...prev, color: target.value }));
                }}
                class="color-input"
              />
            </div>

            <div class="form-actions">
              <button
                type="button"
                class="btn btn-secondary"
                onClick={resetForm}
              >
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                {editingCategory ? "Atualizar" : "Criar"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
