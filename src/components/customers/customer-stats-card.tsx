'use client'

import { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface CustomerStatsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  color: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'indigo'
  change?: {
    value: number
    isPositive: boolean
    label: string
  }
  description?: string
}

const colorClasses = {
  blue: {
    bg: 'from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-900 dark:text-blue-100',
    icon: 'bg-blue-500 dark:bg-blue-600',
  },
  green: {
    bg: 'from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-900 dark:text-emerald-100',
    icon: 'bg-green-500 dark:bg-green-600',
  },
  red: {
    bg: 'from-rose-50 to-red-50 dark:from-rose-950/50 dark:to-red-950/50',
    border: 'border-rose-200 dark:border-rose-800',
    text: 'text-red-900 dark:text-red-100',
    icon: 'bg-red-500 dark:bg-red-600',
  },
  orange: {
    bg: 'from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-900 dark:text-orange-100',
    icon: 'bg-orange-500 dark:bg-orange-600',
  },
  purple: {
    bg: 'from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-900 dark:text-purple-100',
    icon: 'bg-purple-500 dark:bg-purple-600',
  },
  indigo: {
    bg: 'from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50',
    border: 'border-indigo-200 dark:border-indigo-800',
    text: 'text-indigo-900 dark:text-indigo-100',
    icon: 'bg-indigo-500 dark:bg-indigo-600',
  },
}

export function CustomerStatsCard({
  title,
  value,
  icon,
  color,
  change,
  description,
}: CustomerStatsCardProps) {
  const colors = colorClasses[color]

  return (
    <div className={`bg-gradient-to-br ${colors.bg} rounded-xl p-6 shadow-sm border-2 ${colors.border}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${colors.text} opacity-75`}>{title}</p>
          <p className={`text-3xl font-bold ${colors.text} mt-2`}>{value}</p>
          
          {description && (
            <p className={`text-xs ${colors.text} opacity-60 mt-1`}>{description}</p>
          )}
          
          {change && (
            <div className="flex items-center gap-1 mt-3">
              {change.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <span className={`text-xs font-medium ${change.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {change.isPositive ? '+' : '-'}{change.value}% {change.label}
              </span>
            </div>
          )}
        </div>
        
        <div className={`p-3 ${colors.icon} rounded-lg shadow-md flex-shrink-0`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
    </div>
  )
}

