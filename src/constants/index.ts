import type { TaskStatus, TaskPriority } from '../lib/database.types'

export const STATUS_CONFIG: Record<TaskStatus, { label: string; bgClass: string; textClass: string }> = {
  not_started: { label: '未着手', bgClass: 'bg-stone-100', textClass: 'text-stone-600' },
  in_progress: { label: '進行中', bgClass: 'bg-orange-100', textClass: 'text-orange-700' },
  completed:   { label: '完了',   bgClass: 'bg-emerald-100', textClass: 'text-emerald-700' },
  on_hold:     { label: '保留',   bgClass: 'bg-amber-100', textClass: 'text-amber-700' },
}

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; colorClass: string }> = {
  high:   { label: '高', colorClass: 'text-red-500' },
  medium: { label: '中', colorClass: 'text-orange-500' },
  low:    { label: '低', colorClass: 'text-stone-400' },
}

export const STATUS_ORDER: TaskStatus[] = ['not_started', 'in_progress', 'on_hold', 'completed']
export const PRIORITY_ORDER: TaskPriority[] = ['high', 'medium', 'low']
