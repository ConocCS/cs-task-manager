import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Task, Member, TaskStatus } from '../../lib/database.types'
import { STATUS_CONFIG } from '../../constants'
import { TaskCard } from './TaskCard'
import { cn } from '../../lib/utils'

interface StatusColumnProps {
  status: TaskStatus
  tasks: Task[]
  members: Member[]
  onTaskClick: (task: Task) => void
}

export function StatusColumn({ status, tasks, members, onTaskClick }: StatusColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const config = STATUS_CONFIG[status]

  return (
    <div className="flex-1 min-w-[260px] max-w-[320px] flex flex-col">
      <div className="flex items-center gap-2.5 px-3 py-3 mb-2">
        <span className={cn('w-3 h-3 rounded-full', config.bgClass)} />
        <span className="text-sm font-bold text-[var(--color-foreground)]">{config.label}</span>
        <span className="text-xs text-[var(--color-muted)] bg-white/60 px-1.5 py-0.5 rounded-full">{tasks.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 rounded-xl p-2.5 space-y-2.5 overflow-y-auto transition-all min-h-[100px]',
          isOver ? 'bg-orange-50 ring-2 ring-[var(--color-primary)]/30' : 'bg-white/40'
        )}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} members={members} onClick={onTaskClick} />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}
