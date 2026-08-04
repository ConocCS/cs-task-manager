import { cn } from '../../lib/utils'

interface BadgeProps {
  children: React.ReactNode
  bgClass: string
  textClass: string
  className?: string
}

export function Badge({ children, bgClass, textClass, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium', bgClass, textClass, className)}>
      {children}
    </span>
  )
}
