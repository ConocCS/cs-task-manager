import { useState } from 'react'
import { LayoutGrid, Plus, ChevronDown } from 'lucide-react'
import type { Project } from '../../lib/database.types'
import { cn } from '../../lib/utils'

interface SidebarProps {
  projects: Project[]
  selectedProjectId: string | null
  onSelectProject: (id: string) => void
  onCreateProject: (name: string) => void
}

export function Sidebar({ projects, selectedProjectId, onSelectProject, onCreateProject }: SidebarProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')

  const handleCreate = () => {
    const name = newName.trim()
    if (name) {
      onCreateProject(name)
    }
    setNewName('')
    setIsCreating(false)
  }

  return (
    <aside className="w-60 h-full bg-[var(--color-sidebar-bg)] flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-white/10">
        <h1 className="text-base font-bold text-[var(--color-sidebar-text)] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
            <LayoutGrid size={18} className="text-white" />
          </div>
          CS Tasks
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        <div className="px-4 py-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1">
            <ChevronDown size={12} />
            プロジェクト
          </span>
          <button
            onClick={() => setIsCreating(true)}
            className="p-1 rounded hover:bg-[var(--color-sidebar-hover)] text-white/40 hover:text-white/70 transition-colors"
            title="プロジェクトを追加"
          >
            <Plus size={16} />
          </button>
        </div>

        {projects.map(project => (
          <button
            key={project.id}
            onClick={() => onSelectProject(project.id)}
            className={cn(
              'w-[calc(100%-16px)] text-left px-3 py-2 mx-2 rounded-lg text-sm flex items-center gap-2.5 transition-all',
              selectedProjectId === project.id
                ? 'bg-[var(--color-primary)] text-white font-medium shadow-lg shadow-orange-900/20'
                : 'text-white/70 hover:bg-[var(--color-sidebar-hover)] hover:text-white'
            )}
          >
            <span
              className={cn(
                'w-2.5 h-2.5 rounded-full shrink-0',
                selectedProjectId === project.id && 'ring-2 ring-white/30'
              )}
              style={{ backgroundColor: selectedProjectId === project.id ? '#fff' : project.color }}
            />
            <span className="truncate">{project.name}</span>
          </button>
        ))}

        {isCreating && (
          <div className="px-3 py-1.5 mx-1">
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => {
                if (e.nativeEvent.isComposing) return
                if (e.key === 'Enter') handleCreate()
                if (e.key === 'Escape') { setIsCreating(false); setNewName('') }
              }}
              onBlur={handleCreate}
              placeholder="プロジェクト名..."
              className="w-full text-sm px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            />
          </div>
        )}
      </nav>
    </aside>
  )
}
