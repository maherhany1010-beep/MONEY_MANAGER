'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPercentage, formatCurrency } from '@/lib/utils'
import { Store, Plus, Edit, Trash2, Save, X } from 'lucide-react'

export interface Merchant {
  id: string
  name: string
  category: string
  purchaseFee?: number // نسبة مئوية
  purchaseFeeFixed?: number // رسوم ثابتة
}

interface MerchantsManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  merchants: Merchant[]
  onSave: (merchants: Merchant[]) => void
}

export function MerchantsManager({ open, onOpenChange, merchants, onSave }: MerchantsManagerProps) {
  const [editedMerchants, setEditedMerchants] = useState<Merchant[]>(merchants)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newMerchant, setNewMerchant] = useState<Partial<Merchant>>({
    name: '',
    category: '',
    purchaseFee: 0,
    purchaseFeeFixed: 0
  })

  const categories = [
    'طعام ومشروبات',
    'وقود',
    'تسوق',
    'ترفيه',
    'سفر',
    'صحة',
    'تعليم',
    'فواتير',
    'أخرى'
  ]

  const handleAddMerchant = () => {
    if (!newMerchant.name || !newMerchant.category) return

    const merchant: Merchant = {
      id: Date.now().toString(),
      name: newMerchant.name,
      category: newMerchant.category,
      purchaseFee: newMerchant.purchaseFee || 0,
      purchaseFeeFixed: newMerchant.purchaseFeeFixed || 0
    }

    setEditedMerchants([...editedMerchants, merchant])
    setNewMerchant({
      name: '',
      category: '',
      purchaseFee: 0,
      purchaseFeeFixed: 0
    })
  }

  const handleUpdateMerchant = (id: string, updates: Partial<Merchant>) => {
    setEditedMerchants(editedMerchants.map(m => 
      m.id === id ? { ...m, ...updates } : m
    ))
  }

  const handleDeleteMerchant = (id: string) => {
    setEditedMerchants(editedMerchants.filter(m => m.id !== id))
  }

  const handleSave = () => {
    onSave(editedMerchants)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            إدارة الأماكن والتجار
          </DialogTitle>
          <DialogDescription>
            أضف وعدّل الأماكن المفضلة مع رسوم الشراء الخاصة بكل مكان
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* إضافة مكان جديد */}
          <div className="p-4 border-2 border-dashed rounded-lg space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إضافة مكان جديد
            </h4>
            
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>اسم المكان *</Label>
                <Input
                  placeholder="مثال: كارفور مصر"
                  value={newMerchant.name}
                  onChange={(e) => setNewMerchant({ ...newMerchant, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>الفئة *</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={newMerchant.category}
                  onChange={(e) => setNewMerchant({ ...newMerchant, category: e.target.value })}
                >
                  <option value="">اختر الفئة</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>رسوم الشراء (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={newMerchant.purchaseFee || ''}
                  onChange={(e) => setNewMerchant({ ...newMerchant, purchaseFee: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label>رسوم ثابتة (EGP)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newMerchant.purchaseFeeFixed || ''}
                  onChange={(e) => setNewMerchant({ ...newMerchant, purchaseFeeFixed: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <Button 
              onClick={handleAddMerchant} 
              disabled={!newMerchant.name || !newMerchant.category}
              className="w-full"
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة المكان
            </Button>
          </div>

          {/* قائمة الأماكن */}
          <div className="space-y-3">
            <h4 className="font-semibold">الأماكن المحفوظة ({editedMerchants.length})</h4>
            
            {editedMerchants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد أماكن محفوظة. أضف مكانك المفضل أعلاه.
              </div>
            ) : (
              <div className="space-y-2">
                {editedMerchants.map((merchant) => (
                  <div key={merchant.id} className="p-3 border rounded-lg">
                    {editingId === merchant.id ? (
                      // وضع التعديل
                      <div className="space-y-3">
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>اسم المكان</Label>
                            <Input
                              value={merchant.name}
                              onChange={(e) => handleUpdateMerchant(merchant.id, { name: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>الفئة</Label>
                            <select
                              className="w-full h-10 px-3 rounded-md border border-input bg-background"
                              value={merchant.category}
                              onChange={(e) => handleUpdateMerchant(merchant.id, { category: e.target.value })}
                            >
                              {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label>رسوم الشراء (%)</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={merchant.purchaseFee || 0}
                              onChange={(e) => handleUpdateMerchant(merchant.id, { purchaseFee: parseFloat(e.target.value) || 0 })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>رسوم ثابتة (EGP)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={merchant.purchaseFeeFixed || 0}
                              onChange={(e) => handleUpdateMerchant(merchant.id, { purchaseFeeFixed: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => setEditingId(null)}>
                            <Save className="h-4 w-4 ml-2" />
                            حفظ
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                            <X className="h-4 w-4 ml-2" />
                            إلغاء
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // وضع العرض
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{merchant.name}</p>
                            <Badge variant="secondary" className="text-xs">
                              {merchant.category}
                            </Badge>
                          </div>
                          <div className="flex gap-3 text-sm text-muted-foreground">
                            {merchant.purchaseFee && merchant.purchaseFee > 0 && (
                              <span>رسوم: {formatPercentage(merchant.purchaseFee)}</span>
                            )}
                            {merchant.purchaseFeeFixed && merchant.purchaseFeeFixed > 0 && (
                              <span>+ {formatCurrency(merchant.purchaseFeeFixed)}</span>
                            )}
                            {(!merchant.purchaseFee || merchant.purchaseFee === 0) && 
                             (!merchant.purchaseFeeFixed || merchant.purchaseFeeFixed === 0) && (
                              <span className="text-green-600">بدون رسوم</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditingId(merchant.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteMerchant(merchant.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 ml-2" />
            حفظ التغييرات
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

