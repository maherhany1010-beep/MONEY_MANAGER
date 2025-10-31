'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/page-header'
import { PrepaidCardCard } from '@/components/prepaid-cards/prepaid-card-card'
import { AddPrepaidCardDialog } from '@/components/prepaid-cards/add-prepaid-card-dialog'
import { AddDepositDialog } from '@/components/prepaid-cards/add-deposit-dialog'
import { AddWithdrawalDialog } from '@/components/prepaid-cards/add-withdrawal-dialog'
import { AddPurchaseDialog } from '@/components/prepaid-cards/add-purchase-dialog'
import { AddTransferDialog } from '@/components/prepaid-cards/add-transfer-dialog'
import { ReconciliationDialog } from '@/components/reconciliation/reconciliation-dialog'
import { DashboardStats } from '@/components/prepaid-cards/dashboard-stats'
import { TopMerchants } from '@/components/prepaid-cards/top-merchants'
import { BalanceForecast } from '@/components/prepaid-cards/balance-forecast'
import { ReportsTab } from '@/components/prepaid-cards/reports-tab'
import { SearchFilter, SearchFilterState } from '@/components/prepaid-cards/search-filter'
import { EmptyState } from '@/components/ui/empty-state'
import { StatCard } from '@/components/ui/stat-card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePrepaidCards, PrepaidCard } from '@/contexts/prepaid-cards-context'
import { usePrepaidLimitsReset } from '@/hooks/use-prepaid-limits-reset'
import { usePrepaidAlerts } from '@/hooks/use-prepaid-alerts'
import { Wallet, Plus, DollarSign, TrendingUp, Activity, CreditCard, TrendingDown, ShoppingCart, ArrowRightLeft, BarChart3, LayoutDashboard } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/design-system'

export default function PrepaidCardsPage() {
  const router = useRouter()
  const { cards, updateCards, getAllTransactions } = usePrepaidCards()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false)
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false)
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false)
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [isReconciliationDialogOpen, setIsReconciliationDialogOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<PrepaidCard | null>(null)

  // Search and Filter State
  const [filters, setFilters] = useState<SearchFilterState>({
    searchQuery: '',
    status: 'all',
    cardType: 'all',
    provider: 'all',
    sortBy: 'balance-desc',
  })

  // تفعيل إعادة تعيين الحدود التلقائي
  usePrepaidLimitsReset()

  // تفعيل نظام التنبيهات الذكي
  usePrepaidAlerts()

  // معالج إضافة بطاقة جديدة
  const handleAddCard = (newCard: any) => {
    const card = {
      ...newCard,
      id: Date.now().toString(),
      status: 'active',
      dailyUsed: 0,
      monthlyUsed: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalPurchases: 0,
      transactionCount: 0,
      depositFee: 0,
      withdrawalFee: 0,
      purchaseFee: 0,
      createdDate: new Date().toISOString().split('T')[0],
      issueDate: new Date().toISOString().split('T')[0],
    }
    updateCards([...cards, card])
  }

  // Filter and Sort Cards
  const filteredAndSortedCards = useMemo(() => {
    let filtered = cards

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(
        card =>
          (card.cardName ?? '').toLowerCase().includes(query) ||
          (card.cardNumber ?? '').toLowerCase().includes(query) ||
          (card.provider ?? '').toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(card => card.status === filters.status)
    }

    // Card type filter
    if (filters.cardType !== 'all') {
      filtered = filtered.filter(card => card.cardType === filters.cardType)
    }

    // Provider filter
    if (filters.provider !== 'all') {
      filtered = filtered.filter(card => (card.provider ?? '').includes(filters.provider))
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (filters.sortBy) {
        case 'balance-desc':
          return b.balance - a.balance
        case 'balance-asc':
          return a.balance - b.balance
        case 'usage-desc':
          return ((b.dailyUsed ?? 0) + (b.monthlyUsed ?? 0)) - ((a.dailyUsed ?? 0) + (a.monthlyUsed ?? 0))
        case 'usage-asc':
          return ((a.dailyUsed ?? 0) + (a.monthlyUsed ?? 0)) - ((b.dailyUsed ?? 0) + (b.monthlyUsed ?? 0))
        case 'date-desc':
          return new Date(b.issueDate ?? 0).getTime() - new Date(a.issueDate ?? 0).getTime()
        case 'date-asc':
          return new Date(a.issueDate ?? 0).getTime() - new Date(b.issueDate ?? 0).getTime()
        case 'name-asc':
          return (a.cardName ?? a.card_name ?? '').localeCompare((b.cardName ?? b.card_name ?? ''), 'ar')
        case 'name-desc':
          return (b.cardName ?? b.card_name ?? '').localeCompare((a.cardName ?? a.card_name ?? ''), 'ar')
        default:
          return 0
      }
    })

    return sorted
  }, [cards, filters])

  const handleCardClick = (id: string) => {
    router.push(`/prepaid-cards/${id}`)
  }

  const handleToggleActive = (id: string) => {
    const updatedCards = cards.map(card =>
      card.id === id
        ? { ...card, status: card.status === 'active' ? 'suspended' : 'active' as const }
        : card
    )
    updateCards(updatedCards as any)
  }

  const handleReconcile = (card: PrepaidCard) => {
    setSelectedCard(card)
    setIsReconciliationDialogOpen(true)
  }

  const handleReconcileConfirm = (actualBalance: number, difference: number, notes?: string) => {
    if (selectedCard) {
      const updatedCards = cards.map(c =>
        c.id === selectedCard.id
          ? { ...c, balance: actualBalance }
          : c
      )
      updateCards(updatedCards)
    }
  }

  // حساب الإحصائيات الإجمالية
  const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0)
  const activeCards = cards.filter(card => card.status === 'active').length
  const totalDailyLimit = cards.reduce((sum, card) => sum + (card.dailyLimit || 0), 0)
  const totalMonthlyLimit = cards.reduce((sum, card) => sum + (card.monthlyLimit || 0), 0)
  const totalTransactions = cards.reduce((sum, card) => sum + (card.transactionCount || 0), 0)

  return (
    <AppLayout>
      <PageHeader
        title="البطاقات المسبقة الدفع"
        description="إدارة البطاقات المسبقة الدفع ومتابعة الحدود والمعاملات (فوري، أمان، ممكن)"
        action={{
          label: 'إضافة بطاقة جديدة',
          icon: Plus,
          onClick: () => setIsAddDialogOpen(true),
        }}
      />

      {/* أزرار الإجراءات السريعة */}
      {cards.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            onClick={() => {
              if (cards.length > 0) {
                setSelectedCard(cards[0])
                setIsDepositDialogOpen(true)
              }
            }}
            className="flex items-center gap-2"
            variant="outline"
          >
            <TrendingUp className="h-4 w-4" />
            شحن بطاقة
          </Button>
          <Button
            onClick={() => {
              if (cards.length > 0) {
                setSelectedCard(cards[0])
                setIsWithdrawalDialogOpen(true)
              }
            }}
            className="flex items-center gap-2"
            variant="outline"
          >
            <TrendingDown className="h-4 w-4" />
            سحب نقدي
          </Button>
          <Button
            onClick={() => {
              if (cards.length > 0) {
                setSelectedCard(cards[0])
                setIsPurchaseDialogOpen(true)
              }
            }}
            className="flex items-center gap-2"
            variant="outline"
          >
            <ShoppingCart className="h-4 w-4" />
            تسجيل شراء
          </Button>
          <Button
            onClick={() => {
              if (cards.length > 0) {
                setSelectedCard(cards[0])
                setIsTransferDialogOpen(true)
              }
            }}
            className="flex items-center gap-2"
            variant="outline"
          >
            <ArrowRightLeft className="h-4 w-4" />
            تحويل بين البطاقات
          </Button>
        </div>
      )}

      {/* الإحصائيات الإجمالية */}
      {cards.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="إجمالي الرصيد"
            value={formatCurrency(totalBalance)}
            subtitle={`${cards.length} بطاقة`}
            icon={DollarSign}
            variant="blue"
          />

          <StatCard
            title="البطاقات النشطة"
            value={`${activeCards} / ${cards.length}`}
            subtitle="بطاقة نشطة"
            icon={CreditCard}
            variant="green"
          />

          <StatCard
            title="الحد اليومي الإجمالي"
            value={formatCurrency(totalDailyLimit)}
            subtitle="حد يومي"
            icon={TrendingUp}
            variant="purple"
          />

          <StatCard
            title="إجمالي المعاملات"
            value={formatNumber(totalTransactions)}
            subtitle="معاملة"
            icon={Activity}
            variant="orange"
          />
        </div>
      )}

      {cards.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="لا توجد بطاقات مسبقة الدفع"
          description="ابدأ بإضافة بطاقاتك المسبقة الدفع (فوري، أمان، ممكن) لإدارة أموالك بشكل أفضل"
          action={{
            label: 'إضافة بطاقة جديدة',
            onClick: () => setIsAddDialogOpen(true),
          }}
        />
      ) : (
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">
              <LayoutDashboard className="h-4 w-4 ml-2" />
              لوحة المعلومات
            </TabsTrigger>
            <TabsTrigger value="cards">
              <CreditCard className="h-4 w-4 ml-2" />
              البطاقات
            </TabsTrigger>
            <TabsTrigger value="reports">
              <BarChart3 className="h-4 w-4 ml-2" />
              التقارير
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Dashboard Stats */}
            <DashboardStats cards={cards} transactions={getAllTransactions()} />

            {/* Top Merchants and Balance Forecast */}
            <div className="grid gap-6 md:grid-cols-2">
              <TopMerchants transactions={getAllTransactions()} />
              <BalanceForecast cards={cards} transactions={getAllTransactions()} />
            </div>
          </TabsContent>

          {/* Cards Tab */}
          <TabsContent value="cards" className="space-y-6">
            {/* Search and Filter */}
            <SearchFilter
              filters={filters}
              onFiltersChange={setFilters}
              onReset={() =>
                setFilters({
                  searchQuery: '',
                  status: 'all',
                  cardType: 'all',
                  provider: 'all',
                  sortBy: 'balance-desc',
                })
              }
            />

            {/* Cards Grid */}
            {filteredAndSortedCards.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>لا توجد بطاقات تطابق معايير البحث</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedCards.map((card) => (
                  <PrepaidCardCard
                    key={card.id}
                    card={card}
                    onClick={() => handleCardClick(card.id)}
                    onToggleActive={() => handleToggleActive(card.id)}
                    onReconcile={() => handleReconcile(card)}
                    onDeposit={() => {
                      setSelectedCard(card)
                      setIsDepositDialogOpen(true)
                    }}
                    onWithdrawal={() => {
                      setSelectedCard(card)
                      setIsWithdrawalDialogOpen(true)
                    }}
                    onPurchase={() => {
                      setSelectedCard(card)
                      setIsPurchaseDialogOpen(true)
                    }}
                    onTransfer={() => {
                      setSelectedCard(card)
                      setIsTransferDialogOpen(true)
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <ReportsTab cards={cards} transactions={getAllTransactions()} />
          </TabsContent>
        </Tabs>
      )}

      {/* نموذج إضافة بطاقة جديدة */}
      <AddPrepaidCardDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddCard}
      />

      {selectedCard && (
        <>
          <ReconciliationDialog
            open={isReconciliationDialogOpen}
            onOpenChange={setIsReconciliationDialogOpen}
            accountId={selectedCard.id}
            accountName={selectedCard.cardName ?? selectedCard.card_name ?? 'بطاقة'}
            accountType="prepaid_card"
            currentBalance={selectedCard.balance}
            onReconcile={handleReconcileConfirm}
          />

          <AddDepositDialog
            open={isDepositDialogOpen}
            onOpenChange={setIsDepositDialogOpen}
            card={selectedCard}
          />

          <AddWithdrawalDialog
            open={isWithdrawalDialogOpen}
            onOpenChange={setIsWithdrawalDialogOpen}
            card={selectedCard}
          />

          <AddPurchaseDialog
            open={isPurchaseDialogOpen}
            onOpenChange={setIsPurchaseDialogOpen}
            card={selectedCard}
          />

          <AddTransferDialog
            open={isTransferDialogOpen}
            onOpenChange={setIsTransferDialogOpen}
            card={selectedCard}
          />
        </>
      )}
    </AppLayout>
  )
}
