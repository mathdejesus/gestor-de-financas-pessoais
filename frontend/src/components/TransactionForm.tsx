import { useState, useEffect } from "preact/hooks";
import { useCategories } from "../hooks/useCategories";
import type { TransactionRequest } from "../types";

interface TransactionFormProps {
  initialData?: Partial<TransactionRequest>;
  onSubmit: (data: TransactionRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function TransactionForm({
  initialData,
  onSubmit,
  onCancel,
  loading,
}: TransactionFormProps) {
  const {
    categories,
    loading: categoriesLoading,
    fetchCategories,
  } = useCategories();
  const [formData, setFormData] = useState<TransactionRequest>({
    description: "",
    amount: 0,
    transactionType: "EXPENSE",
    transactionDate: new Date().toISOString().split("T")[0],
    categoryId: "",
    ...initialData,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof TransactionRequest, string>>
  >({});

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleChange = (field: keyof TransactionRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleInput = (field: keyof TransactionRequest) => (e: Event) => {
    const target = e.target as HTMLInputElement;
    handleChange(field, target.value);
  };

  const handleNumberInput = (field: keyof TransactionRequest) => (e: Event) => {
    const target = e.target as HTMLInputElement;
    handleChange(field, parseFloat(target.value) || 0);
  };

  const handleSelectChange =
    (field: keyof TransactionRequest) => (e: Event) => {
      const target = e.target as HTMLSelectElement;
      handleChange(field, target.value);
    };

  const validate = () => {
    const newErrors: Partial<Record<keyof TransactionRequest, string>> = {};
    if (!formData.description.trim())
      newErrors.description = "Descrição é obrigatória";
    if (!formData.amount || formData.amount <= 0)
      newErrors.amount = "Valor deve ser maior que zero";
    if (!formData.transactionDate)
      newErrors.transactionDate = "Data é obrigatória";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const typeOptions = [
    { value: "EXPENSE", label: "💸 Despesa" },
    { value: "INCOME", label: "💰 Receita" },
  ];

  if (categoriesLoading) {
    return <div class="loading">Carregando categorias...</div>;
  }

  return (
    <form onSubmit={handleSubmit} class="transaction-form card">
      <h2>{initialData?.id ? "Editar Transação" : "Nova Transação"}</h2>

      <div class="form-group">
        <label htmlFor="description">Descrição *</label>
        <input
          type="text"
          id="description"
          value={formData.description}
          onInput={handleInput("description")}
          placeholder="Ex: Almoço, Salário, Conta de luz..."
          required
        />
        {errors.description && <span class="error">{errors.description}</span>}
      </div>

      <div class="form-row">
        <div class="form-group">
          <label htmlFor="amount">Valor *</label>
          <input
            type="number"
            id="amount"
            step="0.01"
            min="0.01"
            value={formData.amount}
            onInput={handleNumberInput("amount")}
            placeholder="0,00"
            required
          />
          {errors.amount && <span class="error">{errors.amount}</span>}
        </div>

        <div class="form-group">
          <label htmlFor="transactionDate">Data *</label>
          <input
            type="date"
            id="transactionDate"
            value={formData.transactionDate}
            onInput={handleInput("transactionDate")}
            required
          />
          {errors.transactionDate && (
            <span class="error">{errors.transactionDate}</span>
          )}
        </div>
      </div>

      <div class="form-group">
        <label>Tipo *</label>
        <div class="radio-group">
          {typeOptions.map((opt) => (
            <label key={opt.value} class="radio-label">
              <input
                type="radio"
                name="transactionType"
                value={opt.value}
                checked={formData.transactionType === opt.value}
                onChange={() =>
                  handleChange(
                    "transactionType",
                    opt.value as "INCOME" | "EXPENSE",
                  )
                }
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div class="form-group">
        <label htmlFor="categoryId">Categoria</label>
        <select
          id="categoryId"
          value={formData.categoryId}
          onChange={handleSelectChange("categoryId")}
        >
          <option value="">Selecione uma categoria (opcional)</option>
          {categories.map((cat) => (
            <option
              key={cat.id}
              value={cat.id}
              style={{ borderLeft: `4px solid ${cat.color || "#000"}` }}
            >
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary" disabled={loading}>
          {loading ? "Salvando..." : initialData?.id ? "Atualizar" : "Criar"}
        </button>
      </div>
    </form>
  );
}
