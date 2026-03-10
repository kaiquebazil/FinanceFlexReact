import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { 
  Account, 
  Transaction, 
  PiggyBank, 
  CreditCard, 
  CreditCardTransaction, 
  RecurringBill, 
  Category 
} from '../types';
import { storage, KEYS } from '../services/storage';

interface DataContextType {
  accounts: Account[];
  transactions: Transaction[];
  piggyBanks: PiggyBank[];
  creditCards: CreditCard[];
  creditCardTransactions: CreditCardTransaction[];
  recurringBills: RecurringBill[];
  categories: Category[];
  valuesHidden: boolean;
  setAccounts: (accounts: Account[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setPiggyBanks: (piggyBanks: PiggyBank[]) => void;
  setCreditCards: (creditCards: CreditCard[]) => void;
  setCreditCardTransactions: (transactions: CreditCardTransaction[]) => void;
  setRecurringBills: (bills: RecurringBill[]) => void;
  setCategories: (categories: Category[]) => void;
  setValuesHidden: (hidden: boolean) => void;
  addCategory: (data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addRecurringBill: (data: Partial<RecurringBill>) => void;
  deleteRecurringBill: (id: string) => void;
  toggleRecurringBillPaid: (id: string) => void;
  addPiggyBank: (data: Partial<PiggyBank>) => void;
  deletePiggyBank: (id: string) => void;
  addCreditCard: (data: Partial<CreditCard>) => void;
  deleteCreditCard: (id: string) => void;
  loadData: () => Promise<void>;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultCategories: Category[] = [
  { id: '1', name: 'Salário', type: 'income', icon: 'briefcase', createdAt: new Date().toISOString() },
  { id: '2', name: 'Alimentação', type: 'expense', icon: 'cutlery', createdAt: new Date().toISOString() },
  { id: '3', name: 'Transporte', type: 'expense', icon: 'car', createdAt: new Date().toISOString() },
  { id: '4', name: 'Moradia', type: 'expense', icon: 'home', createdAt: new Date().toISOString() },
  { id: '5', name: 'Lazer', type: 'expense', icon: 'gamepad', createdAt: new Date().toISOString() },
  { id: '6', name: 'Saúde', type: 'expense', icon: 'heartbeat', createdAt: new Date().toISOString() },
  { id: '7', name: 'Educação', type: 'expense', icon: 'book', createdAt: new Date().toISOString() },
  { id: '8', name: 'Investimentos', type: 'expense', icon: 'chart-line', createdAt: new Date().toISOString() },
];

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [piggyBanks, setPiggyBanks] = useState<PiggyBank[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [creditCardTransactions, setCreditCardTransactions] = useState<CreditCardTransaction[]>([]);
  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [valuesHidden, setValuesHidden] = useState(false);

  // Carregar dados do storage
  const loadData = async () => {
    try {
      const [acc, trans, piggy, cards, cardTrans, bills, cats, hidden] = await Promise.all([
        storage.getItem<Account[]>(KEYS.ACCOUNTS),
        storage.getItem<Transaction[]>(KEYS.TRANSACTIONS),
        storage.getItem<PiggyBank[]>(KEYS.PIGGY_BANKS),
        storage.getItem<CreditCard[]>(KEYS.CREDIT_CARDS),
        storage.getItem<CreditCardTransaction[]>(KEYS.CREDIT_CARD_TRANSACTIONS),
        storage.getItem<RecurringBill[]>(KEYS.RECURRING_BILLS),
        storage.getItem<Category[]>(KEYS.CATEGORIES),
        storage.getItem<boolean>(KEYS.VALUES_HIDDEN),
      ]);
      
      setAccounts(acc ?? []);
      setTransactions(trans ?? []);
      setPiggyBanks(piggy ?? []);
      setCreditCards(cards ?? []);
      setCreditCardTransactions(cardTrans ?? []);
      setRecurringBills(bills ?? []);
      setCategories(cats ?? defaultCategories);
      setValuesHidden(hidden ?? false);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Carregar dados ao iniciar
  useEffect(() => {
    loadData();
  }, []);

  // Salvar dados quando alterados
  useEffect(() => {
    storage.setItem(KEYS.ACCOUNTS, accounts);
  }, [accounts]);

  useEffect(() => {
    storage.setItem(KEYS.TRANSACTIONS, transactions);
  }, [transactions]);

  useEffect(() => {
    storage.setItem(KEYS.PIGGY_BANKS, piggyBanks);
  }, [piggyBanks]);

  useEffect(() => {
    storage.setItem(KEYS.CREDIT_CARDS, creditCards);
  }, [creditCards]);

  useEffect(() => {
    storage.setItem(KEYS.CREDIT_CARD_TRANSACTIONS, creditCardTransactions);
  }, [creditCardTransactions]);

  useEffect(() => {
    storage.setItem(KEYS.RECURRING_BILLS, recurringBills);
  }, [recurringBills]);

  useEffect(() => {
    storage.setItem(KEYS.CATEGORIES, categories);
  }, [categories]);

  useEffect(() => {
    storage.setItem(KEYS.VALUES_HIDDEN, valuesHidden);
  }, [valuesHidden]);

  // Métodos auxiliares
  const addCategory = (data: Partial<Category>) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: data.name || '',
      type: data.type || 'expense',
      icon: data.icon || 'tag',
      createdAt: new Date().toISOString(),
    };
    setCategories([...categories, newCategory]);
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const addRecurringBill = (data: Partial<RecurringBill>) => {
    const newBill: RecurringBill = {
      id: Date.now().toString(),
      name: data.name || '',
      amount: data.amount || 0,
      dueDay: data.dueDay || 1,
      category: data.category || 'Outros',
      isPaid: data.isPaid || false,
      createdAt: new Date().toISOString(),
    };
    setRecurringBills([...recurringBills, newBill]);
  };

  const deleteRecurringBill = (id: string) => {
    setRecurringBills(recurringBills.filter(b => b.id !== id));
  };

  const toggleRecurringBillPaid = (id: string) => {
    setRecurringBills(recurringBills.map(b => 
      b.id === id ? { ...b, isPaid: !b.isPaid } : b
    ));
  };

  const addPiggyBank = (data: Partial<PiggyBank>) => {
    const newPiggyBank: PiggyBank = {
      id: Date.now().toString(),
      name: data.name || '',
      targetAmount: data.targetAmount || 0,
      currentAmount: data.currentAmount || 0,
      color: data.color || '#7c4dff',
      targetDate: data.targetDate,
      createdAt: new Date().toISOString(),
    };
    setPiggyBanks([...piggyBanks, newPiggyBank]);
  };

  const deletePiggyBank = (id: string) => {
    setPiggyBanks(piggyBanks.filter(p => p.id !== id));
  };

  const addCreditCard = (data: Partial<CreditCard>) => {
    const newCard: CreditCard = {
      id: Date.now().toString(),
      name: data.name || '',
      limit: data.limit || 0,
      closingDay: data.closingDay || 1,
      dueDay: data.dueDay || 10,
      createdAt: new Date().toISOString(),
    };
    setCreditCards([...creditCards, newCard]);
  };

  const deleteCreditCard = (id: string) => {
    setCreditCards(creditCards.filter(c => c.id !== id));
  };

  return (
    <DataContext.Provider 
      value={{ 
        accounts, 
        transactions, 
        piggyBanks, 
        creditCards, 
        creditCardTransactions, 
        recurringBills, 
        categories, 
        valuesHidden,
        setAccounts, 
        setTransactions, 
        setPiggyBanks, 
        setCreditCards, 
        setCreditCardTransactions, 
        setRecurringBills, 
        setCategories, 
        setValuesHidden,
        addCategory, 
        deleteCategory, 
        addRecurringBill, 
        deleteRecurringBill, 
        toggleRecurringBillPaid, 
        addPiggyBank, 
        deletePiggyBank, 
        addCreditCard, 
        deleteCreditCard, 
        loadData 
      }}
    >
      {children}
    </DataContext.Provider>
  );
};