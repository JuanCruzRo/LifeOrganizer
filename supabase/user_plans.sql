create table if not exists public.user_plans (
  user_id uuid primary key,
  plan    text not null default 'free' check (plan in ('free', 'pro')),
  updated_at timestamptz not null default now()
);

alter table public.user_plans enable row level security;

-- Los usuarios solo pueden leer su propio plan
create policy "Users read own plan"
  on public.user_plans for select
  using (auth.uid() = user_id);

-- Solo el backend (service role) puede escribir planes
