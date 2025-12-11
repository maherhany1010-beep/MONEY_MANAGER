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
  gradient?: string // kept for backward compatibility but not used
  count: number
  totalBalance: number
  route: string
  viewMode: 'grid' | 'list'
}

export function AccountTypeCard({
  title,
  icon: Icon,
  color,
  count,
  totalBalance,
  route,
  viewMode
}: AccountTypeCardProps) {
  // تحديد ألوان الأيقونة والخلفية حسب النوع
  const colorClasses = {
    blue: {
      iconBg: 'bg-blue-500',
      iconText: 'text-white',
      border: 'border-gray-200 dark:border-gray-700',
      balanceText: 'text-blue-600 dark:text-blue-400',
      button: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
    },
    purple: {
      iconBg: 'bg-purple-500',
      iconText: 'text-white',
      border: 'border-gray-200 dark:border-gray-700',
      balanceText: 'text-purple-600 dark:text-purple-400',
      button: 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600'
    },
    green: {
      iconBg: 'bg-green-500',
      iconText: 'text-white',
      border: 'border-gray-200 dark:border-gray-700',
      balanceText: 'text-green-600 dark:text-green-400',
      button: 'bg-green-600 hover:bg-green-700 text-white border-green-600'
    },
    orange: {
      iconBg: 'bg-orange-500',
      iconText: 'text-white',
      border: 'border-gray-200 dark:border-gray-700',
      balanceText: 'text-orange-600 dark:text-orange-400',
      button: 'bg-orange-600 hover:bg-orange-700 text-white border-orange-600'
    },
    indigo: {
      iconBg: 'bg-indigo-500',
      iconText: 'text-white',
      border: 'border-gray-200 dark:border-gray-700',
      balanceText: 'text-indigo-600 dark:text-indigo-400',
      button: 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600'
    },
    cyan: {
      iconBg: 'bg-cyan-500',
      iconText: 'text-white',
      border: 'border-gray-200 dark:border-gray-700',
      balanceText: 'text-cyan-600 dark:text-cyan-400',
      button: 'bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-600'
    }
  }

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-all duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between gap-4">
            {/* الأيقونة والعنوان */}
            <div className="flex items-center gap-4">
              <div className={`p-4 ${colors.iconBg} rounded-xl shadow-sm`}>
                <Icon className={`h-8 w-8 ${colors.iconText}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">{title}</h3>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-sm">
                    {count} {count === 1 ? 'حساب' : 'حسابات'}
                  </Badge>
                  <span className={`text-2xl font-bold ${colors.balanceText}`}>
                    {formatCurrency(totalBalance)}
                  </span>
                </div>
              </div>
            </div>

            {/* زر عرض الكل */}
            <Link href={route}>
              <Button className={`gap-2 ${colors.button}`}>
                عرض الكل
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  // Grid View (الافتراضي)
  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={`p-3 ${colors.iconBg} rounded-xl shadow-sm`}>
            <Icon className={`h-6 w-6 ${colors.iconText}`} />
          </div>
          <Badge variant="secondary">
            {count} {count === 1 ? 'حساب' : 'حسابات'}
          </Badge>
        </div>
        <CardTitle className="mt-4 text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* الرصيد الإجمالي */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">الرصيد الإجمالي</p>
            <p className={`text-2xl font-bold ${colors.balanceText}`}>
              {formatCurrency(totalBalance)}
            </p>
          </div>

          {/* زر عرض الكل */}
          <Link href={route} className="block">
            <Button className={`w-full gap-2 ${colors.button}`}>
              عرض الكل
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

