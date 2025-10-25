'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Lightbulb,
  TrendingUp,
  AlertCircle,
  Target,
  Zap,
  ArrowRight,
  Lock,
  Activity,
} from 'lucide-react'

interface Insight {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  action?: string
}

interface Goal {
  id: string
  title: string
  target: number
  current: number
  icon: React.ReactNode
  color: string
}

interface QuickShortcut {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  action: string
}

export function InsightsPanel() {
  const insights = useMemo<Insight[]>(() => [
    {
      id: '1',
      title: 'أكثر حساب نشاطاً',
      description: 'البطاقة الذهبية - 45 عملية هذا الشهر',
      icon: <Activity className="h-4 w-4" />,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    },
    {
      id: '2',
      title: 'أعلى نمو شهري',
      description: 'الحساب البنكي الرئيسي - نمو بنسبة 18.5%',
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    },
    {
      id: '3',
      title: 'توصيات التحسين',
      description: 'إعادة توزيع الأموال لتحسين العائد',
      icon: <Lightbulb className="h-4 w-4" />,
      color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    },
    {
      id: '4',
      title: 'تنبيهات الأمان',
      description: 'حساب واحد لم يتم استخدامه منذ 60 يوم',
      icon: <AlertCircle className="h-4 w-4" />,
      color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    },
  ], [])

  const goals = useMemo<Goal[]>(() => [
    {
      id: '1',
      title: 'هدف التوفير الشهري',
      target: 100000,
      current: 75000,
      icon: <Target className="h-4 w-4" />,
      color: 'bg-blue-500',
    },
    {
      id: '2',
      title: 'هدف الاستثمار',
      target: 500000,
      current: 320000,
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'bg-green-500',
    },
    {
      id: '3',
      title: 'هدف الطوارئ',
      target: 200000,
      current: 180000,
      icon: <Lock className="h-4 w-4" />,
      color: 'bg-purple-500',
    },
  ], [])

  const shortcuts = useMemo<QuickShortcut[]>(() => [
    {
      id: '1',
      title: 'تحويل سريع',
      description: 'إلى البطاقة الذهبية',
      icon: <Zap className="h-4 w-4" />,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      action: 'transfer',
    },
    {
      id: '2',
      title: 'إيداع',
      description: 'إلى الحساب الرئيسي',
      icon: <ArrowRight className="h-4 w-4" />,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      action: 'deposit',
    },
    {
      id: '3',
      title: 'سحب',
      description: 'من محفظة الهاتف',
      icon: <ArrowRight className="h-4 w-4" />,
      color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      action: 'withdraw',
    },
  ], [])

  const getProgressPercent = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  return (
    <div className="space-y-6">
      {/* الرؤى الذكية */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          الرؤى الذكية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight) => (
            <Card key={insight.id}>
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${insight.color}`}>
                    {insight.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{insight.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                    {insight.action && (
                      <Button variant="link" size="sm" className="mt-2 h-auto p-0">
                        اعرف المزيد
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="border-t my-6" />

      {/* الأهداف المالية */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5" />
          الأهداف المالية
        </h3>
        <div className="space-y-4">
          {goals.map((goal) => {
            const percent = getProgressPercent(goal.current, goal.target)
            return (
              <Card key={goal.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white ${goal.color}`}>
                        {goal.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{goal.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {(goal.current / 1000).toFixed(0)}K من {(goal.target / 1000).toFixed(0)}K
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{percent.toFixed(0)}%</Badge>
                  </div>
                  <Progress value={percent} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    متبقي: {((goal.target - goal.current) / 1000).toFixed(0)}K جنيه
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="border-t my-6" />

      {/* الاختصارات السريعة */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          الاختصارات السريعة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shortcuts.map((shortcut) => (
            <Button
              key={shortcut.id}
              variant="outline"
              className={`h-auto py-4 flex flex-col items-start gap-2 ${shortcut.color}`}
            >
              <div className="flex items-center gap-2 w-full">
                {shortcut.icon}
                <span className="font-semibold text-sm">{shortcut.title}</span>
              </div>
              <span className="text-xs text-muted-foreground">{shortcut.description}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* نصائح إضافية */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            نصيحة اليوم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            يمكنك تحسين عائد استثمارك بنسبة 5% من خلال إعادة توزيع الأموال بين الحسابات ذات العائد الأعلى.
            جرب استخدام أداة المقارنة لمعرفة أفضل الخيارات.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

