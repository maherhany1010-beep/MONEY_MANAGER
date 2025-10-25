'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/page-header'
import { BankAccountCard } from '@/components/bank-accounts/bank-account-card'
import { AddBankAccountDialog } from '@/components/bank-accounts/add-bank-account-dialog'
import { ReconciliationDialog } from '@/components/reconciliation/reconciliation-dialog'
import { DashboardStats } from '@/components/bank-accounts/dashboard-stats'
import { TopTransactions } from '@/components/bank-accounts/top-transactions'
import { BalanceForecast } from '@/components/bank-accounts/balance-forecast'
import { SearchFilter, SearchFilterState } from '@/components/bank-accounts/search-filter'
import { ReportsTab } from '@/components/bank-accounts/reports-tab'
import { EmptyState } from '@/components/ui/empty-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useBankAccounts, BankAccount } from '@/contexts/bank-accounts-context'
import { Landmark, Plus, LayoutDashboard, Grid3x3, FileText } from 'lucide-react'

export default function BankAccountsPage() {
  const router = useRouter()
  const { accounts, updateAccounts, updateAccountBalance } = useBankAccounts()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isReconciliationDialogOpen, setIsReconciliationDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null)

  // Search and filter state
  const [filters, setFilters] = useState<SearchFilterState>({
    searchQuery: '',
    status: 'all',
    bank: 'all',
    accountType: 'all',
    sortBy: 'name-asc',
  })

  const handleAddAccount = (newAccount: BankAccount) => {
    const account = {
      ...newAccount,
      id: Date.now().toString(),
      isDefault: accounts.length === 0,
    }
    updateAccounts([...accounts, account])
  }

  const handleToggleActive = (id: string) => {
    const updatedAccounts = accounts.map(acc =>
      acc.id === id
        ? { ...acc, isActive: !acc.isActive }
        : acc
    )
    updateAccounts(updatedAccounts)
  }

  const handleCardClick = (accountId: string) => {
    router.push(`/bank-accounts/${accountId}`)
  }

  const handleReconcile = (account: BankAccount) => {
    setSelectedAccount(account)
    setIsReconciliationDialogOpen(true)
  }

  const handleReconcileConfirm = (actualBalance: number, difference: number, notes?: string) => {
    if (selectedAccount) {
      // Update account balance
      updateAccountBalance(selectedAccount.id, actualBalance)
    }
  }

  // Get unique banks and account types for filter
  const banks = useMemo(() => {
    const uniqueBanks = new Set(accounts.map(a => a.bankName).filter(Boolean))
    return Array.from(uniqueBanks)
  }, [accounts])

  const accountTypes = useMemo(() => {
    const uniqueTypes = new Set(accounts.map(a => a.accountType).filter(Boolean))
    return Array.from(uniqueTypes)
  }, [accounts])

  // Filter and sort accounts
  const filteredAndSortedAccounts = useMemo(() => {
    let filtered = [...accounts]

    // Apply search
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(a =>
        a.accountName.toLowerCase().includes(query) ||
        a.bankName.toLowerCase().includes(query) ||
        a.accountNumber?.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(a =>
        filters.status === 'active' ? a.isActive : !a.isActive
      )
    }

    // Apply bank filter
    if (filters.bank !== 'all') {
      filtered = filtered.filter(a => a.bankName === filters.bank)
    }

    // Apply account type filter
    if (filters.accountType !== 'all') {
      filtered = filtered.filter(a => a.accountType === filters.accountType)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name-asc':
          return a.accountName.localeCompare(b.accountName, 'ar')
        case 'name-desc':
          return b.accountName.localeCompare(a.accountName, 'ar')
        case 'balance-desc':
          return b.balance - a.balance
        case 'balance-asc':
          return a.balance - b.balance
        default:
          return 0
      }
    })

    return filtered
  }, [accounts, filters])

  return (
    <AppLayout>
      <PageHeader
        title="الحسابات البنكية"
        description="إدارة حساباتك البنكية ومتابعة الأرصدة والمعاملات"
        action={{
          label: 'إضافة حساب بنكي',
          icon: Plus,
          onClick: () => setIsAddDialogOpen(true),
        }}
      />

      {accounts.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="لا توجد حسابات بنكية"
          description="ابدأ بإضافة حساباتك البنكية لإدارة أموالك بشكل أفضل"
          action={{
            label: 'إضافة حساب بنكي',
            onClick: () => setIsAddDialogOpen(true),
          }}
        />
      ) : (
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              لوحة المعلومات
            </TabsTrigger>
            <TabsTrigger value="accounts" className="gap-2">
              <Grid3x3 className="h-4 w-4" />
              الحسابات
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="h-4 w-4" />
              التقارير
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <DashboardStats accounts={accounts} />

            <div className="grid gap-6 lg:grid-cols-2">
              <TopTransactions accounts={accounts} />
              <BalanceForecast accounts={accounts} />
            </div>
          </TabsContent>

          {/* Accounts Tab */}
          <TabsContent value="accounts" className="space-y-6">
            <SearchFilter
              filters={filters}
              onFiltersChange={setFilters}
              banks={banks}
              accountTypes={accountTypes}
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedAccounts.map((account) => (
                <BankAccountCard
                  key={account.id}
                  account={account}
                  onClick={() => handleCardClick(account.id)}
                  onToggleActive={() => handleToggleActive(account.id)}
                  onReconcile={() => handleReconcile(account)}
                />
              ))}
            </div>

            {filteredAndSortedAccounts.length === 0 && (
              <div className="text-center py-12">
                <Landmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">لا توجد حسابات تطابق معايير البحث</p>
              </div>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <ReportsTab accounts={accounts} />
          </TabsContent>
        </Tabs>
      )}

      <AddBankAccountDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddAccount}
      />

      {selectedAccount && (
        <ReconciliationDialog
          open={isReconciliationDialogOpen}
          onOpenChange={setIsReconciliationDialogOpen}
          accountId={selectedAccount.id}
          accountName={selectedAccount.accountName}
          accountType="bank_account"
          currentBalance={selectedAccount.balance}
          onReconcile={handleReconcileConfirm}
        />
      )}
    </AppLayout>
  )
}

