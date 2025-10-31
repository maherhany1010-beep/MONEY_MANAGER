'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📦 Database Schema Interface
// ===================================
export interface Product {
  // Database fields (snake_case)
  id: string
  user_id?: string
  name: string
  description: string | null
  price: number
  cost: number | null
  stock_quantity: number
  category: string | null
  created_at?: string
  updated_at?: string
  
  // Legacy fields for backward compatibility (camelCase)
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
  maxStockLevel?: number
  reorderPoint?: number
  supplier?: string
  isActive?: boolean
  imageUrl?: string
  weight?: number
  dimensions?: string
  taxRate?: number
  discount?: number
  totalStock?: number
  sellingPrice?: number
  unitType?: string
  minStockAlert?: number
  purchasePrice?: number
  unitsPerBox?: number
  wholesalePrice?: number
  lastRestockDate?: string
  expiryDate?: string
  storageLocation?: string
  notes?: string
}

interface ProductsContextType {
  products: Product[]
  loading: boolean
  error: string | null
  addProduct: (product: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Product | null>
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  getProductById: (id: string) => Product | undefined
  searchProducts: (query: string) => Product[]
  getLowStockProducts: () => Product[]
  getProductsByCategory: (category: string) => Product[]
  updateStock: (id: string, quantity: number) => Promise<void>
  adjustStock: (id: string, quantity: number) => Promise<void>
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

// ===================================
// 🎯 Provider Component
// ===================================
export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  // ===================================
  // 📥 Load products from Supabase
  // ===================================
  const loadProducts = async () => {
    if (!user) {
      setProducts([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error loading products:', fetchError)
        setError(fetchError.message)
      } else {
        setProducts(data || [])
      }
    } catch (err) {
      console.error('Unexpected error loading products:', err)
      setError('حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  // ===================================
  // 🔄 Real-time subscription
  // ===================================
  useEffect(() => {
    if (!user) {
      setProducts([])
      setLoading(false)
      return
    }

    loadProducts()

    const channel: RealtimeChannel = supabase
      .channel('products_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProducts((prev) => [payload.new as Product, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setProducts((prev) =>
              prev.map((product) =>
                product.id === (payload.new as Product).id
                  ? (payload.new as Product)
                  : product
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setProducts((prev) =>
              prev.filter((product) => product.id !== (payload.old as Product).id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user, supabase])

  // ===================================
  // ➕ Add product
  // ===================================
  const addProduct = async (
    product: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<Product | null> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return null
    }

    try {
      const { data, error: insertError } = await supabase
        .from('products')
        .insert([
          {
            user_id: user.id,
            name: product.name,
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
        setError(insertError.message)
        return null
      }

      return data
    } catch (err) {
      console.error('Unexpected error adding product:', err)
      setError('حدث خطأ غير متوقع')
      return null
    }
  }

  // ===================================
  // 🔄 Update product
  // ===================================
  const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating product:', updateError)
        setError(updateError.message)
      }
    } catch (err) {
      console.error('Unexpected error updating product:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🗑️ Delete product
  // ===================================
  const deleteProduct = async (id: string): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error deleting product:', deleteError)
        setError(deleteError.message)
      }
    } catch (err) {
      console.error('Unexpected error deleting product:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 📦 Update stock
  // ===================================
  const updateStock = async (id: string, quantity: number): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock_quantity: quantity })
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating stock:', updateError)
        setError(updateError.message)
      }
    } catch (err) {
      console.error('Unexpected error updating stock:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🔍 Get product by ID
  // ===================================
  const getProductById = (id: string): Product | undefined => {
    return products.find((p) => p.id === id)
  }

  // ===================================
  // 🔎 Search products
  // ===================================
  const searchProducts = (query: string): Product[] => {
    const lowerQuery = query.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery) ||
        p.category?.toLowerCase().includes(lowerQuery)
    )
  }

  // ===================================
  // ⚠️ Get low stock products
  // ===================================
  const getLowStockProducts = (): Product[] => {
    return products.filter((p) => p.stock_quantity < (p.minStockLevel || 10))
  }

  // ===================================
  // 📂 Get products by category
  // ===================================
  const getProductsByCategory = (category: string): Product[] => {
    return products.filter((p) => p.category === category)
  }

  // ===================================
  // 🔧 Adjust stock (alias for updateStock)
  // ===================================
  const adjustStock = async (id: string, quantity: number): Promise<void> => {
    await updateStock(id, quantity)
  }

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        searchProducts,
        getLowStockProducts,
        getProductsByCategory,
        updateStock,
        adjustStock,
      }}
    >
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider')
  }
  return context
}

