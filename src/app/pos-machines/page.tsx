'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { POSMachineCard } from '@/components/pos-machines/pos-machine-card'
import { AddPOSMachineDialog } from '@/components/pos-machines/add-pos-machine-dialog'
import { DashboardStats } from '@/components/pos-machines/dashboard-stats'
import { TopTransactions } from '@/components/pos-machines/top-transactions'
import { BalanceForecast } from '@/components/pos-machines/balance-forecast'
import { SearchFilter, SearchFilterState } from '@/components/pos-machines/search-filter'
import { ReportsTab } from '@/components/pos-machines/reports-tab'
import { EmptyState } from '@/components/ui/empty-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePOSMachines } from '@/contexts/pos-machines-context'
import { CreditCard, Plus, LayoutDashboard, Grid3x3, FileText } from 'lucide-react'

export default function POSMachinesPage() {
  const router = useRouter()
  const { machines, addMachine } = usePOSMachines()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Search and filter state
  const [filters, setFilters] = useState<SearchFilterState>({
    searchQuery: '',
    status: 'all',
    provider: 'all',
    location: 'all',
    sortBy: 'name-asc',
  })

  const handleCardClick = (machineId: string) => {
    router.push(`/pos-machines/${machineId}`)
  }

  const handleToggleStatus = (machineId: string) => {
    // Placeholder for toggle status functionality
  }

  // Get unique providers and locations for filter
  const providers = useMemo(() => {
    const uniqueProviders = new Set(machines.map(m => m.provider).filter(Boolean))
    return Array.from(uniqueProviders) as string[]
  }, [machines])

  const locations = useMemo(() => {
    const uniqueLocations = new Set(machines.map(m => m.location).filter(Boolean))
    return Array.from(uniqueLocations) as string[]
  }, [machines])

  // Filter and sort machines
  const filteredAndSortedMachines = useMemo(() => {
    let filtered = [...machines]

    // Apply search
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(m =>
        (m.machineName ?? m.machine_name ?? '').toLowerCase().includes(query) ||
        (m.machineId ?? m.id ?? '').toLowerCase().includes(query) ||
        m.location?.toLowerCase().includes(query) ||
        m.serialNumber?.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(m => m.status === filters.status)
    }

    // Apply provider filter
    if (filters.provider !== 'all') {
      filtered = filtered.filter(m => m.provider === filters.provider)
    }

    // Apply location filter
    if (filters.location !== 'all') {
      filtered = filtered.filter(m => m.location === filters.location)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name-asc':
          return (a.machineName ?? a.machine_name ?? '').localeCompare((b.machineName ?? b.machine_name ?? ''), 'ar')
        case 'name-desc':
          return (b.machineName ?? b.machine_name ?? '').localeCompare((a.machineName ?? a.machine_name ?? ''), 'ar')
        case 'revenue-desc':
          return (b.monthlyRevenue || 0) - (a.monthlyRevenue || 0)
        case 'revenue-asc':
          return (a.monthlyRevenue || 0) - (b.monthlyRevenue || 0)
        case 'transactions-desc':
          return (b.totalTransactions || 0) - (a.totalTransactions || 0)
        case 'transactions-asc':
          return (a.totalTransactions || 0) - (b.totalTransactions || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [machines, filters])

  return (
    <>
      <PageHeader
        title="ماكينات الدفع الإلكتروني"
        description="إدارة ماكينات الدفع الإلكتروني ومتابعة الحسابات والمعاملات"
        action={{
          label: 'إضافة ماكينة جديدة',
          icon: Plus,
          onClick: () => setIsAddDialogOpen(true),
        }}
      />

      {machines.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="لا توجد ماكينات دفع"
          description="ابدأ بإضافة ماكينات الدفع الإلكتروني لإدارة معاملاتك بشكل أفضل"
          action={{
            label: 'إضافة ماكينة جديدة',
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
            <TabsTrigger value="machines" className="gap-2">
              <Grid3x3 className="h-4 w-4" />
              الماكينات
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="h-4 w-4" />
              التقارير
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4 sm:space-y-6 mt-0">
            <DashboardStats machines={machines} />

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <TopTransactions machines={machines} />
              <BalanceForecast machines={machines} />
            </div>
          </TabsContent>

          {/* Machines Tab */}
          <TabsContent value="machines" className="space-y-4 sm:space-y-6 mt-0">
            <SearchFilter
              filters={filters}
              onFiltersChange={setFilters}
              providers={providers}
              locations={locations}
            />

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedMachines.map((machine) => (
                <POSMachineCard
                  key={machine.id}
                  machine={machine}
                  onClick={() => handleCardClick(machine.id)}
                  onToggleStatus={() => handleToggleStatus(machine.id)}
                />
              ))}
            </div>

            {filteredAndSortedMachines.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-50" />
                <p className="text-sm sm:text-base text-muted-foreground">لا توجد ماكينات تطابق معايير البحث</p>
              </div>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <ReportsTab machines={machines} />
          </TabsContent>
        </Tabs>
      )}

      <AddPOSMachineDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={addMachine}
      />
    </>
  )
}

