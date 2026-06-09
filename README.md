# Spark — Life Organizer

Organizador de vida personal con IA. Gestioná tus tareas y chateá con Milo, tu asistente personal que conoce tu contexto, busca en la web y te ayuda a organizarte.

## Stack

- **Next.js 15** + TypeScript
- **Supabase** — auth, tareas, sesiones de Milo
- **Groq** — LLM (Llama 4 Scout)
- **Tavily** — búsqueda web para plan Pro
- **SearXNG** — búsqueda web para plan Free

## Correr localmente

```bash
pnpm install
pnpm dev
```

Abrí `http://localhost:3000`.

## Variables de entorno

Copiá `.env.example` a `.env` y completá:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GROQ_API_KEY=
GROQ_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
TAVILY_API_KEY=       # opcional, para plan Pro
```

## Base de datos

Ejecutá en orden en el SQL Editor de Supabase:

1. `supabase/reset.sql` — tabla de tareas
2. `supabase/milo.sql` — sesiones de Milo
3. `supabase/add_completed_at.sql` — historial de tareas completadas
4. `supabase/user_planes.sql` — planes de usuario (free/pro)
