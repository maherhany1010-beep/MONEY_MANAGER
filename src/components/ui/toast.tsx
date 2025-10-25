'use client'

import { Toaster as Sonner } from 'sonner'
import { useTheme } from '@/contexts/theme-context'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="top-center"
      dir="rtl"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          success:
            'group-[.toaster]:bg-green-50 group-[.toaster]:text-green-900 group-[.toaster]:border-green-200 dark:group-[.toaster]:bg-green-900/30 dark:group-[.toaster]:text-green-100 dark:group-[.toaster]:border-green-800',
          error:
            'group-[.toaster]:bg-red-50 group-[.toaster]:text-red-900 group-[.toaster]:border-red-200 dark:group-[.toaster]:bg-red-900/30 dark:group-[.toaster]:text-red-100 dark:group-[.toaster]:border-red-800',
          warning:
            'group-[.toaster]:bg-orange-50 group-[.toaster]:text-orange-900 group-[.toaster]:border-orange-200 dark:group-[.toaster]:bg-orange-900/30 dark:group-[.toaster]:text-orange-100 dark:group-[.toaster]:border-orange-800',
          info:
            'group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-900 group-[.toaster]:border-blue-200 dark:group-[.toaster]:bg-blue-900/30 dark:group-[.toaster]:text-blue-100 dark:group-[.toaster]:border-blue-800',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

