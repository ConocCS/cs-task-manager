import { X, Terminal, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface ClaudeGuideModalProps {
  open: boolean
  onClose: () => void
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors"
      title="コピー"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  )
}

const SETUP_COMMAND = 'bash ~/Desktop/カスタマーサクセスチーム/cs-task-manager/setup-claude.sh'

export function ClaudeGuideModal({ open, onClose }: ClaudeGuideModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-[560px] max-w-[90vw] max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-foreground)] flex items-center justify-center">
              <Terminal size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--color-foreground)]">Claude Code 連携</h2>
              <p className="text-xs text-[var(--color-muted)]">Claudeからタスクを操作できるようにする</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center">1</span>
                <h3 className="text-sm font-bold text-[var(--color-foreground)]">ターミナルで以下を実行（1回だけ）</h3>
              </div>
              <div className="relative bg-[var(--color-foreground)] rounded-xl p-4 pr-12">
                <code className="text-sm text-green-400 font-mono break-all">{SETUP_COMMAND}</code>
                <CopyButton text={SETUP_COMMAND} />
              </div>
            </div>

            {/* Step 2 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center">2</span>
                <h3 className="text-sm font-bold text-[var(--color-foreground)]">完了！</h3>
              </div>
              <p className="text-sm text-[var(--color-muted)] ml-8">
                以降、Claude Code で以下のように話しかけるだけでタスクを操作できます。
              </p>
            </div>

            {/* Examples */}
            <div className="bg-[var(--color-background)] rounded-xl p-5 space-y-3">
              <p className="text-xs font-bold text-[var(--color-muted)] mb-3">使い方の例</p>
              <div className="space-y-2">
                {[
                  '「タスク登録して」',
                  '「未完了のタスク一覧を見せて」',
                  '「このタスクを完了にして」',
                  '「高田さんに担当を割り当てて」',
                  '「期日超過のタスクを確認して」',
                ].map((example, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                    <span className="text-sm text-[var(--color-foreground)]">{example}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="border border-[var(--color-border)] rounded-xl p-4">
              <p className="text-xs text-[var(--color-muted)]">
                セットアップはPCごとに1回だけ必要です。Claude Code が自動的にSupabase APIを通じてこのアプリのデータを操作します。変更はリアルタイムで画面に反映されます。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
