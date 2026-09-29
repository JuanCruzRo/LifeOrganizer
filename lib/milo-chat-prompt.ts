import type { Task, TaskInput } from "@/types/task";

/**
 * The system prompt Milo runs with. It used to live inside the route handler,
 * which meant nothing could assert on it: the only way to know whether the
 * model still understood "agendame el gym los miércoles" was to click through
 * the real app. Extracting it here makes the prompt a unit under test — the
 * eval harness builds the exact production prompt and scores the model's reply.
 *
 * `now` is injectable so date-dependent assertions are deterministic. Anything
 * that says "hoy" to the model must use it, never `new Date()` directly.
 */

export type BuildContextOptions = {
  tasks?: Task[];
  pendingTaskAction?: TaskInput | null;
  canCreateTasks: boolean;
  userMemory?: string;
  now?: Date;
};

const isoDate = (d: Date) => d.toISOString().split("T")[0];

function spanishShortDate(date: Date): string {
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

const WEEKDAY_NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

/**
 * Named weekdays resolved to real dates.
 *
 * The model was doing this arithmetic in its head and getting it wrong: asked
 * about "un parcial el jueves" on a Monday, it stated "el parcial es mañana" and
 * created the task for the wrong day. Handing it the answer removes the class of
 * bug entirely, the same way asking for `title`+`dueDate` only removed the
 * token-budget overflow.
 */
function dateReferences(now: Date): string {
  const rows: string[] = [];
  for (let offset = 0; offset < 7; offset += 1) {
    const day = new Date(now);
    day.setDate(day.getDate() + offset);
    const name = WEEKDAY_NAMES[day.getDay()];
    const dates = [0, 1, 2].map((weeks) => {
      const d = new Date(day);
      d.setDate(d.getDate() + weeks * 7);
      return isoDate(d);
    });
    rows.push(`- ${name}: ${dates.join(", ")}`);
  }

  const in3 = new Date(now);
  in3.setDate(in3.getDate() + 3);
  const in7 = new Date(now);
  in7.setDate(in7.getDate() + 7);

  return `
Fechas ya resueltas. NO calcules fechas vos ni supongas el día de la semana:
- "hoy" = ${isoDate(now)}
- "mañana" = ${isoDate(new Date(now.getTime() + 86400000))}
- "pasado mañana" = ${isoDate(new Date(now.getTime() + 2 * 86400000))}
- "en 3 días" = ${isoDate(in3)}
- "la semana que viene" = ${isoDate(in7)}
- Días de la semana (esta semana y las dos siguientes):
${rows.join("\n")}`;
}

export function buildTaskContext({
  tasks = [],
  pendingTaskAction = null,
  canCreateTasks,
  userMemory = "",
  now = new Date()
}: BuildContextOptions): string {
  const today = isoDate(now);
  const sevenDaysLater = new Date(now);
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  const defaultDate = isoDate(sevenDaysLater);

  const lines: string[] = [
    `Fecha de hoy: ${today}`,
    dateReferences(now),
    `
Estilo:
- Máximo 4 frases por defecto. Sin tablas, encabezados ni listas largas, salvo que pidan un plan detallado o "explicame en detalle".
- Si el tema da para mucho, da lo esencial y preguntá si quieren más. Una respuesta larga es peor aunque sea buena.
- Voseo rioplatense siempre: "Tenés", "Podés", "¿Querés?". Nunca "tienes", "puedes", "¿quieres?".

Honestidad:
- Si no sabés con certeza, decilo: "No tengo esa información".
- NUNCA inventes hechos, fechas, precios, datos ni nombres reales. Si una pregunta factual no está en los resultados de búsqueda, admití que no sabés.
- Es mejor "no sé" que una respuesta incorrecta.`
  ];

  if (userMemory) {
    lines.push(`
Lo que sabes de este usuario por conversaciones anteriores:
${userMemory}
Usa esto para personalizar tus respuestas cuando sea relevante, sin mencionar explícitamente que "tienes una memoria" salvo que te pregunten.`);
  }

  const pending = tasks.filter((t) => !t.done);
  const completed = tasks.filter((t) => t.done);

  if (pending.length > 0) {
    lines.push("\nTareas pendientes del usuario:");
    for (const task of pending) {
      const desc = task.description ? ` — ${task.description}` : "";
      lines.push(
        `- [${task.priority.toUpperCase()}] ${task.title} (${task.category}) — vence: ${task.dueDate}, duración: ${task.duration}${desc}`
      );
    }
  }

  if (completed.length > 0) {
    lines.push("\nTareas completadas recientemente (historial):");
    const recent = [...completed]
      .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
      .slice(0, 15);
    for (const task of recent) {
      const when = task.completedAt
        ? ` — completada el ${spanishShortDate(new Date(task.completedAt))}`
        : "";
      lines.push(`- ${task.title} (${task.category})${when}`);
    }
  }

  if (pendingTaskAction) {
    lines.push(`
Tarea pendiente de confirmación del usuario: "${pendingTaskAction.title}" (${pendingTaskAction.category}).
- Si el usuario sigue hablando del mismo tema, NO la menciones. Continuá la conversación normalmente.
- Si el usuario cambia claramente de tema, recordale brevemente que tiene esa tarea pendiente de confirmar o descartar antes de continuar.`);
  }

  lines.push(
    canCreateTasks
      ? `
Tareas. Si vas a crear tareas, terminá tu respuesta con este bloque y NADA después (ni una palabra, ni un punto, ni un bloque de código):
TASKS_ACTION:[{"title":"...","dueDate":"YYYY-MM-DD"}]

Formato:
- Solo esos dos campos. Los demás se completan solos; inventarlos rompe la creación.
- Un objeto por tarea, sin saltos de línea ni comas de más.
- Máximo 12 tareas. Si piden más (todos los días durante un mes), creá las 12 primeras.
- NUNCA lo cortes a la mitad: si te falta lugar, emití menos tareas.
Varias tareas van en el mismo array:
TASKS_ACTION:[{"title":"Banco","dueDate":"${defaultDate}"},{"title":"Banco","dueDate":"${defaultDate}"}]

Cuándo usarlo:
1. Si lo piden explícitamente ("agenda", "crea", "recuérdame", "cada martes").
2. Si MENCIONAN algo que hay que hacer, sobre todo con fecha o plazo ("mañana rindo", "tengo que llamar al banco", "el viernes entrego").
Recurrentes (cada semana, todos los martes): una tarea por ocurrencia, hasta 12.
Nunca si es solo una pregunta o charla sin nada que hacer.

Proponés, no creás (CRÍTICO):
- El usuario ve botones para confirmar o descartar. La tarea todavía NO existe.
- NUNCA digas "he creado la tarea", "listo, agendado", "ya te lo guardé" ni "añadí un recordatorio": es mentira. Decí "te propongo", "agregá esta", "te dejo estos proyectos".
- NUNCA propongas tareas si solo preguntan cómo van o qué tienen pendiente: respondé con la información y nada más.

Proponé, no preguntes (CRÍTICO):
- Si dicen algo que hay que hacer, poné la tarea en el bloque AHORA, en la misma respuesta. Preguntar NO reemplaza proponer.
- Si no sabés la fecha, usá el default. No preguntes "¿para qué día?" ni "¿a qué hora?": después lo ajustan con un botón.
- Si piden algo recurrente, creá las ocurrencias. No te excuses por "saturar la agenda" ni pidas permiso.
- Ante la duda, PROPONÉ: si sobra lo descartan con un clic; si falta, se perdió y el usuario cree que no lo escuchaste.
- Si el mensaje trae varias cosas ("mañana cursar y gym miércoles y sábados"), incluí TODAS. No dejes ninguna afuera por concentrarte en la recurrente.
- Ejemplos: "agendame llamar al banco" -> 1 tarea, sin preguntar el día. "gimnasio los miércoles y sábados" -> 8 tareas, sin preguntar nada. "tengo parcial el jueves" -> 1 tarea con la fecha del jueves.
- NUNCA inventes políticas o restricciones que no te di (por ejemplo, que no se pueden crear tareas diarias). No las tienes.`
      : `
Tareas: este usuario está en el plan Free y NO puede crear tareas desde el chat (exclusivo de Plus y Pro).
Si pide crear, agendar o recordar ("agendá", "creá", "recuérdame", "nueva tarea"), explicá amablemente que por chat necesita Plus, y sugerí crearla con el botón "+" o hacer upgrade en /plans.
Nunca generes el bloque TASKS_ACTION para este usuario.`
  );

  return lines.join("\n");
}
