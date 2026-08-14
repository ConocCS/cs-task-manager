import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Task, Member } from '../../lib/database.types'
import { TaskRow } from './TaskRow'
import { TaskCreateInline } from './TaskCreateInline'

interface TaskListViewProps {
  tasks: Task[]
  completedTasks: Task[]
  members: Member[]
  onToggleComplete: (id: string) => void
  onTaskClick: (task: Task) => void
  onUpdateTask: (id: string, updates: Record<string, unknown>) => void
  onCreateTask: (title: string) => void
}

export function TaskListView({
  tasks, completedTasks, members,
  onToggleComplete, onTaskClick, onUpdateTask, onCreateTask,
}: TaskListViewProps) {
  const [completedOpen, setCompletedOpen] = useState(false)

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex items-center gap-3 px-4 md:px-10 lg:px-4 md:px-10 lg:px-20 py-3 text-xs font-semibold text-[var(--color-primary)] tracking-wider border-b border-[var(--color-primary)]/10 bg-white sticky top-0 z-10">
        <div className="w-5" />
        <div className="flex-1">タスク名</div>
        <div className="w-12 md:w-16 shrink-0">担当</div>
        <div className="w-12 md:w-16 shrink-0">確認先</div>
        <div className="w-10 md:w-14 shrink-0 text-right">期日</div>
        <div className="w-6 md:w-8 shrink-0 text-center">優先</div>
        <div className="w-12 md:w-16 shrink-0">状態</div>
      </div>

      {tasks.map(task => (
        <TaskRow
          key={task.id}
          task={task}
          members={members}
          onToggleComplete={onToggleComplete}
          onClick={onTaskClick}
          onUpdate={onUpdateTask}
        />
      ))}

      <TaskCreateInline onSubmit={onCreateTask} />

      {completedTasks.length > 0 && (
        <div className="mt-4 border-t-2 border-[var(--color-border)]">
          <button
            onClick={() => setCompletedOpen(!completedOpen)}
            className="flex items-center gap-2.5 px-4 md:px-10 lg:px-20 py-3.5 w-full text-left hover:bg-white/40 transition-colors"
          >
            {completedOpen
              ? <ChevronDown size={16} className="text-[var(--color-primary)]" />
              : <ChevronRight size={16} className="text-[var(--color-primary)]" />
            }
            <span className="text-sm font-bold text-[var(--color-foreground)]">
              完了済みタスク
            </span>
            <span className="text-xs text-white bg-[var(--color-primary)] px-1.5 py-0.5 rounded-full">
              {completedTasks.length}件
            </span>
          </button>

          {completedOpen && (
            <div>
              {completedTasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  members={members}
                  onToggleComplete={onToggleComplete}
                  onClick={onTaskClick}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
