'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, CreditCard, TrendingUp } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('يرجى ملء جميع الحقول')
      return
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setIsLoading(true)
    setError('')

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
        setError('✅ تم إرسال رابط التفعيل إلى بريدك الإلكتروني. يرجى التحقق من بريدك!')
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
              {error && (
                <Alert variant={error.includes('✅') ? 'default' : 'destructive'} className={error.includes('✅') ? 'bg-green-500/10 border-green-500/30 text-green-400' : ''}>
                  <AlertDescription className={error.includes('✅') ? 'text-green-400' : ''}>{error}</AlertDescription>
                </Alert>
              )}

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
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300 font-medium">كلمة المرور</Label>
                <div className="relative group">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  type="button"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                  disabled={isLoading || !email || !password}
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

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white font-semibold py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50"
                  onClick={handleSignUp}
                  disabled={isLoading || !email || !password}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري التحميل...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="ml-2 h-4 w-4" />
                      إنشاء حساب جديد
                    </>
                  )}
                </Button>
              </div>

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
