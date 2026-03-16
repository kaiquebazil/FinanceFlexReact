// constants/defaultRecurringBills.ts
import { RecurringBill } from '../types';

export const DEFAULT_RECURRING_BILLS: Omit<RecurringBill, 'createdAt'>[] = [
  { id: 'default-bill-1', name: 'Aluguel', amount: 0, dueDay: 1, category: 'Moradia', isPaid: false },
  { id: 'default-bill-2', name: 'Energia', amount: 0, dueDay: 10, category: 'Contas', isPaid: false },
  { id: 'default-bill-3', name: 'Água', amount: 0, dueDay: 15, category: 'Contas', isPaid: false },
  { id: 'default-bill-4', name: 'Internet', amount: 0, dueDay: 20, category: 'Contas', isPaid: false },
];

// Função para criar contas recorrentes com createdAt
export const createDefaultRecurringBills = (): RecurringBill[] => {
  const now = new Date().toISOString();
  return DEFAULT_RECURRING_BILLS.map(bill => ({
    ...bill,
    createdAt: now,
  }));
};
