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
  const formatted = Math.abs(amount).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${symbol} ${formatted}`;
};

export const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[^0-9,-]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};
