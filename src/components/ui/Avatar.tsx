import { cn } from '../../lib/utils'

interface AvatarProps {
  name: string
  color: string
  size?: 'sm' | 'md'
  outline?: boolean
  className?: string
}

export function Avatar({ name, color, size = 'sm', outline = false, className }: AvatarProps) {
  const initial = name.charAt(0)
  const sizeClasses = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium shrink-0',
        outline ? 'bg-transparent border-2' : 'text-white',
        sizeClasses,
        className
      )}
      style={outline
        ? { borderColor: color, color: color }
        : { backgroundColor: color }
      }
      title={name}
    >
      {initial}
    </div>
  )
}
