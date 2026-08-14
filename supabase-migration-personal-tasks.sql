-- personal_tasks テーブル作成
-- 担当者の個人予定を管理（本体のtasksとは独立）
CREATE TABLE personal_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'on_hold')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- インデックス
CREATE INDEX idx_personal_tasks_member_id ON personal_tasks(member_id);
CREATE INDEX idx_personal_tasks_status ON personal_tasks(status);

-- RLS無効化（既存テーブルと同様）
ALTER TABLE personal_tasks DISABLE ROW LEVEL SECURITY;

-- updated_at 自動更新トリガー
CREATE TRIGGER update_personal_tasks_updated_at
  BEFORE UPDATE ON personal_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Realtime有効化
ALTER PUBLICATION supabase_realtime ADD TABLE personal_tasks;
