import { Button } from '@/components/ui/button'
import { AlertCircle, Home, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: '404 - الصفحة غير موجودة',
  description: 'الصفحة التي تبحث عنها غير موجودة',
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4">
      <div className="max-w-md w-full">
        {/* 404 Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"></div>
            <div className="relative bg-blue-100 dark:bg-blue-900/30 rounded-full p-4">
              <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* 404 Content */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-foreground mb-2">
            404
          </h1>
          <p className="text-2xl font-semibold text-foreground/80 mb-2">
            الصفحة غير موجودة
          </p>
          <p className="text-muted-foreground">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          </p>
        </div>

        {/* Suggestions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-8 border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-semibold text-foreground mb-3">
            الصفحات الشهيرة:
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
                → لوحة التحكم الرئيسية
              </Link>
            </li>
            <li>
              <Link href="/cards" className="text-blue-600 dark:text-blue-400 hover:underline">
                → إدارة البطاقات
              </Link>
            </li>
            <li>
              <Link href="/transactions" className="text-blue-600 dark:text-blue-400 hover:underline">
                → المعاملات المالية
              </Link>
            </li>
            <li>
              <Link href="/reports/financial" className="text-blue-600 dark:text-blue-400 hover:underline">
                → التقارير المالية
              </Link>
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <Link href="/" className="block">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <Home className="w-4 h-4 mr-2" />
            العودة إلى الصفحة الرئيسية
            <ArrowRight className="w-4 h-4 mr-2" />
          </Button>
        </Link>

        {/* Help Text */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          هل تحتاج إلى مساعدة؟{' '}
          <a href="mailto:support@example.com" className="text-blue-600 dark:text-blue-400 hover:underline">
            تواصل معنا
          </a>
        </p>
      </div>
    </div>
  )
}

