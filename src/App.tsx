import { useState, useCallback, useMemo } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { Sidebar } from './components/layout/Sidebar'
import { Header, type ViewMode } from './components/layout/Header'
import { FilterBar, type FilterState, type SortState } from './components/layout/FilterBar'
import { TaskListView } from './components/task/TaskListView'
import { TaskBoardView } from './components/task/TaskBoardView'
import { TaskDetailPanel } from './components/task/TaskDetailPanel'
import { MemberPage } from './components/member/MemberPage'
import { ClaudeGuideModal } from './components/layout/ClaudeGuideModal'
import { LoginPage } from './components/layout/LoginPage'
import { useAuth } from './hooks/useAuth'
import { useProjects } from './hooks/useProjects'
import { useTasks } from './hooks/useTasks'
import { useMembers } from './hooks/useMembers'
import { useAssignedTasks } from './hooks/useAssignedTasks'
import { usePersonalTasks } from './hooks/usePersonalTasks'
import { STATUS_ORDER, PRIORITY_ORDER } from './constants'
import type { Task } from './lib/database.types'
import { Loader2 } from 'lucide-react'

function App() {
  const { user, loading: authLoading, error: authError, signInWithGoogle, signOut } = useAuth()
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('cs-task-view-mode')
    return saved === 'board' ? 'board' : 'list'
  })
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showClaudeGuide, setShowClaudeGuide] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('cs-task-sidebar-collapsed') === 'true'
  })

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
  const { members } = useMembers()
  const { tasks: assignedTasks, waitingOnTasks, updateTask: updateAssignedTask, toggleComplete: toggleAssignedComplete } = useAssignedTasks(selectedMemberId)
  const { tasks: personalTasks, createTask: createPersonalTask, updateTask: updatePersonalTask, deleteTask: deletePersonalTask, toggleComplete: togglePersonalComplete } = usePersonalTasks(selectedMemberId)

  // Auto-select first project (only if no member is selected)
  if (!selectedProjectId && !selectedMemberId && projects.length > 0) {
    setSelectedProjectId(projects[0].id)
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId)
  const currentMember = members.find(m => m.email === user?.email)
  const selectedMember = members.find(m => m.id === selectedMemberId)

  const handleSelectProject = useCallback((id: string) => {
    setSelectedProjectId(id)
    setSelectedMemberId(null)
    setSelectedTask(null)
  }, [])

  const handleSelectMember = useCallback((id: string) => {
    setSelectedMemberId(id)
    setSelectedProjectId(null)
    setSelectedTask(null)
  }, [])

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

  const handleCreateTask = useCallback((title: string) => {
    createTask({ title })
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

  if (authLoading || projectsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" />
      </div>
    )
  }

  if (!user) {
    return <LoginPage onSignIn={signInWithGoogle} error={authError} />
  }

  return (
    <AppLayout
      sidebar={
        <Sidebar
          projects={projects}
          members={members}
          selectedProjectId={selectedProjectId}
          selectedMemberId={selectedMemberId}
          collapsed={sidebarCollapsed}
          userEmail={user.email ?? null}
          onSelectProject={handleSelectProject}
          onSelectMember={handleSelectMember}
          onCreateProject={async (name) => {
            const p = await createProject(name)
            if (p) {
              setSelectedProjectId(p.id)
              setSelectedMemberId(null)
            }
          }}
          onOpenClaudeGuide={() => setShowClaudeGuide(true)}
          onSignOut={signOut}
          onToggleCollapse={() => {
            setSidebarCollapsed(prev => {
              localStorage.setItem('cs-task-sidebar-collapsed', String(!prev))
              return !prev
            })
          }}
        />
      }
    >
      {selectedMember ? (
        <MemberPage
          member={selectedMember}
          assignedTasks={assignedTasks}
          waitingOnTasks={waitingOnTasks}
          personalTasks={personalTasks}
          projects={projects}
          onToggleAssignedComplete={toggleAssignedComplete}
          onUpdateAssignedTask={(id, updates) => updateAssignedTask(id, updates)}
          onTogglePersonalComplete={togglePersonalComplete}
          onCreatePersonalTask={(title) => createPersonalTask({ title })}
          onUpdatePersonalTask={(id, updates) => updatePersonalTask(id, updates)}
          onDeletePersonalTask={deletePersonalTask}
        />
      ) : selectedProject ? (
        <>
          <Header
            projectName={selectedProject.name}
            projectColor={selectedProject.color}
            viewMode={viewMode}
            onViewModeChange={(mode) => {
              setViewMode(mode)
              localStorage.setItem('cs-task-view-mode', mode)
            }}
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
              members={members}
              currentMemberId={currentMember?.id ?? null}
              onToggleComplete={toggleComplete}
              onTaskClick={handleTaskClick}
              onUpdateTask={handleUpdateTask}
              onCreateTask={handleCreateTask}
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
