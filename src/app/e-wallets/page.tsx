'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { EWalletCard } from '@/components/e-wallets/e-wallet-card'
import { AddEWalletDialog } from '@/components/e-wallets/add-e-wallet-dialog'
import { DepositDialog } from '@/components/e-wallets/deposit-dialog'
import { TransferDialog } from '@/components/e-wallets/transfer-dialog'
import { ReconciliationDialog } from '@/components/reconciliation/reconciliation-dialog'
import { DashboardStats } from '@/components/e-wallets/dashboard-stats'
import { TopTransactions } from '@/components/e-wallets/top-transactions'
import { BalanceForecast } from '@/components/e-wallets/balance-forecast'
import { SearchFilter, SearchFilterState } from '@/components/e-wallets/search-filter'
import { ReportsTab } from '@/components/e-wallets/reports-tab'
import { EmptyState } from '@/components/ui/empty-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEWallets, EWallet } from '@/contexts/e-wallets-context'
import { Wallet, Plus, LayoutDashboard, Grid3x3, FileText } from 'lucide-react'

export default function EWalletsPage() {
  const router = useRouter()
  const { wallets, updateWallets, addWallet } = useEWallets()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isReconciliationDialogOpen, setIsReconciliationDialogOpen] = useState(false)
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false)
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<EWallet | null>(null)

  // Search and filter state
  const [filters, setFilters] = useState<SearchFilterState>({
    searchQuery: '',
    status: 'all',
    provider: 'all',
    sortBy: 'name-asc',
  })

  // معالج إضافة محفظة جديدة - يحفظ في قاعدة البيانات
  const handleAddWallet = async (newWallet: any) => {
    // تحويل أسماء الحقول من camelCase إلى snake_case للتوافق مع قاعدة البيانات
    const walletData = {
      wallet_name: newWallet.walletName || newWallet.provider,
      wallet_type: newWallet.provider?.toLowerCase().replace(/ /g, '_') || 'other',
      phone_number: newWallet.phoneNumber || null,
      balance: parseFloat(newWallet.balance) || 0,
      currency: 'EGP',
      status: 'active',
    }

    await addWallet(walletData)
  }

  const handleToggleActive = (id: string) => {
    const updatedWallets = wallets.map(w =>
      w.id === id
        ? { ...w, status: w.status === 'active' ? 'suspended' : 'active' }
        : w
    )
    updateWallets(updatedWallets as any)
  }

  const handleCardClick = (walletId: string) => {
    router.push(`/e-wallets/${walletId}`)
  }

  const handleReconcile = (wallet: EWallet) => {
    setSelectedWallet(wallet)
    setIsReconciliationDialogOpen(true)
  }

  const handleDeposit = (wallet: EWallet) => {
    setSelectedWallet(wallet)
    setIsDepositDialogOpen(true)
  }

  const handleTransfer = (wallet: EWallet) => {
    setSelectedWallet(wallet)
    setIsTransferDialogOpen(true)
  }

  const handleReconcileConfirm = (actualBalance: number, difference: number, notes?: string) => {
    if (selectedWallet) {
      // Update wallet balance
      const updatedWallets = wallets.map(w =>
        w.id === selectedWallet.id
          ? { ...w, balance: actualBalance }
          : w
      )
      updateWallets(updatedWallets)
    }
  }

  // Get unique providers for filter
  const providers = useMemo(() => {
    const uniqueProviders = new Set(wallets.map(w => w.provider))
    return Array.from(uniqueProviders).filter(Boolean) as string[]
  }, [wallets])

  // Filter and sort wallets
  const filteredAndSortedWallets = useMemo(() => {
    let filtered = [...wallets]

    // Apply search
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(w =>
        (w.walletName ?? w.wallet_name ?? '').toLowerCase().includes(query) ||
        (w.provider ?? '').toLowerCase().includes(query) ||
        w.phoneNumber?.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(w =>
        filters.status === 'active' ? w.status === 'active' : w.status !== 'active'
      )
    }

    // Apply provider filter
    if (filters.provider !== 'all') {
      filtered = filtered.filter(w => w.provider === filters.provider)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name-asc':
          return (a.walletName ?? a.wallet_name ?? '').localeCompare((b.walletName ?? b.wallet_name ?? ''), 'ar')
        case 'name-desc':
          return (b.walletName ?? b.wallet_name ?? '').localeCompare((a.walletName ?? a.wallet_name ?? ''), 'ar')
        case 'balance-desc':
          return b.balance - a.balance
        case 'balance-asc':
          return a.balance - b.balance
        case 'transactions-desc':
          return (b.transactionCount || 0) - (a.transactionCount || 0)
        case 'transactions-asc':
          return (a.transactionCount || 0) - (b.transactionCount || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [wallets, filters])

  return (
    <>
      <PageHeader
        title="المحافظ الإلكترونية"
        description="إدارة المحافظ الإلكترونية ومتابعة الحدود والمعاملات"
        action={{
          label: 'إضافة محفظة جديدة',
          icon: Plus,
          onClick: () => setIsAddDialogOpen(true),
        }}
      />

      {wallets.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="لا توجد محافظ إلكترونية"
          description="ابدأ بإضافة محافظك الإلكترونية لإدارة أموالك بشكل أفضل"
          action={{
            label: 'إضافة محفظة جديدة',
            onClick: () => setIsAddDialogOpen(true),
          }}
        />
      ) : (
        <Tabs defaultValue="dashboard" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="dashboard" className="gap-2 text-xs sm:text-sm">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">لوحة المعلومات</span>
              <span className="sm:hidden">لوحة</span>
            </TabsTrigger>
            <TabsTrigger value="wallets" className="gap-2 text-xs sm:text-sm">
              <Grid3x3 className="h-4 w-4" />
              المحافظ
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2 text-xs sm:text-sm">
              <FileText className="h-4 w-4" />
              التقارير
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4 sm:space-y-6 mt-0">
            <DashboardStats wallets={wallets} />

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <TopTransactions wallets={wallets} />
              <BalanceForecast wallets={wallets} />
            </div>
          </TabsContent>

          {/* Wallets Tab */}
          <TabsContent value="wallets" className="space-y-4 sm:space-y-6 mt-0">
            <SearchFilter
              filters={filters}
              onFiltersChange={setFilters}
              providers={providers}
            />

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedWallets.map((wallet) => (
                <EWalletCard
                  key={wallet.id}
                  wallet={wallet}
                  onClick={() => handleCardClick(wallet.id)}
                  onToggleActive={() => handleToggleActive(wallet.id)}
                  onReconcile={() => handleReconcile(wallet)}
                  onDeposit={() => handleDeposit(wallet)}
                  onTransfer={() => handleTransfer(wallet)}
                />
              ))}
            </div>

            {filteredAndSortedWallets.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <Wallet className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-50" />
                <p className="text-sm sm:text-base text-muted-foreground">لا توجد محافظ تطابق معايير البحث</p>
              </div>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-0">
            <ReportsTab wallets={wallets} />
          </TabsContent>
        </Tabs>
      )}

      <AddEWalletDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddWallet}
      />

      {selectedWallet && (
        <>
          <ReconciliationDialog
            open={isReconciliationDialogOpen}
            onOpenChange={setIsReconciliationDialogOpen}
            accountId={selectedWallet.id}
            accountName={selectedWallet.walletName ?? selectedWallet.wallet_name ?? 'محفظة'}
            accountType="e_wallet"
            currentBalance={selectedWallet.balance}
            onReconcile={handleReconcileConfirm}
          />

          <DepositDialog
            open={isDepositDialogOpen}
            onOpenChange={setIsDepositDialogOpen}
            wallet={selectedWallet}
          />

          <TransferDialog
            open={isTransferDialogOpen}
            onOpenChange={setIsTransferDialogOpen}
            wallet={selectedWallet}
          />
        </>
      )}
    </>
  )
}

