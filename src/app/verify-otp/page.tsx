'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { OTPForm } from '@/components/auth/otp-form'
import { AnimatedBackground } from '@/components/auth/animated-background'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function VerifyOTPPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get email from URL params
    const emailParam = searchParams.get('email')
    
    if (!emailParam) {
      setError('البريد الإلكتروني غير محدد. يرجى المحاولة مرة أخرى.')
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
      return
    }

    setEmail(emailParam)
  }, [searchParams, router])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        <AnimatedBackground />
        <div className="w-full max-w-md relative z-10">
          <Alert className="bg-red-500/10 border-red-500/50">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        <AnimatedBackground />
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      <div className="w-full max-w-md relative z-10">
        <OTPForm
          email={email}
          onSuccess={() => {
            router.push('/')
            router.refresh()
          }}
          onBack={() => {
            router.push('/login')
          }}
        />
      </div>
    </div>
  )
}

