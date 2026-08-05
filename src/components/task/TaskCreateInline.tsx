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
      <div className="flex justify-end px-20 py-5">
        <button
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[var(--color-primary)] rounded-xl hover:opacity-90 transition-opacity shadow-md"
        >
          <Plus size={18} strokeWidth={2.5} />
          タスクを追加
        </button>
      </div>
    )
  }

  return (
    <div className="px-20 py-4">
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
        className="w-full text-sm px-4 py-3 border-2 border-[var(--color-primary)] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
      />
    </div>
  )
}
