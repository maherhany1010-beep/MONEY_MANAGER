import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Mock client for development
const createMockClient = () => {
  return {
    auth: {
      signUp: async (credentials: any) => {
        console.log('Mock signUp:', credentials.email)
        return {
          data: {
            user: {
              id: 'mock-user-id',
              email: credentials.email,
              created_at: new Date().toISOString()
            },
            session: {
              access_token: 'mock-access-token',
              refresh_token: 'mock-refresh-token'
            }
          },
          error: null
        }
      },
      signInWithPassword: async (credentials: any) => {
        console.log('Mock signIn:', credentials.email)
        return {
          data: {
            user: {
              id: 'mock-user-id',
              email: credentials.email,
              created_at: new Date().toISOString()
            },
            session: {
              access_token: 'mock-access-token',
              refresh_token: 'mock-refresh-token'
            }
          },
          error: null
        }
      },
      signOut: async () => {
        console.log('Mock signOut')
        return { error: null }
      },
      getSession: async () => {
        return {
          data: { session: null },
          error: null
        }
      },
      getUser: async () => {
        return {
          data: { user: null },
          error: null
        }
      },
      onAuthStateChange: (callback: any) => {
        console.log('Mock onAuthStateChange')
        return {
          data: {
            subscription: {
              unsubscribe: () => console.log('Mock unsubscribe')
            }
          }
        }
      }
    },
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => ({ data: null, error: null }),
          limit: (count: number) => ({
            order: (column: string, options?: any) => Promise.resolve({ data: [], error: null })
          }),
          order: (column: string, options?: any) => Promise.resolve({ data: [], error: null })
        }),
        order: (column: string, options?: any) => Promise.resolve({ data: [], error: null }),
        limit: (count: number) => Promise.resolve({ data: [], error: null })
      }),
      insert: (data: any) => Promise.resolve({ data: null, error: null }),
      update: (data: any) => ({
        eq: (column: string, value: any) => Promise.resolve({ data: null, error: null })
      }),
      delete: () => ({
        eq: (column: string, value: any) => Promise.resolve({ data: null, error: null })
      })
    })
  }
}

// Check if we should use mock client
const shouldUseMockClient = () => {
  return !supabaseUrl || !supabaseAnonKey ||
         supabaseUrl.includes('demo') ||
         supabaseAnonKey.includes('demo') ||
         supabaseUrl.includes('xyzcompany')
}

// Client-side Supabase client
export const createClientComponentClient = () => {
  if (shouldUseMockClient()) {
    console.log('Using mock Supabase client for development')
    return createMockClient() as any
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Legacy client for backward compatibility
export const supabase = shouldUseMockClient() ? createMockClient() as any : createClient(supabaseUrl, supabaseAnonKey)

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
