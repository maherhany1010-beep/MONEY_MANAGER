'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: number
  icon: LucideIcon
  color: string
  trend?: number
  chartData?: Array<{ name: string; value: number }>
  isVisible: boolean
  format?: (value: number) => string
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  trend = 0,
  chartData = [],
  isVisible,
  format = (v) => v.toLocaleString('ar-EG'),
}: MetricCardProps) {
  const isPositive = trend >= 0
  const trendColor = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="h-full"
    >
      <Card className="relative overflow-hidden border-2 border-border bg-card hover:shadow-2xl transition-all duration-300 rounded-xl h-full">
        {/* Background gradient effect */}
        <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${color}`} />

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-5 px-5 relative z-10">
          <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
          <motion.div
            whileHover={{ scale: 1.15, rotate: 10 }}
            className={`p-2.5 rounded-lg ${color} bg-opacity-20 backdrop-blur-sm`}
          >
            <Icon className={`h-5 w-5 ${color}`} />
          </motion.div>
        </CardHeader>

        <CardContent className="relative z-10 px-5 pb-5">
          {/* Value */}
          <div className="mb-4">
            <div className="text-2xl font-bold mb-2 text-foreground">
              {isVisible ? format(value) : '••••••'}
            </div>

            {/* Trend */}
            {trend !== undefined && (
              <div className={`flex items-center gap-1.5 ${trendColor}`}>
                {isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-xs font-semibold">
                  {isPositive ? '+' : ''}{trend.toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="h-14 -mx-2 -mb-2 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={isPositive ? '#10b981' : '#ef4444'}
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

