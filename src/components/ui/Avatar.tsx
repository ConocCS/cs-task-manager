import { cn } from '../../lib/utils'

interface AvatarProps {
  name: string
  color: string
  size?: 'sm' | 'md'
  outline?: boolean
  className?: string
}

export function Avatar({ name, color, size = 'sm', outline = false, className }: AvatarProps) {
  const sizeClasses = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'

  return (
    <div
      className={cn(
        'rounded-full shrink-0',
        outline ? 'border-2 bg-transparent' : '',
        sizeClasses,
        className
      )}
      style={outline
        ? { borderColor: color }
        : { backgroundColor: color }
      }
      title={name}
    />
  )
}
