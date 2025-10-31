'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/page-header'
import { CreditCardComponent } from '@/components/credit-card'
import { EmptyState } from '@/components/ui/empty-state'
import { FormSkeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCards, CreditCard as CreditCardType } from '@/contexts/cards-context'
import { CardSettingsDialog } from '@/components/cards/card-settings-dialog'
import { usePaymentReminders } from '@/hooks/use-payment-reminders'
import { useAutoFees } from '@/hooks/use-auto-fees'
import { DashboardStats } from '@/components/cards/dashboard-stats'
import { TopMerchants } from '@/components/cards/top-merchants'
import { BalanceForecast } from '@/components/cards/balance-forecast'
import { SearchFilter, SearchFilterState } from '@/components/cards/search-filter'
import { ReportsTab } from '@/components/cards/reports-tab'
import { CreditCard, Plus, LayoutDashboard, FileText } from 'lucide-react'
import { toast } from '@/lib/toast'

// Dynamic imports للـ Dialogs - تحميل عند الحاجة فقط
const AddCardDialog = dynamic(
  () => import('@/components/cards/add-card-dialog').then(mod => ({ default: mod.AddCardDialog })),
  { loading: () => <FormSkeleton fields={6} /> }
)

const AddPurchaseDialog = dynamic(
  () => import('@/components/cards/add-purchase-dialog').then(mod => ({ default: mod.AddPurchaseDialog })),
  { loading: () => <FormSkeleton fields={5} /> }
)

const AddPaymentDialog = dynamic(
  () => import('@/components/cards/add-payment-dialog').then(mod => ({ default: mod.AddPaymentDialog })),
  { loading: () => <FormSkeleton fields={4} /> }
)

export default function CardsPage() {
  const {
    cards,
    payments,
    updateCard,
    addPurchase,
    addPayment,
  } = useCards()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CreditCardType | null>(null)



  // Search and filter state
  const [filters, setFilters] = useState<SearchFilterState>({
    searchQuery: '',
    status: 'all',
    cardType: 'all',
    bankName: 'all',
    sortBy: 'name-asc',
  })

  // تفعيل تذكيرات الدفع التلقائية
  usePaymentReminders()

  // تفعيل نظام خصم المصاريف والرسوم التلقائي
  useAutoFees()

  // Get unique bank names for filter
  const uniqueBanks = useMemo(() => {
    const banks = new Set(cards.map(card => card.bankName).filter((b): b is string => b !== undefined))
    return Array.from(banks).sort()
  }, [cards])

  // Filter and sort cards
  const filteredAndSortedCards = useMemo(() => {
    let filtered = [...cards]

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(card =>
        (card.name ?? '').toLowerCase().includes(query) ||
        (card.cardNumberLastFour ?? '').toLowerCase().includes(query) ||
        (card.bankName ?? '').toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(card =>
        filters.status === 'active' ? card.isActive : !card.isActive
      )
    }

    // Card type filter
    if (filters.cardType !== 'all') {
      filtered = filtered.filter(card => card.cardType === filters.cardType)
    }

    // Bank filter
    if (filters.bankName !== 'all') {
      filtered = filtered.filter(card => card.bankName === filters.bankName)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name-asc':
          return (a.name ?? '').localeCompare(b.name ?? '', 'ar')
        case 'name-desc':
          return (b.name ?? '').localeCompare(a.name ?? '', 'ar')
        case 'limit-desc':
          return (b.creditLimit ?? 0) - (a.creditLimit ?? 0)
        case 'limit-asc':
          return (a.creditLimit ?? 0) - (b.creditLimit ?? 0)
        case 'balance-desc':
          return (b.currentBalance ?? 0) - (a.currentBalance ?? 0)
        case 'balance-asc':
          return (a.currentBalance ?? 0) - (b.currentBalance ?? 0)
        case 'available-desc':
          return ((b.creditLimit ?? 0) - (b.currentBalance ?? 0)) - ((a.creditLimit ?? 0) - (a.currentBalance ?? 0))
        case 'available-asc':
          return ((a.creditLimit ?? 0) - (a.currentBalance ?? 0)) - ((b.creditLimit ?? 0) - (b.currentBalance ?? 0))
        case 'utilization-desc':
          return ((b.currentBalance ?? 0) / (b.creditLimit ?? 1)) - ((a.currentBalance ?? 0) / (a.creditLimit ?? 1))
        case 'utilization-asc':
          return ((a.currentBalance ?? 0) / (a.creditLimit ?? 1)) - ((b.currentBalance ?? 0) / (b.creditLimit ?? 1))
        default:
          return 0
      }
    })

    return filtered
  }, [cards, filters])

  const handleAddCard = () => {
    setIsAddDialogOpen(true)
  }

  const handleSettings = (card: CreditCardType) => {
    setSelectedCard(card)
    setIsSettingsDialogOpen(true)
  }

  const handleToggleActive = (cardId: string) => {
    const card = cards.find(c => c.id === cardId)
    if (card) {
      updateCard(cardId, { isActive: !card.isActive })
    }
  }

  const handlePurchase = (card: CreditCardType) => {
    setSelectedCard(card)
    setIsPurchaseDialogOpen(true)
  }

  const handlePayment = (card: CreditCardType) => {
    setSelectedCard(card)
    setIsPaymentDialogOpen(true)
  }

  const handlePurchaseAdded = (purchase: any) => {
    if (selectedCard) {
      // إضافة المشتراة إلى قائمة المشتريات
      addPurchase({
        cardId: selectedCard.id,
        merchantName: purchase.beneficiaryAccount,
        category: purchase.category,
        amount: purchase.amount,
        date: purchase.transactionDate,
        description: purchase.description,
        cashbackEarned: purchase.cashback || 0,
      })

      toast.success(
        'تم إضافة المشتراة بنجاح',
        `تم خصم ${purchase.amount} من رصيد البطاقة وإضافته للحساب المستفيد`
      )

      setIsPurchaseDialogOpen(false)
    }
  }

  const handlePaymentAdded = (payment: any) => {
    if (selectedCard) {
      // إضافة السداد إلى قائمة السدادات
      addPayment({
        cardId: selectedCard.id,
        amount: payment.amount,
        date: payment.transactionDate,
        type: payment.paymentType,
        description: payment.description,
      })

      toast.success(
        'تم تسجيل السداد بنجاح',
        `تم سداد ${payment.amount} من البطاقة`
      )

      setIsPaymentDialogOpen(false)
    }
  }

  return (
    <AppLayout>
      <PageHeader
        title="البطاقات الائتمانية"
        description="إدارة شاملة لجميع بطاقاتك الائتمانية ومعاملاتها"
        action={{
          label: 'إضافة بطاقة جديدة',
          onClick: handleAddCard,
          icon: Plus,
        }}
      />

      {/* Tabs - لوحة المعلومات، البطاقات، التقارير */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span>لوحة المعلومات</span>
          </TabsTrigger>
          <TabsTrigger value="cards" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>البطاقات</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>التقارير</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <DashboardStats cards={cards} />

          <div className="grid gap-6 lg:grid-cols-2">
            <TopMerchants cards={cards} payments={payments} />
            <BalanceForecast cards={cards} payments={payments} />
          </div>
        </TabsContent>

        {/* Cards Tab */}
        <TabsContent value="cards">
          {cards.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="لا توجد بطاقات ائتمانية"
              description="ابدأ بإضافة بطاقتك الائتمانية الأولى لتتمكن من تتبع مصروفاتك وإدارة أموالك بفعالية"
              action={{
                label: 'إضافة بطاقة جديدة',
                onClick: handleAddCard,
              }}
            />
          ) : (
            <div className="space-y-6">
              {/* Search and Filter */}
              <SearchFilter
                filters={filters}
                onFiltersChange={setFilters}
                banks={uniqueBanks}
              />

              {/* Cards Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedCards.map((card) => (
                  <CreditCardComponent
                    key={card.id}
                    {...card}
                    onToggleActive={() => handleToggleActive(card.id)}
                    onPurchase={card.isActive ? () => handlePurchase(card) : undefined}
                    onPayment={card.isActive ? () => handlePayment(card) : undefined}
                    onSettings={card.isActive ? () => handleSettings(card) : undefined}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <ReportsTab cards={cards} payments={payments} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddCardDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => {
          setIsAddDialogOpen(false)
        }}
      />

      {selectedCard && (
        <>
          <AddPurchaseDialog
            open={isPurchaseDialogOpen}
            onOpenChange={setIsPurchaseDialogOpen}
            card={selectedCard}
            onAdd={handlePurchaseAdded}
          />

          <AddPaymentDialog
            open={isPaymentDialogOpen}
            onOpenChange={setIsPaymentDialogOpen}
            card={selectedCard}
            onAdd={handlePaymentAdded}
          />

          <CardSettingsDialog
            open={isSettingsDialogOpen}
            onOpenChange={setIsSettingsDialogOpen}
            card={selectedCard}
          />
        </>
      )}
    </AppLayout>
  )
}
