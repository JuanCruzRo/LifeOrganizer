import { AppLanguage, getDateLocale } from "@/lib/i18n";

export function getTodayDateValue() {
  return formatDateInput(new Date());
}

export function formatTodayLongDate(language: AppLanguage) {
  const today = new Date();
  const locale = getDateLocale(language);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "long" }).format(today);
  const month = new Intl.DateTimeFormat(locale, { month: "long" }).format(today);

  if (language === "es") {
    const day = String(today.getDate()).padStart(2, "0");
    const year = today.getFullYear();

    return `${capitalizeFirstLetter(weekday)}, ${day} de ${month} del ${year}`;
  }

  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(today);
}

export function getDaysUntilDueDate(dueDate: string) {
  const today = startOfDay(new Date());
  const targetDate = startOfDay(new Date(`${dueDate}T00:00:00`));
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Math.round((targetDate.getTime() - today.getTime()) / millisecondsPerDay);
}

export function formatDueDate(dueDate: string, language: AppLanguage) {
  const date = new Date(`${dueDate}T00:00:00`);

  return new Intl.DateTimeFormat(getDateLocale(language), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

export function getDueDateLabel(dueDate: string, language: AppLanguage) {
  const daysUntilDueDate = getDaysUntilDueDate(dueDate);

  if (language === "es") {
    if (daysUntilDueDate < 0) {
      return "vencida";
    }

    if (daysUntilDueDate === 0) {
      return "vence hoy";
    }

    if (daysUntilDueDate === 1) {
      return "vence mañana";
    }

    return `vence en ${daysUntilDueDate} días`;
  }

  if (daysUntilDueDate < 0) {
    return "overdue";
  }

  if (daysUntilDueDate === 0) {
    return "due today";
  }

  if (daysUntilDueDate === 1) {
    return "due tomorrow";
  }

  return `due in ${daysUntilDueDate} days`;
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function capitalizeFirstLetter(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
