'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatementSummary } from '@/components/statements/statement-summary'
import { StatementTransactions } from '@/components/statements/statement-transactions'
import { StatementExport } from '@/components/statements/statement-export'
import { 
  formatCurrency, 
  formatDate,
} from '@/lib/utils'
import { FileText, Download, Calendar, TrendingUp, TrendingDown } from 'lucide-react'

// Mock data - will be replaced with real data from Supabase
const mockStatements: any[] = []

const mockCards: any[] = []

export default function StatementsPage() {
  const [statements] = useState(mockStatements)
  const [selectedCard, setSelectedCard] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('2024')
  const [selectedStatement, setSelectedStatement] = useState(mockStatements[0])

  const filteredStatements = statements.filter(statement => {
    const cardMatch = selectedCard === 'all' || statement.cardId === selectedCard
    const yearMatch = statement.year.toString() === selectedYear
    return cardMatch && yearMatch
  })

  const handleExportStatement = (statementId: string, format: 'pdf' | 'excel') => {
    // Implement export functionality
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
      case 'paid':
        return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
      case 'overdue':
        return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'current':
        return 'حالي'
      case 'paid':
        return 'مسدد'
      case 'overdue':
        return 'متأخر'
      default:
        return 'غير محدد'
    }
  }

  return (
    <>
      <PageHeader
        title="كشوفات الحساب"
        description="عرض وإدارة كشوفات حساب البطاقات الائتمانية"
        action={{
          label: 'تصدير الكشف',
          onClick: () => handleExportStatement(selectedStatement.id, 'pdf'),
          icon: Download,
        }}
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">فلترة الكشوفات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">البطاقة</label>
              <Select value={selectedCard} onValueChange={setSelectedCard}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر البطاقة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع البطاقات</SelectItem>
                  {mockCards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">السنة</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر السنة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Statements List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>قائمة الكشوفات</CardTitle>
              <CardDescription>
                {filteredStatements.length} كشف حساب
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredStatements.map((statement) => (
                  <div
                    key={statement.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent/50 ${
                      selectedStatement.id === statement.id ? 'bg-accent border-primary' : ''
                    }`}
                    onClick={() => setSelectedStatement(statement)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {statement.month}/{statement.year}
                        </span>
                      </div>
                      <Badge className={getStatusColor(statement.status)}>
                        {getStatusLabel(statement.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {statement.cardName}
                    </p>
                    <p className="text-sm font-medium">
                      الرصيد: {formatCurrency(statement.currentBalance)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      تاريخ الاستحقاق: {formatDate(statement.dueDate)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statement Details */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="summary" className="space-y-4">
            <TabsList>
              <TabsTrigger value="summary">ملخص الكشف</TabsTrigger>
              <TabsTrigger value="transactions">المعاملات</TabsTrigger>
              <TabsTrigger value="export">التصدير</TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <StatementSummary statement={selectedStatement} />
            </TabsContent>

            <TabsContent value="transactions">
              <StatementTransactions statementId={selectedStatement.id} />
            </TabsContent>

            <TabsContent value="export">
              <StatementExport 
                statement={selectedStatement}
                onExport={handleExportStatement}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
