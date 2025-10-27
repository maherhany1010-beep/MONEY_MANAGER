import { NextRequest, NextResponse } from 'next/server'

/**
 * API endpoint to send OTP email
 * POST /api/send-otp-email
 * 
 * Body:
 * {
 *   email: string
 *   otp: string
 *   userName?: string
 *   expiryMinutes?: number
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp, userName, expiryMinutes = 10 } = body

    // Validate input
    if (!email || !otp) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني والرمز مطلوبان' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'صيغة البريد الإلكتروني غير صحيحة' },
        { status: 400 }
      )
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'صيغة الرمز غير صحيحة' },
        { status: 400 }
      )
    }

    // Try to send email using Resend API (if available)
    const resendApiKey = process.env.RESEND_API_KEY
    if (resendApiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'noreply@moneymanager.com',
            to: email,
            subject: 'رمز التفعيل - الإدارة المالية الشاملة',
            html: generateEmailHTML(otp, userName, expiryMinutes),
          }),
        })

        if (response.ok) {
          console.log(`✅ Email sent successfully to ${email}`)
          return NextResponse.json(
            { success: true, message: 'تم إرسال البريد الإلكتروني بنجاح' },
            { status: 200 }
          )
        } else {
          const error = await response.json()
          console.error('Resend API error:', error)
          throw new Error(error.message || 'فشل في إرسال البريد الإلكتروني')
        }
      } catch (resendError) {
        console.error('Resend API error:', resendError)
        // Fall through to try other methods
      }
    }

    // Try to send email using Supabase (if available)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/send_email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseServiceKey}`,
            apikey: supabaseServiceKey,
          },
          body: JSON.stringify({
            to: email,
            subject: 'رمز التفعيل - الإدارة المالية الشاملة',
            html: generateEmailHTML(otp, userName, expiryMinutes),
          }),
        })

        if (response.ok) {
          console.log(`✅ Email sent successfully to ${email} via Supabase`)
          return NextResponse.json(
            { success: true, message: 'تم إرسال البريد الإلكتروني بنجاح' },
            { status: 200 }
          )
        }
      } catch (supabaseError) {
        console.error('Supabase email error:', supabaseError)
        // Fall through to fallback
      }
    }

    // Fallback: Log the OTP for development
    console.warn(`⚠️ Email service not configured. OTP for ${email}: ${otp}`)
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'تم توليد الرمز. يرجى التحقق من البريد الإلكتروني أو وحدة التحكم',
        warning: 'Email service not configured'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in send-otp-email API:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في إرسال البريد الإلكتروني' },
      { status: 500 }
    )
  }
}

/**
 * Generate HTML email template for OTP
 */
function generateEmailHTML(otp: string, userName?: string, expiryMinutes: number = 10): string {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .content {
          padding: 30px;
          text-align: right;
        }
        .greeting {
          font-size: 16px;
          color: #333;
          margin-bottom: 20px;
        }
        .otp-section {
          background-color: #f9f9f9;
          border: 2px solid #667eea;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        .otp-code {
          font-size: 36px;
          font-weight: bold;
          color: #667eea;
          letter-spacing: 4px;
          font-family: 'Courier New', monospace;
          margin: 10px 0;
        }
        .otp-info {
          font-size: 14px;
          color: #666;
          margin-top: 10px;
        }
        .footer {
          background-color: #f5f5f5;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #999;
          border-top: 1px solid #eee;
        }
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          color: #856404;
          padding: 12px;
          border-radius: 4px;
          margin: 15px 0;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>الإدارة المالية الشاملة</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px;">تطبيق إدارة الأموال والبطاقات الائتمانية</p>
        </div>
        
        <div class="content">
          <div class="greeting">
            ${userName ? `مرحباً ${userName}،` : 'مرحباً،'}
          </div>
          
          <p style="color: #333; line-height: 1.6;">
            تم طلب رمز تفعيل لحسابك. استخدم الرمز أدناه لإكمال عملية التحقق:
          </p>
          
          <div class="otp-section">
            <div style="font-size: 14px; color: #666; margin-bottom: 10px;">رمز التفعيل</div>
            <div class="otp-code">${otp}</div>
            <div class="otp-info">
              صلاحية الرمز: ${expiryMinutes} دقائق
            </div>
          </div>
          
          <div class="warning">
            ⚠️ لا تشارك هذا الرمز مع أحد. فريق الدعم لن يطلب منك هذا الرمز أبداً.
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني.
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 0;">© 2025 الإدارة المالية الشاملة. جميع الحقوق محفوظة.</p>
          <p style="margin: 5px 0 0 0;">هذا البريد الإلكتروني تم إرساله تلقائياً. يرجى عدم الرد عليه.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

