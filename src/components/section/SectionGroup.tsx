import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Task, Section, Member } from '../../lib/database.types'
import { TaskRow } from '../task/TaskRow'
import { TaskCreateInline } from '../task/TaskCreateInline'

interface SectionGroupProps {
  section: Section
  tasks: Task[]
  members: Member[]
  onToggleComplete: (id: string) => void
  onTaskClick: (task: Task) => void
  onCreateTask: (title: string, sectionId: string) => void
}

export function SectionGroup({ section, tasks, members, onToggleComplete, onTaskClick, onCreateTask }: SectionGroupProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="mb-1">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 px-10 py-3 w-full text-left hover:bg-white/40 transition-colors"
      >
        {collapsed ? <ChevronRight size={16} className="text-[var(--color-primary)]" /> : <ChevronDown size={16} className="text-[var(--color-primary)]" />}
        <span className="text-sm font-bold text-[var(--color-foreground)]">{section.name}</span>
        <span className="text-xs text-white bg-[var(--color-primary)] px-1.5 py-0.5 rounded-full">{tasks.length}</span>
      </button>

      {!collapsed && (
        <div>
          {tasks.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              members={members}
              onToggleComplete={onToggleComplete}
              onClick={onTaskClick}
            />
          ))}
          <TaskCreateInline onSubmit={title => onCreateTask(title, section.id)} />
        </div>
      )}
    </div>
  )
}
