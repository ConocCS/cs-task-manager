import { useState } from 'react'
import { Plus } from 'lucide-react'

interface SectionCreateProps {
  onSubmit: (name: string) => void
}

export function SectionCreate({ onSubmit }: SectionCreateProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setIsEditing(false)
      return
    }
    onSubmit(trimmed)
    setName('')
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="flex items-center gap-2 px-10 py-3 text-sm text-[var(--color-primary)]/60 hover:text-[var(--color-primary)] w-full border-t border-[var(--color-border)]/50 transition-colors font-medium"
      >
        <Plus size={16} />
        セクションを追加
      </button>
    )
  }

  return (
    <div className="px-10 py-3 border-t border-[var(--color-border)]/50">
      <input
        autoFocus
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => {
          if (e.nativeEvent.isComposing) return
          if (e.key === 'Enter') handleSubmit()
          if (e.key === 'Escape') { setIsEditing(false); setName('') }
        }}
        onBlur={handleSubmit}
        placeholder="セクション名を入力..."
        className="w-full text-sm font-semibold px-3 py-2 border border-[var(--color-primary)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
      />
    </div>
  )
}
