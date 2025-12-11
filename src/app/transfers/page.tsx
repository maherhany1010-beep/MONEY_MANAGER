'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { PageHeader } from '@/components/layout/page-header'
import { TransferForm, type AccountOption } from '@/components/central-transfers/transfer-form'
import { PendingTransfersDialog } from '@/components/central-transfers/pending-transfers-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/ui/stat-card'
import { EmptyState } from '@/components/ui/empty-state'
import { useCentralTransfersStore, type TransferFormData, type TransferStatus } from '@/stores/central-transfers-store'
import { useBankAccountsStore } from '@/stores/bank-accounts-store'
import { useCards } from '@/contexts/cards-context'
import { usePrepaidCards } from '@/contexts/prepaid-cards-context'
import { useCashVaults } from '@/contexts/cash-vaults-context'
import { useEWallets } from '@/contexts/e-wallets-context'
import { useCustomers } from '@/contexts/customers-context'
import { formatCurrency } from '@/lib/design-system'
import { 
  ArrowRightLeft, 
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react'

export default function TransfersPage() {
  const { user } = useAuth()
  const transferStore = useCentralTransfersStore()
  const bankAccountsStore = useBankAccountsStore()
  const { cards } = useCards()
  const { cards: prepaidCards } = usePrepaidCards()
  const { vaults } = useCashVaults()
  const { wallets } = useEWallets()
  const { customers } = useCustomers()

  const [isPendingDialogOpen, setIsPendingDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize store
  useEffect(() => {
    if (user?.id) {
      transferStore.initialize(user.id)
    }
    return () => {
      transferStore.cleanup()
    }
  }, [user?.id])

  // Aggregate all accounts
  const allAccounts: AccountOption[] = [
    ...(bankAccountsStore.accounts || []).map(acc => ({
      id: `bank-${acc.id}`,
      name: `${acc.account_name} (بنك)`,
      balance: acc.balance || 0,
      type: 'bank',
      isActive: acc.status === 'active',
    })),
    ...(cards || []).map(card => ({
      id: `card-${card.id}`,
      name: `${card.card_name} (بطاقة ائتمان)`,
      balance: card.available_credit || 0,
      type: 'credit-card',
      isActive: card.status === 'active',
    })),
    ...(prepaidCards || []).map(card => ({
      id: `prepaid-${card.id}`,
      name: `${card.card_name} (بطاقة مدفوعة)`,
      balance: card.balance || 0,
      type: 'prepaid-card',
      isActive: card.status === 'active',
    })),
    ...(vaults || []).map(vault => ({
      id: `vault-${vault.id}`,
      name: `${vault.vault_name} (خزينة)`,
      balance: vault.balance || 0,
      type: 'cash-vault',
      isActive: true,
    })),
    ...(wallets || []).map(wallet => ({
      id: `wallet-${wallet.id}`,
      name: `${wallet.wallet_name} (محفظة)`,
      balance: wallet.balance || 0,
      type: 'e-wallet',
      isActive: true,
    })),
    ...(customers || []).map(customer => ({
      id: `customer-${customer.id}`,
      name: `${customer.name} (عميل)`,
      balance: 0,
      type: 'customer',
      isActive: true,
    })),
  ]

  // Get statistics
  const successfulTransfers = transferStore.transfers.filter(t => t.status === 'successful')
  const pendingTransfers = transferStore.transfers.filter(t => t.status === 'pending')
  const failedTransfers = transferStore.transfers.filter(t => t.status === 'failed')

  const totalTransferred = successfulTransfers.reduce((sum, t) => sum + t.base_amount, 0)
  const totalPending = pendingTransfers.reduce((sum, t) => sum + t.base_amount, 0)
  const totalFailed = failedTransfers.reduce((sum, t) => sum + t.base_amount, 0)

  // Handle transfer submission
  const handleTransferSubmit = async (data: TransferFormData, executionStatus: TransferStatus) => {
    setIsSubmitting(true)
    try {
      await transferStore.createTransfer(data, executionStatus)
    } catch (err) {
      console.error('Error creating transfer:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="التحويلات المركزية"
        description="إدارة التحويلات بين جميع أنواع الحسابات"
        action={{
          label: 'المعاملات المعلقة',
          icon: Clock,
          onClick: () => setIsPendingDialogOpen(true),
        }}
      />

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="التحويلات الناجحة"
          value={formatCurrency(totalTransferred)}
          subtitle={`${successfulTransfers.length} تحويل`}
          icon={CheckCircle2}
          variant="green"
        />

        <StatCard
          title="المعاملات المعلقة"
          value={formatCurrency(totalPending)}
          subtitle={`${pendingTransfers.length} معاملة`}
          icon={Clock}
          variant="orange"
        />

        <StatCard
          title="التحويلات الفاشلة"
          value={formatCurrency(totalFailed)}
          subtitle={`${failedTransfers.length} تحويل`}
          icon={XCircle}
          variant="red"
        />

        <StatCard
          title="إجمالي التحويلات"
          value={transferStore.transfers.length.toString()}
          subtitle="معاملة"
          icon={ArrowRightLeft}
          variant="blue"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Transfer Form */}
        <div className="lg:col-span-2">
          <TransferForm
            accounts={allAccounts}
            onSubmit={handleTransferSubmit}
            isLoading={isSubmitting}
          />
        </div>

        {/* Recent Transfers */}
        <div>
          <Card className="border-2 border-slate-600/50 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                آخر التحويلات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transferStore.transfers.length === 0 ? (
                <EmptyState
                  icon={ArrowRightLeft}
                  title="لا توجد تحويلات"
                  description="ابدأ بإنشاء تحويل جديد"
                />
              ) : (
                <div className="space-y-3">
                  {transferStore.transfers.slice(0, 5).map((transfer) => (
                    <div key={transfer.id} className="p-3 bg-muted/50 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold truncate">
                          {transfer.from_account_id} → {transfer.to_account_id}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            transfer.status === 'successful'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/30'
                              : transfer.status === 'pending'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-500/30'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/30'
                          }
                        >
                          {transfer.status === 'successful' ? 'ناجحة' : transfer.status === 'pending' ? 'معلقة' : 'فاشلة'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(transfer.base_amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pending Transfers Dialog */}
      <PendingTransfersDialog
        open={isPendingDialogOpen}
        onOpenChange={setIsPendingDialogOpen}
        pendingTransfers={pendingTransfers}
        onMarkSuccessful={transferStore.markPendingAsSuccessful}
        onMarkFailed={transferStore.markPendingAsFailed}
        isLoading={isSubmitting}
      />
    </div>
  )
}

