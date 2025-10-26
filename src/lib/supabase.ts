import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const createClientComponentClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Legacy client for backward compatibility
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      credit_cards: {
        Row: {
          id: string
          user_id: string
          name: string
          bank_name: string
          card_number_last_four: string
          card_type: 'visa' | 'mastercard' | 'amex' | 'other'
          credit_limit: number
          current_balance: number
          cashback_rate: number
          due_date: number // day of month (1-31)
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          bank_name: string
          card_number_last_four: string
          card_type: 'visa' | 'mastercard' | 'amex' | 'other'
          credit_limit: number
          current_balance?: number
          cashback_rate?: number
          due_date: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          bank_name?: string
          card_number_last_four?: string
          card_type?: 'visa' | 'mastercard' | 'amex' | 'other'
          credit_limit?: number
          current_balance?: number
          cashback_rate?: number
          due_date?: number
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          card_id: string
          type: 'withdrawal' | 'deposit' | 'payment' | 'cashback'
          amount: number
          description: string
          category: string
          transaction_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          card_id: string
          type: 'withdrawal' | 'deposit' | 'payment' | 'cashback'
          amount: number
          description: string
          category?: string
          transaction_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          card_id?: string
          type?: 'withdrawal' | 'deposit' | 'payment' | 'cashback'
          amount?: number
          description?: string
          category?: string
          transaction_date?: string
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          card_id: string
          amount: number
          payment_date: string
          due_date: string
          status: 'pending' | 'completed' | 'overdue'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          card_id: string
          amount: number
          payment_date?: string
          due_date: string
          status?: 'pending' | 'completed' | 'overdue'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          card_id?: string
          amount?: number
          payment_date?: string
          due_date?: string
          status?: 'pending' | 'completed' | 'overdue'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
