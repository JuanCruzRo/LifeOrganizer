drop table if exists public.tasks;

create table public.tasks (
  id text primary key,
  owner_token text not null,
  title text not null,
  category text not null,
  description text not null default '',
  priority text not null check (priority in ('low', 'medium', 'high')),
  duration text not null check (duration in ('short', 'medium', 'long')),
  due_date text not null,
  done boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index tasks_created_at_idx on public.tasks (created_at desc);
create index tasks_done_idx on public.tasks (done);
create index tasks_owner_token_idx on public.tasks (owner_token);

alter table public.tasks enable row level security;

create policy "Allow scoped read tasks"
on public.tasks
for select
to anon
using (
  owner_token = coalesce(current_setting('request.headers', true)::json->>'x-client-token', '')
);

create policy "Allow scoped insert tasks"
on public.tasks
for insert
to anon
with check (
  owner_token = coalesce(current_setting('request.headers', true)::json->>'x-client-token', '')
);

create policy "Allow scoped update tasks"
on public.tasks
for update
to anon
using (
  owner_token = coalesce(current_setting('request.headers', true)::json->>'x-client-token', '')
)
with check (
  owner_token = coalesce(current_setting('request.headers', true)::json->>'x-client-token', '')
);

create policy "Allow scoped delete tasks"
on public.tasks
for delete
to anon
using (
  owner_token = coalesce(current_setting('request.headers', true)::json->>'x-client-token', '')
);
