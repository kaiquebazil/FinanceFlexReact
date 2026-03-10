export type AccountType = 'Dinheiro' | 'Banco' | 'Crédito' | 'Investimento' | 'Digital' | 'Outro';
export type Currency = 'BRL' | 'USD' | 'EUR' | 'GBP' | 'JPY';
export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: Currency;
  balance: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  accountId: string;
  toAccountId?: string;
  createdAt: string;
}

export interface PiggyBank {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
  targetDate?: string;
  createdAt: string;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  createdAt: string;
}

export interface CreditCardTransaction {
  id: string;
  creditCardId: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  installments: number;
  currentInstallment: number;
  createdAt: string;
}

export interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  category: string;
  isPaid: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  createdAt: string;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expenses: number;
  balance: number;
  savingsRate: number;
}
