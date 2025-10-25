'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/lib/utils'
import { 
  Gift, 
  CreditCard, 
  Banknote, 
  ShoppingCart, 
  Plane,
  Coffee,
  CheckCircle,
  AlertTriangle,
  Info,
  Star
} from 'lucide-react'

interface CashbackRedemptionProps {
  currentBalance: number
  onRedeem: (amount: number) => void
}

const redemptionOptions = [
  {
    id: 'bank_transfer',
    title: 'تحويل بنكي',
    description: 'تحويل إلى حسابك البنكي',
    icon: Banknote,
    minAmount: 100,
    fee: 0,
    processingTime: '1-2 أيام عمل',
    available: true,
  },
  {
    id: 'credit_statement',
    title: 'خصم من كشف الحساب',
    description: 'خصم من رصيد البطاقة الائتمانية',
    icon: CreditCard,
    minAmount: 50,
    fee: 0,
    processingTime: 'فوري',
    available: true,
  },
  {
    id: 'gift_cards',
    title: 'بطاقات هدايا',
    description: 'بطاقات هدايا للمتاجر الشريكة',
    icon: Gift,
    minAmount: 25,
    fee: 0,
    processingTime: 'فوري',
    available: true,
    bonus: 5, // 5% bonus
  },
  {
    id: 'travel_miles',
    title: 'أميال السفر',
    description: 'تحويل إلى أميال الطيران',
    icon: Plane,
    minAmount: 200,
    fee: 10,
    processingTime: '3-5 أيام عمل',
    available: false,
    comingSoon: true,
  },
  {
    id: 'vouchers',
    title: 'قسائم الطعام',
    description: 'قسائم للمطاعم والمقاهي',
    icon: Coffee,
    minAmount: 30,
    fee: 0,
    processingTime: 'فوري',
    available: true,
    bonus: 10, // 10% bonus
  },
  {
    id: 'shopping',
    title: 'قسائم التسوق',
    description: 'قسائم للمتاجر الإلكترونية',
    icon: ShoppingCart,
    minAmount: 50,
    fee: 0,
    processingTime: 'فوري',
    available: true,
  },
]

export function CashbackRedemption({ currentBalance, onRedeem }: CashbackRedemptionProps) {
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [customAmount, setCustomAmount] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)

  const selectedRedemption = redemptionOptions.find(option => option.id === selectedOption)
  const amount = parseFloat(customAmount) || 0
  const canRedeem = selectedRedemption && 
                   amount >= selectedRedemption.minAmount && 
                   amount <= currentBalance &&
                   selectedRedemption.available

  const handleRedeem = async () => {
    if (!canRedeem) return

    setIsProcessing(true)
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      onRedeem(amount)
      setCustomAmount('')
      setSelectedOption('')
    } catch (error) {
      console.error('Redemption failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const setQuickAmount = (percentage: number) => {
    const quickAmount = Math.floor((currentBalance * percentage) / 100)
    setCustomAmount(quickAmount.toString())
  }

  const getEffectiveAmount = () => {
    if (!selectedRedemption) return amount
    
    let effectiveAmount = amount
    if (selectedRedemption.bonus) {
      effectiveAmount = amount * (1 + selectedRedemption.bonus / 100)
    }
    if (selectedRedemption.fee) {
      effectiveAmount = amount - selectedRedemption.fee
    }
    return effectiveAmount
  }

  return (
    <div className="space-y-6">
      {/* Current Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="h-5 w-5" />
            رصيد الكاش باك المتاح
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {formatCurrency(currentBalance)}
            </div>
            <p className="text-muted-foreground">
              متاح للاسترداد الآن
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Redemption Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">خيارات الاسترداد</CardTitle>
          <CardDescription>
            اختر الطريقة المفضلة لاسترداد الكاش باك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {redemptionOptions.map((option) => {
              const Icon = option.icon
              const isSelected = selectedOption === option.id
              const isDisabled = !option.available || currentBalance < option.minAmount
              
              return (
                <div
                  key={option.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors relative ${
                    isSelected ? 'border-primary bg-primary/5' : 
                    isDisabled ? 'border-gray-200 bg-gray-50 cursor-not-allowed' :
                    'border-border hover:bg-accent/50'
                  }`}
                  onClick={() => !isDisabled && setSelectedOption(option.id)}
                >
                  {option.bonus && (
                    <Badge className="absolute -top-2 -right-2 bg-green-600">
                      +{option.bonus}%
                    </Badge>
                  )}
                  
                  {option.comingSoon && (
                    <Badge className="absolute -top-2 -right-2 bg-blue-600">
                      قريباً
                    </Badge>
                  )}

                  <div className="flex items-center gap-3 mb-3">
                    <Icon className={`h-6 w-6 ${
                      isDisabled ? 'text-gray-400' : 'text-primary'
                    }`} />
                    <div>
                      <h3 className={`font-semibold ${
                        isDisabled ? 'text-gray-400' : ''
                      }`}>
                        {option.title}
                      </h3>
                      <p className={`text-sm ${
                        isDisabled ? 'text-gray-400' : 'text-muted-foreground'
                      }`}>
                        {option.description}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle className="h-5 w-5 text-primary mr-auto" />
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className={isDisabled ? 'text-gray-400' : 'text-muted-foreground'}>
                        الحد الأدنى:
                      </span>
                      <span className={isDisabled ? 'text-gray-400' : ''}>
                        {formatCurrency(option.minAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDisabled ? 'text-gray-400' : 'text-muted-foreground'}>
                        وقت المعالجة:
                      </span>
                      <span className={isDisabled ? 'text-gray-400' : ''}>
                        {option.processingTime}
                      </span>
                    </div>
                    {option.fee > 0 && (
                      <div className="flex justify-between">
                        <span className={isDisabled ? 'text-gray-400' : 'text-muted-foreground'}>
                          الرسوم:
                        </span>
                        <span className={isDisabled ? 'text-gray-400' : ''}>
                          {formatCurrency(option.fee)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Amount Selection */}
      {selectedRedemption && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">تحديد المبلغ</CardTitle>
            <CardDescription>
              أدخل المبلغ الذي تريد استرداده
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ (ريال)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min={selectedRedemption.minAmount}
                max={currentBalance}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickAmount(25)}
                >
                  25%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickAmount(50)}
                >
                  50%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickAmount(75)}
                >
                  75%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickAmount(100)}
                >
                  الكل
                </Button>
              </div>
            </div>

            {/* Amount Validation */}
            {amount > 0 && (
              <div className="space-y-2">
                {amount < selectedRedemption.minAmount && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      الحد الأدنى للاسترداد هو {formatCurrency(selectedRedemption.minAmount)}
                    </AlertDescription>
                  </Alert>
                )}

                {amount > currentBalance && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      المبلغ أكبر من الرصيد المتاح
                    </AlertDescription>
                  </Alert>
                )}

                {canRedeem && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p>ملخص الاسترداد:</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span>المبلغ المطلوب:</span>
                          <span className="font-medium">{formatCurrency(amount)}</span>
                          
                          {selectedRedemption.bonus && (
                            <>
                              <span>مكافأة ({selectedRedemption.bonus}%):</span>
                              <span className="font-medium text-green-600">
                                +{formatCurrency(amount * selectedRedemption.bonus / 100)}
                              </span>
                            </>
                          )}
                          
                          {selectedRedemption.fee > 0 && (
                            <>
                              <span>الرسوم:</span>
                              <span className="font-medium text-red-600">
                                -{formatCurrency(selectedRedemption.fee)}
                              </span>
                            </>
                          )}
                          
                          <span className="font-semibold">المبلغ النهائي:</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(getEffectiveAmount())}
                          </span>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Redemption Button */}
            <Button
              onClick={handleRedeem}
              disabled={!canRedeem || isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                'جاري المعالجة...'
              ) : (
                <>
                  <Gift className="h-4 w-4 ml-2" />
                  استرداد {amount > 0 ? formatCurrency(amount) : 'الكاش باك'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5" />
            نصائح للاسترداد
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <p>
                استخدم بطاقات الهدايا للحصول على مكافآت إضافية تصل إلى 10%
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <p>
                الخصم من كشف الحساب يتم فورياً ويقلل من رصيد البطاقة
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <p>
                التحويل البنكي آمن ومضمون ولكن يحتاج وقت أطول للمعالجة
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <p>
                يمكنك إلغاء طلب الاسترداد خلال 24 ساعة من تقديمه
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
