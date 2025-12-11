'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  devSkipAuth: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  devSkipAuth: () => {},
})

// Development mode: Create a fake user for testing
const createDevUser = (): User => ({
  id: 'dev-user-id',
  email: 'dev@test.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [devMode, setDevMode] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    let mounted = true
    let subscription: any = null

    // Check if dev mode is enabled in localStorage
    const checkDevMode = () => {
      if (typeof window !== 'undefined') {
        const devModeEnabled = localStorage.getItem('dev_skip_auth') === 'true'
        const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
        if (devModeEnabled && isDev) {
          setDevMode(true)
          setUser(createDevUser())
          setLoading(false)
          return true
        }
      }
      return false
    }

    // If dev mode is enabled, skip auth
    if (checkDevMode()) {
      return
    }

    // Get initial session with retry logic
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.warn('Session error (non-critical):', error.message)
          // Don't throw - just set user to null
          if (mounted) {
            setUser(null)
            setLoading(false)
          }
          return
        }

        if (mounted) {
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.warn('Error getting session (non-critical):', error)
        // Don't throw - just set user to null and continue
        if (mounted) {
          setUser(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getSession()

    // Listen for auth changes
    try {
      const { data } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (mounted) {
            setUser(session?.user ?? null)
          }
        }
      )
      subscription = data.subscription
    } catch (error) {
      console.warn('Error setting up auth listener (non-critical):', error)
    }

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    try {
      // If in dev mode, just clear the flag
      if (devMode) {
        localStorage.removeItem('dev_skip_auth')
        setDevMode(false)
        setUser(null)
        return
      }

      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const devSkipAuth = () => {
    const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
    if (isDev && typeof window !== 'undefined') {
      localStorage.setItem('dev_skip_auth', 'true')
      setDevMode(true)
      setUser(createDevUser())
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut, devSkipAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
