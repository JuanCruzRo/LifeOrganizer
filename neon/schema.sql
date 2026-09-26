-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'general',
  description TEXT NOT NULL DEFAULT '',
  priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  duration    TEXT NOT NULL DEFAULT 'medium' CHECK (duration IN ('short', 'medium', 'long')),
  due_date    TEXT NOT NULL,
  done        BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks (user_id);

-- User plans table (free, plus or pro)
CREATE TABLE IF NOT EXISTS user_plans (
  user_id                TEXT PRIMARY KEY,
  plan                   TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'plus', 'pro')),
  trial_ends_at          TIMESTAMPTZ,
  mp_preapproval_id      TEXT,
  mp_payer_email         TEXT,
  subscription_status    TEXT CHECK (subscription_status IN ('authorized', 'paused', 'cancelled')),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Milo's per-user memory: a short AI-generated summary of patterns/preferences,
-- refreshed periodically instead of storing full conversation history.
CREATE TABLE IF NOT EXISTS user_memory (
  user_id       TEXT PRIMARY KEY,
  summary       TEXT NOT NULL DEFAULT '',
  message_count INTEGER NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Daily AI usage counters, used to rate-limit Milo and other AI endpoints per user.
CREATE TABLE IF NOT EXISTS ai_usage (
  user_id TEXT NOT NULL,
  day     DATE NOT NULL DEFAULT CURRENT_DATE,
  kind    TEXT NOT NULL,
  count   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day, kind)
);

-- Sub-steps for a task (AI-generated "break it down" checklist).
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS steps JSONB NOT NULL DEFAULT '[]';
