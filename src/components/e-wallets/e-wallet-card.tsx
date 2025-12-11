'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { EWallet } from '@/contexts/e-wallets-context'
import { Wallet, Smartphone, Settings, Power, CheckCircle, AlertTriangle, XCircle, Shield, RefreshCw, TrendingUp, Send } from 'lucide-react'

interface EWalletCardProps {
  wallet: EWallet
  onClick?: () => void
  onToggleActive?: () => void
  onReconcile?: () => void
  onDeposit?: () => void
  onTransfer?: () => void
}

export function EWalletCard({ wallet, onClick, onToggleActive, onReconcile, onDeposit, onTransfer }: EWalletCardProps) {
  const getProviderColor = (provider: string) => {
    if (provider.toLowerCase().includes('vodafone')) return 'from-red-100 to-red-200 dark:from-red-800 dark:to-red-900 text-red-900 dark:text-white'
    if (provider.toLowerCase().includes('etisalat')) return 'from-green-100 to-green-200 dark:from-green-800 dark:to-green-900 text-green-900 dark:text-white'
    if (provider.toLowerCase().includes('orange')) return 'from-orange-100 to-orange-200 dark:from-orange-800 dark:to-orange-900 text-orange-900 dark:text-white'
    if (provider.toLowerCase().includes('we')) return 'from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-900 text-purple-900 dark:text-white'
    return 'from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 text-blue-900 dark:text-white'
  }

  const getWalletTypeLabel = (type: string) => {
    switch (type) {
      case 'personal': return 'شخصية'
      case 'business': return 'تجارية'
      case 'savings': return 'توفير'
      default: return type
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'نشطة'
      case 'suspended': return 'معلقة'
      case 'blocked': return 'محظورة'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
      case 'suspended': return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
      case 'blocked': return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
      default: return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getKycLevelLabel = (level?: number) => {
    switch (level) {
      case 1: return 'مستوى 1'
      case 2: return 'مستوى 2'
      case 3: return 'مستوى 3'
      default: return 'غير محدد'
    }
  }

  const dailyUsagePercentage = wallet.dailyLimit 
    ? ((wallet.dailyUsed || 0) / wallet.dailyLimit) * 100 
    : 0

  const monthlyUsagePercentage = wallet.monthlyLimit 
    ? ((wallet.monthlyUsed || 0) / wallet.monthlyLimit) * 100 
    : 0

  const isNearDailyLimit = dailyUsagePercentage > 80
  const isNearMonthlyLimit = monthlyUsagePercentage > 80

  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${wallet.status !== 'active' ? 'opacity-60' : ''}`}
      onClick={onClick}
    >
      {/* رأس البطاقة بتدرج لوني */}
      <div className={`bg-gradient-to-br ${getProviderColor(wallet.provider ?? '')} p-6 relative`}>
        {/* حالة المحفظة */}
        {wallet.status !== 'active' && (
          <div className="absolute top-2 left-2">
            <Badge variant="destructive" className="text-xs">
              {wallet.status === 'suspended' ? 'معلقة' : 'محظورة'}
            </Badge>
          </div>
        )}

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            <div>
              <h3 className="font-bold text-lg">{wallet.walletName}</h3>
              <p className="text-sm opacity-90">{wallet.provider}</p>
            </div>
          </div>
          {wallet.isDefault && (
            <Badge variant="secondary" className="bg-black/10 dark:bg-white/20 border-black/20 dark:border-white/30">
              افتراضية
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm opacity-90">
            <Smartphone className="h-4 w-4" />
            <p className="font-mono">{wallet.phoneNumber}</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{formatCurrency(wallet.balance)}</span>
          </div>
          <p className="text-sm opacity-75">الرصيد المتاح</p>
        </div>
      </div>

      {/* محتوى البطاقة */}
      <div className="p-4 space-y-4">
        {/* الحالة والتحقق */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(wallet.status)}>
              {getStatusLabel(wallet.status)}
            </Badge>
            <Badge variant="outline">{getWalletTypeLabel(wallet.walletType ?? '')}</Badge>
          </div>
          <div className="flex items-center gap-2">
            {wallet.isVerified ? (
              <Badge variant="default" className="bg-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                <span>موثقة</span>
              </Badge>
            ) : (
              <Badge variant="destructive" className="flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                <span>غير موثقة</span>
              </Badge>
            )}
            {wallet.kycLevel && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>{getKycLevelLabel(wallet.kycLevel)}</span>
              </Badge>
            )}
          </div>
        </div>

        {/* التحذيرات */}
        {(isNearDailyLimit || isNearMonthlyLimit) && (
          <div className="space-y-2">
            {isNearDailyLimit && (
              <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-700 rounded text-xs dark:text-yellow-300" style={{ color: '#a16207' }}>
                <AlertTriangle className="h-3 w-3" />
                <span>اقتربت من الحد اليومي</span>
              </div>
            )}
            {isNearMonthlyLimit && (
              <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-700 rounded text-xs dark:text-red-300" style={{ color: '#b91c1c' }}>
                <AlertTriangle className="h-3 w-3" />
                <span>اقتربت من الحد الشهري</span>
              </div>
            )}
          </div>
        )}

        {/* الحدود اليومية */}
        {wallet.dailyLimit && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">الحد اليومي</span>
              <div className="text-left">
                <span className="font-medium text-foreground">{formatCurrency(wallet.dailyUsed || 0)}</span>
                <span className="text-muted-foreground"> / {formatCurrency(wallet.dailyLimit)}</span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
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

        {/* الحدود الشهرية */}
        {wallet.monthlyLimit && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">الحد الشهري</span>
              <div className="text-left">
                <span className="font-medium text-foreground">{formatCurrency(wallet.monthlyUsed || 0)}</span>
                <span className="text-muted-foreground"> / {formatCurrency(wallet.monthlyLimit)}</span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
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

        {/* حد المعاملة */}
        {wallet.transactionLimit && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-600 dark:text-blue-400">حد المعاملة الواحدة</span>
              <span className="font-bold text-blue-900 dark:text-blue-100">{formatCurrency(wallet.transactionLimit)}</span>
            </div>
          </div>
        )}

        {/* الإحصائيات */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t">
          <div className="text-center p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <p className="text-xs text-green-600 dark:text-green-400 mb-1">إيداعات</p>
            <p className="text-sm font-semibold text-green-900 dark:text-green-100">
              {wallet.totalDeposits ? formatCurrency(wallet.totalDeposits) : '-'}
            </p>
          </div>
          <div className="text-center p-2 bg-red-50 dark:bg-red-950/30 rounded-lg">
            <p className="text-xs text-red-600 dark:text-red-400 mb-1">سحوبات</p>
            <p className="text-sm font-semibold text-red-900 dark:text-red-100">
              {wallet.totalWithdrawals ? formatCurrency(wallet.totalWithdrawals) : '-'}
            </p>
          </div>
          <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">تحويلات</p>
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              {wallet.totalTransfers ? formatCurrency(wallet.totalTransfers) : '-'}
            </p>
          </div>
        </div>

        {/* صاحب المحفظة */}
        {wallet.holderName && (
          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
            <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">صاحب المحفظة</p>
            <p className="text-sm font-medium text-purple-900 dark:text-purple-100">{wallet.holderName}</p>
          </div>
        )}

        {/* أزرار الإجراءات */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={(e) => {
              e.stopPropagation()
              onDeposit?.()
            }}
          >
            <TrendingUp className="h-4 w-4 ml-2" />
            إيداع
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={(e) => {
              e.stopPropagation()
              onTransfer?.()
            }}
          >
            <Send className="h-4 w-4 ml-2" />
            تحويل
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2">
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
            className={wallet.status === 'active' ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
            onClick={(e) => {
              e.stopPropagation()
              onToggleActive?.()
            }}
          >
            <Power className="h-4 w-4 ml-2" />
            {wallet.status === 'active' ? 'تعطيل' : 'تفعيل'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

