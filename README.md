# Life Organizer

App web para cargar tareas, guardarlas en Supabase y pedirle a Ollama Cloud una recomendacion real sobre que hacer primero y como resolver la tarea elegida.

## Que hace

- Permite crear tareas con titulo, categoria, descripcion, prioridad, duracion y fecha de vencimiento.
- Guarda las tareas en Supabase.
- Usa Ollama Cloud para recomendar la tarea principal del dia.
- Usa Ollama Cloud para leer la problematica de la tarea recomendada y generar una solucion concreta.
- Permite marcar tareas como hechas o pendientes, editarlas y borrarlas.

## Como correrla

```bash
npm install
npm run dev
```

Despues abri `http://localhost:3000`.

## Variables de entorno

Copia `.env.example` a `.env.local` y completa:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OLLAMA_API_KEY=your_ollama_api_key
OLLAMA_BASE_URL=https://ollama.com/api
OLLAMA_MODEL=qwen3.5:cloud
```

## Supabase

La tabla base para tareas esta en `supabase/reset.sql`.

Pasos sugeridos:

1. Crear un proyecto en Supabase.
2. Ejecutar `supabase/reset.sql` en el SQL editor.
3. Copiar la URL publica y la anon key al `.env.local`.

## Estructura basica

- `app/`: layout global, pagina principal y endpoints para Ollama Cloud.
- `components/`: interfaz principal de tareas y recomendacion.
- `lib/`: prompts, Supabase y cliente server-side de Ollama.
- `types/`: tipos de tareas y respuestas.

## Notas

- La carpeta `IA/` con experimentos viejos fue eliminada.
- La app no usa fallbacks locales para las funciones de IA: si Ollama Cloud falla o responde invalido, se muestra un error.
