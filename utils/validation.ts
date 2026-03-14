export const validateAccount = (name: string, balance: number) => {
  const errors: { name?: string; balance?: string } = {};

  if (!name?.trim()) {
    errors.name = "Nome é obrigatório";
  } else if (name.trim().length < 3) {
    errors.name = "Nome deve ter pelo menos 3 caracteres";
  }

  if (isNaN(balance)) {
    errors.balance = "Saldo inválido";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateTransaction = (
  amount: number,
  category: string,
  accountId: string,
  type: string,
  toAccountId?: string,
) => {
  const errors: any = {};

  if (isNaN(amount) || amount <= 0) {
    errors.amount = "Valor deve ser maior que zero";
  }

  if (!category && type !== "transfer") {
    errors.category = "Categoria é obrigatória";
  }

  if (!accountId) {
    errors.accountId = "Conta é obrigatória";
  }

  if (type === "transfer") {
    if (!toAccountId) {
      errors.toAccountId = "Conta destino é obrigatória";
    } else if (toAccountId === accountId) {
      errors.toAccountId = "Conta destino deve ser diferente da origem";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validatePiggyBank = (name: string, targetAmount: number) => {
  const errors: { name?: string; targetAmount?: string } = {};

  if (!name?.trim()) {
    errors.name = "Nome é obrigatório";
  }

  if (isNaN(targetAmount) || targetAmount <= 0) {
    errors.targetAmount = "Meta deve ser maior que zero";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateCreditCard = (
  name: string,
  limit: number,
  closingDay: number,
  dueDay: number,
) => {
  const errors: {
    name?: string;
    limit?: string;
    closingDay?: string;
    dueDay?: string;
  } = {};

  if (!name?.trim()) {
    errors.name = "Nome é obrigatório";
  }

  if (isNaN(limit) || limit <= 0) {
    errors.limit = "Limite deve ser maior que zero";
  }

  if (isNaN(closingDay) || closingDay < 1 || closingDay > 31) {
    errors.closingDay = "Dia de fechamento deve ser entre 1 e 31";
  }

  if (isNaN(dueDay) || dueDay < 1 || dueDay > 31) {
    errors.dueDay = "Dia de vencimento deve ser entre 1 e 31";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
