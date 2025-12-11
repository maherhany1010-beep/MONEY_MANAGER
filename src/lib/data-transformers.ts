/**
 * Data Transformers
 * 
 * Utility functions to transform data between snake_case (database) 
 * and camelCase (frontend) formats.
 * 
 * @module lib/data-transformers
 */

// ===================================
// 🔄 Generic Transformers
// ===================================

/**
 * Convert a string from snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Convert a string from camelCase to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

/**
 * Transform object keys from snake_case to camelCase
 */
export function transformToCamelCase<T extends Record<string, unknown>>(
  obj: T
): Record<string, unknown> {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => transformToCamelCase(item as Record<string, unknown>)) as unknown as Record<string, unknown>
  }

  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = snakeToCamel(key)
    const value = obj[key]
    
    acc[camelKey] = value !== null && typeof value === 'object' 
      ? transformToCamelCase(value as Record<string, unknown>)
      : value
    
    return acc
  }, {} as Record<string, unknown>)
}

/**
 * Transform object keys from camelCase to snake_case
 */
export function transformToSnakeCase<T extends Record<string, unknown>>(
  obj: T
): Record<string, unknown> {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => transformToSnakeCase(item as Record<string, unknown>)) as unknown as Record<string, unknown>
  }

  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = camelToSnake(key)
    const value = obj[key]
    
    acc[snakeKey] = value !== null && typeof value === 'object'
      ? transformToSnakeCase(value as Record<string, unknown>)
      : value
    
    return acc
  }, {} as Record<string, unknown>)
}

// ===================================
// 🏦 Entity-Specific Transformers
// ===================================

/**
 * Transform bank account from DB format to frontend format
 */
export function transformBankAccount(dbData: Record<string, unknown>) {
  return {
    id: dbData.id as string,
    userId: dbData.user_id as string | undefined,
    accountName: dbData.account_name as string,
    bankName: dbData.bank_name as string,
    accountNumber: dbData.account_number as string,
    balance: dbData.balance as number,
    currency: dbData.currency as string,
    accountType: dbData.account_type as string,
    status: dbData.status as string,
    iban: dbData.iban as string | undefined,
    swiftCode: dbData.swift_code as string | undefined,
    isActive: dbData.status === 'active',
    isDefault: dbData.is_default as boolean | undefined,
    dailyLimit: dbData.daily_limit as number | undefined,
    monthlyLimit: dbData.monthly_limit as number | undefined,
    createdAt: dbData.created_at as string | undefined,
    updatedAt: dbData.updated_at as string | undefined,
  }
}

/**
 * Transform bank account from frontend format to DB format
 */
export function transformBankAccountToDB(frontendData: Record<string, unknown>) {
  return {
    account_name: frontendData.accountName,
    bank_name: frontendData.bankName,
    account_number: frontendData.accountNumber,
    balance: frontendData.balance,
    currency: frontendData.currency ?? 'EGP',
    account_type: frontendData.accountType ?? 'checking',
    status: frontendData.isActive !== false ? 'active' : 'inactive',
    iban: frontendData.iban,
    swift_code: frontendData.swiftCode,
    is_default: frontendData.isDefault,
    daily_limit: frontendData.dailyLimit,
    monthly_limit: frontendData.monthlyLimit,
  }
}

/**
 * Transform credit card from DB format to frontend format
 */
export function transformCreditCard(dbData: Record<string, unknown>) {
  return {
    id: dbData.id as string,
    userId: dbData.user_id as string | undefined,
    name: dbData.card_name as string,
    bankName: dbData.bank_name as string,
    cardNumberLastFour: dbData.card_number_last_four as string,
    cardType: dbData.card_type as 'visa' | 'mastercard' | 'amex' | 'other',
    creditLimit: dbData.credit_limit as number,
    currentBalance: dbData.current_balance as number,
    availableCredit: dbData.available_credit as number,
    dueDate: dbData.due_date as number,
    minimumPayment: dbData.minimum_payment as number,
    interestRate: dbData.interest_rate as number,
    status: dbData.status as 'active' | 'blocked' | 'cancelled',
    isActive: dbData.status === 'active',
    createdAt: dbData.created_at as string | undefined,
    updatedAt: dbData.updated_at as string | undefined,
  }
}

/**
 * Transform credit card from frontend format to DB format
 */
export function transformCreditCardToDB(frontendData: Record<string, unknown>) {
  return {
    card_name: frontendData.name,
    bank_name: frontendData.bankName,
    card_number_last_four: frontendData.cardNumberLastFour,
    card_type: frontendData.cardType ?? 'visa',
    credit_limit: frontendData.creditLimit,
    current_balance: frontendData.currentBalance ?? 0,
    available_credit: frontendData.availableCredit ?? frontendData.creditLimit,
    due_date: frontendData.dueDate,
    minimum_payment: frontendData.minimumPayment ?? 0,
    interest_rate: frontendData.interestRate ?? 0,
    status: frontendData.isActive !== false ? 'active' : 'blocked',
  }
}

/**
 * Transform prepaid card from DB format to frontend format
 */
export function transformPrepaidCard(dbData: Record<string, unknown>) {
  return {
    id: dbData.id as string,
    userId: dbData.user_id as string | undefined,
    cardName: dbData.card_name as string,
    cardNumber: dbData.card_number as string | null,
    balance: dbData.balance as number,
    currency: dbData.currency as string,
    expiryDate: dbData.expiry_date as string | null,
    status: dbData.status as string,
    provider: dbData.provider as string | undefined,
    cardType: dbData.card_type as string | undefined,
    isReloadable: dbData.is_reloadable as boolean | undefined,
    maxBalance: dbData.max_balance as number | undefined,
    dailyLimit: dbData.daily_limit as number | undefined,
    monthlyLimit: dbData.monthly_limit as number | undefined,
    transactionLimit: dbData.transaction_limit as number | undefined,
    dailyUsed: dbData.daily_used as number | undefined,
    monthlyUsed: dbData.monthly_used as number | undefined,
    holderName: dbData.holder_name as string | undefined,
    holderPhone: dbData.holder_phone as string | undefined,
    isDefault: dbData.is_default as boolean | undefined,
    createdAt: dbData.created_at as string | undefined,
    updatedAt: dbData.updated_at as string | undefined,
  }
}

/**
 * Transform prepaid card from frontend format to DB format
 */
export function transformPrepaidCardToDB(frontendData: Record<string, unknown>) {
  return {
    card_name: frontendData.cardName,
    card_number: frontendData.cardNumber,
    balance: frontendData.balance ?? 0,
    currency: frontendData.currency ?? 'EGP',
    expiry_date: frontendData.expiryDate,
    status: frontendData.status ?? 'active',
    provider: frontendData.provider,
    card_type: frontendData.cardType,
    is_reloadable: frontendData.isReloadable,
    max_balance: frontendData.maxBalance,
    daily_limit: frontendData.dailyLimit,
    monthly_limit: frontendData.monthlyLimit,
    transaction_limit: frontendData.transactionLimit,
    holder_name: frontendData.holderName,
    holder_phone: frontendData.holderPhone,
    is_default: frontendData.isDefault,
  }
}

/**
 * Transform e-wallet from DB format to frontend format
 */
export function transformEWallet(dbData: Record<string, unknown>) {
  return {
    id: dbData.id as string,
    userId: dbData.user_id as string | undefined,
    walletName: dbData.wallet_name as string,
    walletType: dbData.wallet_type as string,
    phoneNumber: dbData.phone_number as string | null,
    balance: dbData.balance as number,
    currency: dbData.currency as string,
    status: dbData.status as string,
    provider: dbData.provider as string | undefined,
    isDefault: dbData.is_default as boolean | undefined,
    dailyLimit: dbData.daily_limit as number | undefined,
    monthlyLimit: dbData.monthly_limit as number | undefined,
    dailyUsed: dbData.daily_used as number | undefined,
    monthlyUsed: dbData.monthly_used as number | undefined,
    holderName: dbData.holder_name as string | undefined,
    isVerified: dbData.is_verified as boolean | undefined,
    createdAt: dbData.created_at as string | undefined,
    updatedAt: dbData.updated_at as string | undefined,
  }
}

/**
 * Transform e-wallet from frontend format to DB format
 */
export function transformEWalletToDB(frontendData: Record<string, unknown>) {
  return {
    wallet_name: frontendData.walletName,
    wallet_type: frontendData.walletType ?? 'other',
    phone_number: frontendData.phoneNumber,
    balance: frontendData.balance ?? 0,
    currency: frontendData.currency ?? 'EGP',
    status: frontendData.status ?? 'active',
    provider: frontendData.provider,
    is_default: frontendData.isDefault,
    daily_limit: frontendData.dailyLimit,
    monthly_limit: frontendData.monthlyLimit,
    holder_name: frontendData.holderName,
  }
}

/**
 * Transform cash vault from DB format to frontend format
 */
export function transformCashVault(dbData: Record<string, unknown>) {
  return {
    id: dbData.id as string,
    userId: dbData.user_id as string | undefined,
    vaultName: dbData.vault_name as string,
    location: dbData.location as string | null,
    balance: dbData.balance as number,
    currency: dbData.currency as string,
    isDefault: dbData.is_default as boolean | undefined,
    isActive: dbData.is_active as boolean ?? true,
    maxCapacity: dbData.max_capacity as number | undefined,
    minBalance: dbData.min_balance as number | undefined,
    vaultType: dbData.vault_type as string | undefined,
    managerName: dbData.manager_name as string | undefined,
    managerPhone: dbData.manager_phone as string | undefined,
    createdAt: dbData.created_at as string | undefined,
    updatedAt: dbData.updated_at as string | undefined,
  }
}

/**
 * Transform cash vault from frontend format to DB format
 */
export function transformCashVaultToDB(frontendData: Record<string, unknown>) {
  return {
    vault_name: frontendData.vaultName,
    location: frontendData.location,
    balance: frontendData.balance ?? 0,
    currency: frontendData.currency ?? 'EGP',
    is_default: frontendData.isDefault,
    is_active: frontendData.isActive ?? true,
    max_capacity: frontendData.maxCapacity,
    min_balance: frontendData.minBalance,
    vault_type: frontendData.vaultType,
    manager_name: frontendData.managerName,
    manager_phone: frontendData.managerPhone,
  }
}

/**
 * Transform POS machine from DB format to frontend format
 */
export function transformPOSMachine(dbData: Record<string, unknown>) {
  return {
    id: dbData.id as string,
    userId: dbData.user_id as string | undefined,
    machineName: dbData.machine_name as string,
    machineId: dbData.machine_id as string,
    location: dbData.location as string | null,
    balance: dbData.balance as number,
    currency: dbData.currency as string,
    status: dbData.status as string,
    provider: dbData.provider as string | undefined,
    feePercentage: dbData.fee_percentage as number | undefined,
    isDefault: dbData.is_default as boolean | undefined,
    createdAt: dbData.created_at as string | undefined,
    updatedAt: dbData.updated_at as string | undefined,
  }
}

/**
 * Transform POS machine from frontend format to DB format
 */
export function transformPOSMachineToDB(frontendData: Record<string, unknown>) {
  return {
    machine_name: frontendData.machineName,
    machine_id: frontendData.machineId,
    location: frontendData.location,
    balance: frontendData.balance ?? 0,
    currency: frontendData.currency ?? 'EGP',
    status: frontendData.status ?? 'active',
    provider: frontendData.provider,
    fee_percentage: frontendData.feePercentage,
    is_default: frontendData.isDefault,
  }
}

// ===================================
// 📦 Batch Transform Helpers
// ===================================

/**
 * Transform an array of items using a specific transformer
 */
export function transformArray<T, R>(
  items: T[],
  transformer: (item: T) => R
): R[] {
  return items.map(transformer)
}

