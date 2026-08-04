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

/** フィルタ対象のステータス（完了を除く） */
export const FILTER_STATUS_OPTIONS: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全て' },
  { value: 'not_started', label: '未着手' },
  { value: 'in_progress', label: '進行中' },
  { value: 'on_hold', label: '保留' },
]

export const FILTER_PRIORITY_OPTIONS: { value: TaskPriority | 'all'; label: string }[] = [
  { value: 'all', label: '全て' },
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
]

export type SortField = 'default' | 'due_date' | 'priority' | 'status' | 'assignee'
export type SortDirection = 'asc' | 'desc'

export const SORT_FIELD_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'default', label: 'デフォルト' },
  { value: 'due_date', label: '期日' },
  { value: 'priority', label: '優先度' },
  { value: 'status', label: 'ステータス' },
  { value: 'assignee', label: '担当者' },
]

export const SORT_DIRECTION_OPTIONS: { value: SortDirection; label: string }[] = [
  { value: 'asc', label: '昇順' },
  { value: 'desc', label: '降順' },
]
