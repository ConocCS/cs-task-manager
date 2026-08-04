import { Filter, ArrowUpDown } from 'lucide-react'
import type { Member, TaskStatus, TaskPriority } from '../../lib/database.types'
import {
  FILTER_STATUS_OPTIONS,
  FILTER_PRIORITY_OPTIONS,
  SORT_FIELD_OPTIONS,
  SORT_DIRECTION_OPTIONS,
  type SortField,
  type SortDirection,
} from '../../constants'

export interface FilterState {
  assigneeId: string // 'all' or member id
  priority: TaskPriority | 'all'
  status: TaskStatus | 'all'
  waitingOnId: string // 'all' or member id
}

export interface SortState {
  field: SortField
  direction: SortDirection
}

interface FilterBarProps {
  filter: FilterState
  sort: SortState
  members: Member[]
  onFilterChange: (filter: FilterState) => void
  onSortChange: (sort: SortState) => void
}

export function FilterBar({ filter, sort, members, onFilterChange, onSortChange }: FilterBarProps) {
  return (
    <div className="flex items-center gap-4 px-8 py-2 border-b border-[var(--color-border)]/50 bg-white/60 shrink-0 flex-wrap">
      {/* フィルタ */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 text-xs font-semibold text-[var(--color-muted)]">
          <Filter size={14} />
          絞り込み
        </span>

        <label className="text-xs text-[var(--color-muted)]">担当</label>
        <select
          value={filter.assigneeId}
          onChange={e => onFilterChange({ ...filter, assigneeId: e.target.value })}
          className="text-xs border border-[var(--color-border)] rounded-lg px-2 py-1.5 bg-white text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/40"
        >
          <option value="all">全員</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <label className="text-xs text-[var(--color-muted)]">優先度</label>
        <select
          value={filter.priority}
          onChange={e => onFilterChange({ ...filter, priority: e.target.value as TaskPriority | 'all' })}
          className="text-xs border border-[var(--color-border)] rounded-lg px-2 py-1.5 bg-white text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/40"
        >
          {FILTER_PRIORITY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <label className="text-xs text-[var(--color-muted)]">状態</label>
        <select
          value={filter.status}
          onChange={e => onFilterChange({ ...filter, status: e.target.value as TaskStatus | 'all' })}
          className="text-xs border border-[var(--color-border)] rounded-lg px-2 py-1.5 bg-white text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/40"
        >
          {FILTER_STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <label className="text-xs text-[var(--color-muted)]">確認先</label>
        <select
          value={filter.waitingOnId}
          onChange={e => onFilterChange({ ...filter, waitingOnId: e.target.value })}
          className="text-xs border border-[var(--color-border)] rounded-lg px-2 py-1.5 bg-white text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/40"
        >
          <option value="all">全員</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* 区切り */}
      <div className="w-px h-5 bg-[var(--color-border)]" />

      {/* ソート */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 text-xs font-semibold text-[var(--color-muted)]">
          <ArrowUpDown size={14} />
          並べ替え
        </span>

        <select
          value={sort.field}
          onChange={e => onSortChange({ ...sort, field: e.target.value as SortField })}
          className="text-xs border border-[var(--color-border)] rounded-lg px-2 py-1.5 bg-white text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/40"
        >
          {SORT_FIELD_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          value={sort.direction}
          onChange={e => onSortChange({ ...sort, direction: e.target.value as SortDirection })}
          disabled={sort.field === 'default'}
          className="text-xs border border-[var(--color-border)] rounded-lg px-2 py-1.5 bg-white text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/40 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {SORT_DIRECTION_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
