import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  noPadding?: boolean
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
}

/**
 * Page Container Component
 * مكون حاوية الصفحة - يوفر هوامش وتباعد موحد لجميع الصفحات
 */
export function PageContainer({
  children,
  className,
  maxWidth = 'full',
  noPadding = false,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'w-full mx-auto',
        maxWidthClasses[maxWidth],
        !noPadding && 'space-y-6',
        className
      )}
    >
      {children}
    </div>
  )
}

