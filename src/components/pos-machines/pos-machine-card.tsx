'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { POSMachine } from '@/contexts/pos-machines-context'
import { formatCurrency } from '@/lib/design-system'
import {
  CreditCard,
  MapPin,
  Wallet,
  TrendingUp,
  Settings,
  Power,
  Wrench,
  AlertCircle,
  Target
} from 'lucide-react'

interface POSMachineCardProps {
  machine: POSMachine
  onClick?: () => void
  onToggleStatus?: () => void
}

export function POSMachineCard({ machine, onClick, onToggleStatus }: POSMachineCardProps) {
  const getStatusBadge = () => {
    switch (machine.status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">نشط</Badge>
      case 'inactive':
        return <Badge variant="secondary">معطل</Badge>
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">صيانة</Badge>
      default:
        return null
    }
  }

  const getStatusIcon = () => {
    switch (machine.status) {
      case 'active':
        return <Power className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'inactive':
        return <Power className="h-4 w-4 text-muted-foreground" />
      case 'maintenance':
        return <Wrench className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      default:
        return null
    }
  }

  // حساب إجمالي الرصيد في جميع الحسابات
  const totalBalance = (machine.accounts ?? []).reduce((sum, acc) => sum + acc.balance, 0)

  // الحساب الرئيسي
  const primaryAccount = (machine.accounts ?? []).find(acc => acc.isPrimary)

  // حالة الهدف
  const getTargetStatus = () => {
    if (!machine.monthlyTarget || machine.monthlyTarget === 0) return null

    const percentage = machine.targetPercentage || 0
    const threshold = machine.penaltyThreshold || 80

    if (percentage >= 100) {
      return { label: 'تم تحقيق الهدف', variant: 'default' as const, color: 'green' }
    } else if (percentage >= threshold) {
      return { label: 'قريب من الهدف', variant: 'secondary' as const, color: 'orange' }
    } else {
      return { label: 'بعيد عن الهدف', variant: 'destructive' as const, color: 'red' }
    }
  }

  const targetStatus = getTargetStatus()

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 bg-card"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-800 rounded-lg shadow-md">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">
                {machine.machineName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {machine.machineId}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge()}
            {getStatusIcon()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* معلومات المزود والموقع */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{machine.provider}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground truncate">{machine.location}</span>
          </div>
        </div>

        {/* الرصيد الإجمالي */}
        <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-200">إجمالي الرصيد</span>
            <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
          </div>
          <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
            {formatCurrency(totalBalance)}
          </p>
          <p className="text-xs text-indigo-600 dark:text-indigo-300 mt-1">
            {(machine.accounts ?? []).length} حساب
          </p>
        </div>

        {/* الحساب الرئيسي */}
        {primaryAccount && (
          <div className="p-3 bg-muted/50 rounded-lg border border-border shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">الحساب الرئيسي</span>
              <Badge variant="default" className="text-xs">رئيسي</Badge>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {primaryAccount.accountName}
            </p>
            <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300 mt-1">
              {formatCurrency(primaryAccount.balance)}
            </p>
          </div>
        )}

        {/* الإحصائيات */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">المعاملات الشهرية</p>
            <p className="text-sm font-semibold text-foreground">
              {machine.totalTransactions?.toLocaleString('en-EG') || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">الإيرادات الشهرية</p>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(machine.monthlyRevenue || 0)}
            </p>
          </div>
        </div>

        {/* الهدف الشهري والغرامات */}
        {machine.monthlyTarget && machine.monthlyTarget > 0 && (
          <div className="pt-3 border-t border-border space-y-3">
            {/* عنوان القسم مع أيقونة التحذير */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">الهدف الشهري</span>
              </div>
              {machine.hasPenalty && (
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                    غرامة متوقعة
                  </span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {formatCurrency(machine.monthlyRevenue || 0)} / {formatCurrency(machine.monthlyTarget)}
                </span>
                <span className={`font-bold ${
                  targetStatus?.color === 'green' ? 'text-green-600 dark:text-green-400' :
                  targetStatus?.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {(machine.targetPercentage || 0).toFixed(1)}%
                </span>
              </div>
              <Progress
                value={Math.min(machine.targetPercentage || 0, 100)}
                className={`h-2 ${
                  targetStatus?.color === 'green' ? '[&>div]:bg-green-600 dark:[&>div]:bg-green-500' :
                  targetStatus?.color === 'orange' ? '[&>div]:bg-orange-600 dark:[&>div]:bg-orange-500' :
                  '[&>div]:bg-red-600 dark:[&>div]:bg-red-500'
                }`}
              />
            </div>

            {/* Badge الحالة */}
            {targetStatus && (
              <div className="flex items-center justify-between">
                <Badge variant={targetStatus.variant}>
                  {targetStatus.label}
                </Badge>
                {machine.hasPenalty && machine.penaltyAmount && machine.penaltyAmount > 0 && (
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                    غرامة: {formatCurrency(machine.penaltyAmount)}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* زر التبديل */}
        {onToggleStatus && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={(e) => {
              e.stopPropagation()
              onToggleStatus()
            }}
          >
            <Settings className="h-4 w-4 ml-2" />
            {machine.status === 'active' ? 'تعطيل الماكينة' : 'تفعيل الماكينة'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

