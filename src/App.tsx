import { useState, useCallback, useMemo } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { Sidebar } from './components/layout/Sidebar'
import { Header, type ViewMode } from './components/layout/Header'
import { FilterBar, type FilterState, type SortState } from './components/layout/FilterBar'
import { TaskListView } from './components/task/TaskListView'
import { TaskBoardView } from './components/task/TaskBoardView'
import { TaskDetailPanel } from './components/task/TaskDetailPanel'
import { ClaudeGuideModal } from './components/layout/ClaudeGuideModal'
import { useProjects } from './hooks/useProjects'
import { useTasks } from './hooks/useTasks'
import { useSections } from './hooks/useSections'
import { useMembers } from './hooks/useMembers'
import { STATUS_ORDER, PRIORITY_ORDER } from './constants'
import type { Task } from './lib/database.types'
import { Loader2 } from 'lucide-react'

function App() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showClaudeGuide, setShowClaudeGuide] = useState(false)

  // フィルタ・ソートstate
  const [filter, setFilter] = useState<FilterState>({
    assigneeId: 'all',
    priority: 'all',
    status: 'all',
    waitingOnId: 'all',
  })
  const [sort, setSort] = useState<SortState>({
    field: 'default',
    direction: 'asc',
  })

  const { projects, loading: projectsLoading, createProject } = useProjects()
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask, toggleComplete } = useTasks(selectedProjectId)
  const { sections, createSection } = useSections(selectedProjectId)
  const { members } = useMembers()

  // Auto-select first project
  if (!selectedProjectId && projects.length > 0) {
    setSelectedProjectId(projects[0].id)
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  // フィルタ・ソート適用
  const { activeTasks, completedTasks } = useMemo(() => {
    // まず完了/未完了を分離
    const completed = tasks.filter(t => t.status === 'completed')
    let active = tasks.filter(t => t.status !== 'completed')

    // フィルタ適用（完了以外のタスクに対して）
    if (filter.assigneeId !== 'all') {
      active = active.filter(t => t.assignee_id === filter.assigneeId)
    }
    if (filter.priority !== 'all') {
      active = active.filter(t => t.priority === filter.priority)
    }
    if (filter.status !== 'all') {
      active = active.filter(t => t.status === filter.status)
    }
    if (filter.waitingOnId !== 'all') {
      active = active.filter(t => t.waiting_on_id === filter.waitingOnId)
    }

    // ソート適用
    if (sort.field !== 'default') {
      const dir = sort.direction === 'asc' ? 1 : -1

      active.sort((a, b) => {
        switch (sort.field) {
          case 'due_date': {
            // nullは末尾
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

    return { activeTasks: active, completedTasks: completed }
  }, [tasks, filter, sort, members])

  const handleCreateTask = useCallback((title: string, sectionId: string | null) => {
    createTask({ title, sectionId })
  }, [createTask])

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task)
  }, [])

  const handleUpdateTask = useCallback((id: string, updates: Record<string, unknown>) => {
    updateTask(id, updates)
    setSelectedTask(prev => {
      if (prev && prev.id === id) {
        return { ...prev, ...updates } as Task
      }
      return prev
    })
  }, [updateTask])

  const handleDeleteTask = useCallback((id: string) => {
    deleteTask(id)
    setSelectedTask(null)
  }, [deleteTask])

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" />
      </div>
    )
  }

  return (
    <AppLayout
      sidebar={
        <Sidebar
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          onCreateProject={async (name) => {
            const p = await createProject(name)
            if (p) setSelectedProjectId(p.id)
          }}
          onOpenClaudeGuide={() => setShowClaudeGuide(true)}
        />
      }
    >
      {selectedProject ? (
        <>
          <Header
            projectName={selectedProject.name}
            projectColor={selectedProject.color}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <FilterBar
            filter={filter}
            sort={sort}
            members={members}
            onFilterChange={setFilter}
            onSortChange={setSort}
          />

          {tasksLoading ? (
            <div className="flex items-center justify-center flex-1">
              <Loader2 size={24} className="animate-spin text-[var(--color-primary)]" />
            </div>
          ) : viewMode === 'list' ? (
            <TaskListView
              tasks={activeTasks}
              completedTasks={completedTasks}
              sections={sections}
              members={members}
              onToggleComplete={toggleComplete}
              onTaskClick={handleTaskClick}
              onCreateTask={handleCreateTask}
              onCreateSection={createSection}
            />
          ) : (
            <TaskBoardView
              tasks={tasks}
              members={members}
              onTaskClick={handleTaskClick}
              onUpdateTask={handleUpdateTask}
              filter={filter}
              sort={sort}
            />
          )}

          <TaskDetailPanel
            task={selectedTask}
            members={members}
            sections={sections}
            onClose={() => setSelectedTask(null)}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
          />
        </>
      ) : (
        <div className="flex items-center justify-center flex-1 text-[var(--color-muted)]">
          <div className="text-center">
            <p className="text-lg mb-2">プロジェクトを選択または作成してください</p>
            <p className="text-sm">左サイドバーの「+」ボタンから新規プロジェクトを作成できます</p>
          </div>
        </div>
      )}
      <ClaudeGuideModal open={showClaudeGuide} onClose={() => setShowClaudeGuide(false)} />
    </AppLayout>
  )
}

export default App
