'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { BankAccount } from '@/contexts/bank-accounts-context'
import { Landmark, TrendingUp, TrendingDown, Settings, Power, RefreshCw } from 'lucide-react'

interface BankAccountCardProps {
  account: BankAccount
  onClick?: () => void
  onToggleActive?: () => void
  onReconcile?: () => void
}

export function BankAccountCard({ account, onClick, onToggleActive, onReconcile }: BankAccountCardProps) {
  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'checking':
        return 'حساب جاري'
      case 'savings':
        return 'حساب توفير'
      case 'current':
        return 'حساب تجاري'
      default:
        return type
    }
  }

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'checking':
        return 'from-blue-500 to-blue-700'
      case 'savings':
        return 'from-green-500 to-green-700'
      case 'current':
        return 'from-purple-500 to-purple-700'
      default:
        return 'from-gray-500 to-gray-700'
    }
  }

  const dailyUsagePercentage = account.dailyLimit 
    ? ((account.monthlySpending || 0) / 30 / account.dailyLimit) * 100 
    : 0

  const monthlyUsagePercentage = account.monthlyLimit 
    ? ((account.monthlySpending || 0) / account.monthlyLimit) * 100 
    : 0

  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${!account.isActive ? 'opacity-60' : ''}`}
      onClick={onClick}
    >
      {/* رأس البطاقة بتدرج لوني */}
      <div className={`bg-gradient-to-br ${getAccountTypeColor(account.accountType)} p-6 text-white relative`}>
        {/* حالة الحساب */}
        {!account.isActive && (
          <div className="absolute top-2 left-2">
            <Badge variant="destructive" className="text-xs">
              معطل
            </Badge>
          </div>
        )}

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Landmark className="h-6 w-6" />
            <div>
              <h3 className="font-bold text-lg">{account.accountName}</h3>
              <p className="text-sm opacity-90">{account.bankName}</p>
            </div>
          </div>
          {account.isDefault && (
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              افتراضي
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{formatCurrency(account.balance)}</span>
          </div>
          <p className="text-sm opacity-75">الرصيد المتاح</p>
        </div>

        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-75">رقم الحساب</span>
            <span className="font-mono">{account.accountNumber}</span>
          </div>
        </div>
      </div>

      {/* محتوى البطاقة */}
      <div className="p-4 space-y-4">
        {/* نوع الحساب */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">نوع الحساب</span>
          <Badge variant="outline">{getAccountTypeLabel(account.accountType)}</Badge>
        </div>

        {/* الحدود */}
        {account.dailyLimit && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">الحد اليومي</span>
              <span className="font-medium">{formatCurrency(account.dailyLimit)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  dailyUsagePercentage > 80 ? 'bg-red-500' : 
                  dailyUsagePercentage > 50 ? 'bg-yellow-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(dailyUsagePercentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {account.monthlyLimit && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">الحد الشهري</span>
              <span className="font-medium">{formatCurrency(account.monthlyLimit)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  monthlyUsagePercentage > 80 ? 'bg-red-500' : 
                  monthlyUsagePercentage > 50 ? 'bg-yellow-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(monthlyUsagePercentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* الإحصائيات */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          <div className="text-center p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <div className="flex items-center justify-center gap-1 dark:text-green-400 mb-1" style={{ color: '#16a34a' }}>
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">إيداعات</span>
            </div>
            <p className="text-sm font-semibold dark:text-green-300" style={{ color: '#15803d' }}>
              {formatCurrency(account.totalDeposits || 0)}
            </p>
          </div>
          <div className="text-center p-2 bg-red-50 dark:bg-red-950/30 rounded-lg">
            <div className="flex items-center justify-center gap-1 dark:text-red-400 mb-1" style={{ color: '#dc2626' }}>
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs">سحوبات</span>
            </div>
            <p className="text-sm font-semibold dark:text-red-300" style={{ color: '#b91c1c' }}>
              {formatCurrency(account.totalWithdrawals || 0)}
            </p>
          </div>
        </div>

        {/* الإنفاق الشهري */}
        {account.monthlySpending !== undefined && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm dark:text-blue-300" style={{ color: '#1d4ed8' }}>الإنفاق الشهري</span>
              <span className="font-semibold dark:text-blue-100" style={{ color: '#1e3a8a' }}>
                {formatCurrency(account.monthlySpending)}
              </span>
            </div>
          </div>
        )}

        {/* أزرار الإجراءات */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onClick?.()
            }}
          >
            <Settings className="h-4 w-4 ml-2" />
            التفاصيل
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={(e) => {
              e.stopPropagation()
              onReconcile?.()
            }}
          >
            <RefreshCw className="h-4 w-4 ml-2" />
            تسوية
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={account.isActive ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
            onClick={(e) => {
              e.stopPropagation()
              onToggleActive?.()
            }}
          >
            <Power className="h-4 w-4 ml-2" />
            {account.isActive ? 'تعطيل' : 'تفعيل'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

