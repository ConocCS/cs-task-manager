import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, ArrowUp, ArrowDown, Minus, Eye } from 'lucide-react'
import { format, isBefore, startOfToday } from 'date-fns'
import type { Task, Member } from '../../lib/database.types'
import { PRIORITY_CONFIG } from '../../constants'
import { cn } from '../../lib/utils'

interface TaskCardProps {
  task: Task
  members: Member[]
  onClick: (task: Task) => void
}

const PriorityIcon = ({ priority }: { priority: Task['priority'] }) => {
  const size = 12
  switch (priority) {
    case 'high': return <ArrowUp size={size} className="text-red-500" />
    case 'medium': return <Minus size={size} className="text-orange-500" />
    case 'low': return <ArrowDown size={size} className="text-stone-400" />
  }
}

export function TaskCard({ task, members, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const assignee = members.find(m => m.id === task.assignee_id)
  const waitingOn = members.find(m => m.id === task.waiting_on_id)
  const isOverdue = task.due_date && task.status !== 'completed' && isBefore(new Date(task.due_date), startOfToday())

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={cn(
        'bg-white border border-[var(--color-border)] rounded-xl p-3.5 cursor-pointer hover:shadow-md hover:border-[var(--color-primary)]/30 transition-all',
        isDragging && 'opacity-50 shadow-lg rotate-2'
      )}
    >
      <div className="text-sm font-medium text-[var(--color-foreground)] mb-2.5">{task.title}</div>

      {waitingOn && (
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
            <Eye size={11} />
            {waitingOn.name}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.due_date && (
            <span className={cn(
              'text-xs flex items-center gap-1',
              isOverdue ? 'text-red-500 font-medium' : 'text-[var(--color-muted)]'
            )}>
              <Calendar size={12} />
              {format(new Date(task.due_date), 'M/d')}
            </span>
          )}
          <span className="flex items-center gap-0.5" title={PRIORITY_CONFIG[task.priority].label}>
            <PriorityIcon priority={task.priority} />
          </span>
        </div>

        {assignee && <span className="text-xs text-[var(--color-muted)]">{assignee.name}</span>}
      </div>
    </div>
  )
}
