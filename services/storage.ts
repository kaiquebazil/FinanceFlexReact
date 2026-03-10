import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Account,
  Transaction,
  PiggyBank,
  CreditCard,
  CreditCardTransaction,
  RecurringBill,
  Category,
  MonthlySummary,
} from '../types';

const KEYS = {
  ACCOUNTS: 'financeAccounts',
  TRANSACTIONS: 'financeTransactions',
  PIGGY_BANKS: 'piggyBanks',
  CREDIT_CARDS: 'financeCreditCards',
  CREDIT_CARD_TRANSACTIONS: 'creditCardTransactions',
  RECURRING_BILLS: 'recurringBills',
  CATEGORIES: 'financeCategories',
  MONTHLY_SUMMARY: 'monthlySummary',
  VALUES_HIDDEN: 'valuesHidden',
};

class StorageService {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  }

  async getAllData() {
    const accounts = await this.getItem<Account[]>(KEYS.ACCOUNTS) ?? [];
    const transactions = await this.getItem<Transaction[]>(KEYS.TRANSACTIONS) ?? [];
    const piggyBanks = await this.getItem<PiggyBank[]>(KEYS.PIGGY_BANKS) ?? [];
    const creditCards = await this.getItem<CreditCard[]>(KEYS.CREDIT_CARDS) ?? [];
    const creditCardTransactions = await this.getItem<CreditCardTransaction[]>(KEYS.CREDIT_CARD_TRANSACTIONS) ?? [];
    const recurringBills = await this.getItem<RecurringBill[]>(KEYS.RECURRING_BILLS) ?? [];
    const categories = await this.getItem<Category[]>(KEYS.CATEGORIES) ?? [];
    return {
      accounts,
      transactions,
      piggyBanks,
      creditCards,
      creditCardTransactions,
      recurringBills,
      categories,
    };
  }

  async importData(data: any): Promise<void> {
    if (data?.accounts) await this.setItem(KEYS.ACCOUNTS, data.accounts);
    if (data?.transactions) await this.setItem(KEYS.TRANSACTIONS, data.transactions);
    if (data?.piggyBanks) await this.setItem(KEYS.PIGGY_BANKS, data.piggyBanks);
    if (data?.creditCards) await this.setItem(KEYS.CREDIT_CARDS, data.creditCards);
    if (data?.creditCardTransactions) await this.setItem(KEYS.CREDIT_CARD_TRANSACTIONS, data.creditCardTransactions);
    if (data?.recurringBills) await this.setItem(KEYS.RECURRING_BILLS, data.recurringBills);
    if (data?.categories) await this.setItem(KEYS.CATEGORIES, data.categories);
  }

  async clearAll(): Promise<void> {
    await AsyncStorage.clear();
  }
}

export const storage = new StorageService();
export { KEYS };
