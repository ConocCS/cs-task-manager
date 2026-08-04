# CS Task Manager — Claude操作ルール

## 概要
CSチーム共有のタスク管理アプリ。Supabase REST APIで直接操作する。

## URL
- 本番: https://cs-task-manager-ashen.vercel.app

## API操作の前提
```bash
source ~/Desktop/カスタマーサクセスチーム/cs-task-manager/.env.local
SB_URL="$VITE_SUPABASE_URL"
SB_KEY="$VITE_SUPABASE_ANON_KEY"
```

## メンバーID
| 名前 | ID |
|------|-----|
| 黒田 | 20c7a4a0-93da-4775-9e42-abf181764413 |
| 遠山 | 800ce30f-980f-4110-930a-d7b8e3a53c40 |
| 松田 | b9a46db2-60d4-44c6-946f-9b59b1009436 |
| 高田 | 2bbc08c0-5ee0-4606-9986-2edb0c7e544e |

## タスク操作

### 一覧取得
```bash
curl -s "${SB_URL}/rest/v1/tasks?project_id=eq.{PJ_ID}&status=neq.completed&order=sort_order.asc" \
  -H "apikey: ${SB_KEY}" -H "Authorization: Bearer ${SB_KEY}"
```

### プロジェクト一覧
```bash
curl -s "${SB_URL}/rest/v1/projects?is_archived=eq.false&order=sort_order.asc" \
  -H "apikey: ${SB_KEY}" -H "Authorization: Bearer ${SB_KEY}"
```

### タスク追加
```bash
curl -s "${SB_URL}/rest/v1/tasks" \
  -H "apikey: ${SB_KEY}" -H "Authorization: Bearer ${SB_KEY}" \
  -H "Content-Type: application/json" -H "Prefer: return=representation" \
  -d '{"project_id":"PJ_ID","title":"タスク名","status":"not_started","priority":"medium","assignee_id":"MEMBER_ID","due_date":"YYYY-MM-DD"}'
```

### タスク更新
```bash
curl -s "${SB_URL}/rest/v1/tasks?id=eq.{TASK_ID}" -X PATCH \
  -H "apikey: ${SB_KEY}" -H "Authorization: Bearer ${SB_KEY}" \
  -H "Content-Type: application/json" -H "Prefer: return=representation" \
  -d '{"status":"completed","completed_at":"NOW_ISO"}'
```

### タスク削除
```bash
curl -s "${SB_URL}/rest/v1/tasks?id=eq.{TASK_ID}" -X DELETE \
  -H "apikey: ${SB_KEY}" -H "Authorization: Bearer ${SB_KEY}"
```

### 期日超過タスク
```bash
curl -s "${SB_URL}/rest/v1/tasks?due_date=lt.$(date +%Y-%m-%d)&status=neq.completed&order=due_date.asc" \
  -H "apikey: ${SB_KEY}" -H "Authorization: Bearer ${SB_KEY}"
```

## ステータス値
- not_started（未着手）
- in_progress（進行中）
- completed（完了）
- on_hold（保留）

## 優先度値
- high / medium / low
