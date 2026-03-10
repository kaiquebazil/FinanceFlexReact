import { Category } from '../types';

export const DEFAULT_CATEGORIES: Omit<Category, 'createdAt'>[] = [
  // Receitas
  { id: '1', name: 'Salário', type: 'income', icon: 'briefcase' },
  { id: '2', name: 'Freelance', type: 'income', icon: 'laptop-code' },
  { id: '3', name: 'Investimentos', type: 'income', icon: 'chart-line' },
  { id: '4', name: 'Presente', type: 'income', icon: 'gift' },
  { id: '5', name: 'Outros', type: 'income', icon: 'money-bill' },
  
  // Despesas
  { id: '6', name: 'Alimentação', type: 'expense', icon: 'utensils' },
  { id: '7', name: 'Transporte', type: 'expense', icon: 'car' },
  { id: '8', name: 'Moradia', type: 'expense', icon: 'home' },
  { id: '9', name: 'Saúde', type: 'expense', icon: 'heartbeat' },
  { id: '10', name: 'Educação', type: 'expense', icon: 'book' },
  { id: '11', name: 'Lazer', type: 'expense', icon: 'gamepad' },
  { id: '12', name: 'Compras', type: 'expense', icon: 'shopping-bag' },
  { id: '13', name: 'Contas', type: 'expense', icon: 'file-invoice' },
  { id: '14', name: 'Assinaturas', type: 'expense', icon: 'redo' },
  { id: '15', name: 'Outros', type: 'expense', icon: 'tag' },
];