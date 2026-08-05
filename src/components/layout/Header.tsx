import { List, Columns3 } from 'lucide-react'
import { cn } from '../../lib/utils'

export type ViewMode = 'list' | 'board'

interface HeaderProps {
  projectName: string
  projectColor: string
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function Header({ projectName, viewMode, onViewModeChange }: HeaderProps) {
  return (
    <header className="h-16 border-b-2 border-[var(--color-primary)]/20 px-20 flex items-center justify-between shrink-0">
      <h2 className="text-base font-bold text-[var(--color-foreground)] flex items-center gap-2">
        <span className="w-1 h-5 bg-[var(--color-primary)] rounded-full" />
        {projectName}
      </h2>

      <div className="flex items-center gap-1 bg-[var(--color-background)] rounded-xl p-1">
        <button
          onClick={() => onViewModeChange('list')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
            viewMode === 'list'
              ? 'bg-white text-[var(--color-foreground)] shadow-sm'
              : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
          )}
        >
          <List size={16} />
          リスト
        </button>
        <button
          onClick={() => onViewModeChange('board')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
            viewMode === 'board'
              ? 'bg-white text-[var(--color-foreground)] shadow-sm'
              : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
          )}
        >
          <Columns3 size={16} />
          ボード
        </button>
      </div>
    </header>
  )
}
