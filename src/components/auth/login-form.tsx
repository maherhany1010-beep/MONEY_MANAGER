'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, CreditCard, TrendingUp, ArrowRight, Eye, EyeOff } from 'lucide-react'

type AuthMode = 'login' | 'signup' | 'reset'

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

  // Rate limiting state
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockoutTime, setLockoutTime] = useState<number | null>(null)

  const router = useRouter()
  const supabase = createClientComponentClient()

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
        setSuccess('✅ تم تسجيل الدخول بنجاح!')
        setTimeout(() => {
          router.push('/')
          router.refresh()
        }, 1000)
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('✅ تم إرسال رابط التفعيل إلى بريدك الإلكتروني. يرجى التحقق من بريدك!')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setTimeout(() => setMode('login'), 3000)
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
    } finally {
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
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header with icon */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">الإدارة المالية الشاملة</h1>
          <p className="text-slate-400 text-sm">إدارة بطاقاتك الائتمانية والمعاملات المالية بسهولة</p>
        </div>

        {/* Main card */}
        <Card className="border-0 shadow-2xl bg-slate-800/50 backdrop-blur-xl">
          <CardContent className="pt-8">
            <div className="space-y-5">
              {/* Alerts */}
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-400">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="bg-green-500/10 border-green-500/30 text-green-400">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* LOGIN MODE */}
              {mode === 'login' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300 font-medium">البريد الإلكتروني</Label>
                    <div className="relative group">
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="أدخل بريدك الإلكتروني"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pr-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                        disabled={isLockedOut}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300 font-medium">كلمة المرور</Label>
                    <div className="relative group">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="أدخل كلمة المرور"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                        disabled={isLockedOut}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Forgot password link */}
                  <div className="text-right">
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
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                    disabled={isLoading || !email || !password || isLockedOut}
                    onClick={handleLogin}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
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
                      <span className="px-2 bg-slate-800/50 text-slate-400">أو</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white font-semibold py-2.5 rounded-lg transition-all duration-200"
                    onClick={() => {
                      setMode('signup')
                      setError('')
                      setSuccess('')
                    }}
                  >
                    <TrendingUp className="ml-2 h-4 w-4" />
                    إنشاء حساب جديد
                  </Button>
                </div>
              )}

              {/* SIGNUP MODE */}
              {mode === 'signup' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-slate-300 font-medium">البريد الإلكتروني</Label>
                    <div className="relative group">
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="أدخل بريدك الإلكتروني"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pr-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-slate-300 font-medium">كلمة المرور</Label>
                    <div className="relative group">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-slate-300 font-medium">تأكيد كلمة المرور</Label>
                    <div className="relative group">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="أعد إدخال كلمة المرور"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pr-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                    disabled={isLoading || !email || !password || !confirmPassword}
                    onClick={handleSignUp}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري التحميل...
                      </>
                    ) : (
                      'إنشاء حساب'
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white font-semibold py-2.5 rounded-lg transition-all duration-200"
                    onClick={() => {
                      setMode('login')
                      setError('')
                      setSuccess('')
                    }}
                  >
                    <ArrowRight className="ml-2 h-4 w-4" />
                    العودة إلى تسجيل الدخول
                  </Button>
                </div>
              )}

              {/* RESET PASSWORD MODE */}
              {mode === 'reset' && (
                <div className="space-y-4">
                  <p className="text-slate-400 text-sm">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور</p>

                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-slate-300 font-medium">البريد الإلكتروني</Label>
                    <div className="relative group">
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="أدخل بريدك الإلكتروني"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pr-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                    disabled={isLoading || !email}
                    onClick={handleResetPassword}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      'إرسال رابط إعادة التعيين'
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white font-semibold py-2.5 rounded-lg transition-all duration-200"
                    onClick={() => {
                      setMode('login')
                      setError('')
                      setSuccess('')
                      setEmail('')
                    }}
                  >
                    <ArrowRight className="ml-2 h-4 w-4" />
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

        {/* Footer info */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-slate-800/30 backdrop-blur rounded-lg border border-slate-700/50">
            <CreditCard className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">إدارة البطاقات</p>
          </div>
          <div className="p-3 bg-slate-800/30 backdrop-blur rounded-lg border border-slate-700/50">
            <TrendingUp className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">تحليل المالية</p>
          </div>
          <div className="p-3 bg-slate-800/30 backdrop-blur rounded-lg border border-slate-700/50">
            <Lock className="w-5 h-5 text-green-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">آمن وموثوق</p>
          </div>
        </div>
      </div>
    </div>
  )
}
