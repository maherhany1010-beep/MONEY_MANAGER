'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Product {
  id: string
  name: string
  barcode?: string
  category: string
  description?: string
  imageUrl?: string
  unitsPerBox: number
  unitType: string
  totalStock: number
  minStockAlert: number
  purchasePrice: number
  sellingPrice: number
  wholesalePrice?: number
  supplier?: string
  lastRestockDate?: string
  expiryDate?: string
  storageLocation?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface StockMovement {
  id: string
  productId: string
  productName: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason: string
  date: string
  notes?: string
}

interface ProductsContextType {
  products: Product[]
  stockMovements: StockMovement[]
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  restockProduct: (productId: string, quantity: number, notes?: string) => void
  adjustStock: (productId: string, quantity: number, reason: string, notes?: string) => void
  getProductById: (id: string) => Product | undefined
  getLowStockProducts: () => Product[]
  getStockMovementsByProduct: (productId: string) => StockMovement[]
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('products')
    const savedMovements = localStorage.getItem('stockMovements')
    
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts))
    }
    if (savedMovements) {
      setStockMovements(JSON.parse(savedMovements))
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products))
  }, [products])

  useEffect(() => {
    localStorage.setItem('stockMovements', JSON.stringify(stockMovements))
  }, [stockMovements])

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setProducts([...products, newProduct])

    // Add initial stock movement
    if (newProduct.totalStock > 0) {
      const movement: StockMovement = {
        id: `movement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productId: newProduct.id,
        productName: newProduct.name,
        type: 'in',
        quantity: newProduct.totalStock,
        reason: 'مخزون أولي',
        date: new Date().toISOString(),
        notes: 'إضافة منتج جديد',
      }
      setStockMovements([...stockMovements, movement])
    }
  }

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(products.map(product =>
      product.id === id
        ? { ...product, ...productData, updatedAt: new Date().toISOString() }
        : product
    ))
  }

  const deleteProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id))
    setStockMovements(stockMovements.filter(movement => movement.productId !== id))
  }

  const restockProduct = (productId: string, quantity: number, notes?: string) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    // Update product stock
    updateProduct(productId, {
      totalStock: product.totalStock + quantity,
      lastRestockDate: new Date().toISOString(),
    })

    // Add stock movement
    const movement: StockMovement = {
      id: `movement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId,
      productName: product.name,
      type: 'in',
      quantity,
      reason: 'إعادة تعبئة المخزون',
      date: new Date().toISOString(),
      notes,
    }
    setStockMovements([...stockMovements, movement])
  }

  const adjustStock = (productId: string, quantity: number, reason: string, notes?: string) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    // Update product stock
    updateProduct(productId, {
      totalStock: product.totalStock + quantity,
    })

    // Add stock movement
    const movement: StockMovement = {
      id: `movement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId,
      productName: product.name,
      type: quantity > 0 ? 'in' : 'out',
      quantity: Math.abs(quantity),
      reason,
      date: new Date().toISOString(),
      notes,
    }
    setStockMovements([...stockMovements, movement])
  }

  const getProductById = (id: string) => {
    return products.find(product => product.id === id)
  }

  const getLowStockProducts = () => {
    return products.filter(product => product.totalStock <= product.minStockAlert)
  }

  const getStockMovementsByProduct = (productId: string) => {
    return stockMovements
      .filter(movement => movement.productId === productId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  return (
    <ProductsContext.Provider
      value={{
        products,
        stockMovements,
        addProduct,
        updateProduct,
        deleteProduct,
        restockProduct,
        adjustStock,
        getProductById,
        getLowStockProducts,
        getStockMovementsByProduct,
      }}
    >
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider')
  }
  return context
}

