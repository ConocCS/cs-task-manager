import { useState } from 'react'
import { LayoutGrid, Plus, ChevronDown, ChevronRight, Terminal, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import type { Project, Member } from '../../lib/database.types'
import { cn } from '../../lib/utils'
import { Avatar } from '../ui/Avatar'

interface SidebarProps {
  projects: Project[]
  members: Member[]
  selectedProjectId: string | null
  selectedMemberId: string | null
  collapsed: boolean
  userEmail: string | null
  onSelectProject: (id: string) => void
  onSelectMember: (id: string) => void
  onCreateProject: (name: string) => void
  onOpenClaudeGuide: () => void
  onSignOut: () => void
  onToggleCollapse: () => void
}

export function Sidebar({ projects, members, selectedProjectId, selectedMemberId, collapsed, userEmail, onSelectProject, onSelectMember, onCreateProject, onOpenClaudeGuide, onSignOut, onToggleCollapse }: SidebarProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [projectsOpen, setProjectsOpen] = useState(true)
  const [membersOpen, setMembersOpen] = useState(true)

  const handleCreate = () => {
    const name = newName.trim()
    if (name) {
      onCreateProject(name)
    }
    setNewName('')
    setIsCreating(false)
  }

  // 折りたたみ時：アイコンのみ表示
  if (collapsed) {
    return (
      <aside className="w-14 h-full bg-[var(--color-sidebar-bg)] flex flex-col shrink-0 items-center py-4 transition-all duration-200">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-[var(--color-sidebar-hover)] transition-colors mb-4"
          title="サイドバーを開く"
        >
          <PanelLeftOpen size={18} />
        </button>

        <div className="flex-1 flex flex-col items-center gap-2 overflow-y-auto w-full">
          {projects.map(project => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all',
                selectedProjectId === project.id
                  ? 'bg-[var(--color-primary)] shadow-lg shadow-orange-900/20'
                  : 'hover:bg-[var(--color-sidebar-hover)]'
              )}
              title={project.name}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: selectedProjectId === project.id ? '#fff' : project.color }}
              />
            </button>
          ))}

          <div className="w-6 border-t border-white/10 my-2" />

          {members.map(member => (
            <button
              key={member.id}
              onClick={() => onSelectMember(member.id)}
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all',
                selectedMemberId === member.id
                  ? 'bg-[var(--color-primary)] shadow-lg shadow-orange-900/20'
                  : 'hover:bg-[var(--color-sidebar-hover)]'
              )}
              title={member.name}
            >
              <Avatar
                name={member.name}
                color={selectedMemberId === member.id ? '#fff' : member.avatar_color}
                size="sm"
                className={cn(selectedMemberId === member.id && 'text-[var(--color-primary)]')}
              />
            </button>
          ))}
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-60 h-full bg-[var(--color-sidebar-bg)] flex flex-col shrink-0 transition-all duration-200">
      <div className="px-8 py-5 border-b border-white/10 flex items-center justify-between">
        <h1 className="text-base font-bold text-[var(--color-sidebar-text)] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
            <LayoutGrid size={18} className="text-white" />
          </div>
          CS Tasks
        </h1>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-[var(--color-sidebar-hover)] transition-colors"
          title="サイドバーを閉じる"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-8 py-2.5 flex items-center justify-between">
          <button
            onClick={() => setProjectsOpen(!projectsOpen)}
            className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1 hover:text-white/60 transition-colors"
          >
            {projectsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            プロジェクト
          </button>
          <button
            onClick={() => { setProjectsOpen(true); setIsCreating(true) }}
            className="p-1 rounded hover:bg-[var(--color-sidebar-hover)] text-white/40 hover:text-white/70 transition-colors"
            title="プロジェクトを追加"
          >
            <Plus size={16} />
          </button>
        </div>

        {projectsOpen && (
          <>
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className={cn(
                  'w-[calc(100%-40px)] text-left px-4 py-2.5 mx-5 rounded-lg text-sm flex items-center gap-2.5 transition-all',
                  selectedProjectId === project.id
                    ? 'bg-[var(--color-primary)] text-white font-medium shadow-lg shadow-orange-900/20'
                    : 'text-white/70 hover:bg-[var(--color-sidebar-hover)] hover:text-white'
                )}
              >
                <span
                  className={cn(
                    'w-2.5 h-2.5 rounded-full shrink-0',
                    selectedProjectId === project.id && 'ring-2 ring-white/30'
                  )}
                  style={{ backgroundColor: selectedProjectId === project.id ? '#fff' : project.color }}
                />
                <span className="truncate">{project.name}</span>
              </button>
            ))}

            {isCreating && (
              <div className="px-4 py-2 mx-5">
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => {
                    if (e.nativeEvent.isComposing) return
                    if (e.key === 'Enter') handleCreate()
                    if (e.key === 'Escape') { setIsCreating(false); setNewName('') }
                  }}
                  onBlur={handleCreate}
                  placeholder="プロジェクト名..."
                  className="w-full text-sm px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
              </div>
            )}
          </>
        )}

        {/* メンバー */}
        <div className="px-8 py-2.5 mt-4 flex items-center">
          <button
            onClick={() => setMembersOpen(!membersOpen)}
            className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1 hover:text-white/60 transition-colors"
          >
            {membersOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            メンバー
          </button>
        </div>

        {membersOpen && members.map(member => (
          <button
            key={member.id}
            onClick={() => onSelectMember(member.id)}
            className={cn(
              'w-[calc(100%-40px)] text-left px-4 py-2.5 mx-5 rounded-lg text-sm flex items-center gap-2.5 transition-all',
              selectedMemberId === member.id
                ? 'bg-blue-500 text-white font-medium shadow-lg shadow-blue-900/20'
                : 'text-white/70 hover:bg-[var(--color-sidebar-hover)] hover:text-white'
            )}
          >
            <Avatar
              name={member.name}
              color={selectedMemberId === member.id ? '#fff' : member.avatar_color}
              size="sm"
              className={cn(
                selectedMemberId === member.id && 'text-[var(--color-primary)]'
              )}
            />
            <span className="truncate">{member.name}</span>
          </button>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-white/10 space-y-1.5">
        <button
          onClick={onOpenClaudeGuide}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/50 hover:text-white hover:bg-[var(--color-sidebar-hover)] transition-all"
        >
          <Terminal size={14} />
          Claude連携方法
        </button>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/50 hover:text-white hover:bg-[var(--color-sidebar-hover)] transition-all"
        >
          <LogOut size={14} />
          ログアウト
        </button>
        {userEmail && (
          <div className="px-3 py-1 text-xs text-white/30 truncate">{userEmail}</div>
        )}
      </div>
    </aside>
  )
}
