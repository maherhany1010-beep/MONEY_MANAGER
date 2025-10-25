import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"
import { ar } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency in Egyptian style with Latin numbers
export function formatCurrency(amount: number, currency: string = 'EGP'): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

  return formatted
}

// Format date in Arabic with Latin numbers
export function formatDate(date: string | Date, formatStr: string = 'dd/MM/yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const formattedDate = format(dateObj, formatStr, { locale: ar })
  return convertToLatinNumbers(formattedDate)
}

// Convert Arabic numbers to Latin numbers
export function convertToLatinNumbers(text: string): string {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  const latinNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

  let result = text
  for (let i = 0; i < arabicNumbers.length; i++) {
    result = result.replace(new RegExp(arabicNumbers[i], 'g'), latinNumbers[i])
  }
  return result
}

// Format number with Latin digits and Arabic locale
export function formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('en-EG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options
  }).format(num)
}

// Format percentage with Latin numbers
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${formatNumber(value, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}%`
}

// Format card number (show only last 4 digits)
export function formatCardNumber(lastFour: string): string {
  return `**** **** **** ${lastFour}`
}

// Get card type icon
export function getCardTypeIcon(cardType: string): string {
  switch (cardType.toLowerCase()) {
    case 'visa':
      return '💳'
    case 'mastercard':
      return '💳'
    case 'amex':
      return '💳'
    default:
      return '💳'
  }
}

// Calculate cashback amount
export function calculateCashback(amount: number, rate: number): number {
  return (amount * rate) / 100
}

// Get transaction type color
export function getTransactionTypeColor(type: string): string {
  switch (type) {
    case 'withdrawal':
      return 'text-red-600'
    case 'deposit':
      return 'text-green-600'
    case 'payment':
      return 'text-blue-600'
    case 'cashback':
      return 'text-purple-600'
    default:
      return 'text-gray-600'
  }
}

// Get transaction type label in Arabic
export function getTransactionTypeLabel(type: string): string {
  switch (type) {
    case 'withdrawal':
      return 'سحب'
    case 'deposit':
      return 'إيداع'
    case 'payment':
      return 'سداد'
    case 'cashback':
      return 'كاش باك'
    default:
      return 'غير محدد'
  }
}

// Get payment status color
export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-100'
    case 'pending':
      return 'text-yellow-600 bg-yellow-100'
    case 'overdue':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

// Get payment status label in Arabic
export function getPaymentStatusLabel(status: string): string {
  switch (status) {
    case 'completed':
      return 'مكتمل'
    case 'pending':
      return 'معلق'
    case 'overdue':
      return 'متأخر'
    default:
      return 'غير محدد'
  }
}

// Calculate available credit
export function calculateAvailableCredit(creditLimit: number, currentBalance: number): number {
  return creditLimit - currentBalance
}

// Calculate credit utilization percentage
export function calculateCreditUtilization(currentBalance: number, creditLimit: number): number {
  if (creditLimit === 0) return 0
  return Math.round((currentBalance / creditLimit) * 100 * 10) / 10 // Round to 1 decimal place
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Validate card number (basic validation)
export function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '')
  return /^\d{13,19}$/.test(cleaned)
}

// Get last 4 digits of card number
export function getLastFourDigits(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '')
  return cleaned.slice(-4)
}
