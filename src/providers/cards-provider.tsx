'use client'

import { ReactNode } from 'react'
import { CardsProvider as CreditCardsProvider } from '@/contexts/cards-context'
import { CashbackProvider } from '@/contexts/cashback-context'
import { MerchantsProvider } from '@/contexts/merchants-context'

/**
 * CardsAndCashbackProvider
 * 
 * Groups card-related providers:
 * - Credit Cards
 * - Cashback
 * - Merchants
 */
export function CardsAndCashbackProvider({ children }: { children: ReactNode }) {
  return (
    <MerchantsProvider>
      <CreditCardsProvider>
        <CashbackProvider>
          {children}
        </CashbackProvider>
      </CreditCardsProvider>
    </MerchantsProvider>
  )
}

