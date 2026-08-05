import { useState } from 'react'
import { Plus } from 'lucide-react'

interface TaskCreateInlineProps {
  onSubmit: (title: string) => void
}

export function TaskCreateInline({ onSubmit }: TaskCreateInlineProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')

  const handleSubmit = () => {
    const trimmed = title.trim()
    if (trimmed) {
      onSubmit(trimmed)
    }
    setTitle('')
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <div className="px-20 py-4">
        <button
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus size={16} />
          タスクを追加
        </button>
      </div>
    )
  }

  return (
    <div className="px-20 py-3">
      <input
        autoFocus
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => {
          if (e.nativeEvent.isComposing) return
          if (e.key === 'Enter') handleSubmit()
          if (e.key === 'Escape') { setIsEditing(false); setTitle('') }
        }}
        onBlur={handleSubmit}
        placeholder="タスク名を入力..."
        className="w-full text-sm px-3 py-2 border-2 border-[var(--color-primary)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
      />
    </div>
  )
}
