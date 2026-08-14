import { useState, useMemo } from 'react'
import { Check, ArrowUp, ArrowDown, Minus, Calendar, ChevronDown, ChevronRight, Plus, Briefcase, User as UserIcon, Eye } from 'lucide-react'
import { format, isBefore, startOfToday } from 'date-fns'
import type { Task, PersonalTask, Member, Project } from '../../lib/database.types'
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../../constants'
import { Badge } from '../ui/Badge'
import { Avatar } from '../ui/Avatar'
import { cn } from '../../lib/utils'

interface MemberPageProps {
  member: Member
  assignedTasks: Task[]
  waitingOnTasks: Task[]
  personalTasks: PersonalTask[]
  projects: Project[]
  onToggleAssignedComplete: (id: string) => void
  onUpdateAssignedTask: (id: string, updates: Record<string, unknown>) => void
  onTogglePersonalComplete: (id: string) => void
  onCreatePersonalTask: (title: string) => void
  onUpdatePersonalTask: (id: string, updates: Record<string, unknown>) => void
  onDeletePersonalTask: (id: string) => void
}

const PriorityIcon = ({ priority }: { priority: string }) => {
  const size = 14
  switch (priority) {
    case 'high': return <ArrowUp size={size} className="text-orange-700" />
    case 'medium': return <Minus size={size} className="text-orange-500" />
    case 'low': return <ArrowDown size={size} className="text-stone-400" />
    default: return null
  }
}

export function MemberPage({
  member, assignedTasks, waitingOnTasks, personalTasks, projects,
  onToggleAssignedComplete, onUpdateAssignedTask,
  onTogglePersonalComplete, onCreatePersonalTask, onUpdatePersonalTask, onDeletePersonalTask,
}: MemberPageProps) {
  const [assignedCompletedOpen, setAssignedCompletedOpen] = useState(false)
  const [waitingOnCompletedOpen, setWaitingOnCompletedOpen] = useState(false)
  const [personalCompletedOpen, setPersonalCompletedOpen] = useState(false)
  const [isCreatingPersonal, setIsCreatingPersonal] = useState(false)
  const [newPersonalTitle, setNewPersonalTitle] = useState('')

  const { activeAssigned, completedAssigned } = useMemo(() => {
    const active = assignedTasks.filter(t => t.status !== 'completed')
    const completed = assignedTasks.filter(t => t.status === 'completed')
    return { activeAssigned: active, completedAssigned: completed }
  }, [assignedTasks])

  const { activeWaitingOn, completedWaitingOn } = useMemo(() => {
    const active = waitingOnTasks.filter(t => t.status !== 'completed')
    const completed = waitingOnTasks.filter(t => t.status === 'completed')
    return { activeWaitingOn: active, completedWaitingOn: completed }
  }, [waitingOnTasks])

  const { activePersonal, completedPersonal } = useMemo(() => {
    const active = personalTasks.filter(t => t.status !== 'completed')
    const completed = personalTasks.filter(t => t.status === 'completed')
    return { activePersonal: active, completedPersonal: completed }
  }, [personalTasks])

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name ?? ''
  }

  const getProjectColor = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.color ?? '#999'
  }

  const handleCreatePersonal = () => {
    const trimmed = newPersonalTitle.trim()
    if (trimmed) {
      onCreatePersonalTask(trimmed)
    }
    setNewPersonalTitle('')
    setIsCreatingPersonal(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <header className="h-16 border-b-2 border-[var(--color-primary)]/20 px-20 flex items-center gap-3 shrink-0">
        <Avatar name={member.name} color={member.avatar_color} size="md" />
        <h2 className="text-base font-bold text-[var(--color-foreground)]">
          {member.name}
        </h2>
        <span className="text-xs text-[var(--color-muted)]">マイページ</span>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* 割り振りタスク セクション */}
        <div className="px-20 pt-6 pb-2">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase size={16} className="text-[var(--color-primary)]" />
            <h3 className="text-sm font-bold text-[var(--color-foreground)]">割り振りタスク</h3>
            <span className="text-xs text-[var(--color-muted)]">
              {activeAssigned.length}件
            </span>
          </div>
        </div>

        {/* 割り振りタスク ヘッダー */}
        <div className="flex items-center gap-3 px-20 py-2 text-xs font-semibold text-[var(--color-primary)] tracking-wider border-b border-[var(--color-primary)]/10 bg-white sticky top-0 z-10">
          <div className="w-5" />
          <div className="flex-1">タスク名</div>
          <div className="w-24 shrink-0">プロジェクト</div>
          <div className="w-14 shrink-0 text-right">期日</div>
          <div className="w-8 shrink-0 text-center">優先</div>
          <div className="w-16 shrink-0">状態</div>
        </div>

        {activeAssigned.length === 0 ? (
          <div className="px-20 py-6 text-sm text-[var(--color-muted)]">
            割り振られたタスクはありません
          </div>
        ) : (
          activeAssigned.map(task => (
            <AssignedTaskRow
              key={task.id}
              task={task}
              projectName={getProjectName(task.project_id)}
              projectColor={getProjectColor(task.project_id)}
              onToggleComplete={onToggleAssignedComplete}
              onUpdate={onUpdateAssignedTask}
            />
          ))
        )}

        {/* 割り振り 完了済み */}
        {completedAssigned.length > 0 && (
          <div className="border-t border-[var(--color-border)]/50">
            <button
              onClick={() => setAssignedCompletedOpen(!assignedCompletedOpen)}
              className="flex items-center gap-2 px-20 py-2.5 w-full text-left hover:bg-white/40 transition-colors"
            >
              {assignedCompletedOpen
                ? <ChevronDown size={14} className="text-[var(--color-primary)]" />
                : <ChevronRight size={14} className="text-[var(--color-primary)]" />
              }
              <span className="text-xs font-bold text-[var(--color-foreground)]">完了済み</span>
              <span className="text-xs text-white bg-[var(--color-primary)] px-1.5 py-0.5 rounded-full">
                {completedAssigned.length}件
              </span>
            </button>
            {assignedCompletedOpen && completedAssigned.map(task => (
              <AssignedTaskRow
                key={task.id}
                task={task}
                projectName={getProjectName(task.project_id)}
                projectColor={getProjectColor(task.project_id)}
                onToggleComplete={onToggleAssignedComplete}
              />
            ))}
          </div>
        )}

        {/* 確認待ちタスク セクション */}
        {(activeWaitingOn.length > 0 || completedWaitingOn.length > 0) && (
          <>
            <div className="px-20 pt-8 pb-2 border-t-2 border-[var(--color-border)] mt-4">
              <div className="flex items-center gap-2 mb-4">
                <Eye size={16} className="text-[var(--color-primary)]" />
                <h3 className="text-sm font-bold text-[var(--color-foreground)]">確認待ちタスク</h3>
                <span className="text-xs text-[var(--color-muted)]">
                  {activeWaitingOn.length}件
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 px-20 py-2 text-xs font-semibold text-[var(--color-primary)] tracking-wider border-b border-[var(--color-primary)]/10 bg-white sticky top-0 z-10">
              <div className="w-5" />
              <div className="flex-1">タスク名</div>
              <div className="w-24 shrink-0">プロジェクト</div>
              <div className="w-14 shrink-0 text-right">期日</div>
              <div className="w-8 shrink-0 text-center">優先</div>
              <div className="w-16 shrink-0">状態</div>
            </div>

            {activeWaitingOn.length === 0 ? (
              <div className="px-20 py-6 text-sm text-[var(--color-muted)]">
                確認待ちのタスクはありません
              </div>
            ) : (
              activeWaitingOn.map(task => (
                <AssignedTaskRow
                  key={task.id}
                  task={task}
                  projectName={getProjectName(task.project_id)}
                  projectColor={getProjectColor(task.project_id)}
                  onToggleComplete={onToggleAssignedComplete}
                  onUpdate={onUpdateAssignedTask}
                />
              ))
            )}

            {completedWaitingOn.length > 0 && (
              <div className="border-t border-[var(--color-border)]/50">
                <button
                  onClick={() => setWaitingOnCompletedOpen(!waitingOnCompletedOpen)}
                  className="flex items-center gap-2 px-20 py-2.5 w-full text-left hover:bg-white/40 transition-colors"
                >
                  {waitingOnCompletedOpen
                    ? <ChevronDown size={14} className="text-[var(--color-primary)]" />
                    : <ChevronRight size={14} className="text-[var(--color-primary)]" />
                  }
                  <span className="text-xs font-bold text-[var(--color-foreground)]">完了済み</span>
                  <span className="text-xs text-white bg-[var(--color-primary)] px-1.5 py-0.5 rounded-full">
                    {completedWaitingOn.length}件
                  </span>
                </button>
                {waitingOnCompletedOpen && completedWaitingOn.map(task => (
                  <AssignedTaskRow
                    key={task.id}
                    task={task}
                    projectName={getProjectName(task.project_id)}
                    projectColor={getProjectColor(task.project_id)}
                    onToggleComplete={onToggleAssignedComplete}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* 個人予定 セクション */}
        <div className="px-20 pt-8 pb-2 border-t-2 border-[var(--color-border)] mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UserIcon size={16} className="text-[var(--color-primary)]" />
              <h3 className="text-sm font-bold text-[var(--color-foreground)]">個人予定</h3>
              <span className="text-xs text-[var(--color-muted)]">
                {activePersonal.length}件
              </span>
            </div>
          </div>
        </div>

        {/* 個人予定 ヘッダー */}
        <div className="flex items-center gap-3 px-20 py-2 text-xs font-semibold text-[var(--color-primary)] tracking-wider border-b border-[var(--color-primary)]/10 bg-white sticky top-0 z-10">
          <div className="w-5" />
          <div className="flex-1">予定名</div>
          <div className="w-14 shrink-0 text-right">期日</div>
          <div className="w-8 shrink-0 text-center">優先</div>
          <div className="w-16 shrink-0">状態</div>
        </div>

        {activePersonal.map(task => (
          <PersonalTaskRow
            key={task.id}
            task={task}
            onToggleComplete={onTogglePersonalComplete}
            onUpdate={onUpdatePersonalTask}
            onDelete={onDeletePersonalTask}
          />
        ))}

        {/* 個人予定 追加ボタン */}
        {isCreatingPersonal ? (
          <div className="px-20 py-3">
            <input
              autoFocus
              type="text"
              value={newPersonalTitle}
              onChange={e => setNewPersonalTitle(e.target.value)}
              onKeyDown={e => {
                if (e.nativeEvent.isComposing) return
                if (e.key === 'Enter') handleCreatePersonal()
                if (e.key === 'Escape') { setIsCreatingPersonal(false); setNewPersonalTitle('') }
              }}
              onBlur={handleCreatePersonal}
              placeholder="予定名を入力..."
              className="w-full text-sm px-4 py-3 border-2 border-[var(--color-primary)] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>
        ) : (
          <div className="flex justify-end px-20 py-3">
            <button
              onClick={() => setIsCreatingPersonal(true)}
              className="w-8 h-8 flex items-center justify-center text-[var(--color-primary)] border-2 border-[var(--color-primary)]/30 rounded-lg hover:bg-[var(--color-primary)]/5 transition-colors"
              title="個人予定を追加"
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* 個人予定 完了済み */}
        {completedPersonal.length > 0 && (
          <div className="border-t border-[var(--color-border)]/50">
            <button
              onClick={() => setPersonalCompletedOpen(!personalCompletedOpen)}
              className="flex items-center gap-2 px-20 py-2.5 w-full text-left hover:bg-white/40 transition-colors"
            >
              {personalCompletedOpen
                ? <ChevronDown size={14} className="text-[var(--color-primary)]" />
                : <ChevronRight size={14} className="text-[var(--color-primary)]" />
              }
              <span className="text-xs font-bold text-[var(--color-foreground)]">完了済み</span>
              <span className="text-xs text-white bg-[var(--color-primary)] px-1.5 py-0.5 rounded-full">
                {completedPersonal.length}件
              </span>
            </button>
            {personalCompletedOpen && completedPersonal.map(task => (
              <PersonalTaskRow
                key={task.id}
                task={task}
                onToggleComplete={onTogglePersonalComplete}
                onDelete={onDeletePersonalTask}
              />
            ))}
          </div>
        )}

        <div className="h-8" />
      </div>
    </div>
  )
}

// 割り振りタスク行
function AssignedTaskRow({ task, projectName, projectColor, onToggleComplete, onUpdate }: {
  task: Task
  projectName: string
  projectColor: string
  onToggleComplete: (id: string) => void
  onUpdate?: (id: string, updates: Record<string, unknown>) => void
}) {
  const statusConfig = STATUS_CONFIG[task.status]
  const isOverdue = task.due_date && task.status !== 'completed' && isBefore(new Date(task.due_date), startOfToday())
  const isCompleted = task.status === 'completed'

  return (
    <div className="group flex items-center gap-3 px-20 py-3 hover:bg-white/60 border-b border-[var(--color-border)]/50 transition-all">
      <button
        onClick={() => onToggleComplete(task.id)}
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
          isCompleted
            ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
            : 'border-stone-300 hover:border-[var(--color-primary)] hover:bg-orange-50'
        )}
      >
        {isCompleted && <Check size={12} />}
      </button>

      <span className={cn('flex-1 text-sm break-words', isCompleted && 'line-through text-stone-400')}>
        {task.title}
      </span>

      <div className="w-24 shrink-0 flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: projectColor }}
        />
        <span className="text-xs text-[var(--color-muted)] truncate">{projectName}</span>
      </div>

      <div className="w-14 shrink-0 text-right">
        <span
          className={cn(
            'text-xs flex items-center justify-end gap-1',
            isOverdue ? 'text-orange-700 font-medium' :
            task.due_date ? 'text-[var(--color-muted)]' :
            'text-stone-300'
          )}
        >
          <Calendar size={12} />
          {task.due_date ? format(new Date(task.due_date), 'M/d') : '--'}
        </span>
      </div>

      <div className="w-8 shrink-0 flex justify-center" title={PRIORITY_CONFIG[task.priority].label}>
        <PriorityIcon priority={task.priority} />
      </div>

      <div className="w-16 shrink-0">
        {onUpdate ? (
          <select
            value={task.status}
            onChange={e => onUpdate(task.id, { status: e.target.value })}
            onClick={e => e.stopPropagation()}
            className="text-xs px-1.5 py-1 border border-[var(--color-border)] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/30 cursor-pointer"
          >
            <option value="not_started">未着手</option>
            <option value="in_progress">進行中</option>
            <option value="on_hold">保留</option>
            <option value="completed">完了</option>
          </select>
        ) : (
          <Badge bgClass={statusConfig.bgClass} textClass={statusConfig.textClass}>
            {statusConfig.label}
          </Badge>
        )}
      </div>
    </div>
  )
}

// 個人予定行
function PersonalTaskRow({ task, onToggleComplete, onUpdate, onDelete }: {
  task: PersonalTask
  onToggleComplete: (id: string) => void
  onUpdate?: (id: string, updates: Record<string, unknown>) => void
  onDelete?: (id: string) => void
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [isEditingDueDate, setIsEditingDueDate] = useState(false)

  const statusConfig = STATUS_CONFIG[task.status]
  const isOverdue = task.due_date && task.status !== 'completed' && isBefore(new Date(task.due_date), startOfToday())
  const isCompleted = task.status === 'completed'

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
    <div className="group flex items-center gap-3 px-20 py-3 hover:bg-white/60 border-b border-[var(--color-border)]/50 transition-all">
      <button
        onClick={() => onToggleComplete(task.id)}
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
          isCompleted
            ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
            : 'border-stone-300 hover:border-[var(--color-primary)] hover:bg-orange-50'
        )}
      >
        {isCompleted && <Check size={12} />}
      </button>

      {isEditingTitle ? (
        <input
          autoFocus
          type="text"
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          onKeyDown={e => {
            if (e.nativeEvent.isComposing) return
            if (e.key === 'Enter') handleTitleSubmit()
            if (e.key === 'Escape') { setEditTitle(task.title); setIsEditingTitle(false) }
          }}
          onBlur={handleTitleSubmit}
          className="flex-1 text-sm px-2 py-1 border border-[var(--color-primary)] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
        />
      ) : (
        <span
          className={cn(
            'flex-1 text-sm break-words',
            isCompleted ? 'line-through text-stone-400' : 'hover:text-[var(--color-primary)] cursor-pointer'
          )}
          onClick={() => {
            if (!isCompleted && onUpdate) {
              setEditTitle(task.title)
              setIsEditingTitle(true)
            }
          }}
        >
          {task.title}
        </span>
      )}

      <div className="w-14 shrink-0 text-right">
        {isEditingDueDate ? (
          <input
            autoFocus
            type="date"
            value={task.due_date ?? ''}
            onChange={e => {
              if (onUpdate) {
                onUpdate(task.id, { due_date: e.target.value || null })
              }
              setIsEditingDueDate(false)
            }}
            onBlur={() => setIsEditingDueDate(false)}
            className="w-full text-xs border border-[var(--color-primary)] rounded-md px-1 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        ) : (
          <span
            className={cn(
              'text-xs flex items-center justify-end gap-1 cursor-pointer rounded-md px-1.5 py-1 transition-colors',
              isOverdue ? 'text-orange-700 font-medium hover:bg-orange-50' :
              task.due_date ? 'text-[var(--color-muted)] hover:bg-orange-50' :
              'text-stone-300 hover:bg-stone-100'
            )}
            onClick={() => onUpdate && setIsEditingDueDate(true)}
          >
            <Calendar size={12} />
            {task.due_date ? format(new Date(task.due_date), 'M/d') : '--'}
          </span>
        )}
      </div>

      <div className="w-8 shrink-0 flex justify-center" title={PRIORITY_CONFIG[task.priority].label}>
        <PriorityIcon priority={task.priority} />
      </div>

      <div className="w-16 shrink-0">
        {onUpdate ? (
          <select
            value={task.status}
            onChange={e => onUpdate(task.id, { status: e.target.value })}
            className="text-xs px-1.5 py-1 border border-[var(--color-border)] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/30 cursor-pointer"
          >
            <option value="not_started">未着手</option>
            <option value="in_progress">進行中</option>
            <option value="on_hold">保留</option>
            <option value="completed">完了</option>
          </select>
        ) : (
          <Badge bgClass={statusConfig.bgClass} textClass={statusConfig.textClass}>
            {statusConfig.label}
          </Badge>
        )}
      </div>

      {/* 削除ボタン（ホバー時表示） */}
      {onDelete && !isCompleted && (
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 transition-all shrink-0"
          title="削除"
        >
          x
        </button>
      )}
    </div>
  )
}
