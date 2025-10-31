/**
 * Script to generate remaining Zustand stores
 * 
 * This script generates all remaining stores based on the existing contexts
 * following the same pattern as bank-accounts-store.ts
 */

const fs = require('fs')
const path = require('path')

// Store configurations
const stores = [
  {
    name: 'cash-vaults',
    table: 'cash_vaults',
    interface: 'CashVault',
    fields: ['vault_name', 'location', 'balance', 'currency', 'status'],
  },
  {
    name: 'cards',
    table: 'credit_cards',
    interface: 'CreditCard',
    fields: ['card_name', 'card_number', 'bank_name', 'credit_limit', 'current_balance', 'billing_date', 'due_date', 'status'],
  },
  {
    name: 'prepaid-cards',
    table: 'prepaid_cards',
    interface: 'PrepaidCard',
    fields: ['card_name', 'card_number', 'balance', 'currency', 'expiry_date', 'status'],
  },
  {
    name: 'pos-machines',
    table: 'pos_machines',
    interface: 'POSMachine',
    fields: ['machine_name', 'machine_number', 'provider', 'commission_rate', 'status'],
  },
  {
    name: 'savings-circles',
    table: 'savings_circles',
    interface: 'SavingsCircle',
    fields: ['circle_name', 'total_amount', 'monthly_payment', 'start_date', 'end_date', 'status'],
  },
  {
    name: 'investments',
    table: 'investments',
    interface: 'Investment',
    fields: ['investment_name', 'investment_type', 'initial_amount', 'current_value', 'expected_return', 'start_date', 'maturity_date', 'status'],
  },
  {
    name: 'merchants',
    table: 'merchants',
    interface: 'Merchant',
    fields: ['merchant_name', 'category', 'total_spent'],
  },
  {
    name: 'central-transfers',
    table: 'central_transfers',
    interface: 'CentralTransfer',
    fields: ['from_account', 'to_account', 'amount', 'transfer_date', 'notes'],
  },
  {
    name: 'cashback',
    table: 'cashback',
    interface: 'Cashback',
    fields: ['source', 'amount', 'cashback_date', 'status'],
  },
  {
    name: 'reconciliation',
    table: 'reconciliation',
    interface: 'Reconciliation',
    fields: ['account_id', 'account_type', 'reconciliation_date', 'expected_balance', 'actual_balance', 'difference', 'status', 'notes'],
  },
]

function generateStoreTemplate(config) {
  const { name, table, interface: interfaceName, fields } = config
  const storeName = name.split('-').map((word, i) => 
    i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
  ).join('')
  const hookName = `use${interfaceName}sStore`
  const pluralInterface = `${interfaceName}s`
  const lowerPlural = interfaceName.toLowerCase() + 's'

  return `import { create } from 'zustand'
import { createClientComponentClient } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface ${interfaceName} {
  id: string
  user_id?: string
  ${fields.map(f => `${f}: any`).join('\n  ')}
  created_at?: string
  updated_at?: string
}

interface ${pluralInterface}State {
  ${lowerPlural}: ${interfaceName}[]
  loading: boolean
  error: string | null
  initialized: boolean
  channel: RealtimeChannel | null
  
  initialize: (userId: string) => Promise<void>
  cleanup: () => void
  add${interfaceName}: (item: Omit<${interfaceName}, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<${interfaceName} | null>
  update${interfaceName}: (id: string, updates: Partial<${interfaceName}>) => Promise<void>
  delete${interfaceName}: (id: string) => Promise<void>
  get${interfaceName}ById: (id: string) => ${interfaceName} | undefined
}

export const ${hookName} = create<${pluralInterface}State>((set, get) => ({
  ${lowerPlural}: [],
  loading: false,
  error: null,
  initialized: false,
  channel: null,

  initialize: async (userId: string) => {
    const state = get()
    if (state.initialized) return
    
    const supabase = createClientComponentClient()
    
    try {
      set({ loading: true, error: null })

      const { data, error: fetchError } = await supabase
        .from('${table}')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        set({ error: fetchError.message, loading: false })
        return
      }

      set({ ${lowerPlural}: data || [], loading: false, initialized: true })

      const channel: RealtimeChannel = supabase
        .channel('${table}_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: '${table}',
          filter: \`user_id=eq.\${userId}\`,
        }, (payload) => {
          const current = get().${lowerPlural}
          if (payload.eventType === 'INSERT') {
            set({ ${lowerPlural}: [payload.new as ${interfaceName}, ...current] })
          } else if (payload.eventType === 'UPDATE') {
            set({ ${lowerPlural}: current.map((item) => item.id === (payload.new as ${interfaceName}).id ? (payload.new as ${interfaceName}) : item) })
          } else if (payload.eventType === 'DELETE') {
            set({ ${lowerPlural}: current.filter((item) => item.id !== (payload.old as ${interfaceName}).id) })
          }
        })
        .subscribe()

      set({ channel })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع', loading: false })
    }
  },

  cleanup: () => {
    const { channel } = get()
    if (channel) channel.unsubscribe()
    set({ initialized: false, channel: null, ${lowerPlural}: [] })
  },

  add${interfaceName}: async (item) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('${table}')
        .insert([{ user_id: user.id, ...item }])
        .select()
        .single()

      if (error) {
        set({ error: error.message })
        return null
      }
      return data
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
      return null
    }
  },

  update${interfaceName}: async (id, updates) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('${table}')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) set({ error: error.message })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  delete${interfaceName}: async (id) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('${table}')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) set({ error: error.message })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  get${interfaceName}ById: (id) => get().${lowerPlural}.find((item) => item.id === id),
}))
`
}

// Generate all stores
stores.forEach((config) => {
  const content = generateStoreTemplate(config)
  const filename = `${config.name}-store.ts`
  const filepath = path.join(__dirname, '..', 'src', 'stores', filename)
  
  fs.writeFileSync(filepath, content, 'utf8')
  console.log(`✅ Generated: ${filename}`)
})

console.log(`\n🎉 Successfully generated ${stores.length} stores!`)

