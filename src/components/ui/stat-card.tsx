import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  variant?: 'blue' | 'green' | 'purple' | 'orange' | 'indigo' | 'pink' | 'red'
  trend?: {
    value: number
    isPositive: boolean
  }
}

// أنماط التدرجات للوضع الفاتح والداكن
const variantStyles = {
  blue: 'bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-800',
  green: 'bg-gradient-to-br from-green-500 to-green-700 dark:from-green-600 dark:to-green-800',
  purple: 'bg-gradient-to-br from-purple-500 to-purple-700 dark:from-purple-600 dark:to-purple-800',
  orange: 'bg-gradient-to-br from-orange-500 to-orange-700 dark:from-orange-600 dark:to-orange-800',
  indigo: 'bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-800',
  pink: 'bg-gradient-to-br from-pink-500 to-pink-700 dark:from-pink-600 dark:to-pink-800',
  red: 'bg-gradient-to-br from-red-500 to-red-700 dark:from-red-600 dark:to-red-800',
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  trend,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl p-6 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]',
        variantStyles[variant]
      )}
    >
      {/* Gradient Overlay - محسّن للوضع الداكن */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />

      {/* Pattern Background - اختياري للوضع الداكن */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium opacity-90 dark:opacity-95 mb-1 tracking-wide">
              {title}
            </p>
            <p className="text-3xl font-bold tracking-tight drop-shadow-sm">
              {value}
            </p>
          </div>

          {Icon && (
            <div className="flex-shrink-0 mr-4">
              <div className="p-3 bg-white/20 dark:bg-white/15 rounded-lg backdrop-blur-sm shadow-md">
                <Icon className="h-6 w-6 drop-shadow-sm" />
              </div>
            </div>
          )}
        </div>

        {(subtitle || trend) && (
          <div className="flex items-center justify-between text-sm">
            {subtitle && (
              <span className="opacity-90 dark:opacity-95 font-medium">{subtitle}</span>
            )}

            {trend && (
              <span className={cn(
                'flex items-center gap-1 font-medium',
                trend.isPositive
                  ? 'text-green-200 dark:text-green-300'
                  : 'text-red-200 dark:text-red-300'
              )}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

