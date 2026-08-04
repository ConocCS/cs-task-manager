import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import type { Task, Member, TaskStatus } from '../../lib/database.types'
import { STATUS_ORDER } from '../../constants'
import { StatusColumn } from './StatusColumn'

interface TaskBoardViewProps {
  tasks: Task[]
  members: Member[]
  onTaskClick: (task: Task) => void
  onUpdateTask: (id: string, updates: Record<string, unknown>) => void
}

export function TaskBoardView({ tasks, members, onTaskClick, onUpdateTask }: TaskBoardViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

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
              tasks={tasks.filter(t => t.status === status)}
              members={members}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
}
