'use client'

import { ReactNode } from 'react'
import { CustomersProvider } from '@/contexts/customers-context'
import { ProductsProvider } from '@/contexts/products-context'
import { SalesProvider } from '@/contexts/sales-context'

/**
 * BusinessProvider
 * 
 * Groups business-related providers:
 * - Customers
 * - Products
 * - Sales
 */
export function BusinessProvider({ children }: { children: ReactNode }) {
  return (
    <CustomersProvider>
      <ProductsProvider>
        <SalesProvider>
          {children}
        </SalesProvider>
      </ProductsProvider>
    </CustomersProvider>
  )
}

