export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          ✅ التطبيق يعمل!
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          تم نشر التطبيق بنجاح على Vercel
        </p>
        <div className="space-y-4">
          <p className="text-lg text-gray-700 dark:text-gray-200">
            🎉 مرحباً بك في تطبيق إدارة البطاقات الائتمانية الشامل
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            اذهب إلى لوحة التحكم
          </a>
        </div>
      </div>
    </div>
  )
}

