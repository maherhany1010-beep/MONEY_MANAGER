'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertCircle,
  CheckCircle2,
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Lightbulb,
} from 'lucide-react'
import { Insight } from '@/lib/analytics'
import { cn } from '@/lib/utils'

interface InsightsPanelProps {
  insights: Insight[]
  title?: string
  className?: string
  onDismiss?: (insightId: string) => void
}

export function InsightsPanel({
  insights,
  title = 'الرؤى الذكية',
  className,
  onDismiss,
}: InsightsPanelProps) {
  if (insights.length === 0) return null

  return (
    <Card className={cn('p-6', className)} dir="rtl">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge variant="secondary" className="mr-auto">
          {insights.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {insights.map((insight) => (
          <InsightCard
            key={insight.id}
            insight={insight}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </Card>
  )
}

interface InsightCardProps {
  insight: Insight
  onDismiss?: (insightId: string) => void
}

function InsightCard({ insight, onDismiss }: InsightCardProps) {
  const Icon = getInsightIcon(insight.type)
  const TrendIcon = getTrendIcon(insight.trend)

  return (
    <div
      className={cn(
        'relative p-4 rounded-lg border',
        'transition-colors hover:bg-muted/50',
        getInsightBorderColor(insight.type)
      )}
    >
      {/* Dismiss Button */}
      {onDismiss && (
        <button
          onClick={() => onDismiss(insight.id)}
          className="absolute top-2 left-2 p-1 rounded-full hover:bg-muted transition-colors"
        >
          <X className="h-3 w-3 text-muted-foreground" />
        </button>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn('p-2 rounded-lg', getInsightBgColor(insight.type))}>
          <Icon className={cn('h-5 w-5', getInsightIconColor(insight.type))} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm">{insight.title}</h4>
            {insight.trend && (
              <TrendIcon className={cn('h-4 w-4', getTrendColor(insight.trend))} />
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-2">
            {insight.description}
          </p>

          {/* Metrics */}
          <div className="flex items-center gap-4 text-xs">
            {insight.value !== undefined && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">القيمة:</span>
                <span className="font-medium">
                  {insight.value.toLocaleString('ar-SA')} ريال
                </span>
              </div>
            )}

            {insight.percentage !== undefined && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">النسبة:</span>
                <span className={cn(
                  'font-medium',
                  insight.trend === 'up' ? 'text-green-600' : 
                  insight.trend === 'down' ? 'text-red-600' : 
                  'text-muted-foreground'
                )}>
                  {insight.percentage.toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          {/* Action */}
          {insight.action && (
            <Button
              variant="link"
              size="sm"
              onClick={insight.action.onClick}
              className="h-auto p-0 mt-2 text-xs"
            >
              {insight.action.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Compact Insights List
 */
interface CompactInsightsListProps {
  insights: Insight[]
  maxItems?: number
  className?: string
}

export function CompactInsightsList({
  insights,
  maxItems = 3,
  className,
}: CompactInsightsListProps) {
  const displayedInsights = insights.slice(0, maxItems)

  if (displayedInsights.length === 0) return null

  return (
    <div className={cn('space-y-2', className)} dir="rtl">
      {displayedInsights.map((insight) => {
        const Icon = getInsightIcon(insight.type)
        return (
          <div
            key={insight.id}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Icon className={cn('h-4 w-4', getInsightIconColor(insight.type))} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{insight.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {insight.description}
              </p>
            </div>
          </div>
        )
      })}

      {insights.length > maxItems && (
        <p className="text-xs text-muted-foreground text-center">
          +{insights.length - maxItems} رؤية أخرى
        </p>
      )}
    </div>
  )
}

/**
 * Insight Badge
 */
interface InsightBadgeProps {
  count: number
  type?: 'success' | 'warning' | 'info' | 'error'
  className?: string
}

export function InsightBadge({ count, type = 'info', className }: InsightBadgeProps) {
  if (count === 0) return null

  return (
    <Badge
      variant={type === 'error' ? 'destructive' : 'secondary'}
      className={cn('gap-1', className)}
    >
      <Lightbulb className="h-3 w-3" />
      {count}
    </Badge>
  )
}

// Helper functions
function getInsightIcon(type: Insight['type']) {
  switch (type) {
    case 'success':
      return CheckCircle2
    case 'warning':
      return AlertCircle
    case 'error':
      return AlertCircle
    case 'info':
    default:
      return Info
  }
}

function getTrendIcon(trend?: Insight['trend']) {
  switch (trend) {
    case 'up':
      return TrendingUp
    case 'down':
      return TrendingDown
    case 'stable':
    default:
      return Minus
  }
}

function getInsightBorderColor(type: Insight['type']) {
  switch (type) {
    case 'success':
      return 'border-green-200 dark:border-green-900'
    case 'warning':
      return 'border-yellow-200 dark:border-yellow-900'
    case 'error':
      return 'border-red-200 dark:border-red-900'
    case 'info':
    default:
      return 'border-blue-200 dark:border-blue-900'
  }
}

function getInsightBgColor(type: Insight['type']) {
  switch (type) {
    case 'success':
      return 'bg-green-100 dark:bg-green-900/20'
    case 'warning':
      return 'bg-yellow-100 dark:bg-yellow-900/20'
    case 'error':
      return 'bg-red-100 dark:bg-red-900/20'
    case 'info':
    default:
      return 'bg-blue-100 dark:bg-blue-900/20'
  }
}

function getInsightIconColor(type: Insight['type']) {
  switch (type) {
    case 'success':
      return 'text-green-600 dark:text-green-400'
    case 'warning':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'error':
      return 'text-red-600 dark:text-red-400'
    case 'info':
    default:
      return 'text-blue-600 dark:text-blue-400'
  }
}

function getTrendColor(trend?: Insight['trend']) {
  switch (trend) {
    case 'up':
      return 'text-green-600'
    case 'down':
      return 'text-red-600'
    case 'stable':
    default:
      return 'text-muted-foreground'
  }
}

