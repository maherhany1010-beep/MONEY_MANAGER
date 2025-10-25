'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { Landmark, Plus, Edit, Trash2, Save, X } from 'lucide-react'

export interface BankAccount {
  id: string
  accountName: string
  bankName: string
  accountNumber: string
  accountType: 'checking' | 'savings' | 'current' // جاري، توفير، حساب جاري
  balance?: number
  isDefault?: boolean
}

interface BankAccountsManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accounts: BankAccount[]
  onSave: (accounts: BankAccount[]) => void
}

export function BankAccountsManager({ open, onOpenChange, accounts, onSave }: BankAccountsManagerProps) {
  const [editedAccounts, setEditedAccounts] = useState<BankAccount[]>(accounts)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newAccount, setNewAccount] = useState<Partial<BankAccount>>({
    accountName: '',
    bankName: '',
    accountNumber: '',
    accountType: 'checking',
    balance: 0,
    isDefault: false
  })

  const accountTypes = [
    { value: 'checking', label: 'حساب جاري' },
    { value: 'savings', label: 'حساب توفير' },
    { value: 'current', label: 'حساب تجاري' }
  ]

  const handleAddAccount = () => {
    if (!newAccount.accountName || !newAccount.bankName || !newAccount.accountNumber) return

    const account: BankAccount = {
      id: Date.now().toString(),
      accountName: newAccount.accountName,
      bankName: newAccount.bankName,
      accountNumber: newAccount.accountNumber,
      accountType: newAccount.accountType as 'checking' | 'savings' | 'current',
      balance: newAccount.balance || 0,
      isDefault: editedAccounts.length === 0 ? true : (newAccount.isDefault || false)
    }

    setEditedAccounts([...editedAccounts, account])
    setNewAccount({
      accountName: '',
      bankName: '',
      accountNumber: '',
      accountType: 'checking',
      balance: 0,
      isDefault: false
    })
  }

  const handleUpdateAccount = (id: string, updates: Partial<BankAccount>) => {
    setEditedAccounts(editedAccounts.map(acc => 
      acc.id === id ? { ...acc, ...updates } : acc
    ))
  }

  const handleDeleteAccount = (id: string) => {
    const accountToDelete = editedAccounts.find(acc => acc.id === id)
    const remainingAccounts = editedAccounts.filter(acc => acc.id !== id)
    
    // إذا كان الحساب المحذوف هو الافتراضي، اجعل أول حساب متبقي افتراضي
    if (accountToDelete?.isDefault && remainingAccounts.length > 0) {
      remainingAccounts[0].isDefault = true
    }
    
    setEditedAccounts(remainingAccounts)
  }

  const handleSetDefault = (id: string) => {
    setEditedAccounts(editedAccounts.map(acc => ({
      ...acc,
      isDefault: acc.id === id
    })))
  }

  const handleSave = () => {
    onSave(editedAccounts)
    onOpenChange(false)
  }

  const getAccountTypeLabel = (type: string) => {
    return accountTypes.find(t => t.value === type)?.label || type
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            إدارة الحسابات البنكية
          </DialogTitle>
          <DialogDescription>
            أضف وعدّل حساباتك البنكية للاستخدام في عمليات السداد
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* إضافة حساب جديد */}
          <div className="p-4 border-2 border-dashed rounded-lg space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إضافة حساب بنكي جديد
            </h4>
            
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>اسم الحساب *</Label>
                <Input
                  placeholder="مثال: حسابي الجاري"
                  value={newAccount.accountName}
                  onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>اسم البنك *</Label>
                <Input
                  placeholder="مثال: البنك الأهلي المصري"
                  value={newAccount.bankName}
                  onChange={(e) => setNewAccount({ ...newAccount, bankName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>رقم الحساب *</Label>
                <Input
                  placeholder="1234567890"
                  value={newAccount.accountNumber}
                  onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>نوع الحساب</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={newAccount.accountType}
                  onChange={(e) => setNewAccount({ ...newAccount, accountType: e.target.value as any })}
                >
                  {accountTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>الرصيد الحالي (اختياري)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newAccount.balance || ''}
                  onChange={(e) => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <Button 
              onClick={handleAddAccount} 
              disabled={!newAccount.accountName || !newAccount.bankName || !newAccount.accountNumber}
              className="w-full"
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة الحساب
            </Button>
          </div>

          {/* قائمة الحسابات */}
          <div className="space-y-3">
            <h4 className="font-semibold">الحسابات المحفوظة ({editedAccounts.length})</h4>
            
            {editedAccounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد حسابات بنكية محفوظة. أضف حسابك الأول أعلاه.
              </div>
            ) : (
              <div className="space-y-2">
                {editedAccounts.map((account) => (
                  <div key={account.id} className="p-3 border rounded-lg">
                    {editingId === account.id ? (
                      // وضع التعديل
                      <div className="space-y-3">
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>اسم الحساب</Label>
                            <Input
                              value={account.accountName}
                              onChange={(e) => handleUpdateAccount(account.id, { accountName: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>اسم البنك</Label>
                            <Input
                              value={account.bankName}
                              onChange={(e) => handleUpdateAccount(account.id, { bankName: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>رقم الحساب</Label>
                            <Input
                              value={account.accountNumber}
                              onChange={(e) => handleUpdateAccount(account.id, { accountNumber: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>نوع الحساب</Label>
                            <select
                              className="w-full h-10 px-3 rounded-md border border-input bg-background"
                              value={account.accountType}
                              onChange={(e) => handleUpdateAccount(account.id, { accountType: e.target.value as any })}
                            >
                              {accountTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label>الرصيد الحالي</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={account.balance || 0}
                              onChange={(e) => handleUpdateAccount(account.id, { balance: parseFloat(e.target.value) || 0 })}
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
                            <p className="font-medium">{account.accountName}</p>
                            {account.isDefault && (
                              <Badge variant="default" className="text-xs">
                                افتراضي
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {getAccountTypeLabel(account.accountType)}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>{account.bankName}</p>
                            <p>رقم الحساب: {account.accountNumber}</p>
                            {account.balance !== undefined && account.balance > 0 && (
                              <p className="text-green-600 font-medium">
                                الرصيد: {formatCurrency(account.balance)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!account.isDefault && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSetDefault(account.id)}
                            >
                              جعله افتراضي
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditingId(account.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteAccount(account.id)}
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

