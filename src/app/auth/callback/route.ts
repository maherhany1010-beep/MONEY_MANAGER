import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // Handle errors from Supabase
  if (error) {
    console.error('Auth error:', error, error_description)
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error_description || error)}`, request.url)
    )
  }

  // Handle successful authentication
  if (code) {
    try {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                )
              } catch (error) {
                console.error('Error setting cookies:', error)
              }
            },
          },
        }
      )

      // Exchange code for session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Exchange error:', exchangeError)
        return NextResponse.redirect(
          new URL(`/?error=${encodeURIComponent(exchangeError.message)}`, request.url)
        )
      }

      // Redirect to home page on success
      return NextResponse.redirect(new URL('/', request.url))
    } catch (error) {
      console.error('Callback error:', error)
      return NextResponse.redirect(
        new URL('/?error=Authentication failed', request.url)
      )
    }
  }

  // No code or error provided
  return NextResponse.redirect(new URL('/', request.url))
}

