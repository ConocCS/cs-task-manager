import { useState, useEffect, useCallback } from 'react'
import { Trash2, Calendar, User, Flag, Layers, AlignLeft, Eye } from 'lucide-react'
import type { Task, Member, Section, TaskStatus, TaskPriority } from '../../lib/database.types'
import { STATUS_CONFIG, PRIORITY_CONFIG, STATUS_ORDER, PRIORITY_ORDER } from '../../constants'
import { SlidePanel } from '../ui/SlidePanel'
import { Badge } from '../ui/Badge'
import { Avatar } from '../ui/Avatar'

interface TaskDetailPanelProps {
  task: Task | null
  members: Member[]
  sections: Section[]
  onClose: () => void
  onUpdate: (id: string, updates: Record<string, unknown>) => void
  onDelete: (id: string) => void
}

export function TaskDetailPanel({ task, members, sections, onClose, onUpdate, onDelete }: TaskDetailPanelProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description ?? '')
      setShowDeleteConfirm(false)
    }
  }, [task])

  const saveTitle = useCallback(() => {
    if (!task) return
    const trimmed = title.trim()
    if (trimmed && trimmed !== task.title) {
      onUpdate(task.id, { title: trimmed })
    }
  }, [task, title, onUpdate])

  const saveDescription = useCallback(() => {
    if (!task) return
    const val = description.trim()
    if (val !== (task.description ?? '')) {
      onUpdate(task.id, { description: val || null })
    }
  }, [task, description, onUpdate])

  if (!task) return null

  const assignee = members.find(m => m.id === task.assignee_id)

  return (
    <SlidePanel open={!!task} onClose={onClose}>
      <div className="p-6 pt-12">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
          className="w-full text-xl font-bold text-[var(--color-foreground)] bg-transparent border-none outline-none focus:ring-0 mb-6"
        />

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-24 flex items-center gap-2 text-sm text-[var(--color-muted)]">
              <Layers size={16} />
              ステータス
            </div>
            <select
              value={task.status}
              onChange={e => onUpdate(task.id, { status: e.target.value as TaskStatus })}
              className="text-sm px-2.5 py-1.5 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            >
              {STATUS_ORDER.map(s => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
            <Badge bgClass={STATUS_CONFIG[task.status].bgClass} textClass={STATUS_CONFIG[task.status].textClass}>
              {STATUS_CONFIG[task.status].label}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-24 flex items-center gap-2 text-sm text-[var(--color-muted)]">
              <User size={16} />
              担当者
            </div>
            <select
              value={task.assignee_id ?? ''}
              onChange={e => onUpdate(task.id, { assignee_id: e.target.value || null })}
              className="text-sm px-2.5 py-1.5 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            >
              <option value="">未割り当て</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            {assignee && <Avatar name={assignee.name} color={assignee.avatar_color} size="sm" />}
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-24 flex items-center gap-2 text-sm text-[var(--color-muted)] cursor-help"
              title="他メンバーに確認を依頼中の場合に設定。確認が完了したら「なし」に戻してください。"
            >
              <Eye size={16} />
              確認先
            </div>
            <select
              value={task.waiting_on_id ?? ''}
              onChange={e => onUpdate(task.id, { waiting_on_id: e.target.value || null })}
              className="text-sm px-2.5 py-1.5 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            >
              <option value="">なし</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            {task.waiting_on_id && (
              <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                確認待ち
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-24 flex items-center gap-2 text-sm text-[var(--color-muted)]">
              <Calendar size={16} />
              期日
            </div>
            <input
              type="date"
              value={task.due_date ?? ''}
              onChange={e => onUpdate(task.id, { due_date: e.target.value || null })}
              className="text-sm px-2.5 py-1.5 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-24 flex items-center gap-2 text-sm text-[var(--color-muted)]">
              <Flag size={16} />
              優先度
            </div>
            <select
              value={task.priority}
              onChange={e => onUpdate(task.id, { priority: e.target.value as TaskPriority })}
              className="text-sm px-2.5 py-1.5 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            >
              {PRIORITY_ORDER.map(p => (
                <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-24 flex items-center gap-2 text-sm text-[var(--color-muted)]">
              <Layers size={16} />
              セクション
            </div>
            <select
              value={task.section_id ?? ''}
              onChange={e => onUpdate(task.id, { section_id: e.target.value || null })}
              className="text-sm px-2.5 py-1.5 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            >
              <option value="">なし</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-2 text-sm text-[var(--color-muted)] mb-2">
            <AlignLeft size={16} />
            説明
          </div>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            onBlur={saveDescription}
            rows={5}
            placeholder="タスクの詳細を入力..."
            className="w-full text-sm px-3 py-2.5 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 resize-y"
          />
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors"
            >
              <Trash2 size={16} />
              このタスクを削除
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-red-500">本当に削除しますか？</span>
              <button
                onClick={() => { onDelete(task.id); onClose() }}
                className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                削除
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              >
                キャンセル
              </button>
            </div>
          )}
        </div>
      </div>
    </SlidePanel>
  )
}
