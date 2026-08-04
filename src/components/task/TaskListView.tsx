import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Task, Section, Member } from '../../lib/database.types'
import { SectionGroup } from '../section/SectionGroup'
import { SectionCreate } from '../section/SectionCreate'
import { TaskRow } from './TaskRow'
import { TaskCreateInline } from './TaskCreateInline'

interface TaskListViewProps {
  tasks: Task[]
  completedTasks: Task[]
  sections: Section[]
  members: Member[]
  onToggleComplete: (id: string) => void
  onTaskClick: (task: Task) => void
  onCreateTask: (title: string, sectionId: string | null) => void
  onCreateSection: (name: string) => void
}

export function TaskListView({
  tasks, completedTasks, sections, members,
  onToggleComplete, onTaskClick, onCreateTask, onCreateSection,
}: TaskListViewProps) {
  const [completedOpen, setCompletedOpen] = useState(false)
  const unsectionedTasks = tasks.filter(t => !t.section_id)

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex items-center gap-3 px-8 py-2.5 text-xs font-semibold text-[var(--color-primary)] tracking-wider border-b border-[var(--color-primary)]/10 bg-white sticky top-0 z-10">
        <div className="w-5" />
        <div className="flex-1">タスク名</div>
        <div className="w-7">担当</div>
        <div className="w-24">確認先</div>
        <div className="w-20 text-right">期日</div>
        <div className="w-8 text-center">優先</div>
        <div className="w-16">状態</div>
      </div>

      {unsectionedTasks.length > 0 && (
        <div className="mb-1">
          {unsectionedTasks.map(task => (
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

      {sections.map(section => (
        <SectionGroup
          key={section.id}
          section={section}
          tasks={tasks.filter(t => t.section_id === section.id)}
          members={members}
          onToggleComplete={onToggleComplete}
          onTaskClick={onTaskClick}
          onCreateTask={onCreateTask}
        />
      ))}

      {sections.length === 0 && (
        <TaskCreateInline onSubmit={title => onCreateTask(title, null)} />
      )}

      <SectionCreate onSubmit={onCreateSection} />

      {/* 完了済みタスクの折りたたみセクション */}
      {completedTasks.length > 0 && (
        <div className="mt-4 border-t-2 border-[var(--color-border)]">
          <button
            onClick={() => setCompletedOpen(!completedOpen)}
            className="flex items-center gap-2 px-8 py-3 w-full text-left hover:bg-white/40 transition-colors"
          >
            {completedOpen
              ? <ChevronDown size={16} className="text-emerald-600" />
              : <ChevronRight size={16} className="text-emerald-600" />
            }
            <span className="text-sm font-bold text-[var(--color-foreground)]">
              完了済みタスク
            </span>
            <span className="text-xs text-white bg-emerald-500 px-1.5 py-0.5 rounded-full">
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
