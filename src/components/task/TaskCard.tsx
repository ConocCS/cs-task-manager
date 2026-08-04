import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { format, isBefore, startOfToday } from 'date-fns'
import type { Task, Member } from '../../lib/database.types'
import { PRIORITY_CONFIG } from '../../constants'
import { Avatar } from '../ui/Avatar'
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

        {assignee && <Avatar name={assignee.name} color={assignee.avatar_color} size="sm" />}
      </div>
    </div>
  )
}
