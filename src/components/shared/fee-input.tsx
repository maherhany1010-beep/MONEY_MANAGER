'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { formatCurrency } from '@/lib/utils'
import { Percent, DollarSign } from 'lucide-react'

export type FeeType = 'fixed' | 'percentage'

interface FeeInputProps {
  feeType: FeeType
  feeValue: number
  onFeeTypeChange: (type: FeeType) => void
  onFeeValueChange: (value: number) => void
  amount: number // المبلغ الأصلي لحساب الرسوم النسبية
  label?: string
}

export function FeeInput({
  feeType,
  feeValue,
  onFeeTypeChange,
  onFeeValueChange,
  amount,
  label = 'رسوم الشحن',
}: FeeInputProps) {
  // Calculate actual fee amount
  const calculateFee = () => {
    if (feeType === 'fixed') {
      return feeValue
    } else {
      return (amount * feeValue) / 100
    }
  }

  const actualFee = calculateFee()

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      {/* Fee Type Selection */}
      <RadioGroup
        value={feeType}
        onValueChange={(value) => onFeeTypeChange(value as FeeType)}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2 space-x-reverse">
          <RadioGroupItem value="fixed" id="fixed" />
          <Label htmlFor="fixed" className="flex items-center gap-2 cursor-pointer font-normal">
            <DollarSign className="h-4 w-4" />
            رسوم ثابتة
          </Label>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <RadioGroupItem value="percentage" id="percentage" />
          <Label htmlFor="percentage" className="flex items-center gap-2 cursor-pointer font-normal">
            <Percent className="h-4 w-4" />
            رسوم نسبية
          </Label>
        </div>
      </RadioGroup>

      {/* Fee Value Input */}
      <div className="space-y-2">
        <div className="relative">
          <Input
            type="number"
            min="0"
            step={feeType === 'percentage' ? '0.1' : '1'}
            value={feeValue}
            onChange={(e) => onFeeValueChange(parseFloat(e.target.value) || 0)}
            placeholder={feeType === 'fixed' ? 'أدخل المبلغ' : 'أدخل النسبة'}
            className="pl-12"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {feeType === 'fixed' ? 'ج.م' : '%'}
          </div>
        </div>

        {/* Fee Preview */}
        {amount > 0 && feeValue > 0 && (
          <div className="p-3 bg-muted rounded-lg space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">المبلغ الأصلي:</span>
              <span className="font-medium">{formatCurrency(amount)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                الرسوم ({feeType === 'fixed' ? 'ثابتة' : `${feeValue}%`}):
              </span>
              <span className="font-medium text-orange-600">{formatCurrency(actualFee)}</span>
            </div>
            <div className="flex items-center justify-between text-sm pt-2 border-t">
              <span className="font-medium">الإجمالي المخصوم:</span>
              <span className="font-bold text-lg">{formatCurrency(amount + actualFee)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Calculate fee based on type and value
 */
export function calculateFee(amount: number, feeType: FeeType, feeValue: number): number {
  if (feeType === 'fixed') {
    return feeValue
  } else {
    return (amount * feeValue) / 100
  }
}

