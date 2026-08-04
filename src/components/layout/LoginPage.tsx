import { LayoutGrid, LogIn } from 'lucide-react'

interface LoginPageProps {
  onSignIn: () => void
  error: string | null
}

export function LoginPage({ onSignIn, error }: LoginPageProps) {
  return (
    <div className="h-screen bg-[var(--color-background)] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-[400px] max-w-[90vw] text-center">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center">
            <LayoutGrid size={28} className="text-white" />
          </div>
        </div>

        <h1 className="text-base font-bold text-[var(--color-foreground)] mb-1">CS Task Manager</h1>
        <p className="text-xs text-[var(--color-muted)] mb-8">CSチーム共有タスク管理</p>

        <button
          onClick={onSignIn}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-foreground)] text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          <LogIn size={18} />
          Google アカウントでログイン
        </button>

        <p className="text-xs text-[var(--color-muted)] mt-4">
          @conoc.jp のアカウントでログインしてください
        </p>

        {error && (
          <p className="text-xs text-red-500 mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
