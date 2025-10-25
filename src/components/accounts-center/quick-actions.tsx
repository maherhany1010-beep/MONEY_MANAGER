'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ArrowRightLeft, 
  Plus, 
  RefreshCw, 
  FileText,
  Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      id: 'transfer',
      title: 'تحويل سريع',
      description: 'تحويل بين الحسابات',
      icon: ArrowRightLeft,
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-950/50',
      onClick: () => router.push('/transfers'),
    },
    {
      id: 'add-account',
      title: 'إضافة حساب',
      description: 'حساب أو بطاقة جديدة',
      icon: Plus,
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      textColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-800',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-950/50',
      onClick: () => {
        // يمكن فتح dialog لاختيار نوع الحساب
        alert('سيتم فتح نافذة اختيار نوع الحساب')
      },
    },
    {
      id: 'refresh',
      title: 'تحديث الأرصدة',
      description: 'تحديث جميع البيانات',
      icon: RefreshCw,
      color: 'purple',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      textColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-200 dark:border-purple-800',
      hoverColor: 'hover:bg-purple-100 dark:hover:bg-purple-950/50',
      onClick: () => {
        window.location.reload()
      },
    },
    {
      id: 'report',
      title: 'طباعة تقرير',
      description: 'تقرير شامل للحسابات',
      icon: FileText,
      color: 'orange',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      textColor: 'text-orange-600 dark:text-orange-400',
      borderColor: 'border-orange-200 dark:border-orange-800',
      hoverColor: 'hover:bg-orange-100 dark:hover:bg-orange-950/50',
      onClick: () => {
        window.print()
      },
    },
  ]

  return (
    <Card className="border-2 border-indigo-200 dark:border-indigo-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          إجراءات سريعة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              onClick={action.onClick}
              className={`h-auto flex-col gap-2 p-4 ${action.borderColor} ${action.hoverColor}`}
            >
              <div className={`p-3 ${action.bgColor} rounded-lg`}>
                <action.icon className={`h-6 w-6 ${action.textColor}`} />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">{action.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {action.description}
                </p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

