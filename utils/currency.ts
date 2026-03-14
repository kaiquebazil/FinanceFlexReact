// utils/currency.ts
import type { Currency } from '../types';

const currencySymbols: Record<Currency, string> = {
  BRL: 'R$',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

export const formatCurrency = (amount: number, currency: Currency = 'BRL'): string => {
  const symbol = currencySymbols[currency] ?? 'R$';
  
  // Se for negativo, formata com o sinal de menos
  if (amount < 0) {
    const formatted = Math.abs(amount).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `-${symbol} ${formatted}`;
  }
  
  // Se for positivo, formata normal
  const formatted = amount.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${symbol} ${formatted}`;
};

export const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[^0-9,-]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};