/**
 * Provider Groups
 * 
 * This module exports grouped providers to reduce nesting depth
 * in the main layout.tsx file.
 * 
 * Instead of 17+ nested providers, we now have 5 logical groups:
 * 1. CoreProvider - Settings, Theme, Auth, Notifications
 * 2. FinancialAccountsProvider - Bank Accounts, Vaults, Wallets, Cards, POS
 * 3. CardsAndCashbackProvider - Credit Cards, Cashback, Merchants
 * 4. BusinessProvider - Customers, Products, Sales
 * 5. InvestmentsAndSavingsProvider - Investments, Savings Circles
 */

export { CoreProvider } from './core-provider'
export { FinancialAccountsProvider } from './financial-accounts-provider'
export { CardsAndCashbackProvider } from './cards-provider'
export { BusinessProvider } from './business-provider'
export { InvestmentsAndSavingsProvider } from './investments-provider'

