'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  formatCurrency,
  formatCardNumber,
  calculateCreditUtilization,
  formatPercentage,
  getCardTypeIcon
} from '@/lib/utils'
import { ShoppingCart, Wallet, Settings, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'

type CardTier = 'classic' | 'gold' | 'platinum' | 'titanium' | 'black'

interface CreditCardProps {
  id: string
  name?: string
  card_name?: string
  bankName?: string
  bank_name?: string
  cardNumberLastFour?: string
  card_number_last_four?: string
  cardType?: 'visa' | 'mastercard' | 'amex' | 'other'
  card_type?: 'visa' | 'mastercard' | 'amex' | 'other'
  cardTier?: CardTier
  creditLimit?: number
  credit_limit?: number
  currentBalance?: number
  current_balance?: number
  cashbackRate?: number
  dueDate?: number
  due_date?: number
  isActive?: boolean
  status?: 'active' | 'blocked' | 'cancelled'
  onEdit?: () => void
  onToggleActive?: () => void
  onClick?: () => void
  onPurchase?: () => void
  onPayment?: () => void
  onSettings?: () => void
  [key: string]: any
}

export function CreditCardComponent(props: CreditCardProps) {
  const {
    name,
    card_name,
    bankName,
    bank_name,
    cardNumberLastFour,
    card_number_last_four,
    cardType,
    card_type,
    cardTier,
    creditLimit,
    credit_limit,
    currentBalance,
    current_balance,
    cashbackRate,
    dueDate,
    due_date,
    isActive = true,
    status,
    onToggleActive,
    onClick,
    onPurchase,
    onPayment,
    onSettings
  } = props

  const displayName = name ?? card_name ?? 'بطاقة ائتمان'
  const displayBankName = bankName ?? bank_name ?? 'بنك'
  const displayCardNumberLastFour = cardNumberLastFour ?? card_number_last_four ?? '0000'
  const displayCardType = cardType ?? card_type ?? 'visa'
  const displayCardTier = cardTier ?? 'classic'
  const displayCreditLimit = creditLimit ?? credit_limit ?? 0
  const displayCurrentBalance = currentBalance ?? current_balance ?? 0
  const displayCashbackRate = cashbackRate ?? 0
  const displayDueDate = dueDate ?? due_date ?? 1
  const displayIsActive = isActive ?? (status === 'active')

  const utilizationPercentage = calculateCreditUtilization(displayCurrentBalance, displayCreditLimit)

  // Get gradient based on card tier
  const getCardGradient = (tier: CardTier) => {
    switch (tier) {
      case 'classic':
        return 'bg-gradient-to-br from-gray-500 to-gray-700'
      case 'gold':
        return 'bg-gradient-to-br from-yellow-500 to-yellow-700'
      case 'platinum':
        return 'bg-gradient-to-br from-slate-400 to-slate-600'
      case 'titanium':
        return 'bg-gradient-to-br from-zinc-600 to-zinc-800'
      case 'black':
        return 'bg-gradient-to-br from-black to-gray-900'
      default:
        return 'bg-gradient-to-br from-gray-600 to-gray-800'
    }
  }

  return (
    <Card
      className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${!displayIsActive ? 'opacity-60' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Card Front */}
        <div className={`${getCardGradient(displayCardTier)} text-white p-6 relative`}>
          {/* حالة البطاقة */}
          {!displayIsActive && (
            <div className="absolute top-2 left-2">
              <Badge variant="destructive" className="text-xs">
                معطلة
              </Badge>
            </div>
          )}

          {/* Card Type Icon */}
          <div className="flex justify-between items-start mb-4">
            <div className="text-2xl">{getCardTypeIcon(displayCardType)}</div>
          </div>

          {/* Card Number */}
          <div className="mb-4">
            <p className="text-lg font-mono tracking-wider">
              {formatCardNumber(displayCardNumberLastFour)}
            </p>
          </div>

          {/* Card Info */}
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs opacity-80 mb-1">اسم البطاقة</p>
              <p className="font-semibold">{displayName}</p>
            </div>
            <div className="text-left">
              <p className="text-xs opacity-80 mb-1">البنك</p>
              <p className="font-semibold">{displayBankName}</p>
            </div>
          </div>
        </div>

        {/* Card Details */}
        <div className="p-4 space-y-3">
          {/* Credit Limit & Balance */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">الحد الائتماني</p>
              <p className="font-semibold">{formatCurrency(displayCreditLimit)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">الرصيد الحالي</p>
              <p className="font-semibold text-red-600">{formatCurrency(displayCurrentBalance)}</p>
            </div>
          </div>

          {/* Utilization Bar */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-muted-foreground">نسبة الاستخدام</p>
              <p className="text-xs font-medium">{formatPercentage(utilizationPercentage)}</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  utilizationPercentage > 80
                    ? 'bg-red-500'
                    : utilizationPercentage > 50
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                كاش باك {formatPercentage(displayCashbackRate)}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              تاريخ السداد: {displayDueDate}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1"
              onClick={(e) => {
                e.stopPropagation()
                onPurchase?.()
              }}
              disabled={!onPurchase || !isActive}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="text-xs">شراء</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30"
              onClick={(e) => {
                e.stopPropagation()
                onPayment?.()
              }}
              disabled={!onPayment || !isActive}
            >
              <Wallet className="h-4 w-4" />
              <span className="text-xs">سداد</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1"
              onClick={(e) => {
                e.stopPropagation()
                onSettings?.()
              }}
              disabled={!onSettings || !isActive}
            >
              <Settings className="h-4 w-4" />
              <span className="text-xs">إعدادات</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={`w-full gap-1 ${
                isActive
                  ? 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30'
                  : 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                onToggleActive?.()
              }}
              title={isActive ? 'تعطيل البطاقة' : 'تفعيل البطاقة'}
            >
              <Power className="h-4 w-4" />
              <span className="text-xs">{isActive ? 'تعطيل' : 'تفعيل'}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
