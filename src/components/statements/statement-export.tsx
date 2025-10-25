'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  Download, 
  FileText, 
  Table, 
  Mail, 
  Printer,
  CheckCircle,
  Info
} from 'lucide-react'

interface StatementExportProps {
  statement: {
    id: string
    cardName: string
    month: number
    year: number
    statementDate: string
    dueDate: string
    currentBalance: number
  }
  onExport: (statementId: string, format: 'pdf' | 'excel') => void
}

export function StatementExport({ statement, onExport }: StatementExportProps) {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel'>('pdf')
  const [includeTransactions, setIncludeTransactions] = useState(true)
  const [includeSummary, setIncludeSummary] = useState(true)
  const [includeCharts, setIncludeCharts] = useState(false)
  const [emailAfterExport, setEmailAfterExport] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      onExport(statement.id, selectedFormat)
      
      // Show success message
      console.log('Export completed successfully')
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportOptions = [
    {
      format: 'pdf' as const,
      icon: FileText,
      title: 'PDF',
      description: 'ملف PDF قابل للطباعة والمشاركة',
      features: ['تنسيق احترافي', 'قابل للطباعة', 'يحافظ على التصميم'],
    },
    {
      format: 'excel' as const,
      icon: Table,
      title: 'Excel',
      description: 'جدول بيانات Excel للتحليل والمعالجة',
      features: ['قابل للتعديل', 'مناسب للتحليل', 'يدعم الصيغ'],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Export Format Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">اختيار تنسيق التصدير</CardTitle>
          <CardDescription>
            اختر التنسيق المناسب لاحتياجاتك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {exportOptions.map((option) => {
              const Icon = option.icon
              return (
                <div
                  key={option.format}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedFormat === option.format
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-accent/50'
                  }`}
                  onClick={() => setSelectedFormat(option.format)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-semibold">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                    {selectedFormat === option.format && (
                      <CheckCircle className="h-5 w-5 text-primary mr-auto" />
                    )}
                  </div>
                  <div className="space-y-1">
                    {option.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span className="text-xs text-muted-foreground">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">خيارات التصدير</CardTitle>
          <CardDescription>
            حدد المحتوى الذي تريد تضمينه في التصدير
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="summary"
              checked={includeSummary}
              onCheckedChange={(checked) => setIncludeSummary(checked === true)}
            />
            <Label htmlFor="summary" className="text-sm font-medium">
              تضمين ملخص الكشف
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="transactions"
              checked={includeTransactions}
              onCheckedChange={(checked) => setIncludeTransactions(checked === true)}
            />
            <Label htmlFor="transactions" className="text-sm font-medium">
              تضمين قائمة المعاملات
            </Label>
          </div>

          {selectedFormat === 'pdf' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="charts"
                checked={includeCharts}
                onCheckedChange={(checked) => setIncludeCharts(checked === true)}
              />
              <Label htmlFor="charts" className="text-sm font-medium">
                تضمين الرسوم البيانية
              </Label>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="email"
              checked={emailAfterExport}
              onCheckedChange={(checked) => setEmailAfterExport(checked === true)}
            />
            <Label htmlFor="email" className="text-sm font-medium">
              إرسال نسخة بالبريد الإلكتروني
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Statement Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">معاينة الكشف</CardTitle>
          <CardDescription>
            تفاصيل الكشف الذي سيتم تصديره
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">البطاقة</p>
              <p className="font-semibold">{statement.cardName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">فترة الكشف</p>
              <p className="font-semibold">
                {statement.month}/{statement.year}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">تاريخ الكشف</p>
              <p className="font-semibold">
                {formatDate(statement.statementDate)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">الرصيد الحالي</p>
              <p className="font-semibold text-red-600">
                {formatCurrency(statement.currentBalance)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">تصدير الكشف</CardTitle>
          <CardDescription>
            اضغط على الزر أدناه لبدء عملية التصدير
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              سيتم إنشاء الملف وتحميله تلقائياً. قد تستغرق العملية بضع ثوانٍ.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button
              onClick={handleExport}
              disabled={isExporting || (!includeSummary && !includeTransactions)}
              className="flex-1"
            >
              <Download className="h-4 w-4 ml-2" />
              {isExporting ? 'جاري التصدير...' : `تصدير كـ ${selectedFormat.toUpperCase()}`}
            </Button>

            <Button variant="outline" disabled={isExporting}>
              <Printer className="h-4 w-4 ml-2" />
              طباعة
            </Button>

            {emailAfterExport && (
              <Button variant="outline" disabled={isExporting}>
                <Mail className="h-4 w-4 ml-2" />
                إرسال
              </Button>
            )}
          </div>

          {(!includeSummary && !includeTransactions) && (
            <Alert variant="destructive">
              <AlertDescription>
                يجب اختيار محتوى واحد على الأقل للتصدير
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
