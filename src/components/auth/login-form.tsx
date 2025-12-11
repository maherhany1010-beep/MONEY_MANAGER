'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClientComponentClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Mail, Lock, CreditCard, TrendingUp, ArrowRight, Eye, EyeOff, X, Sprout } from 'lucide-react'
import { generateOTP, sendOTPEmail } from '@/lib/otp'
import { AnimatedBackground } from './animated-background'
import { motion, AnimatePresence } from 'framer-motion'

type AuthMode = 'login' | 'signup' | 'reset'

const REMEMBER_EMAIL_KEY = 'remembered_email'

// جميع الشعارات المالية - 23 شعار (محدثة حسب الملفات الموجودة)
const allFinancialLogos = [
  '/logos/banque-misr.png',
  '/logos/cib.png',
  '/logos/nbe.png',
  '/logos/emirates-nbd.png',
  '/logos/vodafone.png',
  '/logos/orange.png',
  '/logos/zain.png',
  '/logos/instapay.png',
  '/logos/meeza.png',
  '/logos/visa.png',
  '/logos/ماستر كارد.png',
  '/logos/WorldElite.png',
  '/logos/لوجو فورى.png',
  '/logos/كارت فورى الأصفر.png',
  '/logos/aman.png',
  '/logos/لوجو أمان.png',
  '/logos/كارت كليفر.png',
  '/logos/كارت تيلدا.png',
  '/logos/بطاقات-البنك-الأهلي.png',
  '/logos/تحويل أموال.png',
  '/logos/investment.png',
  '/logos/savings-circles.png',
]

export function LoginForm() {
  // Auth state
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // UI state
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Rate limiting state
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockoutTime, setLockoutTime] = useState<number | null>(null)

  const router = useRouter()
  const supabase = createClientComponentClient()
  const { devSkipAuth } = useAuth()

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY)
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

  // Lockout timer effect
  useEffect(() => {
    if (lockoutTime === null) return

    const timer = setInterval(() => {
      setLockoutTime(prev => {
        if (prev === null || prev <= 1) {
          setFailedAttempts(0)
          return null
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [lockoutTime])

  const isLockedOut = lockoutTime !== null && lockoutTime > 0

  // Development mode: Skip login
  const handleDevSkipLogin = () => {
    try {
      devSkipAuth()
      setIsTransitioning(true)
      // Force reload to trigger auth provider update
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
    } catch (error) {
      console.error('Error in dev skip:', error)
      setError('حدث خطأ في تخطي تسجيل الدخول')
    }
  }

  const handleLogin = async () => {
    if (isLockedOut) {
      setError(`حسابك مقفول مؤقتاً. حاول مرة أخرى بعد ${lockoutTime} ثانية`)
      return
    }

    if (!email || !password) {
      setError('يرجى ملء جميع الحقول')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        const newAttempts = failedAttempts + 1
        setFailedAttempts(newAttempts)

        if (newAttempts >= 5) {
          setLockoutTime(300) // 5 minutes lockout
          setError('تم تجاوز عدد محاولات تسجيل الدخول. حسابك مقفول لمدة 5 دقائق')
        } else {
          const remaining = 5 - newAttempts
          setError(`${error.message} (محاولات متبقية: ${remaining})`)
        }
      } else {
        setFailedAttempts(0)

        // Save email to localStorage if "Remember Me" is checked
        if (rememberMe) {
          localStorage.setItem(REMEMBER_EMAIL_KEY, email)
        } else {
          localStorage.removeItem(REMEMBER_EMAIL_KEY)
        }

        setSuccess('✅ تم تسجيل الدخول بنجاح!')

        // إخفاء مربع تسجيل الدخول فوراً
        setIsTransitioning(true)

        // الانتقال للصفحة الرئيسية فوراً
        // شاشة الانتقال ستظهر في LayoutProvider
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgetEmail = () => {
    localStorage.removeItem(REMEMBER_EMAIL_KEY)
    setEmail('')
    setRememberMe(false)
  }

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError('يرجى ملء جميع الحقول')
      return
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Step 1: Create user account without email confirmation
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Disable email confirmation redirect - we'll use OTP instead
          emailRedirectTo: undefined,
        },
      })

      if (signUpError) {
        // Check if user already exists
        if (signUpError.message.includes('already registered') ||
            signUpError.message.includes('User already registered') ||
            signUpError.message.includes('already exists')) {
          setError('هذا الحساب مسجل بالفعل. يرجى تسجيل الدخول أو استخدام بريد إلكتروني آخر')
        } else {
          setError(signUpError.message)
        }
        setIsLoading(false)
        return
      }

      // Step 2: Generate and send OTP
      const otp = generateOTP()
      const { success: otpSuccess, error: otpError, displayOTP } = await sendOTPEmail(email, otp)

      if (!otpSuccess) {
        setError(otpError || 'فشل في إرسال رمز التفعيل')
        setIsLoading(false)
        return
      }

      // Step 3: Try to send email via API
      try {
        const emailResponse = await fetch('/api/send-otp-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            otp,
            userName: email.split('@')[0],
          }),
        })

        if (!emailResponse.ok) {
          console.warn('Email API failed, but OTP is stored')
        }
      } catch (emailError) {
        console.warn('Email API error:', emailError)
      }

      // Step 4: Redirect to OTP verification page or login directly in dev mode
      setSuccess('✅ جاري تحويلك لتأكيد حسابك...')

      // في وضع التطوير، تسجيل الدخول مباشرة
      const isDev = process.env.NODE_ENV === 'development'
      if (isDev) {
        // تسجيل الدخول مباشرة
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          console.error('Auto sign-in error:', signInError)
        }

        setTimeout(() => {
          window.location.href = '/'
        }, 500)
      } else {
        setTimeout(() => {
          window.location.href = `/verify-otp?email=${encodeURIComponent(email)}`
        }, 800)
      }
    } catch (err) {
      console.error('SignUp error:', err)
      setError('حدث خطأ غير متوقع')
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      setError('يرجى إدخال بريدك الإلكتروني')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('✅ تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني')
        setTimeout(() => {
          setMode('login')
          setEmail('')
        }, 3000)
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      <AnimatePresence>
        {!isTransitioning && (
          <motion.div
            className="w-full max-w-md relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
        {/* Header with icon */}
        <motion.div
          className="text-center mb-2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex justify-center mb-1.5">
            <motion.div
              className="relative z-20"
              whileHover={{ scale: 1.05 }}
              transition={{
                type: 'spring',
                stiffness: 300,
              }}
            >
              <Image
                src="/logos/LOGO MONEY MANGER.png"
                alt="CFM - Money Manager Logo"
                width={160}
                height={160}
                className="object-contain"
                style={{
                  filter: 'drop-shadow(0 6px 20px rgba(59, 130, 246, 0.4)) drop-shadow(0 0 12px rgba(168, 85, 247, 0.3))',
                }}
                priority
              />
            </motion.div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-0.5 relative z-20">الإدارة المالية الشاملة</h1>
          <p className="text-slate-400 text-xs relative z-20">معاً نحقق الحرية المالية</p>
        </motion.div>

        {/* Main card - شفاف مع blur خفيف للأداء */}
        <Card className="border border-white/10 shadow-xl bg-slate-900/10 backdrop-blur-md">
          <CardContent className="pt-4 pb-4">
            <div className="space-y-3">
              {/* Alerts */}
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-400">
                  <div className="flex items-start justify-between gap-3">
                    <AlertDescription className="flex-1">{error}</AlertDescription>
                    {error.includes('مسجل بالفعل') && mode === 'signup' && (
                      <motion.button
                        type="button"
                        onClick={() => {
                          setMode('login')
                          setError('')
                        }}
                        className="text-xs bg-red-500/20 hover:bg-red-500/30 px-3 py-1 rounded-md transition-colors whitespace-nowrap"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        تسجيل الدخول
                      </motion.button>
                    )}
                  </div>
                </Alert>
              )}
              {success && (
                <Alert className="bg-green-500/10 border-green-500/30 text-green-400">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* LOGIN MODE */}
              {mode === 'login' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-slate-300 font-medium">البريد الإلكتروني</Label>
                    <div className="relative group">
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors z-10" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="أدخل بريدك الإلكتروني"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pr-12 h-10 bg-slate-900/40 backdrop-blur-sm border-2 border-slate-600/40 text-white placeholder:text-slate-500 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:border-slate-500 transition-all duration-200 shadow-lg shadow-black/20"
                        disabled={isLockedOut}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-slate-300 font-medium">كلمة المرور</Label>
                    <div className="relative group">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors z-10" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="أدخل كلمة المرور"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-12 pl-12 h-10 bg-slate-900/40 backdrop-blur-sm border-2 border-slate-600/40 text-white placeholder:text-slate-500 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:border-slate-500 transition-all duration-200 shadow-lg shadow-black/20"
                        disabled={isLockedOut}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 transition-colors z-10"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id="remember-me"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        className="border-slate-600 data-[state=checked]:bg-blue-600"
                      />
                      <Label htmlFor="remember-me" className="text-sm text-slate-300 cursor-pointer">
                        تذكرني
                      </Label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMode('reset')}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  </div>

                  <Button
                    type="button"
                    className="w-full h-10 bg-gradient-to-r from-blue-600 via-blue-600 to-purple-600 hover:from-blue-700 hover:via-blue-700 hover:to-purple-700 text-white font-bold text-base rounded-xl shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    disabled={isLoading || !email || !password || isLockedOut}
                    onClick={handleLogin}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                        جاري التحميل...
                      </>
                    ) : (
                      'تسجيل الدخول'
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-slate-900/60 backdrop-blur-sm text-slate-400">أو</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 border-2 border-slate-600/40 bg-slate-900/30 backdrop-blur-sm text-slate-300 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-blue-600/20 hover:border-purple-500/50 hover:text-white font-semibold text-base rounded-xl shadow-lg shadow-black/20 hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                    onClick={() => {
                      setMode('signup')
                      setError('')
                      setSuccess('')
                    }}
                  >
                    <TrendingUp className="ml-2 h-5 w-5" />
                    إنشاء حساب جديد
                  </Button>

                  {/* Development Mode: Skip Login Button */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 border-2 border-yellow-600/60 bg-yellow-900/20 backdrop-blur-sm text-yellow-300 hover:bg-yellow-600/30 hover:border-yellow-500 hover:text-yellow-200 font-semibold text-base rounded-xl shadow-lg shadow-black/20 hover:shadow-yellow-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                    onClick={handleDevSkipLogin}
                  >
                    <ArrowRight className="ml-2 h-5 w-5" />
                    🚀 تخطي تسجيل الدخول (وضع التطوير)
                  </Button>
                </div>
              )}

              {/* SIGNUP MODE */}
              {mode === 'signup' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="signup-email" className="text-slate-300 font-medium">البريد الإلكتروني</Label>
                    <div className="relative group">
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors z-10" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="أدخل بريدك الإلكتروني"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pr-12 h-10 bg-slate-900/40 backdrop-blur-sm border-2 border-slate-600/40 text-white placeholder:text-slate-500 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 hover:border-slate-500 transition-all duration-200 shadow-lg shadow-black/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="signup-password" className="text-slate-300 font-medium">كلمة المرور</Label>
                    <div className="relative group">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors z-10" />
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-12 pl-12 h-10 bg-slate-900/40 backdrop-blur-sm border-2 border-slate-600/40 text-white placeholder:text-slate-500 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 hover:border-slate-500 transition-all duration-200 shadow-lg shadow-black/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-purple-400 transition-colors z-10"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="confirm-password" className="text-slate-300 font-medium">تأكيد كلمة المرور</Label>
                    <div className="relative group">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors z-10" />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="أعد إدخال كلمة المرور"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pr-12 pl-12 h-10 bg-slate-900/40 backdrop-blur-sm border-2 border-slate-600/40 text-white placeholder:text-slate-500 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 hover:border-slate-500 transition-all duration-200 shadow-lg shadow-black/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-purple-400 transition-colors z-10"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="w-full h-10 bg-gradient-to-r from-purple-600 via-purple-600 to-pink-600 hover:from-purple-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold text-base rounded-xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    disabled={isLoading || !email || !password || !confirmPassword}
                    onClick={handleSignUp}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      'إنشاء حساب'
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 border-2 border-slate-600/60 bg-slate-800/40 text-slate-300 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 hover:border-blue-500/50 hover:text-white font-semibold text-base rounded-xl shadow-lg shadow-black/20 hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                    onClick={() => {
                      setMode('login')
                      setError('')
                      setSuccess('')
                    }}
                  >
                    <ArrowRight className="ml-2 h-5 w-5" />
                    العودة إلى تسجيل الدخول
                  </Button>
                </div>
              )}

              {/* RESET PASSWORD MODE */}
              {mode === 'reset' && (
                <div className="space-y-3">
                  <p className="text-slate-400 text-sm">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور</p>

                  <div className="space-y-1">
                    <Label htmlFor="reset-email" className="text-slate-300 font-medium">البريد الإلكتروني</Label>
                    <div className="relative group">
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-amber-400 transition-colors z-10" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="أدخل بريدك الإلكتروني"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pr-12 h-10 bg-slate-900/40 backdrop-blur-sm border-2 border-slate-600/40 text-white placeholder:text-slate-500 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 hover:border-slate-500 transition-all duration-200 shadow-lg shadow-black/20"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="w-full h-10 bg-gradient-to-r from-amber-600 via-amber-600 to-orange-600 hover:from-amber-700 hover:via-amber-700 hover:to-orange-700 text-white font-bold text-base rounded-xl shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    disabled={isLoading || !email}
                    onClick={handleResetPassword}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      'إرسال رابط إعادة التعيين'
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 border-2 border-slate-600/60 bg-slate-800/40 text-slate-300 hover:bg-gradient-to-r hover:from-amber-600/20 hover:to-orange-600/20 hover:border-amber-500/50 hover:text-white font-semibold text-base rounded-xl shadow-lg shadow-black/20 hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                    onClick={() => {
                      setMode('login')
                      setError('')
                      setSuccess('')
                      setEmail('')
                    }}
                  >
                    <ArrowRight className="ml-2 h-5 w-5" />
                    العودة إلى تسجيل الدخول
                  </Button>
                </div>
              )}

              <div className="pt-4 border-t border-slate-700">
                <p className="text-center text-slate-400 text-xs">
                  بإنشاء حساب، فإنك توافق على شروط الخدمة وسياسة الخصوصية
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


