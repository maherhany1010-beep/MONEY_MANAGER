'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { formatCurrency, formatDate } from '@/lib/design-system'
import { AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react'
import type { CentralTransfer } from '@/stores/central-transfers-store'

interface PendingTransfersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pendingTransfers: CentralTransfer[]
  onMarkSuccessful: (id: string) => Promise<void>
  onMarkFailed: (id: string) => Promise<void>
  isLoading?: boolean
}

export function PendingTransfersDialog({
  open,
  onOpenChange,
  pendingTransfers,
  onMarkSuccessful,
  onMarkFailed,
  isLoading = false,
}: PendingTransfersDialogProps) {
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleMarkSuccessful = async (id: string) => {
    setProcessingId(id)
    try {
      await onMarkSuccessful(id)
    } finally {
      setProcessingId(null)
    }
  }

  const handleMarkFailed = async (id: string) => {
    setProcessingId(id)
    try {
      await onMarkFailed(id)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            المعاملات المعلقة
          </DialogTitle>
          <DialogDescription>
            إدارة المعاملات المعلقة وتحديث حالتها
          </DialogDescription>
        </DialogHeader>

        {pendingTransfers.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="لا توجد معاملات معلقة"
            description="جميع المعاملات قد تم معالجتها بنجاح"
          />
        ) : (
          <div className="space-y-4">
            {pendingTransfers.map((transfer) => (
              <div
                key={transfer.id}
                className="p-4 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Transfer Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">رقم المعاملة:</span>
                      <span className="font-mono text-sm">{transfer.id.slice(0, 8)}...</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">التاريخ:</span>
                      <span className="text-sm">{formatDate(transfer.created_at || new Date().toISOString())}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">من:</span>
                      <span className="text-sm font-semibold">{transfer.from_account_id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">إلى:</span>
                      <span className="text-sm font-semibold">{transfer.to_account_id}</span>
                    </div>
                  </div>

                  {/* Amount Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">المبلغ الأساسي:</span>
                      <span className="text-sm font-semibold">{formatCurrency(transfer.base_amount)}</span>
                    </div>
                    {transfer.fees > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">الرسوم:</span>
                        <span className="text-sm font-semibold">{formatCurrency(transfer.fees)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">الحالة:</span>
                      <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-500/30">
                        <Clock className="h-3 w-3 mr-1" />
                        معلقة
                      </Badge>
                    </div>
                    {transfer.notes && (
                      <div className="flex items-start justify-between">
                        <span className="text-sm text-muted-foreground">ملاحظات:</span>
                        <span className="text-sm text-right">{transfer.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    onClick={() => handleMarkSuccessful(transfer.id)}
                    disabled={processingId === transfer.id || isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {processingId === transfer.id ? 'جاري المعالجة...' : 'تحويل إلى ناجحة'}
                  </Button>
                  <Button
                    onClick={() => handleMarkFailed(transfer.id)}
                    disabled={processingId === transfer.id || isLoading}
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {processingId === transfer.id ? 'جاري المعالجة...' : 'تحويل إلى فاشلة'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

