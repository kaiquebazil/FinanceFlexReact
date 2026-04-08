// Sistema de traduções - pt-BR e en
export type Language = 'pt-BR' | 'en';

export const translations = {
  'pt-BR': {
    // App name
    appName: 'FinanceFlex',

    // Header
    settings: 'Configurações',
    toggleTheme: 'Alternar Tema',
    hideValues: 'Ocultar Valores',
    showValues: 'Mostrar Valores',
    menu: 'Menu',

    // Seções
    accounts: 'Contas',
    total: 'Total',
    addAccount: 'Adicionar Conta',
    noAccounts: 'Nenhuma conta cadastrada',
    viewAll: 'Ver todas',

    monthlySummary: 'Resumo Mensal',
    income: 'Receitas',
    expense: 'Despesas',
    balance: 'Saldo',
    percentage: 'Percentagem',
    savingsRate: 'Taxa de Economia',

    monthlyBills: 'Contas do Mês',
    calendar: 'Calendário',

    budgets: 'Orçamentos',
    monthlyBudgets: 'Orçamentos do Mês',
    exceeded: 'Excedido',
    attention: 'Atenção',
    of: 'de',

    piggyBanks: 'Cofrinhos',
    piggyBank: 'Cofrinho',

    recentTransactions: 'Transações Recentes',
    transactions: 'Transações',
    noTransactions: 'Nenhuma transação encontrada',

    // Períodos
    today: 'Hoje',
    week: 'Semana',
    month: 'Mês',
    year: 'Ano',
    upcoming: 'Futuras',
    all: 'Todas',

    // FAB
    newIncome: 'Nova Receita',
    newExpense: 'Nova Despesa',
    transfer: 'Transferir',

    // Drawer Menu
    mainMenu: 'MENU PRINCIPAL',
    quickActions: 'AÇÕES RÁPIDAS',
    account: 'CONTA',

    categories: 'Categorias',
    recurringBills: 'Contas Recorrentes',
    creditCards: 'Cartões de Crédito',
    cloudSync: 'Sincronização em Nuvem',
    deleteAllData: 'Apagar Todos os Dados',
    logout: 'Sair da Conta',

    // Sync Status
    notConnected: 'Não conectado',
    synced: 'Sincronizado',
    syncing: 'Sincronizando...',
    syncError: 'Erro na sincronização',
    waiting: 'Aguardando...',

    // User
    user: 'Usuário',
    email: 'Email',
    displayName: 'Nome de exibição',

    // Footer
    copyright: '© 2026 Finance Flex',
    creator: 'Criador: Kaique Bazil →',

    // Transaction Form
    newTransaction: 'Nova Transação',
    editTransaction: 'Editar Transação',
    amount: 'Valor',
    description: 'Descrição',
    category: 'Categoria',
    selectCategory: 'Selecionar Categoria',
    accountFrom: 'Conta de Origem',
    accountTo: 'Conta de Destino',
    selectAccount: 'Selecionar Conta',
    date: 'Data',
    selectDate: 'Selecionar Data',

    // Transaction Types
    incomeType: 'Receita',
    expenseType: 'Despesa',
    transferType: 'Transferência',

    // Months
    months: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],

    // Form Buttons
    save: 'Salvar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    delete: 'Excluir',
    edit: 'Editar',
    close: 'Fechar',
    add: 'Adicionar',
    addMore: 'Lançar Mais',

    // Toasts
    incomeAdded: 'Receita adicionada com sucesso!',
    expenseAdded: 'Despesa adicionada com sucesso!',
    transferMade: 'Transferência realizada com sucesso!',
    transactionDeleted: 'Transação excluída com sucesso!',
    accountAdded: 'Conta adicionada com sucesso!',
    accountUpdated: 'Conta atualizada com sucesso!',
    accountDeleted: 'Conta excluída com sucesso!',
    piggyBankAdded: 'Cofrinho adicionado com sucesso!',
    piggyBankUpdated: 'Cofrinho atualizado com sucesso!',
    piggyBankDeleted: 'Cofrinho excluído com sucesso!',
    depositMade: 'Depósito realizado com sucesso!',
    withdrawalMade: 'Saque realizado com sucesso!',

    // Confirm Modal
    confirmTitle: 'Confirmação',
    confirmDelete: 'Tem certeza que deseja excluir?',
    confirmAction: 'Tem certeza que deseja realizar esta ação?',
    logoutConfirm: 'Tem certeza que deseja sair? Seus dados locais serão mantidos.',
    deleteAllConfirm: 'Esta ação é irreversível e apagará TODOS os seus dados, incluindo transações, categorias, contas recorrentes, cartões de crédito e cofrinhos.',

    // Filter
    filterBy: 'Filtrar por',
    filterByType: 'Filtrar por tipo',
    filterByCategory: 'Filtrar por categoria',
    filterByPeriod: 'Filtrar por período',
    clearFilters: 'Limpar filtros',
    search: 'Buscar',

    // Errors
    requiredField: 'Campo obrigatório',
    invalidAmount: 'Valor inválido',
    selectCategoryError: 'Selecione uma categoria',
    selectAccountError: 'Selecione uma conta',
    amountGreaterThanZero: 'O valor deve ser maior que zero',
    sameAccountError: 'As contas devem ser diferentes',

    // Placeholders
    enterDescription: 'Digite uma descrição',
    enterAmount: '0,00',
    noResults: 'Nenhum resultado encontrado',
    amountLabel: 'Valor',
    targetDatePlaceholder: 'DD/MM/AAAA',
    monthlyContributionExample: 'Ex: 200,00',

    // Date Picker
    year: 'Ano',
    month: 'Mês',
    day: 'Dia',
    selectDate: 'Selecione a Data',
    confirmDate: 'Confirmar Data',

    // Account Selection
    selectSourceAccount: 'Selecione a conta de origem',
    selectDestinationAccount: 'Selecione a conta de destino',
    noAccountsFound: 'Nenhuma conta encontrada',

    // Account Form
    accountName: 'Nome da Conta',
    accountNamePlaceholder: 'Ex: Nubank, Itaú, Carteira',
    accountType: 'Tipo de Conta',
    currency: 'Moeda',
    initialBalance: 'Saldo Inicial',
    currentBalance: 'Saldo Atual',
    addAccountDescription: 'Cadastre suas contas bancárias, carteiras e investimentos para gerenciar seu dinheiro.',
    deleteAccount: 'Excluir Conta',
    confirmDeleteAccount: 'Deseja excluir a conta',
    editAccount: 'Editar Conta',

    // Piggy Bank Form
    piggyBankName: 'Nome do Cofrinho',
    piggyBankPlaceholder: 'Ex: Viagem',
    targetAmount: 'Meta',
    currentAmount: 'Valor Atual',
    monthlyContribution: 'Contribuição Mensal Planejada',
    monthlyContributionHint: 'opcional',
    targetDate: 'Data Alvo',
    targetDateHint: 'opcional',
    targetDatePlaceholder: 'Ex: 31/12/2025',
    linkAccount: 'Vincular a uma conta',
    none: 'Nenhuma',

    // Piggy Bank Actions
    deposit: 'Depositar',
    withdraw: 'Retirar',
    depositToPiggyBank: 'Depositar no Cofrinho',
    withdrawFromPiggyBank: 'Retirar do Cofrinho',
    selectAccount: 'Selecione a conta',
    depositAction: 'Depositar',
    withdrawAction: 'Retirar',
    account: 'Conta',

    // Budget Manager
    newBudget: 'Novo Orçamento',
    editBudget: 'Editar Orçamento',
    selectCategoryAlert: 'Selecione uma categoria.',
    enterValidLimit: 'Informe um limite válido maior que zero.',
    deleteBudget: 'Excluir Orçamento',
    addBudget: '+ Novo Orçamento',
    budgets: 'Orçamentos',
    expenseCategory: 'Categoria de Despesa',
    monthlyLimit: 'Limite Mensal',
    noBudgetDefined: 'Nenhum orçamento definido',
    budgetDescription: 'Defina limites de gastos por categoria para controlar suas despesas mensais.',
    used: 'utilizado',
    remaining: 'Restam',
    exceededBy: 'Excedido em',
    confirmDeleteBudget: 'Deseja excluir o orçamento de',
    delete: 'Excluir',

    // Calendar
    dayNames: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    calendarTitle: 'Calendário de Transações',
    transactionsOfDay: 'Transações do dia',
    noTransactionsOnDay: 'Nenhuma transação neste dia',
    unknownAccount: 'Conta desconhecida',

    // Category Manager
    categoryManagerTitle: 'Categorias',
    chooseIcon: 'Escolha um ícone',
    categoryName: 'Nome da categoria',
    noCategories: 'Nenhuma categoria cadastrada',
    incomeCategories: 'Categorias de Receita',
    expenseCategories: 'Categorias de Despesa',
    addCategory: 'Adicionar Categoria',
    editCategory: 'Editar Categoria',
    deleteCategory: 'Excluir Categoria',
    categoryAdded: 'Categoria adicionada com sucesso!',
    categoryUpdated: 'Categoria atualizada com sucesso!',
    categoryDeleted: 'Categoria excluída com sucesso!',

    // Recurring Bills
    recurringBillsTitle: 'Contas Recorrentes',
    newRecurringBill: 'Nova Conta Recorrente',
    billName: 'Nome da conta',
    billNamePlaceholder: 'Ex: Aluguel, Internet, Academia',
    dueDay: 'Dia do Vencimento',
    dueDayPlaceholder: '1 a 31',
    dueDayValidation: 'Dia deve ser entre 1 e 31',
    others: 'Outros',
    categoryLabel: 'Categoria',
    toPay: 'A Pagar',
    paid: 'Pagas',
    noRecurringBills: 'Nenhuma conta recorrente',
    recurringBillsDescription: 'Adicione contas fixas como aluguel, internet ou streaming para acompanhar seus gastos mensais.',
    monthlySummaryTitle: 'Resumo Mensal',
    totalBills: 'Total de contas',
    totalToPay: 'Total a pagar',
    deleteRecurringBill: 'Excluir Conta Recorrente',
    confirmDeleteRecurringBill: 'Tem certeza que deseja excluir',

    // Credit Card
    fillDescriptionValue: 'Preencha descrição e valor',
    addCreditCard: 'Adicionar Cartão',
    creditCardName: 'Nome do Cartão',
    installments: 'Número de Parcelas',
    description: 'Descrição',
    creditCards: 'Cartões de Crédito',
    noCreditCards: 'Nenhum cartão cadastrado',
    fillAllFields: 'Preencha todos os campos',
    purchaseAdded: 'Compra adicionada com sucesso!',
    closingDay: 'Dia do Fechamento',
    dueDay: 'Dia do Vencimento',
    cardLimit: 'Limite',
    used: 'Utilizado',
    available: 'Disponível',
    purchases: 'Compras',
    addPurchase: 'Adicionar Compra',
    invoice: 'Fatura',

    // Recurring Bills
    nameRequired: 'Nome é obrigatório',
    invalidValue: 'Valor inválido',

    // Transactions Modal
    transferDeleted: 'Transferência excluída com sucesso!',
    deleteTransfer: 'Excluir Transferência',
    confirmDeleteTransfer: 'Tem certeza que deseja excluir esta transferência?',

    // Category Manager
    fillRequiredFields: 'Preencha todos os campos obrigatórios',

    // Piggy Bank Manager
    enterPiggyBankName: 'Informe um nome para o cofrinho.',
    enterValidTarget: 'Informe uma meta válida maior que zero.',
    enterValidAmount: 'Informe um valor válido maior que zero.',
    onTrack: 'No caminho certo',
    contributionInsufficient: 'Contribuição insuficiente para o prazo',
    goalReached: 'Meta atingida!',
    perMonth: 'mês',
    withContribution: 'Com {amount}/mês:',
    goalOnDate: 'Meta em {date}:',
    perMonthRequired: '/mês necessários',
    deadlinePassed: 'prazo já passou',
    projection: 'Projeção',
    monthSingular: 'mês',
    monthsPlural: 'meses',
    yearSingular: 'ano',
    yearsPlural: 'anos',
    newPiggyBank: 'Novo Cofrinho',
    editPiggyBank: 'Editar Cofrinho',
    deletePiggyBankConfirm: 'Deseja excluir o cofrinho',
    deletePiggyBankWarning: 'O saldo atual não será devolvido automaticamente às contas.',
    piggyBankBalance: 'Saldo',
    percentageComplete: 'completo',
    linkAccountOptional: 'Vincular a uma conta (opcional)',
    noPiggyBanks: 'Nenhum cofrinho criado',
    piggyBanksDescription: 'Crie cofrinhos para organizar suas economias e acompanhar seu progresso.',
    color: 'Cor',
    targetDateLabel: 'Data Alvo',
    none: 'Nenhuma',
    newPiggyBankButton: '+ Novo Cofrinho',
    from: 'de',

    // Backup/Restore
    dataReset: '✅ Todos os dados foram resetados para o padrão!',
    confirmResetData: 'Tem certeza que deseja resetar todos os dados? Esta ação é irreversível!',
    backupRestoreTitle: 'Backup e Restauração',
    accountsAndTransactions: '{accounts} contas • {transactions} transações',
    defaultAccountsInfo: 'Contas padrão: {defaultCount} | Suas contas: {userCount}',
    defaultCategoriesInfo: 'Categorias padrão: {defaultCount} | Suas categorias: {userCount}',
    resetWarning: 'Ao resetar, todos os seus dados serão apagados e substituídos pelas configurações padrão. Esta ação não pode ser desfeita!',
    resetInfoKept: '✅ Contas e categorias padrão serão mantidas',
    resetInfoLost: '❌ Todas as suas transações serão perdidas',
    resetInfoDeleted: '❌ Cofrinhos, cartões e contas recorrentes serão apagados',
    resetAllData: 'Resetar Todos os Dados',

    // Firebase Sync
    syncStatusError: 'Erro na sincronização',
    syncStatusOffline: 'Sem conexão',
    syncStatusNotSynced: 'Não sincronizado',
    authError: 'Erro na autenticação. Verifique seus dados.',
    recoveryEmailSent: 'E-mail de recuperação enviado!',
    recoveryEmailError: 'Erro ao enviar e-mail de recuperação.',
    syncComplete: '🔄 Sincronização Completa',
    syncInProgress: 'Sincronizando…',
    syncTip: '💡 Use o {sendData} para garantir que seu backup está atualizado antes de trocar de aparelho. Use o {downloadData} apenas se quiser restaurar um backup antigo.',
    sendData: 'Enviar Dados',
    downloadData: 'Baixar Dados',
    haveAccount: 'Já tem conta? Faça login',
    noAccount: 'Não tem conta? Cadastre-se',
    confirmLogout: 'Tem certeza que deseja sair? Você precisará fazer login novamente para sincronizar seus dados.',
    confirmUpload: 'Isso irá substituir os dados salvos na nuvem pelos dados atuais deste dispositivo. Deseja continuar?',
    confirmDownload: 'ATENÇÃO: Isso irá substituir TODOS os dados locais deste dispositivo pelos dados salvos na nuvem. Esta ação não pode ser desfeita. Deseja continuar?',
    enterEmailRecovery: 'Digite seu e-mail para receber o link de recuperação.',
    syncTitle: 'Sincronização',
    cloudSyncTitle: 'Sincronização na Nuvem',
    cloudSyncDescription: 'Mantenha seus dados seguros e sincronizados entre todos os seus dispositivos.',
    loading: 'Carregando…',
    lastSync: 'Última sincronização:',
    realtimeSyncActive: 'Sincronização em tempo real ativa',
    dataControl: 'Controle de Dados',
    uploadDataDesc: 'Salva seus dados locais na nuvem',
    downloadDataDesc: 'Substitui dados locais pelos da nuvem',
    logout: 'Sair da Conta',
    createAccount: 'Criar Nova Conta',
    accessAccount: 'Acesse sua Conta',
    yourName: 'Seu Nome',
    email: 'Email',
    password: 'Senha',
    login: 'Entrar',
    forgotPassword: 'Esqueci minha senha',
    recoverPassword: 'Recuperar Senha',
    send: 'Enviar',
    accountCreated: 'Conta criada com sucesso!',
    loginSuccess: 'Login realizado com sucesso!',
    loggedOut: 'Desconectado com sucesso',
    logoutError: 'Erro ao desconectar',
    fillEmailPassword: 'Preencha e-mail e senha',
    fillName: 'Preencha seu nome',
    dataSynced: 'Dados sincronizados com sucesso!',
    dataUploaded: 'Dados enviados para a nuvem!',
    dataDownloaded: 'Dados baixados da nuvem!',
    errorSync: 'Erro ao sincronizar.',
    uploadDataToCloud: 'Enviar Dados para Nuvem',
    downloadDataFromCloud: 'Baixar Dados da Nuvem',

    // Language
    language: 'Idioma',
    selectLanguage: 'Selecionar Idioma',
    portuguese: 'Português',
    english: 'Inglês',

    // Account Types
    accountTypeCash: 'Dinheiro',
    accountTypeBank: 'Banco',
    accountTypeCredit: 'Crédito',
    accountTypeInvestment: 'Investimento',
    accountTypeDigital: 'Digital',
    accountTypeOther: 'Outro',

    // Credit Card Manager (additional keys)
    creditCardTotalLimit: 'Limite total',
    creditCardUsed: 'Usado',
    creditCardAvailable: 'Disponível',
    creditCardClosingDay: 'Fecha dia',
    creditCardDueDay: 'Vence dia',
    creditCardDetails: 'Detalhes',
    creditCardPurchase: 'Compra',
    creditCardNewCard: 'Novo Cartão',
    creditCardCardName: 'Nome do Cartão',
    creditCardLimitLabel: 'Limite (R$)',
    creditCardClosingLabel: 'Dia do Fechamento',
    creditCardDueLabel: 'Dia do Vencimento',
    creditCardNewPurchase: 'Nova Compra',
    creditCardDescriptionLabel: 'Descrição',
    creditCardValueLabel: 'Valor (R$)',
    creditCardInstallmentsLabel: 'Número de Parcelas',
    creditCardCardDetails: 'Detalhes do Cartão',
    creditCardTotalLimitLabel: 'Limite Total:',
    creditCardUsedLabel: 'Valor Utilizado:',
    creditCardAvailableLabel: 'Disponível:',
    creditCardClosingLabel2: 'Fechamento:',
    creditCardDueLabel2: 'Vencimento:',
    creditCardBack: 'Voltar',

    // Currency
    currencySymbol: 'R$',
  },

  'en': {
    // App name
    appName: 'FinanceFlex',

    // Header
    settings: 'Settings',
    toggleTheme: 'Toggle Theme',
    hideValues: 'Hide Values',
    showValues: 'Show Values',
    menu: 'Menu',

    // Seções
    accounts: 'Accounts',
    total: 'Total',
    addAccount: 'Add Account',
    noAccounts: 'No accounts registered',
    viewAll: 'View all',

    monthlySummary: 'Monthly Summary',
    income: 'Income',
    expense: 'Expenses',
    balance: 'Balance',
    percentage: 'Percentage',
    savingsRate: 'Savings Rate',

    monthlyBills: 'Monthly Bills',
    calendar: 'Calendar',

    budgets: 'Budgets',
    monthlyBudgets: 'Monthly Budgets',
    exceeded: 'Exceeded',
    attention: 'Attention',
    of: 'of',

    piggyBanks: 'Piggy Banks',
    piggyBank: 'Piggy Bank',

    recentTransactions: 'Recent Transactions',
    transactions: 'Transactions',
    noTransactions: 'No transactions found',

    // Períodos
    today: 'Today',
    week: 'Week',
    month: 'Month',
    year: 'Year',
    upcoming: 'Upcoming',
    all: 'All',

    // FAB
    newIncome: 'New Income',
    newExpense: 'New Expense',
    transfer: 'Transfer',

    // Drawer Menu
    mainMenu: 'MAIN MENU',
    quickActions: 'QUICK ACTIONS',
    account: 'ACCOUNT',

    categories: 'Categories',
    recurringBills: 'Recurring Bills',
    creditCards: 'Credit Cards',
    cloudSync: 'Cloud Sync',
    deleteAllData: 'Delete All Data',
    logout: 'Logout',

    // Sync Status
    notConnected: 'Not connected',
    synced: 'Synced',
    syncing: 'Syncing...',
    syncError: 'Sync error',
    waiting: 'Waiting...',

    // User
    user: 'User',
    email: 'Email',
    displayName: 'Display Name',

    // Footer
    copyright: '© 2026 Finance Flex',
    creator: 'Created by: Kaique Bazil →',

    // Transaction Form
    newTransaction: 'New Transaction',
    editTransaction: 'Edit Transaction',
    amount: 'Amount',
    description: 'Description',
    category: 'Category',
    selectCategory: 'Select Category',
    accountFrom: 'From Account',
    accountTo: 'To Account',
    selectAccount: 'Select Account',
    date: 'Date',
    selectDate: 'Select Date',

    // Transaction Types
    incomeType: 'Income',
    expenseType: 'Expense',
    transferType: 'Transfer',

    // Months
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],

    // Form Buttons
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    add: 'Add',
    addMore: 'Add More',

    // Toasts
    incomeAdded: 'Income added successfully!',
    expenseAdded: 'Expense added successfully!',
    transferMade: 'Transfer completed successfully!',
    transactionDeleted: 'Transaction deleted successfully!',
    accountAdded: 'Account added successfully!',
    accountUpdated: 'Account updated successfully!',
    accountDeleted: 'Account deleted successfully!',
    piggyBankAdded: 'Piggy bank added successfully!',
    piggyBankUpdated: 'Piggy bank updated successfully!',
    piggyBankDeleted: 'Piggy bank deleted successfully!',
    depositMade: 'Deposit completed successfully!',
    withdrawalMade: 'Withdrawal completed successfully!',

    // Confirm Modal
    confirmTitle: 'Confirmation',
    confirmDelete: 'Are you sure you want to delete?',
    confirmAction: 'Are you sure you want to perform this action?',
    logoutConfirm: 'Are you sure you want to logout? Your local data will be kept.',
    deleteAllConfirm: 'This action is irreversible and will delete ALL your data, including transactions, categories, recurring bills, credit cards, and piggy banks.',

    // Filter
    filterBy: 'Filter by',
    filterByType: 'Filter by type',
    filterByCategory: 'Filter by category',
    filterByPeriod: 'Filter by period',
    clearFilters: 'Clear filters',
    search: 'Search',

    // Errors
    requiredField: 'Required field',
    invalidAmount: 'Invalid amount',
    selectCategoryError: 'Select a category',
    selectAccountError: 'Select an account',
    amountGreaterThanZero: 'Amount must be greater than zero',
    sameAccountError: 'Accounts must be different',

    // Placeholders
    enterDescription: 'Enter a description',
    enterAmount: '0.00',
    noResults: 'No results found',
    amountLabel: 'Amount',
    targetDatePlaceholder: 'MM/DD/YYYY',
    monthlyContributionExample: 'Ex: 200.00',

    // Date Picker
    year: 'Year',
    month: 'Month',
    day: 'Day',
    selectDate: 'Select Date',
    confirmDate: 'Confirm Date',

    // Account Selection
    selectSourceAccount: 'Select source account',
    selectDestinationAccount: 'Select destination account',
    noAccountsFound: 'No accounts found',

    // Account Form
    accountName: 'Account Name',
    accountNamePlaceholder: 'Ex: Chase, Bank of America, Wallet',
    accountType: 'Account Type',
    currency: 'Currency',
    initialBalance: 'Initial Balance',
    currentBalance: 'Current Balance',
    addAccountDescription: 'Register your bank accounts, wallets and investments to manage your money.',
    deleteAccount: 'Delete Account',
    confirmDeleteAccount: 'Do you want to delete the account',
    editAccount: 'Edit Account',

    // Piggy Bank Form
    piggyBankName: 'Piggy Bank Name',
    piggyBankPlaceholder: 'Ex: Vacation',
    targetAmount: 'Target Amount',
    currentAmount: 'Current Amount',
    monthlyContribution: 'Planned Monthly Contribution',
    monthlyContributionHint: 'optional',
    targetDate: 'Target Date',
    targetDateHint: 'optional',
    targetDatePlaceholder: 'Ex: 12/31/2025',
    linkAccount: 'Link to an account',
    none: 'None',

    // Piggy Bank Actions
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    depositToPiggyBank: 'Deposit to Piggy Bank',
    withdrawFromPiggyBank: 'Withdraw from Piggy Bank',
    selectAccount: 'Select account',
    depositAction: 'Deposit',
    withdrawAction: 'Withdraw',
    account: 'Account',

    // Budget Manager
    newBudget: 'New Budget',
    editBudget: 'Edit Budget',
    selectCategoryAlert: 'Please select a category.',
    enterValidLimit: 'Please enter a valid limit greater than zero.',
    deleteBudget: 'Delete Budget',
    addBudget: '+ New Budget',
    budgets: 'Budgets',
    expenseCategory: 'Expense Category',
    monthlyLimit: 'Monthly Limit',
    noBudgetDefined: 'No budget defined',
    budgetDescription: 'Set spending limits by category to control your monthly expenses.',
    used: 'used',
    remaining: 'Remaining',
    exceededBy: 'Exceeded by',
    confirmDeleteBudget: 'Do you want to delete the budget for',
    delete: 'Delete',

    // Calendar
    dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    calendarTitle: 'Transaction Calendar',
    transactionsOfDay: 'Transactions of the day',
    noTransactionsOnDay: 'No transactions on this day',
    unknownAccount: 'Unknown account',

    // Category Manager
    categoryManagerTitle: 'Categories',
    chooseIcon: 'Choose an icon',
    categoryName: 'Category Name',
    noCategories: 'No categories registered',
    incomeCategories: 'Income Categories',
    expenseCategories: 'Expense Categories',
    addCategory: 'Add Category',
    editCategory: 'Edit Category',
    deleteCategory: 'Delete Category',
    categoryAdded: 'Category added successfully!',
    categoryUpdated: 'Category updated successfully!',
    categoryDeleted: 'Category deleted successfully!',

    // Recurring Bills
    recurringBillsTitle: 'Recurring Bills',
    newRecurringBill: 'New Recurring Bill',
    billName: 'Bill Name',
    billNamePlaceholder: 'Ex: Rent, Internet, Gym',
    dueDay: 'Due Day',
    dueDayPlaceholder: '1 to 31',
    dueDayValidation: 'Day must be between 1 and 31',
    others: 'Others',
    categoryLabel: 'Category',
    toPay: 'To Pay',
    paid: 'Paid',
    noRecurringBills: 'No recurring bills',
    recurringBillsDescription: 'Add fixed bills like rent, internet or streaming to track your monthly expenses.',
    monthlySummaryTitle: 'Monthly Summary',
    totalBills: 'Total bills',
    totalToPay: 'Total to pay',
    deleteRecurringBill: 'Delete Recurring Bill',
    confirmDeleteRecurringBill: 'Are you sure you want to delete',

    // Credit Card
    fillDescriptionValue: 'Please fill description and value',
    addCreditCard: 'Add Credit Card',
    creditCardName: 'Credit Card Name',
    installments: 'Number of Installments',
    description: 'Description',
    creditCards: 'Credit Cards',
    noCreditCards: 'No credit cards registered',
    fillAllFields: 'Please fill all fields',
    purchaseAdded: 'Purchase added successfully!',
    closingDay: 'Closing Day',
    dueDay: 'Due Day',
    cardLimit: 'Limit',
    used: 'Used',
    available: 'Available',
    purchases: 'Purchases',
    addPurchase: 'Add Purchase',
    invoice: 'Statement',

    // Recurring Bills
    nameRequired: 'Name is required',
    invalidValue: 'Invalid value',

    // Transactions Modal
    transferDeleted: 'Transfer deleted successfully!',
    deleteTransfer: 'Delete Transfer',
    confirmDeleteTransfer: 'Are you sure you want to delete this transfer?',

    // Category Manager
    fillRequiredFields: 'Please fill all required fields',

    // Piggy Bank Manager
    enterPiggyBankName: 'Please enter a name for the piggy bank.',
    enterValidTarget: 'Please enter a valid target greater than zero.',
    enterValidAmount: 'Please enter a valid amount greater than zero.',
    onTrack: 'On track',
    contributionInsufficient: 'Contribution insufficient for the deadline',
    goalReached: 'Goal reached!',
    perMonth: 'month',
    withContribution: 'With {amount}/month:',
    goalOnDate: 'Goal by {date}:',
    perMonthRequired: '/month needed',
    deadlinePassed: 'deadline has passed',
    projection: 'Projection',
    monthSingular: 'month',
    monthsPlural: 'months',
    yearSingular: 'year',
    yearsPlural: 'years',
    newPiggyBank: 'New Piggy Bank',
    editPiggyBank: 'Edit Piggy Bank',
    deletePiggyBankConfirm: 'Do you want to delete the piggy bank',
    deletePiggyBankWarning: 'The current balance will not be automatically returned to accounts.',
    piggyBankBalance: 'Balance',
    percentageComplete: 'complete',
    linkAccountOptional: 'Link to an account (optional)',
    noPiggyBanks: 'No piggy banks created',
    piggyBanksDescription: 'Create piggy banks to organize your savings and track your progress.',
    color: 'Color',
    targetDateLabel: 'Target Date',
    none: 'None',
    newPiggyBankButton: '+ New Piggy Bank',
    from: 'of',

    // Backup/Restore
    dataReset: '✅ All data has been reset to default!',
    confirmResetData: 'Are you sure you want to reset all data? This action is irreversible!',
    backupRestoreTitle: 'Backup and Restore',
    accountsAndTransactions: '{accounts} accounts • {transactions} transactions',
    defaultAccountsInfo: 'Default accounts: {defaultCount} | Your accounts: {userCount}',
    defaultCategoriesInfo: 'Default categories: {defaultCount} | Your categories: {userCount}',
    resetWarning: 'When resetting, all your data will be deleted and replaced with default settings. This action cannot be undone!',
    resetInfoKept: '✅ Default accounts and categories will be kept',
    resetInfoLost: '❌ All your transactions will be lost',
    resetInfoDeleted: '❌ Piggy banks, cards and recurring bills will be deleted',
    resetAllData: 'Reset All Data',

    // Firebase Sync
    syncStatusError: 'Sync error',
    syncStatusOffline: 'Offline',
    syncStatusNotSynced: 'Not synced',
    authError: 'Authentication error. Please check your credentials.',
    recoveryEmailSent: 'Recovery email sent!',
    recoveryEmailError: 'Error sending recovery email.',
    syncComplete: '🔄 Sync Complete',
    syncInProgress: 'Syncing…',
    syncTip: '💡 Use {sendData} to ensure your backup is up to date before switching devices. Use {downloadData} only if you want to restore an old backup.',
    sendData: 'Send Data',
    downloadData: 'Download Data',
    haveAccount: 'Already have an account? Log in',
    noAccount: 'Don\'t have an account? Sign up',
    confirmLogout: 'Are you sure you want to logout? You will need to login again to sync your data.',
    confirmUpload: 'This will replace the data saved in the cloud with the current data from this device. Do you want to continue?',
    confirmDownload: 'WARNING: This will replace ALL local data on this device with the data saved in the cloud. This action cannot be undone. Do you want to continue?',
    enterEmailRecovery: 'Enter your email to receive the recovery link.',
    syncTitle: 'Sync',
    cloudSyncTitle: 'Cloud Sync',
    cloudSyncDescription: 'Keep your data safe and synchronized across all your devices.',
    loading: 'Loading…',
    lastSync: 'Last sync:',
    realtimeSyncActive: 'Real-time sync active',
    dataControl: 'Data Control',
    uploadDataDesc: 'Save your local data to the cloud',
    downloadDataDesc: 'Replace local data with cloud data',
    logout: 'Logout',
    createAccount: 'Create New Account',
    accessAccount: 'Access Your Account',
    yourName: 'Your Name',
    email: 'Email',
    password: 'Password',
    login: 'Login',
    forgotPassword: 'Forgot my password',
    recoverPassword: 'Recover Password',
    send: 'Send',
    accountCreated: 'Account created successfully!',
    loginSuccess: 'Login successful!',
    loggedOut: 'Logged out successfully',
    logoutError: 'Error logging out',
    fillEmailPassword: 'Please enter email and password',
    fillName: 'Please enter your name',
    dataSynced: 'Data synced successfully!',
    dataUploaded: 'Data uploaded to the cloud!',
    dataDownloaded: 'Data downloaded from the cloud!',
    errorSync: 'Error syncing.',
    uploadDataToCloud: 'Upload Data to Cloud',
    downloadDataFromCloud: 'Download Data from Cloud',

    // Language
    language: 'Language',
    selectLanguage: 'Select Language',
    portuguese: 'Portuguese',
    english: 'English',

    // Account Types
    accountTypeCash: 'Cash',
    accountTypeBank: 'Bank',
    accountTypeCredit: 'Credit',
    accountTypeInvestment: 'Investment',
    accountTypeDigital: 'Digital',
    accountTypeOther: 'Other',

    // Credit Card Manager (additional keys)
    creditCardTotalLimit: 'Total Limit',
    creditCardUsed: 'Used',
    creditCardAvailable: 'Available',
    creditCardClosingDay: 'Closes on',
    creditCardDueDay: 'Due on',
    creditCardDetails: 'Details',
    creditCardPurchase: 'Purchase',
    creditCardNewCard: 'New Card',
    creditCardCardName: 'Card Name',
    creditCardLimitLabel: 'Limit ($)',
    creditCardClosingLabel: 'Closing Day',
    creditCardDueLabel: 'Due Day',
    creditCardNewPurchase: 'New Purchase',
    creditCardDescriptionLabel: 'Description',
    creditCardValueLabel: 'Amount ($)',
    creditCardInstallmentsLabel: 'Number of Installments',
    creditCardCardDetails: 'Card Details',
    creditCardTotalLimitLabel: 'Total Limit:',
    creditCardUsedLabel: 'Used Amount:',
    creditCardAvailableLabel: 'Available:',
    creditCardClosingLabel2: 'Closing:',
    creditCardDueLabel2: 'Due:',
    creditCardBack: 'Back',

    // Currency
    currencySymbol: '$',
  },
};

export type Translations = typeof translations['pt-BR'];
