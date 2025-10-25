'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Users, TrendingUp, DollarSign, Calendar, ArrowRight } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useSavingsCircles } from '@/contexts/savings-circles-context'
import { AddCircleDialog } from '@/components/savings-circles/add-circle-dialog'
import type { SavingsCircle } from '@/types/savings-circles'

export default function SavingsCirclesPage() {
  const router = useRouter()
  const { circles, stats, filter, setFilter } = useSavingsCircles()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // تصنيف الجمعيات
  const managerCircles = circles.filter(c => c.role === 'manager' && c.status === 'active')
  const memberCircles = circles.filter(c => c.role === 'member' && c.status === 'active')
  const completedCircles = circles.filter(c => c.status === 'completed')

  // دالة تنسيق العملة
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // دالة تنسيق التاريخ
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // دالة الحصول على لون الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 dark:bg-green-600'
      case 'completed': return 'bg-gray-500 dark:bg-gray-600'
      case 'cancelled': return 'bg-red-500 dark:bg-red-600'
      case 'pending': return 'bg-yellow-500 dark:bg-yellow-600'
      default: return 'bg-gray-500'
    }
  }

  // دالة الحصول على نص الحالة
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشطة'
      case 'completed': return 'مكتملة'
      case 'cancelled': return 'ملغاة'
      case 'pending': return 'معلقة'
      default: return status
    }
  }

  // مكون بطاقة الجمعية
  const CircleCard = ({ circle }: { circle: SavingsCircle }) => {
    const totalAmount = circle.monthlyAmount * circle.totalMembers
    const progress = (circle.currentRound / circle.duration) * 100

    return (
      <Card className="hover:shadow-lg transition-shadow duration-300 border-2">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{circle.name}</CardTitle>
              {circle.description && (
                <CardDescription className="text-sm">{circle.description}</CardDescription>
              )}
            </div>
            <Badge className={`${getStatusColor(circle.status)} text-white`}>
              {getStatusText(circle.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* المبلغ */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">المبلغ الشهري</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(circle.monthlyAmount)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">المبلغ الكلي</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>

          {/* التقدم */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">التقدم</span>
              <span className="font-semibold">
                الدورة {circle.currentRound} من {circle.duration}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* معلومات إضافية */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{circle.totalMembers} عضو</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(circle.startDate)}</span>
            </div>
          </div>

          {/* دورك */}
          {circle.role === 'member' && circle.myTurnNumber && (
            <div className="pt-2 border-t">
              <Badge variant="outline" className="text-sm">
                دورك: رقم {circle.myTurnNumber}
              </Badge>
            </div>
          )}

          {/* نوع الجمعية */}
          <div className="pt-2 border-t">
            <Badge variant="secondary" className="text-sm">
              {circle.type === 'app-based' ? `📱 ${circle.appName || 'تطبيق'}` : '👥 شخصية'}
            </Badge>
            {circle.hasFees && (
              <Badge variant="outline" className="text-sm mr-2">
                💰 برسوم
              </Badge>
            )}
          </div>

          {/* الأزرار */}
          <div className="flex gap-2 pt-2">
            <Button variant="default" className="flex-1" size="sm">
              عرض التفاصيل
            </Button>
            {circle.role === 'manager' && (
              <Button variant="outline" size="sm">
                إدارة
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6" dir="rtl">

        {/* العنوان والإحصائيات */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">إدارة الجمعيات</h1>
            <p className="text-muted-foreground">
              إدارة جمعياتك المالية وتتبع الدفعات والاستلامات
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} size="lg">
            <Plus className="h-5 w-5 ml-2" />
            إضافة جمعية جديدة
          </Button>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الجمعيات</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCircles}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeCircles} نشطة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الالتزام الشهري</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalMonthlyCommitment)}
            </div>
            <p className="text-xs text-muted-foreground">
              كعضو في الجمعيات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأموال</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalInCircles)}
            </div>
            <p className="text-xs text-muted-foreground">
              في جميع الجمعيات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرسوم المكتسبة</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalFeesEarned)}
            </div>
            <p className="text-xs text-muted-foreground">
              كمدير للجمعيات
            </p>
          </CardContent>
        </Card>
        </div>

        {/* Tabs للجمعيات */}
        <Tabs defaultValue="manager" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manager">
            أنا المدير ({managerCircles.length})
          </TabsTrigger>
          <TabsTrigger value="member">
            أنا عضو ({memberCircles.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            مكتملة ({completedCircles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manager" className="space-y-4">
          {managerCircles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">لا توجد جمعيات تديرها</p>
                <p className="text-sm text-muted-foreground mb-4">
                  ابدأ بإنشاء جمعية جديدة تكون أنت المدير فيها
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة جمعية جديدة
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {managerCircles.map(circle => (
                <CircleCard key={circle.id} circle={circle} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="member" className="space-y-4">
          {memberCircles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">لا توجد جمعيات مشترك فيها</p>
                <p className="text-sm text-muted-foreground mb-4">
                  سجل اشتراكك في جمعية موجودة
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة جمعية
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {memberCircles.map(circle => (
                <CircleCard key={circle.id} circle={circle} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedCircles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">لا توجد جمعيات مكتملة</p>
                <p className="text-sm text-muted-foreground">
                  الجمعيات المكتملة ستظهر هنا
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedCircles.map(circle => (
                <CircleCard key={circle.id} circle={circle} />
              ))}
            </div>
          )}
        </TabsContent>
        </Tabs>

        {/* نافذة إضافة جمعية */}
        <AddCircleDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        />
      </div>
    </AppLayout>
  )
}

