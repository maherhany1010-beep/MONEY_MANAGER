'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { CashVault } from '@/contexts/cash-vaults-context'
import { Vault, MapPin, TrendingUp, TrendingDown, Settings, Power, Lock, Users, AlertTriangle, RefreshCw, ArrowDownToLine, ArrowRightLeft } from 'lucide-react'

interface CashVaultCardProps {
  vault: CashVault
  onClick?: () => void
  onToggleActive?: () => void
  onReconcile?: () => void
  onDeposit?: () => void
  onTransfer?: () => void
}

export function CashVaultCard({ vault, onClick, onToggleActive, onReconcile, onDeposit, onTransfer }: CashVaultCardProps) {
  const getVaultTypeLabel = (type: string) => {
    switch (type) {
      case 'main':
        return 'رئيسية'
      case 'branch':
        return 'فرع'
      case 'personal':
        return 'شخصية'
      case 'emergency':
        return 'طوارئ'
      default:
        return type
    }
  }

  const getVaultTypeColor = (type: string) => {
    switch (type) {
      case 'main':
        return 'from-blue-500 to-blue-700'
      case 'branch':
        return 'from-green-500 to-green-700'
      case 'personal':
        return 'from-purple-500 to-purple-700'
      case 'emergency':
        return 'from-red-500 to-red-700'
      default:
        return 'from-gray-500 to-gray-700'
    }
  }

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'public':
        return <Users className="h-4 w-4" />
      case 'restricted':
        return <Lock className="h-4 w-4" />
      case 'private':
        return <Lock className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getAccessLevelLabel = (level: string) => {
    switch (level) {
      case 'public':
        return 'عام'
      case 'restricted':
        return 'محدود'
      case 'private':
        return 'خاص'
      default:
        return level
    }
  }

  const capacityPercentage = vault.maxCapacity 
    ? (vault.balance / vault.maxCapacity) * 100 
    : 0

  const isNearMinBalance = vault.minBalance && vault.balance <= vault.minBalance * 1.2
  const isNearMaxCapacity = vault.maxCapacity && vault.balance >= vault.maxCapacity * 0.9

  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${!vault.isActive ? 'opacity-60' : ''}`}
      onClick={onClick}
    >
      {/* رأس البطاقة بتدرج لوني */}
      <div className={`bg-gradient-to-br ${getVaultTypeColor(vault.vaultType ?? 'main')} p-6 text-white relative`}>
        {/* حالة الخزينة */}
        {!vault.isActive && (
          <div className="absolute top-2 left-2">
            <Badge variant="destructive" className="text-xs">
              معطلة
            </Badge>
          </div>
        )}

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Vault className="h-6 w-6" />
            <div>
              <h3 className="font-bold text-lg">{vault.vaultName}</h3>
              <div className="flex items-center gap-1 text-sm opacity-90 mt-1">
                <MapPin className="h-3 w-3" />
                <p>{vault.location}</p>
              </div>
            </div>
          </div>
          {vault.isDefault && (
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              افتراضية
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{formatCurrency(vault.balance)}</span>
          </div>
          <p className="text-sm opacity-75">الرصيد المتاح</p>
        </div>

        {vault.maxCapacity && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="opacity-75">السعة</span>
              <span>{formatPercentage(capacityPercentage / 100)}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  capacityPercentage > 90 ? 'bg-red-300' : 
                  capacityPercentage > 70 ? 'bg-yellow-300' : 
                  'bg-green-300'
                }`}
                style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* محتوى البطاقة */}
      <div className="p-4 space-y-4">
        {/* نوع الخزينة ومستوى الوصول */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{getVaultTypeLabel(vault.vaultType ?? 'main')}</Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              {getAccessLevelIcon(vault.accessLevel ?? 'private')}
              <span>{getAccessLevelLabel(vault.accessLevel ?? 'private')}</span>
            </Badge>
          </div>
          {vault.requiresApproval && (
            <Badge variant="destructive" className="text-xs">
              يتطلب موافقة
            </Badge>
          )}
        </div>

        {/* التحذيرات */}
        {(isNearMinBalance || isNearMaxCapacity) && (
          <div className="space-y-2">
            {isNearMinBalance && (
              <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-700 rounded text-xs dark:text-yellow-300" style={{ color: '#a16207' }}>
                <AlertTriangle className="h-3 w-3" />
                <span>الرصيد قريب من الحد الأدنى</span>
              </div>
            )}
            {isNearMaxCapacity && (
              <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-700 rounded text-xs dark:text-red-300" style={{ color: '#b91c1c' }}>
                <AlertTriangle className="h-3 w-3" />
                <span>الخزينة قريبة من السعة القصوى</span>
              </div>
            )}
          </div>
        )}

        {/* الحدود */}
        <div className="space-y-2 text-sm">
          {vault.minBalance !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">الحد الأدنى</span>
              <span className="font-medium">{formatCurrency(vault.minBalance)}</span>
            </div>
          )}
          {vault.dailyWithdrawalLimit !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">حد السحب اليومي</span>
              <span className="font-medium">{formatCurrency(vault.dailyWithdrawalLimit)}</span>
            </div>
          )}
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          <div className="text-center p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <div className="flex items-center justify-center gap-1 dark:text-green-400 mb-1" style={{ color: '#16a34a' }}>
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">إيداعات</span>
            </div>
            <p className="text-sm font-semibold dark:text-green-300" style={{ color: '#15803d' }}>
              {formatCurrency(vault.totalDeposits || 0)}
            </p>
          </div>
          <div className="text-center p-2 bg-red-50 dark:bg-red-950/30 rounded-lg">
            <div className="flex items-center justify-center gap-1 dark:text-red-400 mb-1" style={{ color: '#dc2626' }}>
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs">سحوبات</span>
            </div>
            <p className="text-sm font-semibold dark:text-red-300" style={{ color: '#b91c1c' }}>
              {formatCurrency(vault.totalWithdrawals || 0)}
            </p>
          </div>
        </div>

        {/* المسؤول */}
        {vault.managerName && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <p className="text-xs dark:text-blue-400 mb-1" style={{ color: '#2563eb' }}>المسؤول</p>
            <p className="text-sm font-medium dark:text-blue-100" style={{ color: '#1e3a8a' }}>{vault.managerName}</p>
          </div>
        )}

        {/* أزرار الإجراءات */}
        <div className="space-y-2 pt-3 border-t">
          {/* صف الأزرار الرئيسية */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30"
              onClick={(e) => {
                e.stopPropagation()
                onDeposit?.()
              }}
              disabled={!vault.isActive}
            >
              <ArrowDownToLine className="h-4 w-4 ml-2" />
              شحن
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
              onClick={(e) => {
                e.stopPropagation()
                onTransfer?.()
              }}
              disabled={!vault.isActive}
            >
              <ArrowRightLeft className="h-4 w-4 ml-2" />
              تحويل
            </Button>
          </div>

          {/* صف الأزرار الثانوية */}
          <div className="grid grid-cols-3 gap-2">
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
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
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
              className={vault.isActive ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/30" : "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30"}
              onClick={(e) => {
                e.stopPropagation()
                onToggleActive?.()
              }}
            >
              <Power className="h-4 w-4 ml-2" />
              {vault.isActive ? 'تعطيل' : 'تفعيل'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

