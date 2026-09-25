# Spark — Life Organizer

Organizador de vida personal con IA. Gestioná tus tareas y chateá con Milo, tu asistente personal que conoce tu contexto, busca en la web y te ayuda a organizarte.

## Stack

- **Next.js 15** + TypeScript
- **Clerk** — autenticación
- **Neon** (Postgres) + Drizzle — tareas, sesiones de Milo, planes
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
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
GROQ_API_KEY=
GROQ_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
TAVILY_API_KEY=       # opcional, para plan Pro
```

## Base de datos

Ejecutá `neon/schema.sql` en el SQL Editor de Neon.
