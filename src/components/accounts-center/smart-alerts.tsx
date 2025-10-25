'use client'

import { useMemo } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, AlertTriangle, Info, TrendingUp, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface AccountType {
  id: string
  title: string
  count: number
  totalBalance: number
}

interface SmartAlertsProps {
  accountTypes: AccountType[]
  totalBalance: number
  totalAccounts: number
}

interface Alert {
  id: string
  type: 'critical' | 'warning' | 'info' | 'success'
  title: string
  description: string
  icon: any
}

export function SmartAlerts({ accountTypes, totalBalance, totalAccounts }: SmartAlertsProps) {
  // حساب متوسط الرصيد
  const averageBalance = useMemo(() => {
    return accountTypes.length > 0 ? totalBalance / accountTypes.length : 0
  }, [totalBalance, accountTypes.length])

  // توليد التنبيهات الذكية
  const alerts = useMemo(() => {
    const generatedAlerts: Alert[] = []

    // 1. تنبيهات الأرصدة المنخفضة جداً (حرجة)
    const criticalAccounts = accountTypes.filter(
      type => type.totalBalance > 0 && type.totalBalance < averageBalance * 0.1
    )
    if (criticalAccounts.length > 0) {
      generatedAlerts.push({
        id: 'critical-balance',
        type: 'critical',
        title: '🔴 تحذير: أرصدة منخفضة جداً',
        description: `يوجد ${criticalAccounts.length} نوع حساب برصيد أقل من 10% من المتوسط: ${criticalAccounts.map(a => a.title).join('، ')}`,
        icon: AlertCircle,
      })
    }

    // 2. تنبيهات الأرصدة المنخفضة (تحذيرية)
    const warningAccounts = accountTypes.filter(
      type => 
        type.totalBalance > 0 && 
        type.totalBalance >= averageBalance * 0.1 && 
        type.totalBalance < averageBalance * 0.3
    )
    if (warningAccounts.length > 0) {
      generatedAlerts.push({
        id: 'warning-balance',
        type: 'warning',
        title: '🟠 تنبيه: أرصدة منخفضة',
        description: `يوجد ${warningAccounts.length} نوع حساب برصيد أقل من 30% من المتوسط: ${warningAccounts.map(a => a.title).join('، ')}`,
        icon: AlertTriangle,
      })
    }

    // 3. تنبيه عدم وجود حسابات
    if (totalAccounts === 0) {
      generatedAlerts.push({
        id: 'no-accounts',
        type: 'info',
        title: 'ℹ️ لا توجد حسابات',
        description: 'لم تقم بإضافة أي حسابات بعد. ابدأ بإضافة حساباتك المالية للاستفادة من جميع الميزات.',
        icon: Info,
      })
    }

    // 4. تنبيه الأرصدة العالية (معلوماتي)
    const highBalanceAccounts = accountTypes.filter(
      type => type.totalBalance > averageBalance * 2
    )
    if (highBalanceAccounts.length > 0) {
      generatedAlerts.push({
        id: 'high-balance',
        type: 'success',
        title: '🟢 أداء ممتاز',
        description: `يوجد ${highBalanceAccounts.length} نوع حساب برصيد أعلى من ضعف المتوسط: ${highBalanceAccounts.map(a => a.title).join('، ')}`,
        icon: TrendingUp,
      })
    }

    // 5. تنبيه التوزيع المتوازن
    if (accountTypes.length >= 3) {
      const maxBalance = Math.max(...accountTypes.map(a => a.totalBalance))
      const minBalance = Math.min(...accountTypes.filter(a => a.totalBalance > 0).map(a => a.totalBalance))
      const balanceRatio = maxBalance > 0 ? minBalance / maxBalance : 0
      
      if (balanceRatio > 0.5) {
        generatedAlerts.push({
          id: 'balanced-distribution',
          type: 'success',
          title: '✅ توزيع متوازن',
          description: 'أرصدتك موزعة بشكل جيد بين الأنواع المختلفة، مما يقلل المخاطر المالية.',
          icon: CheckCircle,
        })
      }
    }

    // 6. تنبيه إجمالي الأرصدة المرتفع
    if (totalBalance > 500000) {
      generatedAlerts.push({
        id: 'high-total-balance',
        type: 'info',
        title: '💎 إجمالي أرصدة مرتفع',
        description: `إجمالي أرصدتك يبلغ ${formatCurrency(totalBalance)}. تأكد من استثمار جزء منها لتحقيق عوائد أفضل.`,
        icon: Info,
      })
    }

    // 7. تنبيه عدد الحسابات الكبير
    if (totalAccounts > 10) {
      generatedAlerts.push({
        id: 'many-accounts',
        type: 'info',
        title: '📊 عدد حسابات كبير',
        description: `لديك ${totalAccounts} حساب. قد ترغب في دمج بعض الحسابات لتسهيل الإدارة.`,
        icon: Info,
      })
    }

    // 8. تنبيه حسابات بدون رصيد
    const emptyAccounts = accountTypes.filter(type => type.totalBalance === 0 && type.count > 0)
    if (emptyAccounts.length > 0) {
      generatedAlerts.push({
        id: 'empty-accounts',
        type: 'warning',
        title: '⚠️ حسابات بدون رصيد',
        description: `يوجد ${emptyAccounts.length} نوع حساب بدون رصيد: ${emptyAccounts.map(a => a.title).join('، ')}. قد ترغب في شحنها أو إزالتها.`,
        icon: AlertTriangle,
      })
    }

    return generatedAlerts
  }, [accountTypes, averageBalance, totalBalance, totalAccounts])

  // إذا لم يكن هناك تنبيهات، لا نعرض المكون
  if (alerts.length === 0) {
    return null
  }

  // ألوان التنبيهات
  const alertStyles = {
    critical: {
      className: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30',
      iconColor: 'text-red-600 dark:text-red-400',
      titleColor: 'text-red-900 dark:text-red-200',
    },
    warning: {
      className: 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      titleColor: 'text-orange-900 dark:text-orange-200',
    },
    info: {
      className: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      titleColor: 'text-blue-900 dark:text-blue-200',
    },
    success: {
      className: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30',
      iconColor: 'text-green-600 dark:text-green-400',
      titleColor: 'text-green-900 dark:text-green-200',
    },
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        التنبيهات الذكية
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        {alerts.map((alert) => {
          const style = alertStyles[alert.type]
          const Icon = alert.icon
          
          return (
            <Alert key={alert.id} className={style.className}>
              <Icon className={`h-4 w-4 ${style.iconColor}`} />
              <AlertTitle className={style.titleColor}>{alert.title}</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                {alert.description}
              </AlertDescription>
            </Alert>
          )
        })}
      </div>
    </div>
  )
}

