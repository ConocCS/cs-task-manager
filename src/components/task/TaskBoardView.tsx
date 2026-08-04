import { useMemo } from 'react'
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import type { Task, Member, TaskStatus } from '../../lib/database.types'
import { STATUS_ORDER, PRIORITY_ORDER } from '../../constants'
import type { FilterState, SortState } from '../layout/FilterBar'
import { StatusColumn } from './StatusColumn'

interface TaskBoardViewProps {
  tasks: Task[]
  members: Member[]
  onTaskClick: (task: Task) => void
  onUpdateTask: (id: string, updates: Record<string, unknown>) => void
  filter: FilterState
  sort: SortState
}

export function TaskBoardView({ tasks, members, onTaskClick, onUpdateTask, filter, sort }: TaskBoardViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // フィルタ・ソート適用（カンバンでは完了カラムもそのまま表示）
  const filteredSortedTasks = useMemo(() => {
    let result = [...tasks]

    // フィルタ適用（完了タスクにはフィルタを適用しない）
    result = result.filter(t => {
      if (t.status === 'completed') return true
      if (filter.assigneeId !== 'all' && t.assignee_id !== filter.assigneeId) return false
      if (filter.priority !== 'all' && t.priority !== filter.priority) return false
      if (filter.status !== 'all' && t.status !== filter.status) return false
      return true
    })

    // ソート適用
    if (sort.field !== 'default') {
      const dir = sort.direction === 'asc' ? 1 : -1
      result.sort((a, b) => {
        switch (sort.field) {
          case 'due_date': {
            if (!a.due_date && !b.due_date) return 0
            if (!a.due_date) return 1
            if (!b.due_date) return -1
            return (a.due_date < b.due_date ? -1 : a.due_date > b.due_date ? 1 : 0) * dir
          }
          case 'priority': {
            const ai = PRIORITY_ORDER.indexOf(a.priority)
            const bi = PRIORITY_ORDER.indexOf(b.priority)
            return (ai - bi) * dir
          }
          case 'status': {
            const ai = STATUS_ORDER.indexOf(a.status)
            const bi = STATUS_ORDER.indexOf(b.status)
            return (ai - bi) * dir
          }
          case 'assignee': {
            const aName = members.find(m => m.id === a.assignee_id)?.name ?? ''
            const bName = members.find(m => m.id === b.assignee_id)?.name ?? ''
            if (!aName && !bName) return 0
            if (!aName) return 1
            if (!bName) return -1
            return aName.localeCompare(bName, 'ja') * dir
          }
          default:
            return 0
        }
      })
    }

    return result
  }, [tasks, filter, sort, members])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const taskId = active.id as string
    const overId = over.id as string

    // Check if dropped on a status column
    if (STATUS_ORDER.includes(overId as TaskStatus)) {
      const newStatus = overId as TaskStatus
      const task = tasks.find(t => t.id === taskId)
      if (task && task.status !== newStatus) {
        onUpdateTask(taskId, { status: newStatus })
      }
      return
    }

    // Dropped on another task - move to that task's status
    const overTask = tasks.find(t => t.id === overId)
    if (overTask) {
      const task = tasks.find(t => t.id === taskId)
      if (task && task.status !== overTask.status) {
        onUpdateTask(taskId, { status: overTask.status })
      }
    }
  }

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 h-full">
          {STATUS_ORDER.map(status => (
            <StatusColumn
              key={status}
              status={status}
              tasks={filteredSortedTasks.filter(t => t.status === status)}
              members={members}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
}
