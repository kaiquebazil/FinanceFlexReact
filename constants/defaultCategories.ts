// constants/defaultCategories.ts
import { Category } from '../types';

export const DEFAULT_CATEGORIES: Omit<Category, 'createdAt'>[] = [
  // Receitas
  { id: 'default-income-1', name: 'Salário', type: 'income', icon: 'briefcase' },
  { id: 'default-income-2', name: 'Freelance', type: 'income', icon: 'laptop-code' },
  { id: 'default-income-3', name: 'Investimentos', type: 'income', icon: 'chart-line' },
  { id: 'default-income-4', name: 'Presente', type: 'income', icon: 'gift' },
  { id: 'default-income-5', name: 'Outros', type: 'income', icon: 'money-bill' },
  
  // Despesas
  { id: 'default-expense-1', name: 'Alimentação', type: 'expense', icon: 'utensils' },
  { id: 'default-expense-2', name: 'Transporte', type: 'expense', icon: 'car' },
  { id: 'default-expense-3', name: 'Moradia', type: 'expense', icon: 'home' },
  { id: 'default-expense-4', name: 'Saúde', type: 'expense', icon: 'heartbeat' },
  { id: 'default-expense-5', name: 'Educação', type: 'expense', icon: 'book' },
  { id: 'default-expense-6', name: 'Lazer', type: 'expense', icon: 'gamepad' },
  { id: 'default-expense-7', name: 'Compras', type: 'expense', icon: 'shopping-bag' },
  { id: 'default-expense-8', name: 'Contas', type: 'expense', icon: 'file-invoice' },
  { id: 'default-expense-9', name: 'Assinaturas', type: 'expense', icon: 'redo' },
  { id: 'default-expense-10', name: 'Outros', type: 'expense', icon: 'tag' },
];

// Função para criar categorias com createdAt
export const createDefaultCategories = (): Category[] => {
  const now = new Date().toISOString();
  return DEFAULT_CATEGORIES.map(cat => ({
    ...cat,
    createdAt: now,
  }));
};