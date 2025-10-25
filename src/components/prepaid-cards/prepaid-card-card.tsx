'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { PrepaidCard } from '@/contexts/prepaid-cards-context'
import { Wallet, User, Phone, IdCard, Power, AlertTriangle, RefreshCw, TrendingUp, TrendingDown, ShoppingCart, ArrowRightLeft } from 'lucide-react'

interface PrepaidCardCardProps {
  card: PrepaidCard
  onClick?: () => void
  onToggleActive?: () => void
  onReconcile?: () => void
  onDeposit?: () => void
  onWithdrawal?: () => void
  onPurchase?: () => void
  onTransfer?: () => void
}

export function PrepaidCardCard({ card, onClick, onToggleActive, onReconcile, onDeposit, onWithdrawal, onPurchase, onTransfer }: PrepaidCardCardProps) {
  const getProviderColor = (provider: string) => {
    const p = provider.toLowerCase()
    if (p.includes('فوري')) return 'from-blue-500 to-blue-700'
    if (p.includes('أمان')) return 'from-green-500 to-green-700'
    if (p.includes('ممكن')) return 'from-purple-500 to-purple-700'
    if (p.includes('مصاري')) return 'from-orange-500 to-orange-700'
    return 'from-gray-500 to-gray-700'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 dark:bg-green-950/30 border-green-200 dark:border-green-700 dark:text-green-300" style={{ color: '#15803d' }}>نشطة</Badge>
      case 'suspended':
        return <Badge className="bg-yellow-100 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-700 dark:text-yellow-300" style={{ color: '#a16207' }}>معلقة</Badge>
      case 'blocked':
        return <Badge className="bg-red-100 dark:bg-red-950/30 border-red-200 dark:border-red-700 dark:text-red-300" style={{ color: '#b91c1c' }}>محظورة</Badge>
      case 'expired':
        return <Badge className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 dark:text-gray-300" style={{ color: '#374151' }}>منتهية</Badge>
      default:
        return null
    }
  }

  const dailyPercentage = (card.dailyUsed / card.dailyLimit) * 100
  const monthlyPercentage = (card.monthlyUsed / card.monthlyLimit) * 100

  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
        card.status !== 'active' ? 'opacity-60' : ''
      }`}
      onClick={onClick}
    >
      {/* Header with gradient */}
      <div className={`bg-gradient-to-br ${getProviderColor(card.provider)} p-6 text-white relative`}>
        {card.status !== 'active' && (
          <div className="absolute top-2 left-2">
            <Badge variant="destructive" className="text-xs">
              {card.status === 'suspended' ? 'معلقة' : card.status === 'blocked' ? 'محظورة' : 'منتهية'}
            </Badge>
          </div>
        )}

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            <div>
              <h3 className="font-bold text-lg">{card.cardName}</h3>
              <p className="text-sm opacity-90">{card.provider}</p>
            </div>
          </div>
          {card.isDefault && (
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              افتراضية
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{formatCurrency(card.balance)}</span>
          </div>
          <p className="text-sm opacity-75">الرصيد المتاح</p>

          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-xs opacity-75 mb-1">رقم البطاقة</p>
            <p className="font-mono text-sm">{card.cardNumber.replace(/(.{4})/g, '$1 ').trim()}</p>
          </div>
        </div>
      </div>

      {/* Holder Info */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">الاسم</p>
              <p className="font-medium">{card.holderName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">الهاتف</p>
              <p className="font-medium font-mono">{card.holderPhone}</p>
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <IdCard className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">الرقم القومي</p>
            <p className="font-medium font-mono text-sm">{card.holderNationalId}</p>
          </div>
        </div>
      </div>

      {/* Limits */}
      <div className="p-4 space-y-3">
        {/* Daily Limit */}
        {card.dailyLimit && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">الحد اليومي</span>
              <div className="text-left">
                <p className="font-semibold">{formatCurrency(card.dailyLimit)}</p>
                <p className="text-xs text-gray-500">مستخدم: {formatCurrency(card.dailyUsed)}</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  dailyPercentage > 80 ? 'bg-red-500' :
                  dailyPercentage > 50 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(dailyPercentage, 100)}%` }}
              />
            </div>
            {dailyPercentage > 80 && (
              <div className="flex items-center gap-1 text-xs dark:text-red-400" style={{ color: '#dc2626' }}>
                <AlertTriangle className="h-3 w-3" />
                <span>اقتربت من تجاوز الحد اليومي</span>
              </div>
            )}
          </div>
        )}

        {/* Monthly Limit */}
        {card.monthlyLimit && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">الحد الشهري</span>
              <div className="text-left">
                <p className="font-semibold">{formatCurrency(card.monthlyLimit)}</p>
                <p className="text-xs text-gray-500">مستخدم: {formatCurrency(card.monthlyUsed)}</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  monthlyPercentage > 80 ? 'bg-red-500' :
                  monthlyPercentage > 50 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(monthlyPercentage, 100)}%` }}
              />
            </div>
            {monthlyPercentage > 80 && (
              <div className="flex items-center gap-1 text-xs dark:text-red-400" style={{ color: '#dc2626' }}>
                <AlertTriangle className="h-3 w-3" />
                <span>اقتربت من تجاوز الحد الشهري</span>
              </div>
            )}
          </div>
        )}

        {/* Transaction Limit */}
        {card.transactionLimit && (
          <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="dark:text-blue-300" style={{ color: '#1d4ed8' }}>حد المعاملة الواحدة</span>
              <span className="font-semibold dark:text-blue-100" style={{ color: '#1e3a8a' }}>{formatCurrency(card.transactionLimit)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">إيداعات</p>
            <p className="font-bold dark:text-green-400 text-sm" style={{ color: '#16a34a' }}>{formatCurrency(card.totalDeposits)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">سحوبات</p>
            <p className="font-bold dark:text-red-400 text-sm" style={{ color: '#dc2626' }}>{formatCurrency(card.totalWithdrawals)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">مشتريات</p>
            <p className="font-bold dark:text-blue-400 text-sm" style={{ color: '#2563eb' }}>{formatCurrency(card.totalPurchases)}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <div className="flex items-center justify-between gap-2">
          {getStatusBadge(card.status)}
        </div>

        {/* أزرار المعاملات */}
        {card.status === 'active' && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
              onClick={(e) => {
                e.stopPropagation()
                onDeposit?.()
              }}
            >
              <TrendingUp className="h-4 w-4 ml-2" />
              شحن
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={(e) => {
                e.stopPropagation()
                onWithdrawal?.()
              }}
            >
              <TrendingDown className="h-4 w-4 ml-2" />
              سحب
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              onClick={(e) => {
                e.stopPropagation()
                onPurchase?.()
              }}
            >
              <ShoppingCart className="h-4 w-4 ml-2" />
              شراء
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              onClick={(e) => {
                e.stopPropagation()
                onTransfer?.()
              }}
            >
              <ArrowRightLeft className="h-4 w-4 ml-2" />
              تحويل
            </Button>
          </div>
        )}

        {/* أزرار الإدارة */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
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
            className={card.status === 'active' ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20" : "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"}
            onClick={(e) => {
              e.stopPropagation()
              onToggleActive?.()
            }}
          >
            <Power className="h-4 w-4 ml-2" />
            {card.status === 'active' ? 'تعطيل' : 'تفعيل'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
