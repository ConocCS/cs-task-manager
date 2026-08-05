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
      <div className="flex justify-end px-20 py-3 border-t border-[var(--color-border)]/50">
        <button
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-primary)] border-2 border-[var(--color-primary)]/30 rounded-xl hover:bg-[var(--color-primary)]/5 transition-colors"
        >
          <Plus size={16} />
          セクションを追加
        </button>
      </div>
    )
  }

  return (
    <div className="px-20 py-4 border-t border-[var(--color-border)]/50">
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
        className="w-full text-sm font-semibold px-4 py-3 border-2 border-[var(--color-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
      />
    </div>
  )
}
