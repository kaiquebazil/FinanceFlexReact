export const validateRequired = (value: string): string | null => {
  return value?.trim() ? null : 'Campo obrigatório';
};

export const validateAmount = (value: string): string | null => {
  const num = parseFloat(value?.replace(',', '.') ?? '0');
  if (isNaN(num) || num <= 0) {
    return 'Valor deve ser maior que zero';
  }
  return null;
};

export const validateDay = (value: number): string | null => {
  if (value < 1 || value > 31) {
    return 'Dia deve estar entre 1 e 31';
  }
  return null;
};
