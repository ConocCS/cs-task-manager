#!/bin/bash
# ============================================
# CS Task Manager — Claude Code 連携セットアップ
# 各CSメンバーが1回だけ実行してください
# ============================================

CLAUDE_MD="$HOME/.claude/CLAUDE.md"

# ~/.claude ディレクトリがなければ作成
mkdir -p "$HOME/.claude"

# 既に設定済みか確認
if grep -q "CS Task Manager" "$CLAUDE_MD" 2>/dev/null; then
  echo "既にセットアップ済みです。"
  exit 0
fi

# CLAUDE.md に追記
cat >> "$CLAUDE_MD" << 'EOF'

## CS Task Manager -- タスク操作

ユーザーが「タスク登録して」「タスク完了にして」「タスク一覧見せて」等と言ったら、以下のAPIで操作する。
アプリURL: https://cs-task-manager-ashen.vercel.app

### 接続（毎回最初に実行）
```bash
SB_URL="https://iuvunwchcaghpdurxoqa.supabase.co"
SB_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1dnVud2NoY2FnaHBkdXJ4b3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NDU2NDQsImV4cCI6MjEwMTMyMTY0NH0.nuV_09XLsEsRGT6hFBsDQUUgXpRXt0iQNpeme2kbq9U"
```

### メンバーID
| 名前 | ID |
|------|-----|
| 黒田 | 20c7a4a0-93da-4775-9e42-abf181764413 |
| 遠山 | 800ce30f-980f-4110-930a-d7b8e3a53c40 |
| 松田 | b9a46db2-60d4-44c6-946f-9b59b1009436 |
| 高田 | 2bbc08c0-5ee0-4606-9986-2edb0c7e544e |

### タスク追加
```bash
curl -s "${SB_URL}/rest/v1/tasks" \
  -H "apikey: ${SB_KEY}" -H "Authorization: Bearer ${SB_KEY}" \
  -H "Content-Type: application/json" -H "Prefer: return=representation" \
  -d '{"project_id":"PJ_ID","title":"タスク名","status":"not_started","priority":"medium","assignee_id":"MEMBER_ID","due_date":"YYYY-MM-DD"}'
```

### タスク更新（ステータス変更・完了など）
```bash
curl -s "${SB_URL}/rest/v1/tasks?id=eq.{TASK_ID}" -X PATCH \
  -H "apikey: ${SB_KEY}" -H "Authorization: Bearer ${SB_KEY}" \
  -H "Content-Type: application/json" -H "Prefer: return=representation" \
  -d '{"status":"completed","completed_at":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
```

### タスク一覧（未完了）
```bash
curl -s "${SB_URL}/rest/v1/tasks?status=neq.completed&order=due_date.asc.nullslast" \
  -H "apikey: ${SB_KEY}" -H "Authorization: Bearer ${SB_KEY}"
```

### プロジェクト一覧
```bash
curl -s "${SB_URL}/rest/v1/projects?is_archived=eq.false&order=sort_order.asc" \
  -H "apikey: ${SB_KEY}" -H "Authorization: Bearer ${SB_KEY}"
```

### タスク削除
```bash
curl -s "${SB_URL}/rest/v1/tasks?id=eq.{TASK_ID}" -X DELETE \
  -H "apikey: ${SB_KEY}" -H "Authorization: Bearer ${SB_KEY}"
```

### ステータス値
not_started（未着手）/ in_progress（進行中）/ completed（完了）/ on_hold（保留）

### 優先度
high / medium / low
EOF

echo "セットアップ完了！Claudeに「タスク登録して」と言えば操作できます。"
