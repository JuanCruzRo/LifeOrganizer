create table if not exists public.milo_sessions (
  owner_token text primary key,
  messages    jsonb not null default '[]',
  updated_at  timestamptz not null default timezone('utc', now())
);

alter table public.milo_sessions enable row level security;

create policy "Allow scoped read milo_sessions"
on public.milo_sessions
for select to anon
using (
  owner_token = coalesce(current_setting('request.headers', true)::json->>'x-client-token', '')
);

create policy "Allow scoped insert milo_sessions"
on public.milo_sessions
for insert to anon
with check (
  owner_token = coalesce(current_setting('request.headers', true)::json->>'x-client-token', '')
);

create policy "Allow scoped update milo_sessions"
on public.milo_sessions
for update to anon
using (
  owner_token = coalesce(current_setting('request.headers', true)::json->>'x-client-token', '')
)
with check (
  owner_token = coalesce(current_setting('request.headers', true)::json->>'x-client-token', '')
);
