import { useState, useRef, useEffect } from 'react'
import { Check, ArrowUp, ArrowDown, Minus, Calendar, Eye } from 'lucide-react'
import { format, isBefore, startOfToday } from 'date-fns'
import type { Task, Member } from '../../lib/database.types'
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../../constants'
import { Badge } from '../ui/Badge'
import { cn } from '../../lib/utils'

interface TaskRowProps {
  task: Task
  members: Member[]
  onToggleComplete: (id: string) => void
  onClick: (task: Task) => void
  onUpdate?: (id: string, updates: Record<string, unknown>) => void
}

const PriorityIcon = ({ priority }: { priority: Task['priority'] }) => {
  const size = 14
  switch (priority) {
    case 'high': return <ArrowUp size={size} className="text-red-500" />
    case 'medium': return <Minus size={size} className="text-orange-500" />
    case 'low': return <ArrowDown size={size} className="text-stone-400" />
  }
}

export function TaskRow({ task, members, onToggleComplete, onClick, onUpdate }: TaskRowProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const inputRef = useRef<HTMLInputElement>(null)

  const assignee = members.find(m => m.id === task.assignee_id)
  const waitingOn = members.find(m => m.id === task.waiting_on_id)
  const statusConfig = STATUS_CONFIG[task.status]
  const isOverdue = task.due_date && task.status !== 'completed' && isBefore(new Date(task.due_date), startOfToday())
  const isCompleted = task.status === 'completed'

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditingTitle])

  const handleTitleSubmit = () => {
    const trimmed = editTitle.trim()
    if (trimmed && trimmed !== task.title && onUpdate) {
      onUpdate(task.id, { title: trimmed })
    } else {
      setEditTitle(task.title)
    }
    setIsEditingTitle(false)
  }

  return (
    <div
      className="group flex items-center gap-3 px-20 py-3.5 hover:bg-white/60 cursor-pointer border-b border-[var(--color-border)]/50 transition-all"
      onClick={() => onClick(task)}
    >
      <button
        onClick={e => { e.stopPropagation(); onToggleComplete(task.id) }}
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
          isCompleted
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-stone-300 hover:border-[var(--color-primary)] hover:bg-orange-50'
        )}
      >
        {isCompleted && <Check size={12} />}
      </button>

      {isEditingTitle ? (
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          onKeyDown={e => {
            if (e.nativeEvent.isComposing) return
            if (e.key === 'Enter') handleTitleSubmit()
            if (e.key === 'Escape') { setEditTitle(task.title); setIsEditingTitle(false) }
          }}
          onBlur={handleTitleSubmit}
          onClick={e => e.stopPropagation()}
          className="flex-1 text-sm px-2 py-1 border border-[var(--color-primary)] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
        />
      ) : (
        <span
          className={cn('flex-1 text-sm truncate hover:text-[var(--color-primary)]', isCompleted && 'line-through text-stone-400')}
          onClick={e => {
            if (!isCompleted && onUpdate) {
              e.stopPropagation()
              setEditTitle(task.title)
              setIsEditingTitle(true)
            }
          }}
        >
          {task.title}
        </span>
      )}

      <div className="w-16">
        {assignee && (
          <span className="text-xs text-[var(--color-foreground)]">{assignee.name}</span>
        )}
      </div>

      <div className="w-24">
        {waitingOn && (
          <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
            <Eye size={11} />
            {waitingOn.name}
          </span>
        )}
      </div>

      <div className="w-20 text-right">
        {task.due_date && (
          <span className={cn(
            'text-xs flex items-center justify-end gap-1',
            isOverdue ? 'text-red-500 font-medium' : 'text-[var(--color-muted)]'
          )}>
            <Calendar size={12} />
            {format(new Date(task.due_date), 'M/d')}
          </span>
        )}
      </div>

      <div className="w-8 flex justify-center" title={PRIORITY_CONFIG[task.priority].label}>
        <PriorityIcon priority={task.priority} />
      </div>

      <div className="w-16">
        <Badge bgClass={statusConfig.bgClass} textClass={statusConfig.textClass}>
          {statusConfig.label}
        </Badge>
      </div>
    </div>
  )
}
