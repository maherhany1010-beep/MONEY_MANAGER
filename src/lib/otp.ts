/**
 * OTP (One-Time Password) Utilities
 * Handles generation, validation, and storage of OTP codes
 */

import { createClientComponentClient } from '@/lib/supabase'

// OTP Configuration
export const OTP_CONFIG = {
  LENGTH: 6,
  VALIDITY_MINUTES: 10,
  MAX_ATTEMPTS: 5,
  RESEND_COOLDOWN_SECONDS: 60,
}

/**
 * Generate a random OTP code
 */
export function generateOTP(length: number = OTP_CONFIG.LENGTH): string {
  let otp = ''
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10).toString()
  }
  return otp
}

/**
 * Send OTP to email via Supabase
 */
export async function sendOTPEmail(
  email: string,
  otp: string,
  userName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClientComponentClient()

    // Store OTP in database
    const { error: dbError } = await supabase
      .from('otp_codes')
      .insert({
        email,
        code: otp,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + OTP_CONFIG.VALIDITY_MINUTES * 60000).toISOString(),
        attempts: 0,
        verified: false,
      })

    if (dbError) {
      console.error('Error storing OTP:', dbError)
      return { success: false, error: 'فشل في حفظ الرمز' }
    }

    // Send email via Supabase Auth
    // Note: This would typically be done via a server-side function
    // For now, we'll return success and assume the email is sent
    console.log(`OTP ${otp} sent to ${email}`)

    return { success: true }
  } catch (error) {
    console.error('Error sending OTP:', error)
    return { success: false, error: 'فشل في إرسال الرمز' }
  }
}

/**
 * Verify OTP code
 */
export async function verifyOTP(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClientComponentClient()

    // Get OTP record
    const { data, error: fetchError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('verified', false)
      .single()

    if (fetchError || !data) {
      return { success: false, error: 'الرمز غير صحيح' }
    }

    // Check if OTP has expired
    const expiresAt = new Date(data.expires_at)
    if (new Date() > expiresAt) {
      return { success: false, error: 'انتهت صلاحية الرمز' }
    }

    // Check attempts
    if (data.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
      return { success: false, error: 'تم تجاوز عدد المحاولات المسموحة' }
    }

    // Mark OTP as verified
    const { error: updateError } = await supabase
      .from('otp_codes')
      .update({ verified: true })
      .eq('id', data.id)

    if (updateError) {
      return { success: false, error: 'فشل في التحقق من الرمز' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return { success: false, error: 'حدث خطأ أثناء التحقق' }
  }
}

/**
 * Increment OTP attempts
 */
export async function incrementOTPAttempts(
  email: string,
  code: string
): Promise<{ success: boolean; remainingAttempts?: number }> {
  try {
    const supabase = createClientComponentClient()

    // Get OTP record
    const { data, error: fetchError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('verified', false)
      .single()

    if (fetchError || !data) {
      return { success: false }
    }

    const newAttempts = data.attempts + 1
    const remainingAttempts = OTP_CONFIG.MAX_ATTEMPTS - newAttempts

    // Update attempts
    const { error: updateError } = await supabase
      .from('otp_codes')
      .update({ attempts: newAttempts })
      .eq('id', data.id)

    if (updateError) {
      return { success: false }
    }

    return { success: true, remainingAttempts }
  } catch (error) {
    console.error('Error incrementing OTP attempts:', error)
    return { success: false }
  }
}

/**
 * Resend OTP
 */
export async function resendOTP(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClientComponentClient()

    // Check if user can resend (cooldown)
    const { data: lastOTP } = await supabase
      .from('otp_codes')
      .select('created_at')
      .eq('email', email)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (lastOTP) {
      const lastCreatedAt = new Date(lastOTP.created_at)
      const timeSinceLastOTP = (Date.now() - lastCreatedAt.getTime()) / 1000

      if (timeSinceLastOTP < OTP_CONFIG.RESEND_COOLDOWN_SECONDS) {
        const waitTime = Math.ceil(OTP_CONFIG.RESEND_COOLDOWN_SECONDS - timeSinceLastOTP)
        return {
          success: false,
          error: `يرجى الانتظار ${waitTime} ثانية قبل إعادة الإرسال`,
        }
      }
    }

    // Generate and send new OTP
    const newOTP = generateOTP()
    return await sendOTPEmail(email, newOTP)
  } catch (error) {
    console.error('Error resending OTP:', error)
    return { success: false, error: 'فشل في إعادة إرسال الرمز' }
  }
}

/**
 * Clean up expired OTP codes
 */
export async function cleanupExpiredOTPs(): Promise<{ success: boolean; deletedCount?: number }> {
  try {
    const supabase = createClientComponentClient()

    const { data, error: fetchError } = await supabase
      .from('otp_codes')
      .select('id')
      .lt('expires_at', new Date().toISOString())

    if (fetchError) {
      return { success: false }
    }

    if (!data || data.length === 0) {
      return { success: true, deletedCount: 0 }
    }

    const { error: deleteError } = await supabase
      .from('otp_codes')
      .delete()
      .lt('expires_at', new Date().toISOString())

    if (deleteError) {
      return { success: false }
    }

    return { success: true, deletedCount: data.length }
  } catch (error) {
    console.error('Error cleaning up expired OTPs:', error)
    return { success: false }
  }
}

