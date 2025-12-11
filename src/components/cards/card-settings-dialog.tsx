'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCards, CreditCard } from '@/contexts/cards-context'
import { toast } from '@/lib/toast'
import { formatCurrency } from '@/lib/utils'
import { Settings, Bell, CreditCard as CreditCardIcon, User, DollarSign, Save, X } from 'lucide-react'

interface CardSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: CreditCard
}

export function CardSettingsDialog({ open, onOpenChange, card }: CardSettingsDialogProps) {
  const { updateCard } = useCards()
  const [isLoading, setIsLoading] = useState(false)

  // Card basic info
  const [cardInfo, setCardInfo] = useState({
    name: card.card_name || card.name,
    bankName: card.bank_name || card.bankName,
    creditLimit: card.credit_limit || card.creditLimit,
    cashbackRate: 0,
    dueDate: card.due_date || card.dueDate,
    status: card.status || 'active',
  })

  // Notifications settings
  const [notifications, setNotifications] = useState({
    purchaseAlert: true,
    paymentReminder: true,
    limitAlert: true,
    cashbackAlert: true,
    unusualActivity: true,
    monthlyStatement: true,
  })

  // Fees & Charges
  const [feesCharges, setFeesCharges] = useState({
    annualFee: card.annualFee || 0,
    cashWithdrawalFee: card.cashWithdrawalFee || 0,
    latePaymentFee: card.latePaymentFee || 0,
    overLimitFee: card.overLimitFee || 0,
    annualInterestRate: card.annualInterestRate || 0,
    foreignTransactionFee: card.foreignTransactionFee || 0,
    cardReplacementFee: card.cardReplacementFee || 0,
  })

  // Card Holder Info
  const [holderInfo, setHolderInfo] = useState({
    fullName: card.holderInfo?.fullName || '',
    phoneNumber: card.holderInfo?.phoneNumber || '',
    email: card.holderInfo?.email || '',
    nationalId: card.holderInfo?.nationalId || '',
    address: card.holderInfo?.address || '',
  })

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateCard(card.id, {
        card_name: cardInfo.name,
        bank_name: cardInfo.bankName,
        credit_limit: cardInfo.creditLimit,
        due_date: cardInfo.dueDate,
        status: cardInfo.status,
      })

      toast.success('تم حفظ الإعدادات بنجاح')
      onOpenChange(false)
    } catch (error) {
      toast.error('فشل في حفظ الإعدادات')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5" />
            إعدادات البطاقة
          </DialogTitle>
          <DialogDescription>
            إدارة إعدادات البطاقة والتنبيهات والمصاريف
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="gap-2">
              <CreditCardIcon className="h-4 w-4" />
              معلومات أساسية
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              التنبيهات
            </TabsTrigger>
            <TabsTrigger value="fees" className="gap-2">
              <DollarSign className="h-4 w-4" />
              المصاريف والرسوم
            </TabsTrigger>
            <TabsTrigger value="holder" className="gap-2">
              <User className="h-4 w-4" />
              صاحب البطاقة
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>المعلومات الأساسية</CardTitle>
                <CardDescription>تعديل معلومات البطاقة الأساسية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">اسم البطاقة</Label>
                    <Input
                      id="cardName"
                      value={cardInfo.name}
                      onChange={(e) => setCardInfo({ ...cardInfo, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankName">اسم البنك</Label>
                    <Input
                      id="bankName"
                      value={cardInfo.bankName}
                      onChange={(e) => setCardInfo({ ...cardInfo, bankName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="creditLimit">الحد الائتماني (ج.م)</Label>
                    <Input
                      id="creditLimit"
                      type="number"
                      value={cardInfo.creditLimit}
                      onChange={(e) => setCardInfo({ ...cardInfo, creditLimit: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cashbackRate">نسبة الكاش باك (%)</Label>
                    <Input
                      id="cashbackRate"
                      type="number"
                      step="0.1"
                      value={cardInfo.cashbackRate}
                      onChange={(e) => setCardInfo({ ...cardInfo, cashbackRate: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">تاريخ السداد (يوم من الشهر)</Label>
                    <Input
                      id="dueDate"
                      type="number"
                      min="1"
                      max="31"
                      value={cardInfo.dueDate}
                      onChange={(e) => setCardInfo({ ...cardInfo, dueDate: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardType">نوع البطاقة</Label>
                    <Input
                      id="cardType"
                      value={card.cardType}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>حالة البطاقة</Label>
                    <p className="text-sm text-muted-foreground">
                      {cardInfo.status === 'active' ? 'البطاقة نشطة' : 'البطاقة معطلة'}
                    </p>
                  </div>
                  <Switch
                    checked={cardInfo.status === 'active'}
                    onCheckedChange={(checked) => setCardInfo({ ...cardInfo, status: checked ? 'active' : 'blocked' })}
                  />
                </div>

                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">رقم البطاقة:</span>
                    <span className="font-medium">**** **** **** {card.cardNumberLastFour}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الرصيد الحالي:</span>
                    <span className="font-medium">{formatCurrency(card.currentBalance ?? 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الرصيد المتاح:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency((cardInfo.creditLimit ?? 0) - (card.currentBalance ?? 0))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات التنبيهات</CardTitle>
                <CardDescription>تخصيص التنبيهات التي تريد استلامها</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'purchaseAlert', label: 'تنبيه عند كل عملية شراء', description: 'احصل على إشعار فوري عند كل معاملة' },
                  { key: 'paymentReminder', label: 'تذكير بموعد السداد', description: 'تذكير قبل موعد السداد بعدة أيام' },
                  { key: 'limitAlert', label: 'تنبيه عند اقتراب الحد', description: 'إشعار عند الوصول لنسبة معينة من الحد الائتماني' },
                  { key: 'cashbackAlert', label: 'تنبيه الكاش باك', description: 'إشعار عند كسب كاش باك جديد' },
                  { key: 'unusualActivity', label: 'تنبيه النشاط غير المعتاد', description: 'إشعار عند اكتشاف نشاط مشبوه' },
                  { key: 'monthlyStatement', label: 'كشف الحساب الشهري', description: 'استلام كشف الحساب الشهري' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label>{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications]}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, [item.key]: checked })
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fees & Charges Tab */}
          <TabsContent value="fees" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>المصاريف والرسوم</CardTitle>
                <CardDescription>إدارة الرسوم والمصاريف المرتبطة بالبطاقة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="annualFee">الرسوم السنوية (ج.م)</Label>
                    <Input
                      id="annualFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={feesCharges.annualFee}
                      onChange={(e) =>
                        setFeesCharges({ ...feesCharges, annualFee: parseFloat(e.target.value) || 0 })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      الرسوم السنوية للبطاقة
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cashWithdrawalFee">رسوم السحب النقدي (%)</Label>
                    <Input
                      id="cashWithdrawalFee"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={feesCharges.cashWithdrawalFee}
                      onChange={(e) =>
                        setFeesCharges({ ...feesCharges, cashWithdrawalFee: parseFloat(e.target.value) || 0 })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      نسبة رسوم السحب النقدي من المبلغ
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="latePaymentFee">رسوم التأخير (ج.م)</Label>
                    <Input
                      id="latePaymentFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={feesCharges.latePaymentFee}
                      onChange={(e) =>
                        setFeesCharges({ ...feesCharges, latePaymentFee: parseFloat(e.target.value) || 0 })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      رسوم التأخر عن السداد
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="overLimitFee">رسوم تجاوز الحد (ج.م)</Label>
                    <Input
                      id="overLimitFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={feesCharges.overLimitFee}
                      onChange={(e) =>
                        setFeesCharges({ ...feesCharges, overLimitFee: parseFloat(e.target.value) || 0 })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      رسوم تجاوز الحد الائتماني
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="annualInterestRate">معدل الفائدة السنوي - APR (%)</Label>
                    <Input
                      id="annualInterestRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={feesCharges.annualInterestRate}
                      onChange={(e) =>
                        setFeesCharges({ ...feesCharges, annualInterestRate: parseFloat(e.target.value) || 0 })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      معدل الفائدة السنوي على الرصيد المستحق
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="foreignTransactionFee">رسوم المعاملات الدولية (%)</Label>
                    <Input
                      id="foreignTransactionFee"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={feesCharges.foreignTransactionFee}
                      onChange={(e) =>
                        setFeesCharges({ ...feesCharges, foreignTransactionFee: parseFloat(e.target.value) || 0 })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      نسبة رسوم المعاملات بالعملات الأجنبية
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardReplacementFee">رسوم استبدال البطاقة (ج.م)</Label>
                    <Input
                      id="cardReplacementFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={feesCharges.cardReplacementFee}
                      onChange={(e) =>
                        setFeesCharges({ ...feesCharges, cardReplacementFee: parseFloat(e.target.value) || 0 })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      رسوم إصدار بطاقة بديلة
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    💡 تأكد من مراجعة شروط وأحكام البنك للحصول على معلومات دقيقة حول الرسوم
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Card Holder Tab */}
          <TabsContent value="holder" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>معلومات صاحب البطاقة</CardTitle>
                <CardDescription>تعديل معلومات صاحب البطاقة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="holderFullName">الاسم الكامل</Label>
                    <Input
                      id="holderFullName"
                      value={holderInfo.fullName}
                      onChange={(e) => setHolderInfo({ ...holderInfo, fullName: e.target.value })}
                      placeholder="أدخل الاسم الكامل"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="holderPhone">رقم الهاتف</Label>
                    <Input
                      id="holderPhone"
                      value={holderInfo.phoneNumber}
                      onChange={(e) => setHolderInfo({ ...holderInfo, phoneNumber: e.target.value })}
                      placeholder="+20 100 123 4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="holderEmail">البريد الإلكتروني</Label>
                    <Input
                      id="holderEmail"
                      type="email"
                      value={holderInfo.email}
                      onChange={(e) => setHolderInfo({ ...holderInfo, email: e.target.value })}
                      placeholder="example@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="holderNationalId">الرقم القومي</Label>
                    <Input
                      id="holderNationalId"
                      value={holderInfo.nationalId}
                      onChange={(e) => setHolderInfo({ ...holderInfo, nationalId: e.target.value })}
                      placeholder="29012011234567"
                      maxLength={14}
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="holderAddress">العنوان</Label>
                    <Input
                      id="holderAddress"
                      value={holderInfo.address}
                      onChange={(e) => setHolderInfo({ ...holderInfo, address: e.target.value })}
                      placeholder="المدينة، الحي، الشارع"
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 تأكد من صحة المعلومات المدخلة قبل الحفظ
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            <X className="h-4 w-4 ml-2" />
            إلغاء
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 ml-2" />
            {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

