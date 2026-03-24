# Guia de Teste - Sistema de Cartões de Crédito Melhorado

## Visão Geral

Este documento descreve como testar as novas funcionalidades implementadas no sistema de cartões de crédito do FinanceFlexReact.

## Componentes Modificados

### 1. CreditCardManagerV2.tsx (Novo)
Componente principal com interface melhorada contendo três abas: Cartões, Faturas e Histórico.

### 2. DataContext.tsx (Modificado)
Adicionadas funções para gerenciar transações e faturas de cartão:
- `updateCreditCardTransaction()` - Atualizar transação
- `deleteCreditCardTransaction()` - Deletar transação
- `payInvoice()` - Pagar fatura

## Cenários de Teste

### Teste 1: Adicionar Cartão com Validações

**Passos:**
1. Abrir o modal "Novo Cartão"
2. Tentar salvar sem preencher campos obrigatórios
3. Verificar se mensagem de erro aparece
4. Preencher todos os campos corretamente
5. Salvar o cartão

**Resultado Esperado:**
- Mensagem de erro quando campos estão vazios
- Cartão adicionado com sucesso quando todos os campos estão preenchidos
- Cartão aparece na lista com informações corretas

### Teste 2: Validação de Dias

**Passos:**
1. Tentar adicionar cartão com dia de fechamento = 32
2. Tentar adicionar cartão com dia de vencimento = 0
3. Adicionar cartão com dias válidos (1-31)

**Resultado Esperado:**
- Mensagens de erro para dias inválidos
- Cartão criado com sucesso para dias válidos

### Teste 3: Adicionar Compra com Parcelamento

**Passos:**
1. Selecionar um cartão
2. Clicar em "Compra"
3. Preencher descrição, valor e número de parcelas
4. Verificar cálculo de parcelas
5. Adicionar compra

**Resultado Esperado:**
- Cálculo correto de valor por parcela
- Compra registrada com sucesso
- Limite do cartão atualizado
- Faturas geradas automaticamente

### Teste 4: Validação de Limite

**Passos:**
1. Criar cartão com limite de R$ 1.000
2. Tentar adicionar compra de R$ 1.500
3. Tentar adicionar compra de R$ 500
4. Tentar adicionar compra de R$ 600

**Resultado Esperado:**
- Erro ao tentar compra acima do limite disponível
- Compra de R$ 500 aceita (limite total = R$ 1.000)
- Erro ao tentar compra de R$ 600 (limite disponível = R$ 500)

### Teste 5: Visualizar Faturas

**Passos:**
1. Adicionar compra parcelada (3x)
2. Clicar na aba "Faturas"
3. Verificar se faturas aparecem com status correto
4. Selecionar um cartão específico para filtrar faturas

**Resultado Esperado:**
- Faturas aparecem com mês, ano e valor correto
- Status exibido com cor apropriada
- Filtro por cartão funciona corretamente

### Teste 6: Visualizar Histórico de Transações

**Passos:**
1. Adicionar várias compras em um cartão
2. Clicar na aba "Histórico"
3. Verificar se todas as transações aparecem
4. Selecionar um cartão para filtrar transações

**Resultado Esperado:**
- Todas as transações listadas com descrição, valor e data
- Parcelamento exibido corretamente (ex: 1/3, 2/3, 3/3)
- Filtro por cartão funciona corretamente

### Teste 7: Deletar Transação

**Passos:**
1. Adicionar compra de R$ 500 em cartão com limite R$ 1.000
2. Verificar que limite usado = R$ 500
3. Deletar a transação
4. Verificar que limite usado volta a 0

**Resultado Esperado:**
- Transação removida do histórico
- Limite do cartão restaurado
- Faturas associadas atualizadas

### Teste 8: Deletar Cartão

**Passos:**
1. Criar cartão com compras e faturas
2. Clicar em deletar cartão
3. Confirmar exclusão

**Resultado Esperado:**
- Cartão removido
- Todas as transações associadas removidas
- Todas as faturas associadas removidas

### Teste 9: Navegação entre Abas

**Passos:**
1. Estar na aba "Cartões"
2. Clicar em "Histórico" de um cartão
3. Verificar se aba muda para "Histórico" com filtro aplicado
4. Clicar em "Faturas"
5. Clicar em "Cartões"

**Resultado Esperado:**
- Navegação suave entre abas
- Filtros mantidos quando apropriado
- Dados consistentes em todas as abas

### Teste 10: Integração com Contas

**Passos:**
1. Ter uma conta com saldo de R$ 2.000
2. Criar fatura de R$ 500
3. Pagar fatura usando a conta
4. Verificar saldo da conta

**Resultado Esperado:**
- Fatura marcada como paga
- Saldo da conta reduzido em R$ 500
- Transação de pagamento registrada

## Casos de Erro Esperados

| Cenário | Erro Esperado | Mensagem |
|---------|--------------|----------|
| Compra sem descrição | Validação | "Preencha descrição e valor" |
| Compra acima do limite | Validação | "Limite insuficiente..." |
| Dia inválido (>31) | Validação | "Dia deve estar entre 1 e 31" |
| Parcelas inválidas (>12) | Validação | "Número de parcelas deve estar entre 1 e 12" |
| Pagar fatura sem saldo | Erro | "Saldo insuficiente em..." |

## Checklist de Funcionalidades

- [ ] Adicionar cartão com validações
- [ ] Adicionar compra com parcelamento
- [ ] Validar limite do cartão
- [ ] Gerar faturas automaticamente
- [ ] Visualizar faturas por status
- [ ] Visualizar histórico de transações
- [ ] Deletar transação e restaurar limite
- [ ] Deletar cartão e limpar dados associados
- [ ] Pagar fatura
- [ ] Filtrar por cartão em faturas e histórico
- [ ] Navegação suave entre abas
- [ ] Mensagens de erro informativas
- [ ] Feedback visual (cores, ícones)

## Notas Importantes

1. **Cálculo de Parcelas**: O valor de cada parcela é calculado automaticamente dividindo o valor total pelo número de parcelas.

2. **Geração de Faturas**: Faturas são geradas automaticamente para cada parcela, considerando o dia de fechamento do cartão.

3. **Limite Disponível**: O limite disponível é sempre recalculado como `limite - usado`.

4. **Status da Fatura**: O status é determinado automaticamente:
   - `future`: Fatura futura (data de vencimento no futuro)
   - `open`: Fatura aberta (vencida mas não paga)
   - `overdue`: Fatura vencida
   - `paid`: Fatura paga

5. **Persistência**: Todos os dados são persistidos automaticamente via `DataContext` e `storage`.

## Próximas Melhorias Sugeridas

1. Implementar pagamento parcial de faturas
2. Adicionar gráficos de gastos por categoria
3. Implementar alertas de limite próximo
4. Adicionar suporte a múltiplas moedas
5. Implementar relatórios mensais
6. Adicionar busca e filtros avançados
