# Evals de Milo

Tests que corren contra el modelo real. Los unit tests de `tests/` solo prueban
que el parser lee un bloque bien formado; estos preguntan lo que importa: si Milo
entiende a una persona escribiendo entre clases, y si la respuesta deja alguna
incomodidad.

## Correr

```bash
npm run eval:milo                          # 36 casos × 2 modelos
npm run eval:milo -- --model default       # solo qwen (la mitad del costo)
npm run eval:milo -- --filter recurrencia  # un subconjunto
npm run eval:milo -- --repeat 5            # buscar casos intermitentes

EVAL_TRANSCRIPT=/tmp/milo npx vitest run --config vitest.eval.mts
```

Nunca corre con `npm test`: ese gate es hermético y no debe gastar ni un token.

## Qué cubre

| Grupo | Qué mira |
|---|---|
| `recurrencia` | gym miércoles y sábados, todos los lunes, todos los días |
| `explicito` | "agendame", "recordame", "creame una tarea" |
| `implicito` | menciona algo a hacer con fecha, sin fecha, y varios a la vez |
| `no-crea` | conceptos, charla, opiniones, alabanzas, "ya lo hice", desahogo |
| `free` | el plan Free no crea tareas y sí orienta al upgrade |
| `robustez` | mayúsculas, sin acentos, sin espacios, typos, emoji, mensaje largo |
| `comfort` | largo de la respuesta, planes gigantes |
| `regresion` | los bugs que este harness encontró, para que no vuelvan |

Además hay tres chequeos de incomodidad que se aplican a **todos** los casos:

- `no-falsa-afirmacion` — el modelo decía "he creado la tarea" cuando nada se había
  creado todavía; el usuario después ve un botón de confirmar.
- `sin-tuteo` — la app es 100% voseo y el modelo se colaba con "¿quieres?".
- `sin-json-filtrado` — `{"title":"L` a medio escribir se veía en el chat.

`expectation.tasks: "none"` pesa tanto como `"some"`. Una tarea inventada cuando
alguien pregunta "¿qué es un simplex?" se siente peor que una tarea que no se crea.

## Cuánto cuesta

**El presupuesto de Groq son 200.000 tokens POR DÍA y POR MODELO.** No por minuto,
no por request: por día.

Un turno de chat consume:

| Parte | Tokens |
|---|---|
| Prompt (con las fechas ya resueltas y las reglas) | ~960 |
| Razonamiento (solo en el modelo Pro) | ~200-250 |
| Respuesta + bloque de tareas | ~300-500 |
| **Total** | **~1.500-1.700** |

Eso da **~120 turnos de chat por día, en total, para todo el producto** —sumando
todos los usuarios. Una corrida completa del eval son ~70 llamadas, o sea se
come la mitad del día.

Por eso el harness tiene un guard de presupuesto y la app responde con un
mensaje amable cuando se corta:

```ts
if (tokensSpent > RUN_BUDGET_TOKENS) throw ...
```

```ts
if (isRateLimited) return { error: "Milo está con muchos mensajes ahora. Probá en un rato." }
```

## Decisión pendiente

Con 200k/día por modelo el producto no escala: dos o tres usuarios chatting en
horario pico agotan el día y Milo empieza a fallar. Las opciones son:

1. **Subir a Dev Tier de Groq** (link en el mensaje de rate limit). Es lo único
   que resuelve el techo sin cambiar el producto.
2. **Prompt más chico.** Ya se recortó de 1.273 a ~960 tokens. Quedan reglas
   caras: la tabla de fechas y el bloque de reglas de creación. Se pueden mover a
   un system prompt cacheado si el proveedor lo banca.
3. **Barato por modelo.** Si el modelo default (qwen) rinde igual, se le puede
   sacar la carga de razonamiento.

Mientras tanto: usar `--model default` para las corridas de rutina, y reservar
`--repeat 5` para antes de un release.

## Bugs que encontró

Cada uno está fijado como caso de regresión.

1. **Respuesta vacía.** El modelo Pro gastaba los 800 tokens en razonamiento y
   devolvía `content: ""`. El usuario veía un chat en blanco. Ahora `maxTokens`
   es 1200 y si la respuesta viene vacía o con `finish_reason === "length"` se
   reintenta con el otro modelo.
2. **Bloque cortado a la mitad.** Con recurrencias diarias el modelo emitía 28
   tareas, se pasaban del presupuesto y el array quedaba sin cerrar. El parser
   ahora descarta la cola sin cerrar en vez de mostrarla como prosa, y el prompt
   pide máximo 12.
3. **Fechas inventadas.** "Un parcial el jueves" en un lunes producía "el parcial
   es mañana". El modelo hacía la aritmética en su cabeza; ahora el prompt le
   pasa los días de la semana ya resueltos a fecha.
4. **Pregunta en vez de propuesta.** "¿Para qué día lo necesitás?" en vez de
   proponer con la fecha por default. El usuario no tenía tarea y no sabía por
   qué.
5. **Tarea inventada al preguntar el estado.** "¿Cómo voy con mis tareas?" le
   agregaba una tarea que no pidió y decía que la había creado.
6. **Falsa afirmación.** "Listo, agendado" / "he creado la tarea", cuando la
   tarea existe recién cuando el usuario confirma.
7. **Tuteo.** "¿Quieres?", "tienes", en una app que es toda voseo.
