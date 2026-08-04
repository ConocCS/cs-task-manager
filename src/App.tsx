import { useState, useCallback } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { Sidebar } from './components/layout/Sidebar'
import { Header, type ViewMode } from './components/layout/Header'
import { TaskListView } from './components/task/TaskListView'
import { TaskBoardView } from './components/task/TaskBoardView'
import { TaskDetailPanel } from './components/task/TaskDetailPanel'
import { ClaudeGuideModal } from './components/layout/ClaudeGuideModal'
import { useProjects } from './hooks/useProjects'
import { useTasks } from './hooks/useTasks'
import { useSections } from './hooks/useSections'
import { useMembers } from './hooks/useMembers'
import type { Task } from './lib/database.types'
import { Loader2 } from 'lucide-react'

function App() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showClaudeGuide, setShowClaudeGuide] = useState(false)

  const { projects, loading: projectsLoading, createProject } = useProjects()
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask, toggleComplete } = useTasks(selectedProjectId)
  const { sections, createSection } = useSections(selectedProjectId)
  const { members } = useMembers()

  // Auto-select first project
  if (!selectedProjectId && projects.length > 0) {
    setSelectedProjectId(projects[0].id)
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId)

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

          {tasksLoading ? (
            <div className="flex items-center justify-center flex-1">
              <Loader2 size={24} className="animate-spin text-[var(--color-primary)]" />
            </div>
          ) : viewMode === 'list' ? (
            <TaskListView
              tasks={tasks}
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
