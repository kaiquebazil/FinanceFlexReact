// contexts/DataContext.tsx
import { Alert } from "react-native";
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

import type {
  Account,
  Transaction,
  PiggyBank,
  CreditCard,
  CreditCardTransaction,
  RecurringBill,
  Category,
  Invoice,
  AccountType,
  Currency,
  TransactionType,
} from "../types";
import { storage, KEYS } from "../services/storage";
import { createDefaultCategories } from "../constants/defaultCategories";

// Função auxiliar para formatar moeda
const formatCurrency = (value: number, currency: string = "BRL"): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency,
  }).format(value);
};

interface DataContextType {
  // Estados
  accounts: Account[];
  transactions: Transaction[];
  piggyBanks: PiggyBank[];
  creditCards: CreditCard[];
  creditCardTransactions: CreditCardTransaction[];
  recurringBills: RecurringBill[];
  categories: Category[];
  invoices: Invoice[];
  valuesHidden: boolean;

  // Setters
  setAccounts: (accounts: Account[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setPiggyBanks: (piggyBanks: PiggyBank[]) => void;
  setCreditCards: (creditCards: CreditCard[]) => void;
  setCreditCardTransactions: (transactions: CreditCardTransaction[]) => void;
  setRecurringBills: (bills: RecurringBill[]) => void;
  setCategories: (categories: Category[]) => void;
  setInvoices: (invoices: Invoice[]) => void;
  setValuesHidden: (hidden: boolean) => void;

  // Funções de conta
  addAccount: (data: Partial<Account>) => Account;
  updateAccount: (id: string, data: Partial<Account>) => void;
  deleteAccount: (id: string) => Promise<boolean>;
  updateAccountBalance: (
    accountId: string,
    amount: number,
    operation: "add" | "subtract",
  ) => void;
  transferBetweenAccounts: (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
  ) => void;

  // Funções de transação
  addTransaction: (data: Partial<Transaction>) => Transaction;
  deleteTransaction: (id: string) => void;
  getTransactionsByAccount: (accountId: string) => Transaction[];

  // Funções de cofrinho
  addPiggyBank: (data: Partial<PiggyBank>) => void;
  updatePiggyBank: (id: string, data: Partial<PiggyBank>) => void;
  deletePiggyBank: (id: string) => void;
  depositToPiggyBank: (
    piggyBankId: string,
    accountId: string,
    amount: number,
  ) => boolean;
  withdrawFromPiggyBank: (
    piggyBankId: string,
    accountId: string,
    amount: number,
  ) => boolean;

  // Funções de cartão
  addCreditCard: (data: Partial<CreditCard>) => void;
  updateCreditCard: (id: string, data: Partial<CreditCard>) => void;
  deleteCreditCard: (id: string) => void;
  
  // NOVAS FUNÇÕES PARA TRANSAÇÕES DE CARTÃO
  addCreditCardTransaction: (data: Partial<CreditCardTransaction>) => void;
  updateCreditCardTransaction?: (id: string, data: Partial<CreditCardTransaction>) => void;
  deleteCreditCardTransaction?: (id: string) => void;
  
  // Funções de fatura
  payInvoice?: (invoiceId: string, accountId: string, amount: number) => void;

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
  applyRemoteData: (data: any) => void;
  getTotalBalance: () => number;
  getMonthlySummary: () => {
    income: number;
    expense: number;
    balance: number;
    savingsRate: number;
  };
  resetToDefaults: () => void;

  // Callbacks UI
  uiCallbacks: {
    showConfirm?: (options: any) => void;
    showToast?: (
      message: string,
      type?: "success" | "error" | "info" | "warning",
    ) => void;
  };
  setUICallbacks: (callbacks: any) => void;
}

export const DataContext = createContext<DataContextType | undefined>(
  undefined,
);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [piggyBanks, setPiggyBanks] = useState<PiggyBank[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [creditCardTransactions, setCreditCardTransactions] = useState<
    CreditCardTransaction[]
  >([]);
  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [valuesHidden, setValuesHidden] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  // Callbacks UI
  const [uiCallbacks, setUICallbacks] = useState<{
    showConfirm?: (options: any) => void;
    showToast?: (
      message: string,
      type?: "success" | "error" | "info" | "warning",
    ) => void;
  }>({});

  // Função para criar contas padrão
  const createDefaultAccounts = useCallback((): Account[] => {
    const now = new Date().toISOString();
    const defaultAccounts: Account[] = [
      {
        id: "default-cash-1",
        name: "Dinheiro",
        type: "Dinheiro",
        currency: "BRL",
        balance: 0,
        createdAt: now,
      },
      {
        id: "default-bank-1",
        name: "Banco Digital",
        type: "Banco",
        currency: "BRL",
        balance: 0,
        createdAt: now,
      },
    ];
    return defaultAccounts;
  }, []);

  // Função para resetar para valores padrão
  const resetToDefaults = useCallback(() => {
    setAccounts(createDefaultAccounts());
    setCategories(createDefaultCategories());
    setTransactions([]);
    setPiggyBanks([]);
    setCreditCards([]);
    setCreditCardTransactions([]);
    setRecurringBills([]);
    setInvoices([]);
    setValuesHidden(false);
  }, []);

  // Carregar dados do storage
  const loadData = async () => {
    try {
      const [acc, trans, piggy, cards, cardTrans, bills, cats, inv, hidden] =
        await Promise.all([
          storage.getItem<Account[]>(KEYS.ACCOUNTS),
          storage.getItem<Transaction[]>(KEYS.TRANSACTIONS),
          storage.getItem<PiggyBank[]>(KEYS.PIGGY_BANKS),
          storage.getItem<CreditCard[]>(KEYS.CREDIT_CARDS),
          storage.getItem<CreditCardTransaction[]>(
            KEYS.CREDIT_CARD_TRANSACTIONS,
          ),
          storage.getItem<RecurringBill[]>(KEYS.RECURRING_BILLS),
          storage.getItem<Category[]>(KEYS.CATEGORIES),
          storage.getItem<Invoice[]>(KEYS.INVOICES),
          storage.getItem<boolean>(KEYS.VALUES_HIDDEN),
        ]);

      // Se não houver contas, é o primeiro lançamento
      if (!acc || acc.length === 0) {
        console.log("Primeiro lançamento detectado. Criando dados padrão.");
        const defaultAccounts = createDefaultAccounts();
        setAccounts(defaultAccounts);
        setIsFirstLaunch(true);
      } else {
        setAccounts(acc);
      }

      setTransactions(trans ?? []);
      setPiggyBanks(piggy ?? []);
      setCreditCards(cards ?? []);
      setCreditCardTransactions(cardTrans ?? []);
      setRecurringBills(bills ?? []);
      setInvoices(inv ?? []);

      // Se não houver categorias, carrega as padrão
      if (!cats || cats.length === 0) {
        setCategories(createDefaultCategories());
      } else {
        setCategories(cats);
      }

      setValuesHidden(hidden ?? false);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  // Aplica dados recebidos do Firestore em tempo real no estado React
  const applyRemoteData = useCallback((data: any) => {
    if (data?.accounts) setAccounts(data.accounts);
    if (data?.transactions) setTransactions(data.transactions);
    if (data?.piggyBanks) setPiggyBanks(data.piggyBanks);
    if (data?.creditCards) setCreditCards(data.creditCards);
    if (data?.creditCardTransactions) setCreditCardTransactions(data.creditCardTransactions);
    if (data?.recurringBills) setRecurringBills(data.recurringBills);
    if (data?.categories) setCategories(data.categories);
    if (data?.invoices) setInvoices(data.invoices);
  }, []);

  // Carregar dados ao iniciar
  useEffect(() => {
    loadData();
  }, []);

  // Salvar dados quando alterados
  useEffect(() => {
    if (!isFirstLaunch) {
      storage.setItem(KEYS.ACCOUNTS, accounts);
    }
  }, [accounts, isFirstLaunch]);

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
    storage.setItem(KEYS.INVOICES, invoices);
  }, [invoices]);

  useEffect(() => {
    storage.setItem(KEYS.VALUES_HIDDEN, valuesHidden);
  }, [valuesHidden]);

  useEffect(() => {
    if (isFirstLaunch) {
      setIsFirstLaunch(false);
    }
  }, [isFirstLaunch]);

  // ==================== FUNÇÕES DE CONTA ====================

  const addAccount = (data: Partial<Account>): Account => {
    const newAccount: Account = {
      id: Date.now().toString(),
      name: data.name || "",
      type: (data.type as AccountType) || "Banco",
      currency: (data.currency as Currency) || "BRL",
      balance: data.balance || 0,
      createdAt: new Date().toISOString(),
    };
    setAccounts([...accounts, newAccount]);
    return newAccount;
  };

  const updateAccount = (id: string, data: Partial<Account>) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...data } : acc)),
    );
  };

  const updateAccountBalance = useCallback(
    (accountId: string, amount: number, operation: "add" | "subtract") => {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === accountId
            ? {
                ...acc,
                balance:
                  operation === "add"
                    ? acc.balance + amount
                    : acc.balance - amount,
              }
            : acc,
        ),
      );
    },
    [],
  );

  const transferBetweenAccounts = (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
  ) => {
    if (fromAccountId === toAccountId) {
      if (uiCallbacks.showConfirm) {
        uiCallbacks.showConfirm({
          title: "Erro",
          message: "As contas de origem e destino devem ser diferentes",
          type: "warning",
          onConfirm: () => {},
        });
      }
      return;
    }

    const fromAccount = accounts.find((a) => a.id === fromAccountId);
    if (!fromAccount) {
      if (uiCallbacks.showConfirm) {
        uiCallbacks.showConfirm({
          title: "Erro",
          message: "Conta de origem não encontrada",
          type: "warning",
          onConfirm: () => {},
        });
      }
      return;
    }

    if (fromAccount.balance < amount) {
      if (uiCallbacks.showConfirm) {
        uiCallbacks.showConfirm({
          title: "Erro",
          message: "Saldo insuficiente na conta de origem",
          type: "warning",
          onConfirm: () => {},
        });
      }
      return;
    }

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === fromAccountId) {
          return { ...acc, balance: acc.balance - amount };
        }
        if (acc.id === toAccountId) {
          return { ...acc, balance: acc.balance + amount };
        }
        return acc;
      }),
    );

    if (uiCallbacks.showToast) {
      uiCallbacks.showToast("Transferência realizada com sucesso!", "success");
    }
  };

  const deleteAccount = async (id: string): Promise<boolean> => {
    const hasTransactions = transactions.some(
      (t) => t.accountId === id || t.toAccountId === id,
    );
    const hasPiggyBanks = piggyBanks.some((p) => p.accountId === id);

    if (hasTransactions || hasPiggyBanks) {
      if (uiCallbacks.showConfirm) {
        uiCallbacks.showConfirm({
          title: "Excluir Conta",
          message:
            "Esta conta possui movimentações. Deseja realmente excluí-la? Todas as transações associadas serão perdidas.",
          type: "danger",
          onConfirm: () => {
            setTransactions((prev) =>
              prev.filter((t) => t.accountId !== id && t.toAccountId !== id),
            );
            setPiggyBanks((prev) =>
              prev.map((p) =>
                p.accountId === id ? { ...p, accountId: undefined } : p,
              ),
            );
            setAccounts((prev) => prev.filter((acc) => acc.id !== id));
            if (uiCallbacks.showToast) {
              uiCallbacks.showToast("Conta excluída com sucesso!", "success");
            }
          },
        });
      }
      return false;
    }

    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    if (uiCallbacks.showToast) {
      uiCallbacks.showToast("Conta excluída com sucesso!", "success");
    }
    return true;
  };

  // ==================== FUNÇÕES DE TRANSAÇÃO ====================

  const addTransaction = (data: Partial<Transaction>): Transaction => {
    const type = (data.type as TransactionType) || "expense";
    const amount = data.amount || 0;
    const accountId = data.accountId || "";

    if (type === "expense") {
      const account = accounts.find((a) => a.id === accountId);
      if (account && account.balance < amount) {
        const errorMessage = `Saldo insuficiente em ${account.name}! Saldo atual: ${formatCurrency(account.balance, account.currency)}`;

        if (uiCallbacks.showToast) {
          uiCallbacks.showToast(errorMessage, "error");
        } else {
          Alert.alert("Saldo Insuficiente", errorMessage);
        }

        throw new Error("Saldo insuficiente");
      }
    }

    const newTransaction: Transaction = {
      id: data.id || Date.now().toString(),
      type,
      amount,
      category: data.category || "",
      description: data.description || "",
      date: data.date || new Date().toISOString(),
      accountId,
      toAccountId: data.toAccountId,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [...prev, newTransaction]);

    if (type === "income") {
      updateAccountBalance(accountId, amount, "add");
    } else if (type === "expense") {
      updateAccountBalance(accountId, amount, "subtract");
    } else if (type === "transfer" && data.toAccountId) {
      updateAccountBalance(accountId, amount, "subtract");
      updateAccountBalance(data.toAccountId, amount, "add");
    }

    return newTransaction;
  };

  const deleteTransaction = (id: string) => {
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction) return;

    if (transaction.type === 'income') {
      setAccounts(prev => prev.map(acc => 
        acc.id === transaction.accountId 
          ? { ...acc, balance: acc.balance - transaction.amount }
          : acc
      ));
      
    } else if (transaction.type === 'expense') {
      setAccounts(prev => prev.map(acc => 
        acc.id === transaction.accountId 
          ? { ...acc, balance: acc.balance + transaction.amount }
          : acc
      ));
      
    } else if (transaction.type === 'transfer' && transaction.toAccountId) {
      setAccounts(prev => prev.map(acc => {
        if (acc.id === transaction.accountId) {
          return { ...acc, balance: acc.balance + transaction.amount };
        }
        if (acc.id === transaction.toAccountId) {
          return { ...acc, balance: acc.balance - transaction.amount };
        }
        return acc;
      }));
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id));

    if (uiCallbacks.showToast) {
      uiCallbacks.showToast("Transação excluída com sucesso!", "success");
    }
  };

  const getTransactionsByAccount = (accountId: string): Transaction[] => {
    return transactions.filter(
      (t) => t.accountId === accountId || t.toAccountId === accountId,
    );
  };

  // ==================== FUNÇÕES DE COFRINHO ====================

  const addPiggyBank = (data: Partial<PiggyBank>) => {
    const newPiggyBank: PiggyBank = {
      id: Date.now().toString(),
      name: data.name || "",
      targetAmount: data.targetAmount || 0,
      currentAmount: data.currentAmount || 0,
      color: data.color || "#7c4dff",
      accountId: data.accountId,
      targetDate: data.targetDate,
      createdAt: new Date().toISOString(),
    };
    setPiggyBanks([...piggyBanks, newPiggyBank]);

    if (uiCallbacks.showToast) {
      uiCallbacks.showToast("Cofrinho criado com sucesso!", "success");
    }
  };

  const updatePiggyBank = (id: string, data: Partial<PiggyBank>) => {
    setPiggyBanks((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p)),
    );
  };

  const deletePiggyBank = (id: string) => {
    setPiggyBanks((prev) => prev.filter((p) => p.id !== id));
    if (uiCallbacks.showToast) {
      uiCallbacks.showToast("Cofrinho excluído com sucesso!", "success");
    }
  };

  const depositToPiggyBank = (
    piggyBankId: string,
    accountId: string,
    amount: number,
  ): boolean => {
    const account = accounts.find((a) => a.id === accountId);
    const piggyBank = piggyBanks.find((p) => p.id === piggyBankId);

    if (!account || !piggyBank) {
      if (uiCallbacks.showConfirm) {
        uiCallbacks.showConfirm({
          title: "Erro",
          message: "Conta ou cofrinho não encontrado",
          type: "warning",
          onConfirm: () => {},
        });
      } else {
        Alert.alert("Erro", "Conta ou cofrinho não encontrado");
      }
      return false;
    }

    if (account.balance < amount) {
      const errorMessage = `Saldo insuficiente em ${account.name}! Saldo atual: ${formatCurrency(account.balance, account.currency)}`;
      if (uiCallbacks.showConfirm) {
        uiCallbacks.showConfirm({
          title: "Erro",
          message: errorMessage,
          type: "warning",
          onConfirm: () => {},
        });
      } else {
        Alert.alert("Erro", errorMessage);
      }
      return false;
    }

    updateAccountBalance(accountId, amount, "subtract");
    setPiggyBanks((prev) =>
      prev.map((p) =>
        p.id === piggyBankId
          ? { ...p, currentAmount: p.currentAmount + amount }
          : p,
      ),
    );

    addTransaction({
      type: "expense",
      amount,
      description: `Depósito no cofrinho: ${piggyBank.name}`,
      category: "Cofrinho",
      accountId,
      date: new Date().toISOString(),
    });

    if (uiCallbacks.showToast) {
      uiCallbacks.showToast("Depósito realizado com sucesso!", "success");
    }
    return true;
  };

  const withdrawFromPiggyBank = (
    piggyBankId: string,
    accountId: string,
    amount: number,
  ): boolean => {
    const piggyBank = piggyBanks.find((p) => p.id === piggyBankId);
    if (!piggyBank) {
      if (uiCallbacks.showConfirm) {
        uiCallbacks.showConfirm({
          title: "Erro",
          message: "Cofrinho não encontrado",
          type: "warning",
          onConfirm: () => {},
        });
      } else {
        Alert.alert("Erro", "Cofrinho não encontrado");
      }
      return false;
    }

    if (piggyBank.currentAmount < amount) {
      const errorMessage = `Saldo insuficiente no cofrinho! Saldo atual: ${formatCurrency(piggyBank.currentAmount, "BRL")}`;
      if (uiCallbacks.showConfirm) {
        uiCallbacks.showConfirm({
          title: "Erro",
          message: errorMessage,
          type: "warning",
          onConfirm: () => {},
        });
      } else {
        Alert.alert("Erro", errorMessage);
      }
      return false;
    }

    updateAccountBalance(accountId, amount, "add");
    setPiggyBanks((prev) =>
      prev.map((p) =>
        p.id === piggyBankId
          ? { ...p, currentAmount: p.currentAmount - amount }
          : p,
      ),
    );

    addTransaction({
      type: "income",
      amount,
      description: `Retirada do cofrinho: ${piggyBank.name}`,
      category: "Cofrinho",
      accountId,
      date: new Date().toISOString(),
    });

    if (uiCallbacks.showToast) {
      uiCallbacks.showToast("Retirada realizada com sucesso!", "success");
    }
    return true;
  };

  // ==================== FUNÇÕES DE CARTÃO ====================

  const addCreditCard = (data: Partial<CreditCard>) => {
    const newCard: CreditCard = {
      id: Date.now().toString(),
      name: data.name || "",
      limit: data.limit || 0,
      used: data.used || 0,
      availableLimit: data.availableLimit || data.limit || 0,
      closingDay: data.closingDay || 1,
      dueDay: data.dueDay || 10,
      lastDigits: data.lastDigits || "",
      brand: data.brand || "visa",
      color: data.color || "#7c4dff",
      status: data.status || "active",
      createdAt: new Date().toISOString(),
    };
    setCreditCards([...creditCards, newCard]);

    if (uiCallbacks.showToast) {
      uiCallbacks.showToast("Cartão adicionado com sucesso!", "success");
    }
  };

  const updateCreditCard = (id: string, data: Partial<CreditCard>) => {
    setCreditCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
    );
  };

  const deleteCreditCard = (id: string) => {
    setCreditCards((prev) => prev.filter((c) => c.id !== id));
    if (uiCallbacks.showToast) {
      uiCallbacks.showToast("Cartão excluído com sucesso!", "success");
    }
  };

  // ==================== NOVAS FUNÇÕES DE TRANSAÇÃO DE CARTÃO ====================

  const addCreditCardTransaction = (data: Partial<CreditCardTransaction>) => {
    const newTransaction: CreditCardTransaction = {
      id: Date.now().toString(),
      creditCardId: data.creditCardId || '',
      description: data.description || '',
      amount: data.amount || 0,
      category: data.category || 'Outros',
      date: data.date || new Date().toISOString(),
      installments: data.installments || 1,
      currentInstallment: data.currentInstallment || 1,
      installmentAmount: data.installmentAmount || 0,
      createdAt: new Date().toISOString(),
    };
    
    setCreditCardTransactions(prev => [...prev, newTransaction]);
    
    // Atualizar o limite usado do cartão
    if (newTransaction.creditCardId) {
      setCreditCards(prev => prev.map(card => 
        card.id === newTransaction.creditCardId
          ? { 
              ...card, 
              used: (card.used || 0) + newTransaction.amount,
              availableLimit: (card.availableLimit || card.limit) - newTransaction.amount
            }
          : card
      ));
    }
    
    // Gerar faturas automaticamente
    generateInvoicesForTransaction(newTransaction);
    
    if (uiCallbacks.showToast) {
      uiCallbacks.showToast('Compra adicionada com sucesso!', 'success');
    }
  };

  // Função auxiliar para gerar faturas
  const generateInvoicesForTransaction = (transaction: CreditCardTransaction) => {
    const card = creditCards.find(c => c.id === transaction.creditCardId);
    if (!card) return;
    
    const transactionDate = new Date(transaction.date);
    const closingDay = card.closingDay;
    
    // Determinar em qual fatura a compra entra
    let firstInvoiceMonth = transactionDate.getMonth() + 1;
    let firstInvoiceYear = transactionDate.getFullYear();
    
    if (transactionDate.getDate() > closingDay) {
      firstInvoiceMonth = firstInvoiceMonth === 12 ? 1 : firstInvoiceMonth + 1;
      firstInvoiceYear = firstInvoiceMonth === 1 ? firstInvoiceYear + 1 : firstInvoiceYear;
    }
    
    // Criar/atualizar faturas para cada parcela
    for (let i = 0; i < transaction.installments; i++) {
      let invoiceMonth = firstInvoiceMonth + i;
      let invoiceYear = firstInvoiceYear;
      
      while (invoiceMonth > 12) {
        invoiceMonth -= 12;
        invoiceYear += 1;
      }
      
      const invoiceId = `${transaction.creditCardId}-${invoiceYear}-${invoiceMonth}`;
      const dueDate = new Date(invoiceYear, invoiceMonth - 1, card.dueDay).toISOString();
      
      setInvoices(prev => {
        const existingInvoice = prev.find(inv => inv.id === invoiceId);
        const installmentAmount = transaction.installmentAmount;
        
        if (existingInvoice) {
          // Atualizar fatura existente
          return prev.map(inv => 
            inv.id === invoiceId
              ? {
                  ...inv,
                  totalAmount: inv.totalAmount + installmentAmount,
                  transactions: [...inv.transactions, transaction.id]
                }
              : inv
          );
        } else {
          // Criar nova fatura
          const newInvoice: Invoice = {
            id: invoiceId,
            creditCardId: transaction.creditCardId,
            month: invoiceMonth,
            year: invoiceYear,
            dueDate,
            totalAmount: installmentAmount,
            status: new Date() > new Date(dueDate) ? 'overdue' : 'future',
            transactions: [transaction.id],
            createdAt: new Date().toISOString(),
          };
          return [...prev, newInvoice];
        }
      });
    }
  };

  // ==================== FUNÇÕES DE CONTA RECORRENTE ====================

  const addRecurringBill = (data: Partial<RecurringBill>) => {
    const newBill: RecurringBill = {
      id: Date.now().toString(),
      name: data.name || "",
      amount: data.amount || 0,
      dueDay: data.dueDay || 1,
      category: data.category || "Outros",
      isPaid: data.isPaid || false,
      createdAt: new Date().toISOString(),
    };
    setRecurringBills([...recurringBills, newBill]);

    if (uiCallbacks.showToast) {
      uiCallbacks.showToast("Conta recorrente adicionada!", "success");
    }
  };

  const updateRecurringBill = (id: string, data: Partial<RecurringBill>) => {
    setRecurringBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...data } : b)),
    );
  };

  const deleteRecurringBill = (id: string) => {
    setRecurringBills((prev) => prev.filter((b) => b.id !== id));
    if (uiCallbacks.showToast) {
      uiCallbacks.showToast("Conta recorrente excluída!", "success");
    }
  };

  const toggleRecurringBillPaid = (id: string) => {
    setRecurringBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isPaid: !b.isPaid } : b)),
    );
  };

  // ==================== FUNÇÕES DE CATEGORIA ====================

  const addCategory = (data: Partial<Category>) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: data.name || "",
      type: data.type || "expense",
      icon: data.icon || "tag",
      createdAt: new Date().toISOString(),
    };
    setCategories([...categories, newCategory]);

    if (uiCallbacks.showToast) {
      uiCallbacks.showToast("Categoria adicionada!", "success");
    }
  };

  const updateCategory = (id: string, data: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
    );
  };

  const deleteCategory = (id: string) => {
    if (id.startsWith("default-")) {
      if (uiCallbacks.showConfirm) {
        uiCallbacks.showConfirm({
          title: "Aviso",
          message: "Categorias padrão não podem ser excluídas",
          type: "warning",
          onConfirm: () => {},
        });
      } else {
        Alert.alert("Aviso", "Categorias padrão não podem ser excluídas");
      }
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (uiCallbacks.showToast) {
      uiCallbacks.showToast("Categoria excluída!", "success");
    }
  };

  // ==================== UTILITÁRIOS ====================

  const getTotalBalance = (): number => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  };

  const getMonthlySummary = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    });

    const income = monthlyTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthlyTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expense;
    const savingsRate = income > 0 ? (balance / income) * 100 : 0;

    return { income, expense, balance, savingsRate };
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
        invoices,
        valuesHidden,

        setAccounts,
        setTransactions,
        setPiggyBanks,
        setCreditCards,
        setCreditCardTransactions,
        setRecurringBills,
        setCategories,
        setInvoices,
        setValuesHidden,

        addAccount,
        updateAccount,
        deleteAccount,
        updateAccountBalance,
        transferBetweenAccounts,

        addTransaction,
        deleteTransaction,
        getTransactionsByAccount,

        addPiggyBank,
        updatePiggyBank,
        deletePiggyBank,
        depositToPiggyBank,
        withdrawFromPiggyBank,

        addCreditCard,
        updateCreditCard,
        deleteCreditCard,
        
        addCreditCardTransaction,
        updateCreditCardTransaction: undefined,
        deleteCreditCardTransaction: undefined,
        
        payInvoice: undefined,

        addRecurringBill,
        updateRecurringBill,
        deleteRecurringBill,
        toggleRecurringBillPaid,

        addCategory,
        updateCategory,
        deleteCategory,

        loadData,
        applyRemoteData,
        getTotalBalance,
        getMonthlySummary,
        resetToDefaults,

        uiCallbacks,
        setUICallbacks,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};