import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = {
  ACCOUNTS: 'financeAccounts',
  TRANSACTIONS: 'financeTransactions',
  PIGGY_BANKS: 'piggyBanks',
  CREDIT_CARDS: 'financeCreditCards',
  CREDIT_CARD_TRANSACTIONS: 'creditCardTransactions',
  RECURRING_BILLS: 'recurringBills',
  CATEGORIES: 'financeCategories',
  MONTHLY_SUMMARY: 'monthlySummary',
  VALUES_HIDDEN: 'valuesHidden',
  INVOICES: 'invoices',
  INVOICE_PAYMENTS: 'invoicePayments',
};

export const storage = new class {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  }

  async setItem(key: string, value: any): Promise<void> {
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
    return {
      accounts: await this.getItem(KEYS.ACCOUNTS) ?? [],
      transactions: await this.getItem(KEYS.TRANSACTIONS) ?? [],
      piggyBanks: await this.getItem(KEYS.PIGGY_BANKS) ?? [],
      creditCards: await this.getItem(KEYS.CREDIT_CARDS) ?? [],
      creditCardTransactions: await this.getItem(KEYS.CREDIT_CARD_TRANSACTIONS) ?? [],
      recurringBills: await this.getItem(KEYS.RECURRING_BILLS) ?? [],
      categories: await this.getItem(KEYS.CATEGORIES) ?? [],
      invoices: await this.getItem(KEYS.INVOICES) ?? [],
      invoicePayments: await this.getItem(KEYS.INVOICE_PAYMENTS) ?? [],
    };
  }

  async importData(data: any) {
    if (data?.accounts) await this.setItem(KEYS.ACCOUNTS, data.accounts);
    if (data?.transactions) await this.setItem(KEYS.TRANSACTIONS, data.transactions);
    if (data?.piggyBanks) await this.setItem(KEYS.PIGGY_BANKS, data.piggyBanks);
    if (data?.creditCards) await this.setItem(KEYS.CREDIT_CARDS, data.creditCards);
    if (data?.creditCardTransactions) await this.setItem(KEYS.CREDIT_CARD_TRANSACTIONS, data.creditCardTransactions);
    if (data?.recurringBills) await this.setItem(KEYS.RECURRING_BILLS, data.recurringBills);
    if (data?.categories) await this.setItem(KEYS.CATEGORIES, data.categories);
    if (data?.invoices) await this.setItem(KEYS.INVOICES, data.invoices);
    if (data?.invoicePayments) await this.setItem(KEYS.INVOICE_PAYMENTS, data.invoicePayments);
  }

  async clearAll() {
    await AsyncStorage.clear();
  }
}();