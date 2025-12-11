'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { PageHeader } from '@/components/layout/page-header'
import { CreditCardComponent } from '@/components/credit-card'
import { EmptyState } from '@/components/ui/empty-state'
import { FormSkeleton } from '@/components/ui/skeleton'
import { useCards, CreditCard as CreditCardType } from '@/contexts/cards-context'
import { CardSettingsDialog } from '@/components/cards/card-settings-dialog'
import { usePaymentReminders } from '@/hooks/use-payment-reminders'
import { useAutoFees } from '@/hooks/use-auto-fees'
import { SearchFilter, SearchFilterState } from '@/components/cards/search-filter'
import { CardsStatistics } from '@/components/cards/cards-statistics'
import { CreditCard, Plus } from 'lucide-react'
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
    const banks = new Set(cards.map(card => card.bank_name ?? card.bankName).filter((b): b is string => b !== undefined))
    return Array.from(banks).sort()
  }, [cards])

  // Filter and sort cards
  const filteredAndSortedCards = useMemo(() => {
    let filtered = [...cards]

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(card =>
        (card.name ?? card.card_name ?? '').toLowerCase().includes(query) ||
        (card.card_number_last_four ?? card.cardNumberLastFour ?? '').toLowerCase().includes(query) ||
        (card.bank_name ?? card.bankName ?? '').toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(card =>
        filters.status === 'active' ? (card.isActive || card.status === 'active') : (!card.isActive && card.status !== 'active')
      )
    }

    // Card type filter
    if (filters.cardType !== 'all') {
      filtered = filtered.filter(card => (card.card_type ?? card.cardType) === filters.cardType)
    }

    // Bank filter
    if (filters.bankName !== 'all') {
      filtered = filtered.filter(card => (card.bank_name ?? card.bankName) === filters.bankName)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name-asc':
          return (a.name ?? a.card_name ?? '').localeCompare(b.name ?? b.card_name ?? '', 'ar')
        case 'name-desc':
          return (b.name ?? b.card_name ?? '').localeCompare(a.name ?? a.card_name ?? '', 'ar')
        case 'limit-desc':
          return (b.credit_limit ?? b.creditLimit ?? 0) - (a.credit_limit ?? a.creditLimit ?? 0)
        case 'limit-asc':
          return (a.credit_limit ?? a.creditLimit ?? 0) - (b.credit_limit ?? b.creditLimit ?? 0)
        case 'balance-desc':
          return (b.current_balance ?? b.currentBalance ?? 0) - (a.current_balance ?? a.currentBalance ?? 0)
        case 'balance-asc':
          return (a.current_balance ?? a.currentBalance ?? 0) - (b.current_balance ?? b.currentBalance ?? 0)
        case 'available-desc':
          return ((b.credit_limit ?? b.creditLimit ?? 0) - (b.current_balance ?? b.currentBalance ?? 0)) - ((a.credit_limit ?? a.creditLimit ?? 0) - (a.current_balance ?? a.currentBalance ?? 0))
        case 'available-asc':
          return ((a.credit_limit ?? a.creditLimit ?? 0) - (a.current_balance ?? a.currentBalance ?? 0)) - ((b.credit_limit ?? b.creditLimit ?? 0) - (b.current_balance ?? b.currentBalance ?? 0))
        case 'utilization-desc':
          return ((b.current_balance ?? b.currentBalance ?? 0) / (b.credit_limit ?? b.creditLimit ?? 1)) - ((a.current_balance ?? a.currentBalance ?? 0) / (a.credit_limit ?? a.creditLimit ?? 1))
        case 'utilization-asc':
          return ((a.current_balance ?? a.currentBalance ?? 0) / (a.credit_limit ?? a.creditLimit ?? 1)) - ((b.current_balance ?? b.currentBalance ?? 0) / (b.credit_limit ?? b.creditLimit ?? 1))
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
      // تبديل حالة البطاقة بين active و blocked
      const newStatus = card.status === 'active' ? 'blocked' : 'active'
      updateCard(cardId, { status: newStatus })
      toast.success(
        newStatus === 'active' ? 'تم تفعيل البطاقة' : 'تم تعطيل البطاقة'
      )
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
    <div className="space-y-6">
      <PageHeader
        title="البطاقات الائتمانية"
        description="إدارة شاملة لجميع بطاقاتك الائتمانية ومعاملاتها"
        action={{
          label: 'إضافة بطاقة جديدة',
          onClick: handleAddCard,
          icon: Plus,
        }}
      />

      {/* Cards Section */}
      {cards.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="لا توجد بطاقات ائتمانية"
          description="ابدأ بإضافة بطاقتك الائتمانية الأولى لتتمكن من تتبع مصروفاتك وإدارة أموالك بفعالية"
        />
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Statistics */}
          <CardsStatistics />

          {/* Search and Filter */}
          <SearchFilter
            filters={filters}
            onFiltersChange={setFilters}
            banks={uniqueBanks}
          />

          {/* Cards Grid */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedCards.map((card) => (
              <CreditCardComponent
                key={card.id}
                {...card}
                onToggleActive={() => handleToggleActive(card.id)}
                onPurchase={card.status === 'active' ? () => handlePurchase(card) : undefined}
                onPayment={card.status === 'active' ? () => handlePayment(card) : undefined}
                onSettings={() => handleSettings(card)}
              />
            ))}
          </div>
        </div>
      )}

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
    </div>
  )
}
