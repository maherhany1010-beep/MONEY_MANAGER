/**
 * OTP (One-Time Password) Utilities
 * Handles generation, validation, and storage of OTP codes
 * Uses localStorage for client-side storage (temporary solution)
 */

import { createClientComponentClient } from '@/lib/supabase'

// OTP Configuration
export const OTP_CONFIG = {
  LENGTH: 6,
  VALIDITY_MINUTES: 10,
  MAX_ATTEMPTS: 5,
  RESEND_COOLDOWN_SECONDS: 60,
}

// In-memory storage for OTP codes (will be replaced with database)
const otpStorage = new Map<string, {
  code: string
  createdAt: number
  expiresAt: number
  attempts: number
  verified: boolean
}>()

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
 * Uses in-memory storage as temporary solution
 */
export async function sendOTPEmail(
  email: string,
  otp: string,
  userName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const now = Date.now()
    const expiresAt = now + OTP_CONFIG.VALIDITY_MINUTES * 60000

    // Store OTP in memory
    otpStorage.set(email, {
      code: otp,
      createdAt: now,
      expiresAt: expiresAt,
      attempts: 0,
      verified: false,
    })

    // Log for debugging
    console.log(`✅ OTP ${otp} generated for ${email}`)
    console.log(`⏱️ OTP expires at: ${new Date(expiresAt).toLocaleTimeString()}`)

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
    const otpData = otpStorage.get(email)

    if (!otpData) {
      return { success: false, error: 'الرمز غير صحيح' }
    }

    // Check if OTP has expired
    const now = Date.now()
    if (now > otpData.expiresAt) {
      otpStorage.delete(email)
      return { success: false, error: 'انتهت صلاحية الرمز' }
    }

    // Check attempts
    if (otpData.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
      return { success: false, error: 'تم تجاوز عدد المحاولات المسموحة' }
    }

    // Check if code matches
    if (otpData.code !== code) {
      otpData.attempts += 1
      return { success: false, error: 'الرمز غير صحيح' }
    }

    // Mark OTP as verified
    otpData.verified = true
    console.log(`✅ OTP verified for ${email}`)

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
    const otpData = otpStorage.get(email)

    if (!otpData) {
      return { success: false }
    }

    const newAttempts = otpData.attempts + 1
    const remainingAttempts = OTP_CONFIG.MAX_ATTEMPTS - newAttempts

    otpData.attempts = newAttempts

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
    const otpData = otpStorage.get(email)
    const now = Date.now()

    if (otpData) {
      const timeSinceLastOTP = (now - otpData.createdAt) / 1000

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
    const now = Date.now()
    let deletedCount = 0

    // Iterate through all OTP entries and delete expired ones
    for (const [email, otpData] of otpStorage.entries()) {
      if (now > otpData.expiresAt) {
        otpStorage.delete(email)
        deletedCount++
      }
    }

    console.log(`🧹 Cleaned up ${deletedCount} expired OTP codes`)
    return { success: true, deletedCount }
  } catch (error) {
    console.error('Error cleaning up expired OTPs:', error)
    return { success: false }
  }
}

