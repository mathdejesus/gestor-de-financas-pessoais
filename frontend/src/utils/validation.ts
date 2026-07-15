export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password: string): {
  valid: boolean;
  message: string;
} {
  if (password.length < 6) {
    return { valid: false, message: 'Senha deve ter pelo menos 6 caracteres' };
  }
  return { valid: true, message: '' };
}

export function validateAmount(amount: string | number): {
  valid: boolean;
  message: string;
} {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num) || num <= 0) {
    return { valid: false, message: 'Valor deve ser maior que zero' };
  }
  return { valid: true, message: '' };
}

export function validateRequired(
  value: string,
  fieldName: string
): { valid: boolean; message: string } {
  if (!value || !value.trim()) {
    return { valid: false, message: `${fieldName} é obrigatório` };
  }
  return { valid: true, message: '' };
}

export function validateDate(dateString: string): {
  valid: boolean;
  message: string;
} {
  const date = new Date(dateString + 'T00:00:00');
  if (isNaN(date.getTime())) {
    return { valid: false, message: 'Data inválida' };
  }
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (date > today) {
    return { valid: false, message: 'Data não pode ser no futuro' };
  }
  return { valid: true, message: '' };
}
