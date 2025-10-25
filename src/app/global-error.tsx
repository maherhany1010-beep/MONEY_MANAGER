'use client'

import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to console
    console.error('🔴 Global Error:', error)

    // You can also log to an error reporting service
    // Example: Sentry, LogRocket, etc.
  }, [error])

  return (
    <html lang="ar" dir="rtl">
      <body>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: 'white',
          padding: '20px',
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '500px',
          }}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: 'bold',
              margin: '0 0 20px 0',
            }}>
              ⚠️ خطأ حرج
            </h1>
            <p style={{
              fontSize: '18px',
              marginBottom: '20px',
              opacity: 0.9,
            }}>
              حدث خطأ حرج في التطبيق. يرجى إعادة تحميل الصفحة.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'left',
                fontSize: '12px',
                fontFamily: 'monospace',
                maxHeight: '200px',
                overflow: 'auto',
              }}>
                <strong>Error Details:</strong>
                <pre style={{ margin: '10px 0 0 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {error.message}
                </pre>
              </div>
            )}

            <button
              onClick={reset}
              style={{
                padding: '12px 24px',
                background: 'white',
                color: '#667eea',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'scale(1)'
              }}
            >
              إعادة محاولة
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

