'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { POSAccount } from '@/contexts/pos-machines-context'
import { Wallet, Plus } from 'lucide-react'

interface AddAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (account: POSAccount) => void
  machineId: string
  provider: string
}

export function AddAccountDialog({ open, onOpenChange, onAdd, machineId, provider }: AddAccountDialogProps) {
  const [formData, setFormData] = useState({
    accountName: '',
    accountNumber: '',
    balance: '0',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newAccount: POSAccount = {
      id: `acc-${Date.now()}`,
      name: formData.accountName,
      accountName: formData.accountName,
      accountNumber: formData.accountNumber,
      balance: parseFloat(formData.balance) || 0,
      isPrimary: false,
      currency: 'EGP',
      totalDeposits: 0,
      totalWithdrawals: 0,
    }

    onAdd(newAccount)
    onOpenChange(false)
    
    // إعادة تعيين النموذج
    setFormData({
      accountName: '',
      accountNumber: '',
      balance: '0',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-lime-100 dark:border-lime-900/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b pb-4 border-lime-100 dark:border-lime-900/30">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-lime-600 to-green-600 bg-clip-text text-transparent">
            <div className="p-2 bg-lime-100 dark:bg-lime-900/30 rounded-lg">
              <Wallet className="h-6 w-6 text-lime-600 dark:text-lime-400" />
            </div>
            إضافة حساب جديد
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-2">
            أدخل معلومات الحساب الجديد للماكينة
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountName">اسم الحساب *</Label>
            <Input
              id="accountName"
              value={formData.accountName}
              onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              placeholder="مثال: حساب احتياطي"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">رقم الحساب *</Label>
            <Input
              id="accountNumber"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              placeholder={`مثال: ${provider.substring(0, 3).toUpperCase()}-${machineId}-002`}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">الرصيد الافتتاحي</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              placeholder="0.00"
            />
          </div>

          {/* الأزرار */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit">
              <Plus className="h-4 w-4 ml-2" />
              إضافة الحساب
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

