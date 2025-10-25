import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: React.ComponentType<{ className?: string }>
  }
  className?: string
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  const ActionIcon = action?.icon || Plus

  return (
    <div className={cn(
      'flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8 animate-in',
      className
    )}>
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {action && (
        <Button
          onClick={action.onClick}
          className="gap-2 shadow-sm hover:shadow-md transition-shadow"
          size="default"
        >
          <ActionIcon className="h-4 w-4" />
          {action.label}
        </Button>
      )}
    </div>
  )
}
