'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, CheckCircle2, AlertCircle } from 'lucide-react'
import { verifyOTP, resendOTP, incrementOTPAttempts, OTP_CONFIG } from '@/lib/otp'

interface OTPFormProps {
  email: string
  onSuccess?: () => void
  onBack?: () => void
}

export function OTPForm({ email, onSuccess, onBack }: OTPFormProps) {
  const router = useRouter()
  const [otp, setOTP] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [remainingAttempts, setRemainingAttempts] = useState(OTP_CONFIG.MAX_ATTEMPTS)
  const [canResend, setCanResend] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)
  const [displayOTP, setDisplayOTP] = useState<string | null>(null)
  const [showOTPDisplay, setShowOTPDisplay] = useState(false)

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (resendCountdown === 0 && !canResend) {
      setCanResend(true)
    }
  }, [resendCountdown, canResend])

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== OTP_CONFIG.LENGTH) {
      setError(`يرجى إدخال رمز مكون من ${OTP_CONFIG.LENGTH} أرقام`)
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await verifyOTP(email, otp)

      if (result.success) {
        setSuccess('✅ تم التحقق من الرمز بنجاح!')
        setOTP('')
        setDisplayOTP(null)

        // Call success callback or redirect
        setTimeout(() => {
          if (onSuccess) {
            onSuccess()
          } else {
            router.push('/')
            router.refresh()
          }
        }, 1500)
      } else {
        // Increment attempts
        const attemptsResult = await incrementOTPAttempts(email, otp)
        const remaining = attemptsResult.remainingAttempts ?? OTP_CONFIG.MAX_ATTEMPTS

        if (remaining === 0) {
          setError('تم تجاوز عدد المحاولات المسموحة. يرجى طلب رمز جديد')
        } else {
          setError(
            `${result.error} (محاولات متبقية: ${remaining})`
          )
        }
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await resendOTP(email)

      if (result.success) {
        setSuccess('✅ تم إرسال رمز جديد إلى بريدك الإلكتروني')
        setOTP('')
        setRemainingAttempts(OTP_CONFIG.MAX_ATTEMPTS)
        setCanResend(false)
        setResendCountdown(OTP_CONFIG.RESEND_COOLDOWN_SECONDS)

        // Display OTP for development mode
        if (result.otp) {
          setDisplayOTP(result.otp)
        }

        // Try to send email via API
        try {
          const emailResponse = await fetch('/api/send-otp-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              otp: result.otp || 'unknown',
              userName: email.split('@')[0],
            }),
          })

          if (!emailResponse.ok) {
            console.warn('Email API failed, but OTP is stored')
          }
        } catch (emailError) {
          console.warn('Email API error:', emailError)
        }
      } else {
        setError(result.error || 'فشل في إعادة إرسال الرمز')
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-slate-800/50 border-slate-700 shadow-2xl">
      <CardContent className="pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-500/20 rounded-full">
              <Mail className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">التحقق من البريد الإلكتروني</h2>
          <p className="text-slate-400">
            أدخل الرمز المكون من 6 أرقام الذي تم إرساله إلى:
          </p>
          <p className="text-blue-400 font-semibold mt-1">{email}</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 bg-red-500/10 border-red-500/50">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="mb-6 bg-green-500/10 border-green-500/50">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-400">{success}</AlertDescription>
          </Alert>
        )}

        {/* OTP Input */}
        <div className="space-y-4 mb-6">
          <Label htmlFor="otp" className="text-slate-300 font-medium">
            رمز التفعيل
          </Label>
          <Input
            id="otp"
            type="text"
            inputMode="numeric"
            placeholder="000000"
            maxLength={OTP_CONFIG.LENGTH}
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '')
              setOTP(value)
            }}
            className="text-center text-2xl tracking-widest bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
            disabled={isLoading}
          />
          <p className="text-xs text-slate-400 text-center">
            صلاحية الرمز: {OTP_CONFIG.VALIDITY_MINUTES} دقائق
          </p>
        </div>

        {/* Verify Button */}
        <Button
          type="button"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 mb-4"
          disabled={isLoading || otp.length !== OTP_CONFIG.LENGTH}
          onClick={handleVerifyOTP}
        >
          {isLoading ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري التحقق...
            </>
          ) : (
            'التحقق من الرمز'
          )}
        </Button>

        {/* Resend Button with Countdown */}
        <div className="mb-4">
          <Button
            type="button"
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all disabled:opacity-50"
            disabled={!canResend || isLoading}
            onClick={handleResendOTP}
          >
            {resendCountdown > 0 ? (
              <div className="flex items-center justify-center gap-2">
                <span>إعادة الإرسال خلال</span>
                <span className="font-bold text-blue-400 text-lg min-w-[2rem] text-center">
                  {resendCountdown}
                </span>
                <span>ثانية</span>
              </div>
            ) : (
              'إعادة إرسال الرمز'
            )}
          </Button>
          {resendCountdown > 0 && (
            <div className="mt-2 text-center">
              <div className="w-full bg-slate-700/30 rounded-full h-1 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-1000"
                  style={{
                    width: `${(resendCountdown / OTP_CONFIG.RESEND_COOLDOWN_SECONDS) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Back Button */}
        {onBack && (
          <Button
            type="button"
            variant="ghost"
            className="w-full text-slate-400 hover:text-slate-300 hover:bg-slate-700/30 transition-all"
            onClick={onBack}
            disabled={isLoading}
          >
            العودة
          </Button>
        )}

        {/* Development Mode - Show OTP */}
        <div className="mt-6 p-4 bg-amber-500/10 rounded-lg border border-amber-500/50">
          <button
            type="button"
            className="w-full text-xs text-amber-400 hover:text-amber-300 transition-colors"
            onClick={() => setShowOTPDisplay(!showOTPDisplay)}
          >
            {showOTPDisplay ? '▼ إخفاء الرمز' : '▶ عرض الرمز (للاختبار)'}
          </button>
          {showOTPDisplay && (
            <div className="mt-3 p-3 bg-slate-700/50 rounded border border-amber-500/30">
              <p className="text-xs text-amber-400 mb-2">الرمز للاختبار (في بيئة التطوير):</p>
              <div className="bg-slate-800 p-3 rounded text-center">
                <p className="text-2xl font-bold text-amber-400 tracking-widest font-mono">
                  {displayOTP || 'جاري التحميل...'}
                </p>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                ملاحظة: في الإنتاج، سيتم إرسال الرمز عبر البريد الإلكتروني فقط
              </p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
          <p className="text-xs text-slate-400 text-center">
            لم تستقبل الرمز؟ تحقق من مجلد البريد العشوائي أو انتظر دقيقة واحدة قبل إعادة الإرسال
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

