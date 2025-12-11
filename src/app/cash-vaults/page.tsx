'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { CashVaultCard } from '@/components/cash-vaults/cash-vault-card'
import { AddCashVaultDialog } from '@/components/cash-vaults/add-cash-vault-dialog'
import { ReconciliationDialog } from '@/components/reconciliation/reconciliation-dialog'
import { AddDepositDialog } from '@/components/cash-vaults/add-deposit-dialog'
import { AddTransferDialog } from '@/components/cash-vaults/add-transfer-dialog'
import { DashboardStats } from '@/components/cash-vaults/dashboard-stats'
import { TopTransactions } from '@/components/cash-vaults/top-transactions'
import { BalanceForecast } from '@/components/cash-vaults/balance-forecast'
import { SearchFilter, SearchFilterState } from '@/components/cash-vaults/search-filter'
import { ReportsTab } from '@/components/cash-vaults/reports-tab'
import { EmptyState } from '@/components/ui/empty-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCashVaults, CashVault } from '@/contexts/cash-vaults-context'
import { Vault, Plus, LayoutDashboard, Grid3x3, FileText } from 'lucide-react'

export default function CashVaultsPage() {
  const router = useRouter()
  const { vaults, updateVaults, addVault } = useCashVaults()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isReconciliationDialogOpen, setIsReconciliationDialogOpen] = useState(false)
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false)
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [selectedVault, setSelectedVault] = useState<CashVault | null>(null)

  // Search and filter state
  const [filters, setFilters] = useState<SearchFilterState>({
    searchQuery: '',
    status: 'all',
    vaultType: 'all',
    location: 'all',
    sortBy: 'name-asc',
  })

  // معالج إضافة خزينة جديدة - يحفظ في قاعدة البيانات
  const handleAddVault = async (newVault: any) => {
    // تحويل أسماء الحقول من camelCase إلى snake_case للتوافق مع قاعدة البيانات
    const vaultData = {
      vault_name: newVault.vaultName,
      vault_type: newVault.vaultType || 'main',
      location: newVault.location || null,
      balance: parseFloat(newVault.balance) || 0,
      currency: 'EGP',
      status: 'active',
    }

    await addVault(vaultData)
  }

  const handleToggleActive = (id: string) => {
    const updatedVaults = vaults.map(v =>
      v.id === id
        ? { ...v, isActive: !v.isActive }
        : v
    )
    updateVaults(updatedVaults)
  }

  const handleCardClick = (vaultId: string) => {
    router.push(`/cash-vaults/${vaultId}`)
  }

  const handleReconcile = (vault: CashVault) => {
    setSelectedVault(vault)
    setIsReconciliationDialogOpen(true)
  }

  const handleReconcileConfirm = (actualBalance: number, difference: number, notes?: string) => {
    if (selectedVault) {
      const updatedVaults = vaults.map(v =>
        v.id === selectedVault.id
          ? { ...v, balance: actualBalance }
          : v
      )
      updateVaults(updatedVaults)
    }
  }

  // Get unique vault types and locations for filter
  const vaultTypes = useMemo(() => {
    const uniqueTypes = new Set(vaults.map(v => v.vaultType).filter(Boolean))
    return Array.from(uniqueTypes) as string[]
  }, [vaults])

  const locations = useMemo(() => {
    const uniqueLocations = new Set(vaults.map(v => v.location).filter(Boolean))
    return Array.from(uniqueLocations) as string[]
  }, [vaults])

  // Filter and sort vaults
  const filteredAndSortedVaults = useMemo(() => {
    let filtered = [...vaults]

    // Apply search
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(v =>
        (v.vaultName ?? v.vault_name ?? '').toLowerCase().includes(query) ||
        (v.location ?? '').toLowerCase().includes(query) ||
        (v.vaultType ?? '').toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(v =>
        filters.status === 'active' ? v.isActive : !v.isActive
      )
    }

    // Apply vault type filter
    if (filters.vaultType !== 'all') {
      filtered = filtered.filter(v => v.vaultType === filters.vaultType)
    }

    // Apply location filter
    if (filters.location !== 'all') {
      filtered = filtered.filter(v => v.location === filters.location)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name-asc':
          return (a.vaultName ?? a.vault_name ?? '').localeCompare((b.vaultName ?? b.vault_name ?? ''), 'ar')
        case 'name-desc':
          return (b.vaultName ?? b.vault_name ?? '').localeCompare((a.vaultName ?? a.vault_name ?? ''), 'ar')
        case 'balance-desc':
          return b.balance - a.balance
        case 'balance-asc':
          return a.balance - b.balance
        case 'capacity-desc':
          return (b.maxCapacity || 0) - (a.maxCapacity || 0)
        case 'capacity-asc':
          return (a.maxCapacity || 0) - (b.maxCapacity || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [vaults, filters])

  return (
    <>
      <PageHeader
        title="الخزائن النقدية"
        description="إدارة الخزائن النقدية ومتابعة السيولة والمعاملات"
        action={{
          label: 'إضافة خزينة جديدة',
          icon: Plus,
          onClick: () => setIsAddDialogOpen(true),
        }}
      />

      {vaults.length === 0 ? (
        <EmptyState
          icon={Vault}
          title="لا توجد خزائن نقدية"
          description="ابدأ بإضافة خزائنك النقدية لإدارة السيولة بشكل أفضل"
          action={{
            label: 'إضافة خزينة جديدة',
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
            <TabsTrigger value="vaults" className="gap-2 text-xs sm:text-sm">
              <Grid3x3 className="h-4 w-4" />
              الخزائن
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2 text-xs sm:text-sm">
              <FileText className="h-4 w-4" />
              التقارير
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4 sm:space-y-6 mt-0">
            <DashboardStats vaults={vaults} />

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <TopTransactions vaults={vaults} />
              <BalanceForecast vaults={vaults} />
            </div>
          </TabsContent>

          {/* Vaults Tab */}
          <TabsContent value="vaults" className="space-y-4 sm:space-y-6 mt-0">
            <SearchFilter
              filters={filters}
              onFiltersChange={setFilters}
              vaultTypes={vaultTypes}
              locations={locations}
            />

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedVaults.map((vault) => (
                <CashVaultCard
                  key={vault.id}
                  vault={vault}
                  onClick={() => handleCardClick(vault.id)}
                  onToggleActive={() => handleToggleActive(vault.id)}
                  onReconcile={() => handleReconcile(vault)}
                  onDeposit={() => {
                    setSelectedVault(vault)
                    setIsDepositDialogOpen(true)
                  }}
                  onTransfer={() => {
                    setSelectedVault(vault)
                    setIsTransferDialogOpen(true)
                  }}
                />
              ))}
            </div>

            {filteredAndSortedVaults.length === 0 && (
              <div className="text-center py-12">
                <Vault className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">لا توجد خزائن تطابق معايير البحث</p>
              </div>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <ReportsTab vaults={vaults} />
          </TabsContent>
        </Tabs>
      )}

      <AddCashVaultDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddVault}
      />

      {selectedVault && (
        <>
          <ReconciliationDialog
            open={isReconciliationDialogOpen}
            onOpenChange={setIsReconciliationDialogOpen}
            accountId={selectedVault.id}
            accountName={selectedVault.vaultName ?? selectedVault.vault_name ?? 'خزينة'}
            accountType="cash_vault"
            currentBalance={selectedVault.balance}
            onReconcile={handleReconcileConfirm}
          />

          <AddDepositDialog
            open={isDepositDialogOpen}
            onOpenChange={setIsDepositDialogOpen}
            vault={selectedVault}
          />

          <AddTransferDialog
            open={isTransferDialogOpen}
            onOpenChange={setIsTransferDialogOpen}
            vault={selectedVault}
          />
        </>
      )}
    </>
  )
}

