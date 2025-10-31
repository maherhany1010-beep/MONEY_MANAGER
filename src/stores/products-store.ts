import { create } from 'zustand'
import { createClientComponentClient } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface Product {
  id: string
  user_id?: string
  product_name: string
  description: string | null
  price: number
  cost: number | null
  stock_quantity: number
  category: string | null
  created_at?: string
  updated_at?: string
  
  productName?: string
  productDescription?: string
  productPrice?: number
  productCost?: number
  stockQuantity?: number
  productCategory?: string
  sku?: string
  barcode?: string
  unit?: string
  minStockLevel?: number
  isActive?: boolean
}

interface ProductsState {
  products: Product[]
  loading: boolean
  error: string | null
  initialized: boolean
  channel: RealtimeChannel | null
  
  initialize: (userId: string) => Promise<void>
  cleanup: () => void
  addProduct: (product: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Product | null>
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  updateStock: (id: string, quantity: number) => Promise<void>
  
  getProductById: (id: string) => Product | undefined
  searchProducts: (query: string) => Product[]
  getLowStockProducts: (threshold?: number) => Product[]
  getProductsByCategory: (category: string) => Product[]
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
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
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error loading products:', fetchError)
        set({ error: fetchError.message, loading: false })
        return
      }

      set({ products: data || [], loading: false, initialized: true })

      const channel: RealtimeChannel = supabase
        .channel('products_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'products',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const currentProducts = get().products
            
            if (payload.eventType === 'INSERT') {
              set({ products: [payload.new as Product, ...currentProducts] })
            } else if (payload.eventType === 'UPDATE') {
              set({
                products: currentProducts.map((p) =>
                  p.id === (payload.new as Product).id ? (payload.new as Product) : p
                ),
              })
            } else if (payload.eventType === 'DELETE') {
              set({
                products: currentProducts.filter((p) => p.id !== (payload.old as Product).id),
              })
            }
          }
        )
        .subscribe()

      set({ channel })
    } catch (err) {
      console.error('Unexpected error initializing products:', err)
      set({ error: 'حدث خطأ غير متوقع', loading: false })
    }
  },

  cleanup: () => {
    const { channel } = get()
    if (channel) {
      channel.unsubscribe()
    }
    set({ initialized: false, channel: null, products: [] })
  },

  addProduct: async (product) => {
    const supabase = createClientComponentClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        set({ error: 'يجب تسجيل الدخول أولاً' })
        return null
      }

      const { data, error: insertError } = await supabase
        .from('products')
        .insert([
          {
            user_id: user.id,
            product_name: product.product_name,
            description: product.description,
            price: product.price,
            cost: product.cost,
            stock_quantity: product.stock_quantity || 0,
            category: product.category,
          },
        ])
        .select()
        .single()

      if (insertError) {
        console.error('Error adding product:', insertError)
        set({ error: insertError.message })
        return null
      }

      return data
    } catch (err) {
      console.error('Unexpected error adding product:', err)
      set({ error: 'حدث خطأ غير متوقع' })
      return null
    }
  },

  updateProduct: async (id, updates) => {
    const supabase = createClientComponentClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        set({ error: 'يجب تسجيل الدخول أولاً' })
        return
      }

      const { error: updateError } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating product:', updateError)
        set({ error: updateError.message })
      }
    } catch (err) {
      console.error('Unexpected error updating product:', err)
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  deleteProduct: async (id) => {
    const supabase = createClientComponentClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        set({ error: 'يجب تسجيل الدخول أولاً' })
        return
      }

      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error deleting product:', deleteError)
        set({ error: deleteError.message })
      }
    } catch (err) {
      console.error('Unexpected error deleting product:', err)
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  updateStock: async (id, quantity) => {
    await get().updateProduct(id, { stock_quantity: quantity })
  },

  getProductById: (id) => {
    return get().products.find((p) => p.id === id)
  },

  searchProducts: (query) => {
    const lowerQuery = query.toLowerCase()
    return get().products.filter(
      (p) =>
        p.product_name.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery) ||
        p.category?.toLowerCase().includes(lowerQuery)
    )
  },

  getLowStockProducts: (threshold = 10) => {
    return get().products.filter((p) => p.stock_quantity < threshold)
  },

  getProductsByCategory: (category) => {
    return get().products.filter((p) => p.category === category)
  },
}))

