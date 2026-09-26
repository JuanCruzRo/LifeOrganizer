import type { AppLanguage } from "@/lib/i18n";

export type FocusCopy = {
  breakDown: string;
  breaking: string;
  focus: string;
  justThis: string;
  start: string;
  pause: string;
  resume: string;
  stepDone: string;
  taskDone: string;
  exit: string;
  timeUp: string;
  aiError: string;
  limit: string;
  minutes: string;
  hint: string;
};

export const focusCopy: Record<AppLanguage, FocusCopy> = {
  en: { breakDown: "Break into steps", breaking: "Breaking it down…", focus: "Focus mode", justThis: "Just this, right now", start: "Start", pause: "Pause", resume: "Resume", stepDone: "Step done", taskDone: "Task done", exit: "Exit", timeUp: "Time's up. Nice work!", aiError: "Couldn't generate the steps. Try again.", limit: "You reached today's limit for this feature.", minutes: "min", hint: "Break it into tiny steps to make starting easier." },
  es: { breakDown: "Dividir en pasos", breaking: "Dividiendo…", focus: "Modo foco", justThis: "Solo esto, ahora", start: "Iniciar", pause: "Pausar", resume: "Continuar", stepDone: "Paso hecho", taskDone: "Tarea hecha", exit: "Salir", timeUp: "¡Se acabó el tiempo! Buen trabajo.", aiError: "No se pudieron generar los pasos. Inténtalo de nuevo.", limit: "Llegaste al límite de hoy para esta función.", minutes: "min", hint: "Divídela en pasos pequeños para que empezar sea más fácil." },
  pt: { breakDown: "Dividir em passos", breaking: "Dividindo…", focus: "Modo foco", justThis: "Só isto, agora", start: "Iniciar", pause: "Pausar", resume: "Continuar", stepDone: "Passo feito", taskDone: "Tarefa feita", exit: "Sair", timeUp: "Acabou o tempo! Bom trabalho.", aiError: "Não foi possível gerar os passos. Tente de novo.", limit: "Você atingiu o limite de hoje para este recurso.", minutes: "min", hint: "Divida em passos pequenos para facilitar o começo." },
  fr: { breakDown: "Diviser en étapes", breaking: "Découpage…", focus: "Mode focus", justThis: "Juste ça, maintenant", start: "Démarrer", pause: "Pause", resume: "Reprendre", stepDone: "Étape faite", taskDone: "Tâche faite", exit: "Quitter", timeUp: "Temps écoulé. Bravo !", aiError: "Impossible de générer les étapes. Réessayez.", limit: "Vous avez atteint la limite du jour pour cette fonction.", minutes: "min", hint: "Découpez en toutes petites étapes pour faciliter le démarrage." },
  de: { breakDown: "In Schritte aufteilen", breaking: "Wird aufgeteilt…", focus: "Fokusmodus", justThis: "Nur das, jetzt", start: "Starten", pause: "Pause", resume: "Fortsetzen", stepDone: "Schritt erledigt", taskDone: "Aufgabe erledigt", exit: "Beenden", timeUp: "Zeit ist um. Gut gemacht!", aiError: "Schritte konnten nicht erstellt werden. Versuch es erneut.", limit: "Du hast das heutige Limit für diese Funktion erreicht.", minutes: "Min.", hint: "Teile sie in winzige Schritte, damit der Start leichter fällt." },
  it: { breakDown: "Dividi in passaggi", breaking: "Divisione in corso…", focus: "Modalità focus", justThis: "Solo questo, ora", start: "Avvia", pause: "Pausa", resume: "Riprendi", stepDone: "Passaggio fatto", taskDone: "Attività fatta", exit: "Esci", timeUp: "Tempo scaduto. Ottimo lavoro!", aiError: "Impossibile generare i passaggi. Riprova.", limit: "Hai raggiunto il limite di oggi per questa funzione.", minutes: "min", hint: "Dividila in piccoli passaggi per rendere più facile iniziare." },
  zh: { breakDown: "拆分成步骤", breaking: "正在拆分…", focus: "专注模式", justThis: "现在只做这件事", start: "开始", pause: "暂停", resume: "继续", stepDone: "完成此步", taskDone: "任务完成", exit: "退出", timeUp: "时间到，做得好！", aiError: "无法生成步骤，请重试。", limit: "你今天使用此功能的次数已达上限。", minutes: "分钟", hint: "拆成很小的步骤，会更容易开始。" },
  ja: { breakDown: "ステップに分ける", breaking: "分けています…", focus: "集中モード", justThis: "今はこれだけ", start: "開始", pause: "一時停止", resume: "再開", stepDone: "ステップ完了", taskDone: "タスク完了", exit: "終了", timeUp: "時間です。お疲れさま！", aiError: "ステップを作成できませんでした。もう一度お試しください。", limit: "この機能の本日の上限に達しました。", minutes: "分", hint: "小さなステップに分けると、始めやすくなります。" },
  ko: { breakDown: "단계로 나누기", breaking: "나누는 중…", focus: "집중 모드", justThis: "지금은 이것만", start: "시작", pause: "일시정지", resume: "계속", stepDone: "단계 완료", taskDone: "할 일 완료", exit: "나가기", timeUp: "시간이 끝났어요. 잘했어요!", aiError: "단계를 만들지 못했어요. 다시 시도해 주세요.", limit: "오늘 이 기능의 사용 한도에 도달했어요.", minutes: "분", hint: "아주 작은 단계로 나누면 시작하기 쉬워져요." },
  ru: { breakDown: "Разбить на шаги", breaking: "Разбиваю…", focus: "Режим фокуса", justThis: "Только это, сейчас", start: "Начать", pause: "Пауза", resume: "Продолжить", stepDone: "Шаг выполнен", taskDone: "Задача выполнена", exit: "Выйти", timeUp: "Время вышло. Отличная работа!", aiError: "Не удалось создать шаги. Попробуйте ещё раз.", limit: "Вы достигли сегодняшнего лимита для этой функции.", minutes: "мин", hint: "Разбейте на крошечные шаги, чтобы легче начать." },
  tr: { breakDown: "Adımlara böl", breaking: "Bölünüyor…", focus: "Odak modu", justThis: "Şimdi sadece bu", start: "Başlat", pause: "Duraklat", resume: "Devam et", stepDone: "Adım tamam", taskDone: "Görev tamam", exit: "Çık", timeUp: "Süre doldu. Aferin!", aiError: "Adımlar oluşturulamadı. Tekrar dene.", limit: "Bu özellik için bugünkü sınıra ulaştın.", minutes: "dk", hint: "Başlamayı kolaylaştırmak için küçük adımlara böl." },
  nl: { breakDown: "Opdelen in stappen", breaking: "Opdelen…", focus: "Focusmodus", justThis: "Alleen dit, nu", start: "Start", pause: "Pauze", resume: "Hervatten", stepDone: "Stap klaar", taskDone: "Taak klaar", exit: "Sluiten", timeUp: "Tijd is om. Goed gedaan!", aiError: "Stappen konden niet worden gemaakt. Probeer opnieuw.", limit: "Je hebt de limiet van vandaag voor deze functie bereikt.", minutes: "min", hint: "Deel het op in kleine stappen zodat beginnen makkelijker wordt." },
  pl: { breakDown: "Podziel na kroki", breaking: "Dzielę…", focus: "Tryb skupienia", justThis: "Tylko to, teraz", start: "Start", pause: "Pauza", resume: "Wznów", stepDone: "Krok gotowy", taskDone: "Zadanie gotowe", exit: "Wyjdź", timeUp: "Czas minął. Dobra robota!", aiError: "Nie udało się utworzyć kroków. Spróbuj ponownie.", limit: "Osiągnięto dzisiejszy limit tej funkcji.", minutes: "min", hint: "Podziel na malutkie kroki, aby łatwiej było zacząć." }
};

export type ReminderCopy = {
  title: string;
  enable: string;
  enabled: string;
  blocked: string;
  dueToday: (n: number) => string;
  overdue: (n: number) => string;
  focusDone: string;
  focusDoneBody: string;
};

export const reminderCopy: Record<AppLanguage, ReminderCopy> = {
  en: { title: "Reminders", enable: "Turn on reminders", enabled: "Reminders on", blocked: "Notifications are blocked in your browser.", dueToday: (n) => `You have ${n} task${n === 1 ? "" : "s"} due today`, overdue: (n) => `${n} overdue task${n === 1 ? "" : "s"}`, focusDone: "Focus session finished", focusDoneBody: "Time's up. Take a break!" },
  es: { title: "Recordatorios", enable: "Activar recordatorios", enabled: "Recordatorios activos", blocked: "Las notificaciones están bloqueadas en tu navegador.", dueToday: (n) => `Tienes ${n} tarea${n === 1 ? "" : "s"} para hoy`, overdue: (n) => `${n} tarea${n === 1 ? "" : "s"} vencida${n === 1 ? "" : "s"}`, focusDone: "Sesión de foco terminada", focusDoneBody: "Se acabó el tiempo. ¡Tómate un descanso!" },
  pt: { title: "Lembretes", enable: "Ativar lembretes", enabled: "Lembretes ativos", blocked: "As notificações estão bloqueadas no seu navegador.", dueToday: (n) => `Você tem ${n} tarefa${n === 1 ? "" : "s"} para hoje`, overdue: (n) => `${n} tarefa${n === 1 ? "" : "s"} atrasada${n === 1 ? "" : "s"}`, focusDone: "Sessão de foco concluída", focusDoneBody: "Acabou o tempo. Faça uma pausa!" },
  fr: { title: "Rappels", enable: "Activer les rappels", enabled: "Rappels activés", blocked: "Les notifications sont bloquées dans votre navigateur.", dueToday: (n) => `Vous avez ${n} tâche${n === 1 ? "" : "s"} pour aujourd'hui`, overdue: (n) => `${n} tâche${n === 1 ? "" : "s"} en retard`, focusDone: "Session de focus terminée", focusDoneBody: "Temps écoulé. Faites une pause !" },
  de: { title: "Erinnerungen", enable: "Erinnerungen aktivieren", enabled: "Erinnerungen aktiv", blocked: "Benachrichtigungen sind in deinem Browser blockiert.", dueToday: (n) => `Du hast ${n} Aufgabe${n === 1 ? "" : "n"} für heute`, overdue: (n) => `${n} überfällige Aufgabe${n === 1 ? "" : "n"}`, focusDone: "Fokus-Session beendet", focusDoneBody: "Zeit ist um. Mach eine Pause!" },
  it: { title: "Promemoria", enable: "Attiva i promemoria", enabled: "Promemoria attivi", blocked: "Le notifiche sono bloccate nel tuo browser.", dueToday: (n) => `Hai ${n} attività per oggi`, overdue: (n) => `${n} attività in ritardo`, focusDone: "Sessione di focus terminata", focusDoneBody: "Tempo scaduto. Fai una pausa!" },
  zh: { title: "提醒", enable: "开启提醒", enabled: "提醒已开启", blocked: "你的浏览器已阻止通知。", dueToday: (n) => `今天有 ${n} 项任务`, overdue: (n) => `${n} 项任务已逾期`, focusDone: "专注时段结束", focusDoneBody: "时间到，休息一下吧！" },
  ja: { title: "リマインダー", enable: "リマインダーをオンにする", enabled: "リマインダー オン", blocked: "ブラウザで通知がブロックされています。", dueToday: (n) => `今日のタスクが ${n} 件あります`, overdue: (n) => `期限切れのタスクが ${n} 件`, focusDone: "集中セッション終了", focusDoneBody: "時間です。休憩しましょう！" },
  ko: { title: "알림", enable: "알림 켜기", enabled: "알림 켜짐", blocked: "브라우저에서 알림이 차단되어 있어요.", dueToday: (n) => `오늘 할 일이 ${n}개 있어요`, overdue: (n) => `기한이 지난 할 일 ${n}개`, focusDone: "집중 시간 종료", focusDoneBody: "시간이 다 됐어요. 잠시 쉬어요!" },
  ru: { title: "Напоминания", enable: "Включить напоминания", enabled: "Напоминания включены", blocked: "Уведомления заблокированы в браузере.", dueToday: (n) => `У вас ${n} задач(и) на сегодня`, overdue: (n) => `${n} просроченных задач(и)`, focusDone: "Сессия фокуса завершена", focusDoneBody: "Время вышло. Сделайте перерыв!" },
  tr: { title: "Hatırlatıcılar", enable: "Hatırlatıcıları aç", enabled: "Hatırlatıcılar açık", blocked: "Bildirimler tarayıcında engellenmiş.", dueToday: (n) => `Bugün için ${n} görevin var`, overdue: (n) => `${n} gecikmiş görev`, focusDone: "Odak seansı bitti", focusDoneBody: "Süre doldu. Biraz ara ver!" },
  nl: { title: "Herinneringen", enable: "Herinneringen aanzetten", enabled: "Herinneringen aan", blocked: "Meldingen zijn geblokkeerd in je browser.", dueToday: (n) => `Je hebt ${n} ta${n === 1 ? "ak" : "ken"} voor vandaag`, overdue: (n) => `${n} te late ta${n === 1 ? "ak" : "ken"}`, focusDone: "Focussessie klaar", focusDoneBody: "Tijd is om. Neem een pauze!" },
  pl: { title: "Przypomnienia", enable: "Włącz przypomnienia", enabled: "Przypomnienia włączone", blocked: "Powiadomienia są zablokowane w przeglądarce.", dueToday: (n) => `Masz ${n} zada${n === 1 ? "nie" : "nia"} na dziś`, overdue: (n) => `${n} zaległ${n === 1 ? "e zadanie" : "e zadania"}`, focusDone: "Sesja skupienia zakończona", focusDoneBody: "Czas minął. Zrób przerwę!" }
};
