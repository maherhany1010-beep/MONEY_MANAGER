'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { AccountTypeCard } from '@/components/accounts-center/account-type-card'
import { SummaryStats } from '@/components/accounts-center/summary-stats'
import { ViewToggle } from '@/components/accounts-center/view-toggle'
import { AdvancedFilter, FilterState } from '@/components/accounts-center/advanced-filter'
import { ExportButton } from '@/components/accounts-center/export-button'
import { QuickActions } from '@/components/accounts-center/quick-actions'
import { ChartsDashboard } from '@/components/accounts-center/charts-dashboard'
import { SmartAlerts } from '@/components/accounts-center/smart-alerts'
import { CashFlowTab } from '@/components/accounts-center/cash-flow-tab'
import { ReportsTab } from '@/components/accounts-center/reports-tab'
import { ComparisonTool } from '@/components/accounts-center/comparison-tool'
import { InsightsPanel } from '@/components/accounts-center/insights-panel'
import { LiveNotifications } from '@/components/accounts-center/live-notifications'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePrepaidCards } from '@/contexts/prepaid-cards-context'
import { useBankAccounts } from '@/contexts/bank-accounts-context'
import { useCashVaults } from '@/contexts/cash-vaults-context'
import { useEWallets } from '@/contexts/e-wallets-context'
import { usePOSMachines } from '@/contexts/pos-machines-context'
import { useSumByField } from '@/hooks/use-memoized-data'
import {
  LayoutGrid,
  CreditCard,
  CircleDollarSign,
  Landmark,
  Vault,
  Wallet,
  Smartphone,
  BarChart3,
  Activity,
  FileText,
  TrendingUp,
  Lightbulb,
  ArrowRight,
} from 'lucide-react'

// Mock data للبطاقات الائتمانية - سيتم استبدالها بـ Context لاحقاً
const mockCreditCards = [
  {
    id: '1',
    name: 'بطاقة البنك الأهلي المصري الذهبية',
    bankName: 'البنك الأهلي المصري',
    cardNumberLastFour: '1234',
    cardType: 'visa' as const,
    creditLimit: 80000,
    currentBalance: 18500,
    cashbackRate: 2.5,
    dueDate: 15,
    isActive: true,
  },
  {
    id: '2',
    name: 'بطاقة بنك مصر البلاتينية',
    bankName: 'بنك مصر',
    cardNumberLastFour: '5678',
    cardType: 'mastercard' as const,
    creditLimit: 100000,
    currentBalance: 15750,
    cashbackRate: 3.0,
    dueDate: 25,
    isActive: true,
  },
  {
    id: '3',
    name: 'بطاقة البنك التجاري الدولي الكلاسيكية',
    bankName: 'البنك التجاري الدولي',
    cardNumberLastFour: '9012',
    cardType: 'visa' as const,
    creditLimit: 50000,
    currentBalance: 12300,
    cashbackRate: 1.5,
    dueDate: 10,
    isActive: true,
  },
]

export default function AccountsCenterPage() {
  const router = useRouter()

  // جلب البيانات من الـ Contexts
  const creditCards = mockCreditCards
  const { cards: prepaidCards } = usePrepaidCards()
  const { accounts: bankAccounts } = useBankAccounts()
  const { vaults: cashVaults } = useCashVaults()
  const { wallets: eWallets } = useEWallets()
  const { machines: posMachines } = usePOSMachines()

  // حالة وضع العرض (Grid/List)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // حالة الفلاتر
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    accountType: 'all',
    minBalance: '',
    maxBalance: '',
    sortBy: 'balance-desc',
  })

  // تحميل تفضيل العرض من localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem('accountsCenterViewMode') as 'grid' | 'list'
    if (savedViewMode) {
      setViewMode(savedViewMode)
    }
  }, [])

  // حفظ تفضيل العرض في localStorage - مع useCallback
  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode)
    localStorage.setItem('accountsCenterViewMode', mode)
  }, [])

  // معالج تغيير الفلاتر - مع useCallback
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
  }, [])

  // حساب الأرصدة الإجمالية لكل نوع مع Memoization
  const creditCardsTotalBalance = useMemo(() => {
    return creditCards.reduce((sum, card) => {
      const availableBalance = card.creditLimit - card.currentBalance
      return sum + availableBalance
    }, 0)
  }, [creditCards])

  const prepaidCardsTotalBalance = useSumByField(prepaidCards, card => card.balance)
  const bankAccountsTotalBalance = useSumByField(bankAccounts, account => account.balance)
  const cashVaultsTotalBalance = useSumByField(cashVaults, vault => vault.balance)
  const eWalletsTotalBalance = useSumByField(eWallets, wallet => wallet.balance)

  // حساب الرصيد الإجمالي لماكينات الدفع مع Memoization
  const posMachinesTotalBalance = useMemo(() => {
    return posMachines.reduce((sum, machine) => {
      const machineBalance = machine.accounts.reduce((accSum, account) => accSum + account.balance, 0)
      return sum + machineBalance
    }, 0)
  }, [posMachines])

  // حساب الإحصائيات الإجمالية مع Memoization
  const totalBalance = useMemo(() => {
    return creditCardsTotalBalance +
      prepaidCardsTotalBalance +
      bankAccountsTotalBalance +
      cashVaultsTotalBalance +
      eWalletsTotalBalance +
      posMachinesTotalBalance
  }, [
    creditCardsTotalBalance,
    prepaidCardsTotalBalance,
    bankAccountsTotalBalance,
    cashVaultsTotalBalance,
    eWalletsTotalBalance,
    posMachinesTotalBalance
  ])

  const totalAccounts = useMemo(() => {
    return creditCards.length +
      prepaidCards.length +
      bankAccounts.length +
      cashVaults.length +
      eWallets.length +
      posMachines.length
  }, [creditCards, prepaidCards, bankAccounts, cashVaults, eWallets, posMachines])

  // إيجاد أعلى وأقل رصيد مع Memoization
  const { highestBalance, lowestBalance } = useMemo(() => {
    const balances = [
      { type: 'البطاقات الائتمانية', amount: creditCardsTotalBalance },
      { type: 'البطاقات مسبقة الدفع', amount: prepaidCardsTotalBalance },
      { type: 'الحسابات البنكية', amount: bankAccountsTotalBalance },
      { type: 'الخزائن النقدية', amount: cashVaultsTotalBalance },
      { type: 'المحافظ الإلكترونية', amount: eWalletsTotalBalance },
      { type: 'ماكينات الدفع الإلكتروني', amount: posMachinesTotalBalance }
    ]

    const highest = balances.reduce((max, current) =>
      current.amount > max.amount ? current : max
    , balances[0])

    const lowest = balances.reduce((min, current) =>
      current.amount < min.amount ? current : min
    , balances[0])

    return { highestBalance: highest, lowestBalance: lowest }
  }, [
    creditCardsTotalBalance,
    prepaidCardsTotalBalance,
    bankAccountsTotalBalance,
    cashVaultsTotalBalance,
    eWalletsTotalBalance,
    posMachinesTotalBalance
  ])

  // بيانات أنواع الحسابات - مع useMemo
  const accountTypes = useMemo(() => [
    {
      id: 'credit-cards',
      title: 'البطاقات الائتمانية',
      icon: CreditCard,
      color: 'blue',
      gradient: 'from-blue-50 to-blue-100',
      count: creditCards.length,
      totalBalance: creditCardsTotalBalance,
      route: '/cards'
    },
    {
      id: 'prepaid-cards',
      title: 'البطاقات مسبقة الدفع',
      icon: CircleDollarSign,
      color: 'purple',
      gradient: 'from-purple-50 to-purple-100',
      count: prepaidCards.length,
      totalBalance: prepaidCardsTotalBalance,
      route: '/prepaid-cards'
    },
    {
      id: 'bank-accounts',
      title: 'الحسابات البنكية',
      icon: Landmark,
      color: 'green',
      gradient: 'from-green-50 to-green-100',
      count: bankAccounts.length,
      totalBalance: bankAccountsTotalBalance,
      route: '/bank-accounts'
    },
    {
      id: 'cash-vaults',
      title: 'الخزائن النقدية',
      icon: Vault,
      color: 'orange',
      gradient: 'from-orange-50 to-orange-100',
      count: cashVaults.length,
      totalBalance: cashVaultsTotalBalance,
      route: '/cash-vaults'
    },
    {
      id: 'e-wallets',
      title: 'المحافظ الإلكترونية',
      icon: Wallet,
      color: 'indigo',
      gradient: 'from-indigo-50 to-indigo-100',
      count: eWallets.length,
      totalBalance: eWalletsTotalBalance,
      route: '/e-wallets'
    },
    {
      id: 'pos-machines',
      title: 'ماكينات الدفع الإلكتروني',
      icon: Smartphone,
      color: 'cyan',
      gradient: 'from-cyan-50 to-cyan-100',
      count: posMachines.length,
      totalBalance: posMachinesTotalBalance,
      route: '/pos-machines'
    }
  ], [
    creditCards.length,
    creditCardsTotalBalance,
    prepaidCards.length,
    prepaidCardsTotalBalance,
    bankAccounts.length,
    bankAccountsTotalBalance,
    cashVaults.length,
    cashVaultsTotalBalance,
    eWallets.length,
    eWalletsTotalBalance,
    posMachines.length,
    posMachinesTotalBalance
  ])

  // تطبيق الفلاتر والترتيب - مع useMemo
  const filteredAndSortedAccountTypes = useMemo(() => {
    let filtered = [...accountTypes]

    // فلترة حسب النوع
    if (filters.accountType !== 'all') {
      filtered = filtered.filter(type => type.id === filters.accountType)
    }

    // فلترة حسب نطاق الرصيد
    if (filters.minBalance) {
      const minBalance = parseFloat(filters.minBalance)
      filtered = filtered.filter(type => type.totalBalance >= minBalance)
    }
    if (filters.maxBalance) {
      const maxBalance = parseFloat(filters.maxBalance)
      filtered = filtered.filter(type => type.totalBalance <= maxBalance)
    }

    // فلترة حسب البحث النصي
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(type =>
        type.title.toLowerCase().includes(query)
      )
    }

    // الترتيب
    switch (filters.sortBy) {
      case 'balance-desc':
        filtered.sort((a, b) => b.totalBalance - a.totalBalance)
        break
      case 'balance-asc':
        filtered.sort((a, b) => a.totalBalance - b.totalBalance)
        break
      case 'name-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title, 'ar'))
        break
      case 'name-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title, 'ar'))
        break
      case 'count-desc':
        filtered.sort((a, b) => b.count - a.count)
        break
      case 'count-asc':
        filtered.sort((a, b) => a.count - b.count)
        break
    }

    return filtered
  }, [accountTypes, filters])

  // بيانات التصدير - مع useMemo
  const exportData = useMemo(() => ({
    totalBalance,
    totalAccounts,
    accountTypes: accountTypes.map(type => ({
      id: type.id,
      title: type.title,
      count: type.count,
      totalBalance: type.totalBalance,
    })),
    timestamp: new Date().toISOString().split('T')[0],
  }), [totalBalance, totalAccounts, accountTypes])

  return (
    <AppLayout>
      {/* زر العودة */}
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/')}
          className="gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى لوحة التحكم
        </Button>
      </div>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <PageHeader
          title="مركز الحسابات"
          description="عرض وإدارة جميع حساباتك المالية في مكان واحد"
        />
        <div className="flex gap-2">
          <LiveNotifications />
          <ExportButton data={exportData} />
        </div>
      </div>

      {/* نظام التبويبات */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">
            <BarChart3 className="h-4 w-4 ml-2" />
            لوحة المعلومات
          </TabsTrigger>
          <TabsTrigger value="balances">
            <Wallet className="h-4 w-4 ml-2" />
            الأرصدة
          </TabsTrigger>
          <TabsTrigger value="cash-flow">
            <Activity className="h-4 w-4 ml-2" />
            التدفقات النقدية
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 ml-2" />
            التحليلات
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4 ml-2" />
            التقارير
          </TabsTrigger>
        </TabsList>

        {/* تبويب لوحة المعلومات */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* الإجراءات السريعة */}
          <QuickActions />

          {/* الإحصائيات الإجمالية */}
          <SummaryStats
            totalBalance={totalBalance}
            totalAccounts={totalAccounts}
            highestBalance={highestBalance}
            lowestBalance={lowestBalance}
          />

          {/* التنبيهات الذكية */}
          <SmartAlerts
            accountTypes={accountTypes}
            totalBalance={totalBalance}
            totalAccounts={totalAccounts}
          />

          {/* الرسوم البيانية */}
          <ChartsDashboard
            accountTypes={accountTypes}
            totalBalance={totalBalance}
          />
        </TabsContent>

        {/* تبويب الأرصدة */}
        <TabsContent value="balances" className="space-y-6">
          <div className="flex justify-end">
            <ViewToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
          </div>

          {/* الفلاتر المتقدمة */}
          <AdvancedFilter
            filters={filters}
            onFiltersChange={handleFiltersChange}
            accountTypes={accountTypes}
          />

          {/* بطاقات أنواع الحسابات */}
          <div className={
            viewMode === 'grid'
              ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
              : 'space-y-4'
          }>
            {filteredAndSortedAccountTypes.map((accountType) => (
              <AccountTypeCard
                key={accountType.id}
                title={accountType.title}
                icon={accountType.icon}
                color={accountType.color}
                gradient={accountType.gradient}
                count={accountType.count}
                totalBalance={accountType.totalBalance}
                route={accountType.route}
                viewMode={viewMode}
              />
            ))}
          </div>

          {/* رسالة في حالة عدم وجود نتائج */}
          {filteredAndSortedAccountTypes.length === 0 && totalAccounts > 0 && (
            <div className="text-center py-12">
              <LayoutGrid className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد نتائج</h3>
              <p className="text-muted-foreground">
                لم يتم العثور على حسابات تطابق معايير البحث
              </p>
            </div>
          )}

          {/* رسالة في حالة عدم وجود حسابات */}
          {totalAccounts === 0 && (
            <div className="text-center py-12">
              <LayoutGrid className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد حسابات بعد</h3>
              <p className="text-muted-foreground">
                ابدأ بإضافة حساباتك المالية لرؤية الملخص هنا
              </p>
            </div>
          )}
        </TabsContent>

        {/* تبويب التدفقات النقدية */}
        <TabsContent value="cash-flow">
          <CashFlowTab totalBalance={totalBalance} />
        </TabsContent>

        {/* تبويب التحليلات المتقدمة */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ComparisonTool />
            </div>
            <div>
              <InsightsPanel />
            </div>
          </div>
        </TabsContent>

        {/* تبويب التقارير */}
        <TabsContent value="reports">
          <ReportsTab
            accountTypes={accountTypes}
            totalBalance={totalBalance}
            totalAccounts={totalAccounts}
          />
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}

