'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useInvestments, Investment } from '@/contexts/investments-context'
import { Edit, DollarSign, Percent } from 'lucide-react'

interface EditCertificateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  investment: Investment | null
}

export function EditCertificateDialog({
  open,
  onOpenChange,
  investment,
}: EditCertificateDialogProps) {
  const { updateCertificate } = useInvestments()
  const [amount, setAmount] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [loading, setLoading] = useState(false)

  // تحديث القيم عند فتح الحوار
  useEffect(() => {
    if (investment && open) {
      setAmount((investment.amount ?? 0).toString())
      setInterestRate((investment.interestRate ?? 0).toString())
    }
  }, [investment, open])

  if (!investment) return null

  const formatCurrency = (amount: number) => `${amount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م`

  const handleSubmit = async () => {
    const newAmount = parseFloat(amount)
    const newRate = parseFloat(interestRate)

    if (isNaN(newAmount) || newAmount <= 0) {
      alert('الرجاء إدخال مبلغ صحيح')
      return
    }

    if (isNaN(newRate) || newRate <= 0) {
      alert('الرجاء إدخال نسبة فائدة صحيحة')
      return
    }

    setLoading(true)
    try {
      await updateCertificate(investment.id, newAmount, newRate)
      onOpenChange(false)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // حساب العائد الشهري الجديد
  const newAmount = parseFloat(amount) || 0
  const newRate = parseFloat(interestRate) || 0
  const startDate = new Date(investment.startDate ?? investment.purchaseDate ?? new Date())
  const maturityDate = investment.maturityDate ? new Date(investment.maturityDate) : new Date()
  const totalDays = Math.max(1, (maturityDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const newTotalInterest = newAmount * (newRate / 100)
  const newMonthlyReturn = newTotalInterest / (totalDays / 30)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-600" />
            تعديل الشهادة
          </DialogTitle>
          <DialogDescription>
            تعديل بيانات شهادة {investment.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* المبلغ */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              المبلغ الأساسي
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="أدخل المبلغ"
            />
          </div>

          {/* نسبة الفائدة */}
          <div className="space-y-2">
            <Label htmlFor="rate" className="flex items-center gap-1">
              <Percent className="h-4 w-4" />
              نسبة الفائدة السنوية (%)
            </Label>
            <Input
              id="rate"
              type="number"
              step="0.01"
              min="0"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="أدخل نسبة الفائدة"
            />
          </div>

          {/* معاينة العائد الشهري */}
          {newAmount > 0 && newRate > 0 && (
            <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">العائد الشهري المتوقع:</span>
                <span className="font-bold text-green-600">{formatCurrency(newMonthlyReturn)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">إجمالي الأرباح:</span>
                <span className="font-bold text-green-600">{formatCurrency(newTotalInterest)}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

