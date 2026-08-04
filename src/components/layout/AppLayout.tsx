import type { ReactNode } from 'react'

interface AppLayoutProps {
  sidebar: ReactNode
  children: ReactNode
}

export function AppLayout({ sidebar, children }: AppLayoutProps) {
  return (
    <div className="flex h-full">
      {sidebar}
      <div className="flex-1 p-3 overflow-hidden">
        <main className="h-full flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
