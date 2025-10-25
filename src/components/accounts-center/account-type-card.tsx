'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { ArrowRight, LucideIcon } from 'lucide-react'

interface AccountTypeCardProps {
  title: string
  icon: LucideIcon
  color: string
  gradient: string
  count: number
  totalBalance: number
  route: string
  viewMode: 'grid' | 'list'
}

export function AccountTypeCard({
  title,
  icon: Icon,
  color,
  gradient,
  count,
  totalBalance,
  route,
  viewMode
}: AccountTypeCardProps) {
  // تحديد ألوان الأيقونة والخلفية حسب النوع
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      gradient: 'from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30'
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
      gradient: 'from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30'
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      gradient: 'from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30'
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800',
      gradient: 'from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30'
    },
    indigo: {
      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-200 dark:border-indigo-800',
      gradient: 'from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/30'
    },
    cyan: {
      bg: 'bg-cyan-100 dark:bg-cyan-900/30',
      text: 'text-cyan-600 dark:text-cyan-400',
      border: 'border-cyan-200 dark:border-cyan-800',
      gradient: 'from-cyan-50 to-cyan-100 dark:from-cyan-950/30 dark:to-cyan-900/30'
    }
  }

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue

  if (viewMode === 'list') {
    return (
      <Card className={`border-2 ${colors.border} bg-gradient-to-r ${colors.gradient} hover:shadow-lg transition-all duration-300`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            {/* الأيقونة والعنوان */}
            <div className="flex items-center gap-4">
              <div className={`p-4 ${colors.bg} rounded-xl`}>
                <Icon className={`h-8 w-8 ${colors.text}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">{title}</h3>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-sm">
                    {count} {count === 1 ? 'حساب' : 'حسابات'}
                  </Badge>
                  <span className={`text-2xl font-bold ${colors.text}`}>
                    {formatCurrency(totalBalance)}
                  </span>
                </div>
              </div>
            </div>

            {/* زر عرض الكل */}
            <Link href={route}>
              <Button variant="outline" className="gap-2">
                عرض الكل
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Grid View (الافتراضي)
  return (
    <Card className={`border-2 ${colors.border} bg-gradient-to-br ${colors.gradient} hover:shadow-lg transition-all duration-300`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className={`p-3 ${colors.bg} rounded-lg`}>
            <Icon className={`h-6 w-6 ${colors.text}`} />
          </div>
          <Badge variant="secondary">
            {count} {count === 1 ? 'حساب' : 'حسابات'}
          </Badge>
        </div>
        <CardTitle className="mt-4">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* الرصيد الإجمالي */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">الرصيد الإجمالي</p>
            <p className={`text-2xl font-bold ${colors.text}`}>
              {formatCurrency(totalBalance)}
            </p>
          </div>

          {/* زر عرض الكل */}
          <Link href={route} className="block">
            <Button variant="outline" className="w-full gap-2">
              عرض الكل
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

