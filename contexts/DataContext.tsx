import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Alert } from 'react-native';
import type { 
  Account, 
  Transaction, 
  PiggyBank, 
  CreditCard, 
  CreditCardTransaction, 
  RecurringBill, 
  Category,
  AccountType,
  Currency,
  TransactionType
} from '../types';
import { storage, KEYS } from '../services/storage';

interface DataContextType {
  // Estados
  accounts: Account[];
  transactions: Transaction[];
  piggyBanks: PiggyBank[];
  creditCards: CreditCard[];
  creditCardTransactions: CreditCardTransaction[];
  recurringBills: RecurringBill[];
  categories: Category[];
  valuesHidden: boolean;

  // Setters
  setAccounts: (accounts: Account[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setPiggyBanks: (piggyBanks: PiggyBank[]) => void;
  setCreditCards: (creditCards: CreditCard[]) => void;
  setCreditCardTransactions: (transactions: CreditCardTransaction[]) => void;
  setRecurringBills: (bills: RecurringBill[]) => void;
  setCategories: (categories: Category[]) => void;
  setValuesHidden: (hidden: boolean) => void;

  // Funções de conta
  addAccount: (data: Partial<Account>) => Account;
  updateAccount: (id: string, data: Partial<Account>) => void;
  deleteAccount: (id: string) => Promise<boolean>;
  updateAccountBalance: (accountId: string, amount: number, operation: 'add' | 'subtract') => void;
  transferBetweenAccounts: (fromAccountId: string, toAccountId: string, amount: number) => void;

  // Funções de transação
  addTransaction: (data: Partial<Transaction>) => Transaction;
  deleteTransaction: (id: string) => void;
  getTransactionsByAccount: (accountId: string) => Transaction[];
  
  // Funções de cofrinho
  addPiggyBank: (data: Partial<PiggyBank>) => void;
  updatePiggyBank: (id: string, data: Partial<PiggyBank>) => void;
  deletePiggyBank: (id: string) => void;
  depositToPiggyBank: (piggyBankId: string, accountId: string, amount: number) => boolean;
  withdrawFromPiggyBank: (piggyBankId: string, accountId: string, amount: number) => boolean;

  // Funções de cartão
  addCreditCard: (data: Partial<CreditCard>) => void;
  updateCreditCard: (id: string, data: Partial<CreditCard>) => void;
  deleteCreditCard: (id: string) => void;

  // Funções de conta recorrente
  addRecurringBill: (data: Partial<RecurringBill>) => void;
  updateRecurringBill: (id: string, data: Partial<RecurringBill>) => void;
  deleteRecurringBill: (id: string) => void;
  toggleRecurringBillPaid: (id: string) => void;

  // Funções de categoria
  addCategory: (data: Partial<Category>) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Utilitários
  loadData: () => Promise<void>;
  getTotalBalance: () => number;
  getMonthlySummary: () => { income: number; expense: number; balance: number; savingsRate: number };
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

  // ==================== FUNÇÕES DE CONTA ====================

  const addAccount = (data: Partial<Account>): Account => {
    const newAccount: Account = {
      id: Date.now().toString(),
      name: data.name || '',
      type: data.type as AccountType || 'Banco',
      currency: data.currency as Currency || 'BRL',
      balance: data.balance || 0,
      createdAt: new Date().toISOString(),
    };
    setAccounts([...accounts, newAccount]);
    return newAccount;
  };

  const updateAccount = (id: string, data: Partial<Account>) => {
    setAccounts(prev =>
      prev.map(acc =>
        acc.id === id
          ? { ...acc, ...data }
          : acc
      )
    );
  };

  const updateAccountBalance = useCallback((accountId: string, amount: number, operation: 'add' | 'subtract') => {
    setAccounts(prev =>
      prev.map(acc =>
        acc.id === accountId
          ? { ...acc, balance: operation === 'add' ? acc.balance + amount : acc.balance - amount }
          : acc
      )
    );
  }, []);

  const transferBetweenAccounts = (fromAccountId: string, toAccountId: string, amount: number) => {
    if (fromAccountId === toAccountId) {
      Alert.alert('Erro', 'As contas de origem e destino devem ser diferentes');
      return;
    }

    const fromAccount = accounts.find(a => a.id === fromAccountId);
    if (!fromAccount) {
      Alert.alert('Erro', 'Conta de origem não encontrada');
      return;
    }

    if (fromAccount.balance < amount) {
      Alert.alert('Erro', 'Saldo insuficiente na conta de origem');
      return;
    }

    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === fromAccountId) {
          return { ...acc, balance: acc.balance - amount };
        }
        if (acc.id === toAccountId) {
          return { ...acc, balance: acc.balance + amount };
        }
        return acc;
      })
    );
  };

 const deleteAccount = async (id: string): Promise<boolean> => {
  // Verificar se há transações vinculadas
  const hasTransactions = transactions.some(t => t.accountId === id || t.toAccountId === id);
  const hasPiggyBanks = piggyBanks.some(p => p.accountId === id); // ← LINHA 235 CORRIGIDA
  
  if (hasTransactions || hasPiggyBanks) {
    Alert.alert(
      'Ação bloqueada',
      'Esta conta possui movimentações. Deseja realmente excluí-la? Todas as transações associadas serão perdidas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir mesmo assim',
          style: 'destructive',
          onPress: () => {
            // Remover transações associadas
            setTransactions(prev => prev.filter(t => t.accountId !== id && t.toAccountId !== id));
            // Remover associação de cofrinhos
            setPiggyBanks(prev => prev.map(p => p.accountId === id ? { ...p, accountId: undefined } : p)); // ← LINHA 250 CORRIGIDA
            // Remover a conta
            setAccounts(prev => prev.filter(acc => acc.id !== id));
          }
        }
      ]
    );
    return false;
  }

  // Se não houver movimentações, pode excluir diretamente
  setAccounts(prev => prev.filter(acc => acc.id !== id));
  return true;
};

  // ==================== FUNÇÕES DE TRANSAÇÃO ====================

  const addTransaction = (data: Partial<Transaction>): Transaction => {
    const type = data.type as TransactionType || 'expense';
    const amount = data.amount || 0;
    const accountId = data.accountId || '';

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type,
      amount,
      category: data.category || '',
      description: data.description || '',
      date: data.date || new Date().toISOString(),
      accountId,
      toAccountId: data.toAccountId,
      createdAt: new Date().toISOString(),
    };

    setTransactions([...transactions, newTransaction]);

    // Atualizar saldo da conta
    if (type === 'income') {
      updateAccountBalance(accountId, amount, 'add');
    } else if (type === 'expense') {
      updateAccountBalance(accountId, amount, 'subtract');
    } else if (type === 'transfer' && data.toAccountId) {
      updateAccountBalance(accountId, amount, 'subtract');
      updateAccountBalance(data.toAccountId, amount, 'add');
    }

    return newTransaction;
  };

  const deleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    // Reverter saldo
    if (transaction.type === 'income') {
      updateAccountBalance(transaction.accountId, transaction.amount, 'subtract');
    } else if (transaction.type === 'expense') {
      updateAccountBalance(transaction.accountId, transaction.amount, 'add');
    } else if (transaction.type === 'transfer' && transaction.toAccountId) {
      updateAccountBalance(transaction.accountId, transaction.amount, 'add');
      updateAccountBalance(transaction.toAccountId, transaction.amount, 'subtract');
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const getTransactionsByAccount = (accountId: string): Transaction[] => {
    return transactions.filter(t => t.accountId === accountId || t.toAccountId === accountId);
  };

  // ==================== FUNÇÕES DE COFRINHO ====================

 const addPiggyBank = (data: Partial<PiggyBank>) => {
  const newPiggyBank: PiggyBank = {
    id: Date.now().toString(),
    name: data.name || '',
    targetAmount: data.targetAmount || 0,
    currentAmount: data.currentAmount || 0,
    color: data.color || '#7c4dff',
    accountId: data.accountId,        // ← LINHA 329 CORRIGIDA
    targetDate: data.targetDate,
    createdAt: new Date().toISOString(),
  };
  setPiggyBanks([...piggyBanks, newPiggyBank]);
};

  const updatePiggyBank = (id: string, data: Partial<PiggyBank>) => {
    setPiggyBanks(prev =>
      prev.map(p => p.id === id ? { ...p, ...data } : p)
    );
  };

  const deletePiggyBank = (id: string) => {
    setPiggyBanks(prev => prev.filter(p => p.id !== id));
  };

  const depositToPiggyBank = (piggyBankId: string, accountId: string, amount: number): boolean => {
    const account = accounts.find(a => a.id === accountId);
    const piggyBank = piggyBanks.find(p => p.id === piggyBankId);

    if (!account || !piggyBank) {
      Alert.alert('Erro', 'Conta ou cofrinho não encontrado');
      return false;
    }

    if (account.balance < amount) {
      Alert.alert('Erro', 'Saldo insuficiente na conta');
      return false;
    }

    updateAccountBalance(accountId, amount, 'subtract');
    setPiggyBanks(prev =>
      prev.map(p =>
        p.id === piggyBankId
          ? { ...p, currentAmount: p.currentAmount + amount }
          : p
      )
    );

    // Registrar como transação
    addTransaction({
      type: 'expense',
      amount,
      description: `Depósito no cofrinho: ${piggyBank.name}`,
      category: 'Cofrinho',
      accountId,
      date: new Date().toISOString(),
    });

    return true;
  };

  const withdrawFromPiggyBank = (piggyBankId: string, accountId: string, amount: number): boolean => {
    const piggyBank = piggyBanks.find(p => p.id === piggyBankId);
    if (!piggyBank) {
      Alert.alert('Erro', 'Cofrinho não encontrado');
      return false;
    }

    if (piggyBank.currentAmount < amount) {
      Alert.alert('Erro', 'Saldo insuficiente no cofrinho');
      return false;
    }

    updateAccountBalance(accountId, amount, 'add');
    setPiggyBanks(prev =>
      prev.map(p =>
        p.id === piggyBankId
          ? { ...p, currentAmount: p.currentAmount - amount }
          : p
      )
    );

    // Registrar como transação
    addTransaction({
      type: 'income',
      amount,
      description: `Retirada do cofrinho: ${piggyBank.name}`,
      category: 'Cofrinho',
      accountId,
      date: new Date().toISOString(),
    });

    return true;
  };

  // ==================== FUNÇÕES DE CARTÃO ====================

  const addCreditCard = (data: Partial<CreditCard>) => {
  const newCard: CreditCard = {
    id: Date.now().toString(),
    name: data.name || '',
    limit: data.limit || 0,
    closingDay: data.closingDay || 1,
    dueDay: data.dueDay || 10,
    color: data.color || '#7c4dff',    // ← LINHA 425 CORRIGIDA
    createdAt: new Date().toISOString(),
  };
  setCreditCards([...creditCards, newCard]);
};

  const updateCreditCard = (id: string, data: Partial<CreditCard>) => {
    setCreditCards(prev =>
      prev.map(c => c.id === id ? { ...c, ...data } : c)
    );
  };

  const deleteCreditCard = (id: string) => {
    setCreditCards(prev => prev.filter(c => c.id !== id));
  };

  // ==================== FUNÇÕES DE CONTA RECORRENTE ====================

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

  const updateRecurringBill = (id: string, data: Partial<RecurringBill>) => {
    setRecurringBills(prev =>
      prev.map(b => b.id === id ? { ...b, ...data } : b)
    );
  };

  const deleteRecurringBill = (id: string) => {
    setRecurringBills(prev => prev.filter(b => b.id !== id));
  };

  const toggleRecurringBillPaid = (id: string) => {
    setRecurringBills(prev =>
      prev.map(b => b.id === id ? { ...b, isPaid: !b.isPaid } : b)
    );
  };

  // ==================== FUNÇÕES DE CATEGORIA ====================

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

  const updateCategory = (id: string, data: Partial<Category>) => {
    setCategories(prev =>
      prev.map(c => c.id === id ? { ...c, ...data } : c)
    );
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // ==================== UTILITÁRIOS ====================

  const getTotalBalance = (): number => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  };

  const getMonthlySummary = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expense;
    const savingsRate = income > 0 ? (balance / income) * 100 : 0;

    return { income, expense, balance, savingsRate };
  };

  return (
    <DataContext.Provider 
      value={{ 
        // Estados
        accounts, 
        transactions, 
        piggyBanks, 
        creditCards, 
        creditCardTransactions, 
        recurringBills, 
        categories, 
        valuesHidden,
        
        // Setters
        setAccounts, 
        setTransactions, 
        setPiggyBanks, 
        setCreditCards, 
        setCreditCardTransactions, 
        setRecurringBills, 
        setCategories, 
        setValuesHidden,
        
        // Funções de conta
        addAccount,
        updateAccount,
        deleteAccount,
        updateAccountBalance,
        transferBetweenAccounts,
        
        // Funções de transação
        addTransaction,
        deleteTransaction,
        getTransactionsByAccount,
        
        // Funções de cofrinho
        addPiggyBank,
        updatePiggyBank,
        deletePiggyBank,
        depositToPiggyBank,
        withdrawFromPiggyBank,
        
        // Funções de cartão
        addCreditCard,
        updateCreditCard,
        deleteCreditCard,
        
        // Funções de conta recorrente
        addRecurringBill,
        updateRecurringBill,
        deleteRecurringBill,
        toggleRecurringBillPaid,
        
        // Funções de categoria
        addCategory,
        updateCategory,
        deleteCategory,
        
        // Utilitários
        loadData,
        getTotalBalance,
        getMonthlySummary,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};