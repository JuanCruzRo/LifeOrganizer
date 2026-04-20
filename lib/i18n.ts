export type AppLanguage = "en" | "es";
export type LanguageMode = "auto" | "manual";

export const supportedLanguages: AppLanguage[] = ["en", "es"];

export const languageLabels: Record<AppLanguage, string> = {
  en: "English",
  es: "Espanol"
};

export const copy = {
  en: {
    common: {
      appName: "Life Organizer",
      close: "Close",
      cancel: "Cancel",
      saveChanges: "Save changes",
      delete: "Delete",
      todayRecommendation: "Today's recommendation",
      noPendingTasks: "Nothing pending",
      loading: "Thinking...",
      askForHelp: "Ask for help",
      startOver: "Start over",
      sendContext: "Send context",
      save: "Save",
      add: "Add",
      saving: "Saving...",
      adding: "Adding...",
      auto: "Automatic",
      manual: "Manual",
      systemLanguage: "System language",
      interfaceLanguage: "Interface language",
      autoLanguageHint: "Uses your browser and system locale as a location-safe signal."
    },
    header: {
      title: "Life Organizer",
      subtitle:
        "A simple view to choose what to tackle first based on priority, due date, and the time you actually have today.",
      mascotAlt: "Life Organizer mascot"
    },
    recommendation: {
      expandedView: "Expanded view",
      buildExplanation: "Building explanation",
      awaitingAiTitle: "Waiting for AI recommendation",
      openLarge: "Open large",
      category: "Category",
      priority: "Priority",
      duration: "Time",
      dueDate: "Due date",
      description: "Description",
      unavailableTitle: "AI recommendation unavailable",
      priorityLoadingError: "Couldn't generate the priority explanation with Ollama Cloud."
    },
    taskHelp: {
      title: "Deep help for this task",
      subtitle:
        "AI tries to answer well with the context it already has. It only asks for more if it truly needs it.",
      closeHelp: "Close help",
      openHelp: "Help me solve this",
      mainQuestion: "Main question",
      extraContext: "Extra context you already gave",
      beforeAnswering: "Before answering properly",
      clarificationAnswer: "Answer to the clarification",
      anotherQuestion: "Another question about this task",
      whatDoYouNeed: "What do you want to solve?",
      clarificationPlaceholder: "Reply with the missing detail so AI can help you better.",
      followUpPlaceholder: "If you want, ask another specific question about this same task.",
      initialPlaceholder:
        "Example: I don't know how to start, I don't know what to deliver, I'm stuck on this part, or I need help making a decision.",
      thinking: "Thinking...",
      submitError: "Couldn't generate AI help right now.",
      understanding: "How it read the situation",
      answer: "What it would do",
      actionPlan: "Concrete plan"
    },
    taskForm: {
      editTask: "Edit task",
      newTask: "New task",
      title: "Title",
      titlePlaceholder: "Example: Prepare presentation",
      category: "Category",
      categoryPlaceholder: "Work, home, study...",
      description: "Description",
      descriptionPlaceholder: "Add context so the recommendation understands the task better...",
      priority: "Priority",
      duration: "Duration",
      dueDate: "Due date",
      addTask: "Add task",
      editSubmit: "Save changes",
      priorities: {
        low: "Low",
        medium: "Medium",
        high: "High"
      },
      durations: {
        short: "Short",
        medium: "Medium",
        long: "Long"
      }
    },
    taskList: {
      title: "Tasks",
      subtitle: "Pending and completed",
      pending: "Pending",
      completed: "Completed",
      noPending: "There are no pending tasks yet.",
      noCompleted: "There are no completed tasks yet.",
      edit: "Edit",
      markPending: "Mark pending",
      markDone: "Mark done",
      durations: {
        short: "short",
        medium: "medium",
        long: "long"
      }
    },
    footer: {
      stackLabel: "Project stack"
    },
    language: {
      responseLanguage: "Response language",
      automatic: "Automatic",
      manual: "Manual",
      english: "English",
      spanish: "Spanish",
      activeLanguage: "Active UI language"
    },
    errors: {
      unexpected: "An unexpected error occurred."
    }
  },
  es: {
    common: {
      appName: "Life Organizer",
      close: "Cerrar",
      cancel: "Cancelar",
      saveChanges: "Guardar cambios",
      delete: "Borrar",
      todayRecommendation: "Recomendacion de hoy",
      noPendingTasks: "Nada pendiente",
      loading: "Pensando...",
      askForHelp: "Pedir ayuda",
      startOver: "Empezar de nuevo",
      sendContext: "Enviar contexto",
      save: "Guardar",
      add: "Agregar",
      saving: "Guardando...",
      adding: "Agregando...",
      auto: "Automatico",
      manual: "Manual",
      systemLanguage: "Idioma del sistema",
      interfaceLanguage: "Idioma de la interfaz",
      autoLanguageHint: "Usa el locale del navegador y del sistema como senal segura de ubicacion."
    },
    header: {
      title: "Life Organizer",
      subtitle:
        "Una vista simple para elegir que tarea hacer primero segun prioridad, vencimiento y el tiempo real que tienes hoy.",
      mascotAlt: "Mascota de Life Organizer"
    },
    recommendation: {
      expandedView: "Vista ampliada",
      buildExplanation: "Armando explicacion",
      awaitingAiTitle: "Esperando la recomendacion de la IA",
      openLarge: "Ver en grande",
      category: "Categoria",
      priority: "Prioridad",
      duration: "Tiempo",
      dueDate: "Vencimiento",
      description: "Descripcion",
      unavailableTitle: "La recomendacion de IA no esta disponible",
      priorityLoadingError: "No se pudo generar la explicacion de prioridad con Ollama Cloud."
    },
    taskHelp: {
      title: "Ayuda profunda para esta tarea",
      subtitle:
        "La IA intenta responder bien con lo que ya tiene. Solo te pedira mas contexto si de verdad lo necesita.",
      closeHelp: "Cerrar ayuda",
      openHelp: "Ayudame a resolver esto",
      mainQuestion: "Duda principal",
      extraContext: "Contexto extra que ya le diste",
      beforeAnswering: "Antes de responder bien",
      clarificationAnswer: "Respuesta a la aclaracion",
      anotherQuestion: "Otra duda sobre esta tarea",
      whatDoYouNeed: "Que quieres resolver",
      clarificationPlaceholder: "Responde con el dato que falta para que la IA pueda ayudarte mejor.",
      followUpPlaceholder: "Si quieres, haz otra consulta puntual sobre esta misma tarea.",
      initialPlaceholder:
        "Ej: no se como empezar, no tengo claro que entregar, no se como resolver esta parte o estoy bloqueado con una decision.",
      thinking: "Pensando...",
      submitError: "No se pudo generar la ayuda con IA en este momento.",
      understanding: "Como leyo la situacion",
      answer: "Que haria",
      actionPlan: "Plan concreto"
    },
    taskForm: {
      editTask: "Editar tarea",
      newTask: "Nueva tarea",
      title: "Titulo",
      titlePlaceholder: "Ej: Preparar presentacion",
      category: "Categoria",
      categoryPlaceholder: "Trabajo, casa, estudio...",
      description: "Descripcion",
      descriptionPlaceholder: "Agrega mas contexto para que la recomendacion entienda mejor la tarea...",
      priority: "Prioridad",
      duration: "Duracion",
      dueDate: "Fecha de vencimiento",
      addTask: "Agregar tarea",
      editSubmit: "Guardar cambios",
      priorities: {
        low: "Baja",
        medium: "Media",
        high: "Alta"
      },
      durations: {
        short: "Corta",
        medium: "Media",
        long: "Larga"
      }
    },
    taskList: {
      title: "Tareas",
      subtitle: "Pendientes y completadas",
      pending: "Pendientes",
      completed: "Completadas",
      noPending: "Todavia no hay tareas pendientes.",
      noCompleted: "Todavia no hay tareas completadas.",
      edit: "Editar",
      markPending: "Marcar pendiente",
      markDone: "Marcar hecha",
      durations: {
        short: "corta",
        medium: "media",
        long: "larga"
      }
    },
    footer: {
      stackLabel: "Stack del proyecto"
    },
    language: {
      responseLanguage: "Idioma de respuesta",
      automatic: "Automatico",
      manual: "Manual",
      english: "Ingles",
      spanish: "Espanol",
      activeLanguage: "Idioma activo de la interfaz"
    },
    errors: {
      unexpected: "Ocurrio un error inesperado."
    }
  }
} as const;

export type TranslationSet = (typeof copy)[AppLanguage];

export function resolveAppLanguage(locale?: string | null): AppLanguage {
  const normalized = locale?.toLowerCase() ?? "";

  if (normalized.startsWith("es")) {
    return "es";
  }

  return "en";
}

export function getDateLocale(language: AppLanguage) {
  return language === "es" ? "es-ES" : "en-US";
}

export function detectTextLanguage(text: string, fallback: AppLanguage): AppLanguage {
  const normalized = text.toLowerCase();

  if (!normalized.trim()) {
    return fallback;
  }

  const spanishSignals = [
    " que ",
    " como ",
    " para ",
    " con ",
    " quiero ",
    " necesito ",
    " ayud",
    " tarea",
    "entregar",
    "resolver",
    "man",
    "cion",
    " aca ",
    " esta "
  ];

  const englishSignals = [
    " the ",
    " how ",
    " what ",
    " with ",
    " need ",
    " want ",
    "help",
    "task",
    "deliver",
    "solve"
  ];

  const spanishScore = spanishSignals.reduce(
    (score, signal) => score + (normalized.includes(signal) ? 1 : 0),
    0
  );
  const englishScore = englishSignals.reduce(
    (score, signal) => score + (normalized.includes(signal) ? 1 : 0),
    0
  );

  if (spanishScore === englishScore) {
    return fallback;
  }

  return spanishScore > englishScore ? "es" : "en";
}

export function getPromptLanguageName(language: AppLanguage) {
  return language === "es" ? "Spanish" : "English";
}
