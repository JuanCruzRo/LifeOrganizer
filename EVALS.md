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
npm run eval:milo -- --provider ollama     # medir el provider de pago
npm run eval:milo -- --transcript /tmp/milo
```

Nunca corre con `npm test`: ese gate es hermético y no debe gastar ni un token.

Las opciones llegan por variables de entorno, no por `process.argv`. Vitest
rechaza opciones desconocidas antes de arrancar, y lo que pasa después de un `--`
no aparece en el `process.argv` del worker: el archivo leía los flags ahí y por
eso nunca vio ninguno. Toda corrida "filtrada" que se documentó en el pasado en
realidad corrió completa, con los dos modelos. `scripts/eval-milo.mjs` traduce el
CLI a `EVAL_*` y ahí está la única fuente de verdad.

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
| Prompt (con las fechas ya resueltas y las reglas) | ~1.100-1.500 |
| Razonamiento (solo en el modelo Pro) | ~200-250 |
| Respuesta + bloque de tareas | ~300-500 |
| **Total** | **~1.500-1.900** |

Eso da **~120 turnos de chat por día, en total, para todo el producto** —sumando
todos los usuarios. Una corrida completa del eval son ~70 llamadas, o sea se
come la mitad del día.

Cuando se agota, el mensaje real de Groq lo dice sin rodeos:

```
Rate limit reached for model `qwen/qwen3.8-27b` ... on tokens per day (TPD):
Limit 200000, Used 199974, Requested 1460. Please try again in 10m19.488s.
```

Ojo con ese "10m19s": está calculado sobre el ritmo de consumo actual, no sobre
cuándo se reinicia la ventana diaria. Volver en ese plazo solo junta otro 429.
Por eso la cadena lo trata como piso y nunca como permiso.

## La cadena de providers

Groq primero porque es rápido y gratis mientras dure. Ollama Cloud segundo porque
no tiene techo diario. `lib/ai/complete.ts` es el único que llama a un provider.

| | Groq | Ollama Cloud |
|---|---|---|
| Techo | 200k tokens/día/modelo | ninguno |
| Costo | $0 hasta que se agota | $0.15/M entrada, **$0.014/M cacheada**, $0.60/M salida |
| Un turno (13 tareas) | gratis | ~$0.00044, o ~$0.00022 fuera de pico |
| Por mes | ~3.600 turnos | ~$2,60 a 200 turnos/día |

Lacached es la mitad de la entrada a 13 tareas, y de ahí el split del prompt.

### El prompt partido

`buildTaskPromptParts()` devuelve dos Mitades en lugar de una:

- **static** (~842 tokens) — estilo, honestidad, voseo y las reglas de creación.
  Idéntica byte a byte para todos los usuarios del mismo plan.
- **dynamic** — fecha de hoy, tabla de fechas, memoria y tareas del usuario.
  Cambia en cada turno.

Estable primero es obligatorio: los providers que cachean por prefijo solo
reusan los bytes del principio, y un detalle por turno adelante de las reglas
las invalidaría todas. `tests/milo-prompt.test.ts` lo fija, incluida la
comprobación de que la mitad estática no cambia con las tareas ni con la memoria.

Una concesión: la mitad estática **sí** lleva una fecha, en el ejemplo de formato
del bloque `TASKS_ACTION`. Podría ser un `YYYY-MM-DD` literal, pero eso invita al
modelo a emitirliteral como `dueDate` y crear tareas basura. Cuesta un
re-calentamiento de caché por día, que a $0.136/M de diferencia son centavos.

### El circuit breaker

Un provider caído es peor que ningún provider: contesta 429 en ~200ms, así que
sin cuarentena cada turno de cada usuario paga una ida y vuelta desperdiciada
antes de caer al siguiente. `lib/ai/circuit-breaker.ts` lo saca de rotación.

La política es **por tipo de fallo**, porque "umbral" y "cooldown" responden
preguntas distintas y una sola política para las dos se equivoca en una de ellas
para cada tipo:

| Fallo | Umbral | Cooldown | Por qué |
|---|---|---|---|
| `rate_limited` por día | 2 | 5 min → 10 min | Evidencia fuerte, y no se recupera en 30s |
| `rate_limited` por minuto | 2 | 30s → 2 min | Se limpia en segundos |
| `timeout` | **4** | 30s → 2 min | Evidencia débil: una respuesta lenta es una respuesta lenta |
| `server` / `network` | 3 | 30s → 5 min | Transitorio |
| `auth` | **1** | 10 min | Una key rota no se arregla reintentando |
| `bad_request` | — | — | Es nuestro bug, no del provider |

Los cuatro límites de Groq (TPM, RPM, TPD, RPD) llegan todos como
`Rate limit reached`. `rateLimitScope()` los separa leyendo el texto, porque la
diferencia entre "esperá 30s" y "esperá a mañana" no se puede adivinar.

El umbral de `timeout` es 4 y no 2 por un motivo concreto: `gpt-oss-120b` tarda
legítimamente cinco segundos, y dos respuestas lentas seguidas sacaban al único
provider configurado de rotación por treinta segundos.

### Si el primer provider no contesta

Los callers de texto corto y mecánico piden el tier `fast` explícitamente: el
resumen de memoria, la blurb de estadísticas, los pasos de una tarea, el
companion. En `fast` se manda `reasoning_effort: "none"`, que no es solo dinero:
la única vez que Milo mandó un chat en blanco fue porque el modelo se gastó los
1200 tokens razonando y devolvió `content: ""`.

El chat no adivina si un mensaje es simple. Un guess determinista de "esto es
complicado" es un guess, y equivocarse sale caro en calidad o en plata.

Cuando la respuesta viene vacía o cortada (`finish_reason === "length"`), se
reintenta una vez en el tier contrario **empezando por el provider siguiente**:
la respuesta enana es una propiedad del modelo, no de la pregunta, así que
reintentar contra el mismo motor la reproduce.

## Decisión pendiente

Resuelto: el techo ya no es un techo. Con `OLLAMA_API_KEY` en el entorno la
cadena pasa a un provider sin límite diario, así que dos o tres usuarios en
horario pico ya no pueden agotar el día. Falta la key (ver `DEPLOY.md`); sin ella
todo sigue en Groq y el mensaje amable es lo único que hay.

Lo que sigue abierto, en orden de valor:

1. **Parser de fechas y recurrencias en código, no en el prompt.** Un
   deterministic que resuelva "cada martes" y "en tres días" antes de llamar al
   modelo permitiría borrar la tabla de fechas del prompt (~150 tokens) y
   eliminar de raíz los errores de fecha, que son los que más incomodan.
2. **Routing por dificultad real.** Hoy el tier lo declara el caller. Cuando el
   parser del punto 1 exista, "esto es una tarea simple" pasa a ser una señal
   determinista en vez de un guess.
3. **Medir el mismo eval contra Ollama** con `--provider ollama`, para saber si
   el comportamiento se sostiene con `gpt-oss:120b` como único provider.
4. **Un fine-tune propio** sobre un modelo chico, que es la vía realista a "mi
   propia IA": no hay GPU en esta máquina (Ryzen 7 7445HS, 14GB, sin CUDA), así
   que servir un modelo capaz en local no es una opción.

Mientras tanto: usar `--model default` para las corridas de rutina, y reservar
`--repeat 5` para antes de un release.

## Bugs que encontró el harness de providers

Distinto de los de abajo: estos los encontró la cadena, no el comportamiento de
Milo.

8. **Retry que no cambiaba de modelo.** `order` se usaba como filtro en vez de
   como secuencia, así que el reintento tras una respuesta enana caía siempre en
   el mismo modelo que la había producido. Un no-op silencioso.
9. **Timeouts aislando al provider.** Umbral 2 para `timeout` sacaba a Groq de
   rotación con dos respuestas lentas seguidas, y una corrida completa de 68
   tests falló en 18 segundos. El breaker hacía lo que se le pedía; lo que se le
   pedía estaba mal.
10. **Un solo tipo de error para toda la cadena.** El route decidía entre "Milo
    está ocupado" y "no se pudo conectar" leyendo `error.status`, que el error
    de la cadena ya no expone. Ahora `ProviderError.kinds` trae el detalle de
    cada provider, y "ocupado" solo se afirma si *todos* fallaron por capacidad.
11. **Flags del harness que nunca se leyeron.** Ver arriba, en "Correr".

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
