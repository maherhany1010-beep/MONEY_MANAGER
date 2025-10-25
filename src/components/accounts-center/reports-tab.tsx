'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { FileText, Download, Printer, Calendar } from 'lucide-react'

interface AccountType {
  id: string
  title: string
  count: number
  totalBalance: number
}

interface ReportsTabProps {
  accountTypes: AccountType[]
  totalBalance: number
  totalAccounts: number
}

export function ReportsTab({ accountTypes, totalBalance, totalAccounts }: ReportsTabProps) {
  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = () => {
    // سيتم استخدام مكون ExportButton الموجود
    alert('سيتم فتح نافذة التصدير')
  }

  // حساب النسب المئوية
  const accountTypesWithPercentage = accountTypes.map(type => ({
    ...type,
    percentage: totalBalance > 0 ? ((type.totalBalance / totalBalance) * 100).toFixed(2) : '0.00',
  }))

  return (
    <div className="space-y-6">
      {/* أزرار الإجراءات */}
      <div className="flex gap-3 flex-wrap">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="h-4 w-4 ml-2" />
          طباعة التقرير
        </Button>
        <Button onClick={handleExportPDF} variant="outline">
          <Download className="h-4 w-4 ml-2" />
          تصدير PDF
        </Button>
        <Button variant="outline">
          <Calendar className="h-4 w-4 ml-2" />
          اختيار الفترة
        </Button>
      </div>

      {/* ملخص التقرير */}
      <Card className="print:shadow-none">
        <CardHeader className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="h-6 w-6" />
                تقرير مركز الحسابات الشامل
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                تاريخ التقرير: {new Date().toLocaleDateString('ar-EG', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {totalAccounts} حساب
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* الملخص التنفيذي */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              📊 الملخص التنفيذي
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-muted-foreground mb-1">إجمالي الأرصدة</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(totalBalance)}
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-muted-foreground mb-1">عدد الحسابات</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {totalAccounts}
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-muted-foreground mb-1">متوسط الرصيد</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(totalAccounts > 0 ? totalBalance / totalAccounts : 0)}
                </p>
              </div>
            </div>
          </div>

          {/* جدول تفصيلي */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              📋 التفاصيل حسب نوع الحساب
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-right p-3 font-semibold border border-border">#</th>
                    <th className="text-right p-3 font-semibold border border-border">نوع الحساب</th>
                    <th className="text-right p-3 font-semibold border border-border">العدد</th>
                    <th className="text-right p-3 font-semibold border border-border">إجمالي الرصيد</th>
                    <th className="text-right p-3 font-semibold border border-border">النسبة من الإجمالي</th>
                    <th className="text-right p-3 font-semibold border border-border">متوسط الرصيد</th>
                  </tr>
                </thead>
                <tbody>
                  {accountTypesWithPercentage.map((type, index) => (
                    <tr key={type.id} className="hover:bg-muted/50">
                      <td className="p-3 border border-border">{index + 1}</td>
                      <td className="p-3 border border-border font-medium">{type.title}</td>
                      <td className="p-3 border border-border">{type.count}</td>
                      <td className="p-3 border border-border font-semibold text-blue-600 dark:text-blue-400">
                        {formatCurrency(type.totalBalance)}
                      </td>
                      <td className="p-3 border border-border">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="bg-indigo-600 dark:bg-indigo-400 h-2 rounded-full"
                              style={{ width: `${type.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold">{type.percentage}%</span>
                        </div>
                      </td>
                      <td className="p-3 border border-border text-muted-foreground">
                        {formatCurrency(type.count > 0 ? type.totalBalance / type.count : 0)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted font-bold">
                    <td colSpan={2} className="p-3 border border-border">الإجمالي</td>
                    <td className="p-3 border border-border">{totalAccounts}</td>
                    <td className="p-3 border border-border text-blue-600 dark:text-blue-400">
                      {formatCurrency(totalBalance)}
                    </td>
                    <td className="p-3 border border-border">100%</td>
                    <td className="p-3 border border-border text-muted-foreground">
                      {formatCurrency(totalAccounts > 0 ? totalBalance / totalAccounts : 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* التحليل والتوصيات */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              💡 التحليل والتوصيات
            </h3>
            <div className="space-y-3">
              {accountTypesWithPercentage.filter(t => parseFloat(t.percentage) > 40).length > 0 && (
                <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="font-semibold text-orange-900 dark:text-orange-200 mb-2">
                    ⚠️ تركيز عالي في نوع واحد
                  </p>
                  <p className="text-sm text-muted-foreground">
                    يوجد تركيز عالي للأرصدة في نوع واحد من الحسابات. يُنصح بتوزيع الأرصدة لتقليل المخاطر.
                  </p>
                </div>
              )}
              
              {totalBalance > 500000 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    💎 فرصة استثمارية
                  </p>
                  <p className="text-sm text-muted-foreground">
                    إجمالي أرصدتك مرتفع ({formatCurrency(totalBalance)}). يمكنك التفكير في استثمار جزء منها لتحقيق عوائد أفضل.
                  </p>
                </div>
              )}

              {accountTypes.filter(t => t.count === 0).length > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="font-semibold text-green-900 dark:text-green-200 mb-2">
                    ✅ فرصة للتوسع
                  </p>
                  <p className="text-sm text-muted-foreground">
                    يوجد أنواع حسابات لم تستخدمها بعد. قد ترغب في استكشاف هذه الخيارات لتنويع محفظتك المالية.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* التذييل */}
          <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            <p>تم إنشاء هذا التقرير تلقائياً من نظام الإدارة المالية الشاملة</p>
            <p className="mt-1">© {new Date().getFullYear()} - جميع الحقوق محفوظة</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

