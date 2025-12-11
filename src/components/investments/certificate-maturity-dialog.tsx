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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useInvestments, Investment } from '@/contexts/investments-context'
import { RefreshCw, Wallet, Calendar, Percent, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'

interface CertificateMaturityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  investment: Investment | null
  defaultAction?: 'renew' | 'withdraw'
}

export function CertificateMaturityDialog({
  open,
  onOpenChange,
  investment,
  defaultAction = 'renew',
}: CertificateMaturityDialogProps) {
  const { renewCertificate, withdrawCertificate } = useInvestments()
  const [action, setAction] = useState<'renew' | 'withdraw'>(defaultAction)
  const [newInterestRate, setNewInterestRate] = useState('')
  const [penaltyAmount, setPenaltyAmount] = useState('')
  const [loading, setLoading] = useState(false)

  // تحديث الإجراء الافتراضي عند تغييره
  useEffect(() => {
    setAction(defaultAction)
  }, [defaultAction, open])

  if (!investment) return null

  // حساب الأرباح المستحقة
  const principal = investment.amount ?? 0
  const interestRate = investment.interestRate ?? 0
  const startDate = new Date(investment.startDate ?? investment.purchaseDate ?? new Date())
  const maturityDate = investment.maturityDate ? new Date(investment.maturityDate) : new Date()
  const now = new Date()

  const totalDays = Math.max(1, (maturityDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const daysElapsed = Math.max(0, (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const totalInterest = principal * (interestRate / 100)
  const monthlyReturn = totalInterest / (totalDays / 30)

  // الأرباح حتى الآن
  const profitUntilNow = (daysElapsed / totalDays) * totalInterest

  // التحقق من الاستحقاق
  const isMatured = now >= maturityDate
  const isEarlyWithdrawal = !isMatured && action === 'withdraw'

  // المبلغ الإجمالي
  const penalty = parseFloat(penaltyAmount) || 0
  const totalAmount = isEarlyWithdrawal
    ? principal + profitUntilNow - penalty
    : principal + totalInterest

  const formatCurrency = (amount: number) => `${amount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م`

  const handleSubmit = async () => {
    setLoading(true)
    try {
      if (action === 'renew') {
        const rate = parseFloat(newInterestRate)
        if (isNaN(rate) || rate <= 0) {
          alert('الرجاء إدخال سعر فائدة صحيح')
          setLoading(false)
          return
        }
        await renewCertificate(investment.id, rate)
      } else {
        await withdrawCertificate(investment.id, penalty)
      }
      onOpenChange(false)
      setNewInterestRate('')
      setPenaltyAmount('')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            استحقاق الشهادة
          </DialogTitle>
          <DialogDescription>
            شهادة {investment.name} وصلت لتاريخ الاستحقاق. اختر إجراء التجديد أو السحب.
          </DialogDescription>
        </DialogHeader>

        {/* تحذير السحب المبكر */}
        {isEarlyWithdrawal && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-700 dark:text-red-400 font-medium text-sm">سحب مبكر!</p>
              <p className="text-red-600 dark:text-red-500 text-xs">
                السحب قبل تاريخ الاستحقاق قد يترتب عليه غرامة
              </p>
            </div>
          </div>
        )}

        {/* ملخص الشهادة */}
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-4 w-4" /> المبلغ الأساسي:
            </span>
            <span className="font-bold">{formatCurrency(principal)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Percent className="h-4 w-4" /> الفائدة السنوية:
            </span>
            <span className="font-medium">{interestRate}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4" /> العائد الشهري:
            </span>
            <span className="font-medium text-green-600">{formatCurrency(monthlyReturn)}</span>
          </div>

          {/* الأرباح حتى الآن للسحب المبكر */}
          {isEarlyWithdrawal && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-4 w-4" /> الأرباح حتى الآن:
              </span>
              <span className="font-medium text-green-600">{formatCurrency(profitUntilNow)}</span>
            </div>
          )}

          {/* إجمالي الأرباح للاستحقاق الكامل */}
          {!isEarlyWithdrawal && (
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-4 w-4" /> إجمالي الأرباح:
              </span>
              <span className="font-bold text-green-600">{formatCurrency(totalInterest)}</span>
            </div>
          )}

          {/* الغرامة للسحب المبكر */}
          {isEarlyWithdrawal && penalty > 0 && (
            <div className="flex justify-between items-center text-red-600">
              <span className="text-sm flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" /> الغرامة:
              </span>
              <span className="font-bold">- {formatCurrency(penalty)}</span>
            </div>
          )}

          <div className="flex justify-between items-center border-t pt-2">
            <span className="font-medium">المبلغ الإجمالي:</span>
            <span className="font-bold text-lg text-blue-600">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        {/* اختيار الإجراء */}
        <RadioGroup value={action} onValueChange={(v) => setAction(v as 'renew' | 'withdraw')} className="space-y-3">
          <div className={`flex items-center space-x-2 space-x-reverse p-3 rounded-lg border cursor-pointer transition-colors ${action === 'renew' ? 'border-green-500 bg-green-50 dark:bg-green-950/30' : 'border-gray-200 dark:border-gray-700'}`}>
            <RadioGroupItem value="renew" id="renew" />
            <Label htmlFor="renew" className="flex items-center gap-2 cursor-pointer flex-1">
              <RefreshCw className="h-4 w-4 text-green-600" />
              <div>
                <div className="font-medium">تجديد الشهادة</div>
                <div className="text-xs text-muted-foreground">تجديد بسعر فائدة جديد</div>
              </div>
            </Label>
          </div>
          
          <div className={`flex items-center space-x-2 space-x-reverse p-3 rounded-lg border cursor-pointer transition-colors ${action === 'withdraw' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30' : 'border-gray-200 dark:border-gray-700'}`}>
            <RadioGroupItem value="withdraw" id="withdraw" />
            <Label htmlFor="withdraw" className="flex items-center gap-2 cursor-pointer flex-1">
              <Wallet className="h-4 w-4 text-orange-600" />
              <div>
                <div className="font-medium">سحب المبلغ</div>
                <div className="text-xs text-muted-foreground">سحب الأصل والأرباح وإنهاء الشهادة</div>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {/* سعر الفائدة الجديد عند التجديد */}
        {action === 'renew' && (
          <div className="space-y-2">
            <Label htmlFor="newRate">سعر الفائدة الجديد (%)</Label>
            <Input
              id="newRate"
              type="number"
              step="0.01"
              min="0"
              value={newInterestRate}
              onChange={(e) => setNewInterestRate(e.target.value)}
              placeholder={`السعر الحالي: ${interestRate}%`}
            />
          </div>
        )}

        {/* مبلغ الغرامة عند السحب المبكر */}
        {isEarlyWithdrawal && (
          <div className="space-y-2">
            <Label htmlFor="penalty" className="flex items-center gap-1 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              مبلغ الغرامة (اختياري)
            </Label>
            <Input
              id="penalty"
              type="number"
              step="0.01"
              min="0"
              value={penaltyAmount}
              onChange={(e) => setPenaltyAmount(e.target.value)}
              placeholder="أدخل مبلغ الغرامة إن وجد"
              className="border-red-200 focus:border-red-400"
            />
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            إلغاء
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || (action === 'renew' && !newInterestRate)}
            className={action === 'renew' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}
          >
            {loading ? 'جاري...' : action === 'renew' ? 'تجديد الشهادة' : 'سحب المبلغ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

