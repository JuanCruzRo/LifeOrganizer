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

export const quickAddCopy: Record<AppLanguage, { placeholder: string; add: string }> = {
  en: { placeholder: "Write a task and press Enter…", add: "Add task" },
  es: { placeholder: "Escribe una tarea y pulsa Enter…", add: "Agregar tarea" },
  pt: { placeholder: "Escreva uma tarefa e aperte Enter…", add: "Adicionar tarefa" },
  fr: { placeholder: "Écris une tâche et appuie sur Entrée…", add: "Ajouter une tâche" },
  de: { placeholder: "Aufgabe schreiben und Enter drücken…", add: "Aufgabe hinzufügen" },
  it: { placeholder: "Scrivi un'attività e premi Invio…", add: "Aggiungi attività" },
  zh: { placeholder: "输入任务后按回车…", add: "添加任务" },
  ja: { placeholder: "タスクを入力してEnter…", add: "タスクを追加" },
  ko: { placeholder: "할 일을 쓰고 Enter를 누르세요…", add: "할 일 추가" },
  ru: { placeholder: "Напишите задачу и нажмите Enter…", add: "Добавить задачу" },
  tr: { placeholder: "Bir görev yaz ve Enter'a bas…", add: "Görev ekle" },
  nl: { placeholder: "Typ een taak en druk op Enter…", add: "Taak toevoegen" },
  pl: { placeholder: "Wpisz zadanie i naciśnij Enter…", add: "Dodaj zadanie" }
};


// First-run empty state: points at the one thing the user is avoiding.
export const emptyStateCopy: Record<AppLanguage, { title: string; text: string; examples: string[] }> = {
  en: { title: "What have you been putting off?", text: "Write it above, even if it's vague. Milo turns it into steps small enough to start.", examples: ["Tidy the desk", "Reply to that email", "Book the appointment"] },
  es: { title: "¿Qué es eso que vienes postergando?", text: "Escríbelo arriba, aunque sea vago. Milo lo convierte en pasos tan pequeños que dan ganas de empezar.", examples: ["Ordenar el escritorio", "Responder ese correo", "Pedir el turno médico"] },
  pt: { title: "O que você vem adiando?", text: "Escreva aí em cima, mesmo que vago. O Milo transforma em passos pequenos o bastante para começar.", examples: ["Organizar a mesa", "Responder aquele e-mail", "Marcar a consulta"] },
  fr: { title: "Qu'est-ce que tu remets à plus tard ?", text: "Écris-le en haut, même vaguement. Milo le transforme en étapes assez petites pour démarrer.", examples: ["Ranger le bureau", "Répondre à cet e-mail", "Prendre le rendez-vous"] },
  de: { title: "Was schiebst du gerade vor dir her?", text: "Schreib es oben hin, auch ungenau. Milo macht daraus Schritte, die klein genug zum Anfangen sind.", examples: ["Schreibtisch aufräumen", "Diese E-Mail beantworten", "Termin vereinbaren"] },
  it: { title: "Che cosa stai rimandando?", text: "Scrivilo qui sopra, anche in modo vago. Milo lo trasforma in passaggi abbastanza piccoli da iniziare.", examples: ["Sistemare la scrivania", "Rispondere a quella email", "Prendere l'appuntamento"] },
  zh: { title: "有什么事你一直在拖？", text: "写在上面就行，模糊也没关系。Milo 会把它拆成小到能立刻开始的步骤。", examples: ["整理桌面", "回复那封邮件", "预约看诊"] },
  ja: { title: "ずっと後回しにしていることは？", text: "あいまいでも上に書いてください。Miloが始められるくらい小さな手順に変えます。", examples: ["机を片づける", "あのメールに返信する", "予約を取る"] },
  ko: { title: "계속 미루고 있는 일이 뭔가요?", text: "위에 적어 보세요, 막연해도 괜찮아요. Milo가 시작할 수 있을 만큼 작은 단계로 바꿔 줘요.", examples: ["책상 정리하기", "그 메일에 답장하기", "진료 예약하기"] },
  ru: { title: "Что вы всё откладываете?", text: "Напишите это сверху, пусть даже расплывчато. Milo превратит это в шаги, с которых легко начать.", examples: ["Разобрать стол", "Ответить на то письмо", "Записаться к врачу"] },
  tr: { title: "Sürekli ertelediğin şey ne?", text: "Yukarıya yaz, muğlak olsa bile. Milo onu başlayabileceğin kadar küçük adımlara çevirir.", examples: ["Masayı topla", "Şu e-postayı yanıtla", "Randevu al"] },
  nl: { title: "Wat stel je steeds uit?", text: "Schrijf het hierboven, ook al is het vaag. Milo maakt er stappen van die klein genoeg zijn om te beginnen.", examples: ["Bureau opruimen", "Die mail beantwoorden", "Afspraak maken"] },
  pl: { title: "Co ciągle odkładasz?", text: "Napisz to u góry, nawet ogólnie. Milo zamieni to w kroki na tyle małe, żeby zacząć.", examples: ["Uporządkuj biurko", "Odpisz na tego maila", "Umów wizytę"] }
};


// Body doubling ("modo acompañado"): Milo checks in during a Pro focus session.
export const companionCopy: Record<AppLanguage, {
  withYou: string; keepGoing: string; stuck: string; modeName: string; proOnly: string;
}> = {
  en: { withYou: "Milo is with you", keepGoing: "I'm going", stuck: "I'm stuck", modeName: "Companion mode", proOnly: "Only on Pro" },
  es: { withYou: "Milo te acompaña", keepGoing: "Sigo", stuck: "Me trabé", modeName: "Modo acompañado", proOnly: "Solo en Pro" },
  pt: { withYou: "O Milo está com você", keepGoing: "Sigo", stuck: "Travei", modeName: "Modo acompanhado", proOnly: "Só no Pro" },
  fr: { withYou: "Milo est avec toi", keepGoing: "Je continue", stuck: "Je bloque", modeName: "Mode accompagné", proOnly: "Uniquement sur Pro" },
  de: { withYou: "Milo ist bei dir", keepGoing: "Ich mach weiter", stuck: "Ich häng fest", modeName: "Begleitmodus", proOnly: "Nur mit Pro" },
  it: { withYou: "Milo è con te", keepGoing: "Vado avanti", stuck: "Sono bloccato", modeName: "Modalità accompagnata", proOnly: "Solo su Pro" },
  zh: { withYou: "Milo 陪着你", keepGoing: "我继续", stuck: "我卡住了", modeName: "陪伴模式", proOnly: "仅限 Pro" },
  ja: { withYou: "Miloがそばにいます", keepGoing: "続けます", stuck: "行き詰まった", modeName: "伴走モード", proOnly: "Proのみ" },
  ko: { withYou: "Milo가 함께 있어요", keepGoing: "계속할게요", stuck: "막혔어요", modeName: "동행 모드", proOnly: "Pro 전용" },
  ru: { withYou: "Milo рядом", keepGoing: "Продолжаю", stuck: "Застрял", modeName: "Режим сопровождения", proOnly: "Только в Pro" },
  tr: { withYou: "Milo yanında", keepGoing: "Devam ediyorum", stuck: "Takıldım", modeName: "Eşlik modu", proOnly: "Sadece Pro'da" },
  nl: { withYou: "Milo is bij je", keepGoing: "Ik ga door", stuck: "Ik loop vast", modeName: "Gezelschapsmodus", proOnly: "Alleen bij Pro" },
  pl: { withYou: "Milo jest z Tobą", keepGoing: "Idę dalej", stuck: "Utknąłem", modeName: "Tryb towarzyszenia", proOnly: "Tylko w Pro" }
};


// Extra wording for the stats page.
export const statsExtraCopy: Record<AppLanguage, {
  other: string; lastDays: string; noActivity: string; tasksUnit: string; emptyChart: string;
}> = {
 en: { other: "Other", lastDays: "Last 14 days", noActivity: "No activity yet", tasksUnit: "tasks", emptyChart: "Nothing completed yet. Your first one starts the chart." },
 es: { other: "Otras", lastDays: "Últimos 14 días", noActivity: "Todavía sin actividad", tasksUnit: "tareas", emptyChart: "Aún no completaste nada. La primera empieza el gráfico." },
 pt: { other: "Outras", lastDays: "Últimos 14 dias", noActivity: "Ainda sem atividade", tasksUnit: "tarefas", emptyChart: "Você ainda não concluiu nada. A primeira começa o gráfico." },
 fr: { other: "Autres", lastDays: "14 derniers jours", noActivity: "Pas encore d'activité", tasksUnit: "tâches", emptyChart: "Rien de terminé pour l'instant. La première lance le graphique." },
 de: { other: "Andere", lastDays: "Letzte 14 Tage", noActivity: "Noch keine Aktivität", tasksUnit: "Aufgaben", emptyChart: "Noch nichts erledigt. Die erste startet das Diagramm." },
 it: { other: "Altre", lastDays: "Ultimi 14 giorni", noActivity: "Ancora nessuna attività", tasksUnit: "attività", emptyChart: "Ancora niente completato. La prima avvia il grafico." },
 zh: { other: "其他", lastDays: "最近 14 天", noActivity: "还没有记录", tasksUnit: "项任务", emptyChart: "还没有完成任何任务。第一项会让图表动起来。" },
 ja: { other: "その他", lastDays: "直近14日間", noActivity: "まだ記録がありません", tasksUnit: "件", emptyChart: "まだ何も完了していません。最初の1件からグラフが始まります。" },
 ko: { other: "기타", lastDays: "최근 14일", noActivity: "아직 기록이 없어요", tasksUnit: "개", emptyChart: "아직 완료한 일이 없어요. 첫 번째부터 그래프가 시작돼요." },
 ru: { other: "Другие", lastDays: "Последние 14 дней", noActivity: "Пока нет активности", tasksUnit: "задач", emptyChart: "Пока ничего не завершено. Первая задача запустит график." },
 tr: { other: "Diğer", lastDays: "Son 14 gün", noActivity: "Henüz hareket yok", tasksUnit: "görev", emptyChart: "Henüz hiçbir şey tamamlanmadı. İlki grafiği başlatır." },
 nl: { other: "Overig", lastDays: "Laatste 14 dagen", noActivity: "Nog geen activiteit", tasksUnit: "taken", emptyChart: "Nog niets afgerond. De eerste start de grafiek." },
 pl: { other: "Inne", lastDays: "Ostatnie 14 dni", noActivity: "Brak aktywności", tasksUnit: "zadań", emptyChart: "Nic jeszcze nie ukończono. Pierwsze zadanie uruchomi wykres." }
};


// Voice dictation feedback: errors used to fail silently.
export const micCopy: Record<AppLanguage, {
  blocked: string; noSpeech: string; recording: string; transcribing: string;
  tooLong: string; failed: string; limit: string;
}> = {
  en: { blocked: "Microphone blocked. Allow it in your browser to dictate.", noSpeech: "Couldn't hear anything. Try again.", recording: "Recording… tap to finish", transcribing: "Transcribing…", tooLong: "Recording is too long.", failed: "Couldn't transcribe. Try again.", limit: "You reached today's dictation limit." },
  es: { blocked: "Micrófono bloqueado. Permítelo en tu navegador para dictar.", noSpeech: "No se escuchó nada. Inténtalo de nuevo.", recording: "Grabando… toca para terminar", transcribing: "Transcribiendo…", tooLong: "La grabación es demasiado larga.", failed: "No se pudo transcribir. Inténtalo de nuevo.", limit: "Llegaste al límite de dictado de hoy." },
  pt: { blocked: "Microfone bloqueado. Permita no seu navegador para ditar.", noSpeech: "Não ouvi nada. Tente de novo.", recording: "Gravando… toque para terminar", transcribing: "Transcrevendo…", tooLong: "A gravação é longa demais.", failed: "Não foi possível transcrever. Tente de novo.", limit: "Você atingiu o limite de ditado de hoje." },
  fr: { blocked: "Micro bloqué. Autorisez-le dans votre navigateur pour dicter.", noSpeech: "Je n'ai rien entendu. Réessayez.", recording: "Enregistrement… touchez pour terminer", transcribing: "Transcription…", tooLong: "L'enregistrement est trop long.", failed: "Transcription impossible. Réessayez.", limit: "Vous avez atteint la limite de dictée du jour." },
  de: { blocked: "Mikrofon blockiert. Erlaube es im Browser, um zu diktieren.", noSpeech: "Nichts gehört. Versuch es noch mal.", recording: "Aufnahme… zum Beenden tippen", transcribing: "Wird transkribiert…", tooLong: "Die Aufnahme ist zu lang.", failed: "Transkription fehlgeschlagen. Versuch es noch mal.", limit: "Du hast das heutige Diktat-Limit erreicht." },
  it: { blocked: "Microfono bloccato. Consentilo nel browser per dettare.", noSpeech: "Non ho sentito nulla. Riprova.", recording: "Registrazione… tocca per terminare", transcribing: "Trascrizione…", tooLong: "La registrazione è troppo lunga.", failed: "Impossibile trascrivere. Riprova.", limit: "Hai raggiunto il limite di dettatura di oggi." },
  zh: { blocked: "麦克风被阻止。请在浏览器中允许后再口述。", noSpeech: "没有听到声音，请再试一次。", recording: "录音中…点击结束", transcribing: "转写中…", tooLong: "录音时间过长。", failed: "无法转写，请重试。", limit: "你今天的语音输入次数已用完。" },
  ja: { blocked: "マイクがブロックされています。ブラウザで許可してください。", noSpeech: "聞き取れませんでした。もう一度お試しください。", recording: "録音中…タップで終了", transcribing: "文字起こし中…", tooLong: "録音が長すぎます。", failed: "文字起こしできませんでした。もう一度お試しください。", limit: "本日の音声入力の上限に達しました。" },
  ko: { blocked: "마이크가 차단되었어요. 브라우저에서 허용해 주세요.", noSpeech: "아무 소리도 들리지 않았어요. 다시 시도해 주세요.", recording: "녹음 중… 눌러서 종료", transcribing: "받아쓰는 중…", tooLong: "녹음이 너무 길어요.", failed: "받아쓰지 못했어요. 다시 시도해 주세요.", limit: "오늘의 음성 입력 한도에 도달했어요." },
  ru: { blocked: "Микрофон заблокирован. Разрешите его в браузере, чтобы диктовать.", noSpeech: "Ничего не услышал. Попробуйте ещё раз.", recording: "Запись… нажмите, чтобы закончить", transcribing: "Расшифровка…", tooLong: "Запись слишком длинная.", failed: "Не удалось расшифровать. Попробуйте ещё раз.", limit: "Вы исчерпали дневной лимит диктовки." },
  tr: { blocked: "Mikrofon engellendi. Dikte için tarayıcıdan izin ver.", noSpeech: "Hiçbir şey duyulmadı. Tekrar dene.", recording: "Kaydediliyor… bitirmek için dokun", transcribing: "Yazıya dökülüyor…", tooLong: "Kayıt çok uzun.", failed: "Yazıya dökülemedi. Tekrar dene.", limit: "Bugünkü dikte sınırına ulaştın." },
  nl: { blocked: "Microfoon geblokkeerd. Sta hem toe in je browser om te dicteren.", noSpeech: "Niets gehoord. Probeer het opnieuw.", recording: "Opnemen… tik om te stoppen", transcribing: "Transcriberen…", tooLong: "De opname is te lang.", failed: "Transcriberen mislukt. Probeer opnieuw.", limit: "Je hebt de dicteerlimiet van vandaag bereikt." },
  pl: { blocked: "Mikrofon zablokowany. Zezwól na niego w przeglądarce, aby dyktować.", noSpeech: "Nic nie usłyszałem. Spróbuj ponownie.", recording: "Nagrywanie… dotknij, aby zakończyć", transcribing: "Transkrypcja…", tooLong: "Nagranie jest za długie.", failed: "Nie udało się przepisać. Spróbuj ponownie.", limit: "Osiągnięto dzienny limit dyktowania." }
};


// Streak badges: milestones that stay unlocked once earned.
export const streakCopy: Record<AppLanguage, {
  streak: string; best: string; badges: string; days: string; day: string;
  toNext: string; allUnlocked: string; startToday: string; names: string[];
}> = {
  en: { streak: "Streak", best: "Best", badges: "Badges", days: "days", day: "day", toNext: "%d days to the next badge", allUnlocked: "All badges unlocked", startToday: "Start today", names: ["Quartz", "Jade", "Emerald", "Malachite", "Sapphire", "Amethyst", "Amber", "Topaz", "Ruby", "Diamond", "Alexandrite", "Painite"] },
  es: { streak: "Racha", best: "Mejor", badges: "Insignias", days: "días", day: "día", toNext: "%d días para la próxima insignia", allUnlocked: "Todas las insignias desbloqueadas", startToday: "Empieza hoy", names: ["Cuarzo", "Jade", "Esmeralda", "Malaquita", "Zafiro", "Amatista", "Ámbar", "Topacio", "Rubí", "Diamante", "Alejandrita", "Painita"] },
  pt: { streak: "Sequência", best: "Melhor", badges: "Emblemas", days: "dias", day: "dia", toNext: "%d dias para o próximo emblema", allUnlocked: "Todos os emblemas desbloqueados", startToday: "Comece hoje", names: ["Quartzo", "Jade", "Esmeralda", "Malaquita", "Safira", "Ametista", "Âmbar", "Topázio", "Rubi", "Diamante", "Alexandrita", "Painita"] },
  fr: { streak: "Série", best: "Record", badges: "Badges", days: "jours", day: "jour", toNext: "%d jours avant le prochain badge", allUnlocked: "Tous les badges débloqués", startToday: "Commencez aujourd'hui", names: ["Quartz", "Jade", "Émeraude", "Malachite", "Saphir", "Améthyste", "Ambre", "Topaze", "Rubis", "Diamant", "Alexandrite", "Painite"] },
  de: { streak: "Serie", best: "Bestwert", badges: "Abzeichen", days: "Tage", day: "Tag", toNext: "Noch %d Tage bis zum nächsten Abzeichen", allUnlocked: "Alle Abzeichen freigeschaltet", startToday: "Heute starten", names: ["Quarz", "Jade", "Smaragd", "Malachit", "Saphir", "Amethyst", "Bernstein", "Topas", "Rubin", "Diamant", "Alexandrit", "Painit"] },
  it: { streak: "Serie", best: "Record", badges: "Distintivi", days: "giorni", day: "giorno", toNext: "%d giorni al prossimo distintivo", allUnlocked: "Tutti i distintivi sbloccati", startToday: "Inizia oggi", names: ["Quarzo", "Giada", "Smeraldo", "Malachite", "Zaffiro", "Ametista", "Ambra", "Topazio", "Rubino", "Diamante", "Alessandrite", "Painite"] },
  zh: { streak: "连续天数", best: "最佳", badges: "徽章", days: "天", day: "天", toNext: "距离下一个徽章还有 %d 天", allUnlocked: "已解锁全部徽章", startToday: "今天开始", names: ["石英", "翡翠", "祖母绿", "孔雀石", "蓝宝石", "紫水晶", "琥珀", "黄玉", "红宝石", "钻石", "变石", "硼铝钙石"] },
  ja: { streak: "連続日数", best: "最高", badges: "バッジ", days: "日", day: "日", toNext: "次のバッジまであと%d日", allUnlocked: "すべてのバッジを獲得", startToday: "今日から始める", names: ["クォーツ", "ヒスイ", "エメラルド", "マラカイト", "サファイア", "アメジスト", "アンバー", "トパーズ", "ルビー", "ダイヤモンド", "アレキサンドライト", "ペイナイト"] },
  ko: { streak: "연속", best: "최고", badges: "배지", days: "일", day: "일", toNext: "다음 배지까지 %d일", allUnlocked: "모든 배지 획득", startToday: "오늘 시작하기", names: ["수정", "비취", "에메랄드", "공작석", "사파이어", "자수정", "호박", "토파즈", "루비", "다이아몬드", "알렉산드라이트", "페이나이트"] },
  ru: { streak: "Серия", best: "Рекорд", badges: "Значки", days: "дн.", day: "день", toNext: "До следующего значка %d дн.", allUnlocked: "Все значки открыты", startToday: "Начните сегодня", names: ["Кварц", "Нефрит", "Изумруд", "Малахит", "Сапфир", "Аметист", "Янтарь", "Топаз", "Рубин", "Алмаз", "Александрит", "Пейнит"] },
  tr: { streak: "Seri", best: "Rekor", badges: "Rozetler", days: "gün", day: "gün", toNext: "Sonraki rozete %d gün", allUnlocked: "Tüm rozetler açıldı", startToday: "Bugün başla", names: ["Kuvars", "Yeşim", "Zümrüt", "Malakit", "Safir", "Ametist", "Kehribar", "Topaz", "Yakut", "Elmas", "İskenderiye taşı", "Painit"] },
  nl: { streak: "Reeks", best: "Record", badges: "Badges", days: "dagen", day: "dag", toNext: "Nog %d dagen tot de volgende badge", allUnlocked: "Alle badges vrijgespeeld", startToday: "Begin vandaag", names: ["Kwarts", "Jade", "Smaragd", "Malachiet", "Saffier", "Amethist", "Barnsteen", "Topaas", "Robijn", "Diamant", "Alexandriet", "Painiet"] },
  pl: { streak: "Seria", best: "Rekord", badges: "Odznaki", days: "dni", day: "dzień", toNext: "%d dni do kolejnej odznaki", allUnlocked: "Wszystkie odznaki zdobyte", startToday: "Zacznij dziś", names: ["Kwarc", "Jadeit", "Szmaragd", "Malachit", "Szafir", "Ametyst", "Bursztyn", "Topaz", "Rubin", "Diament", "Aleksandryt", "Painit"] }
};


// Shown once, full screen, when a streak milestone unlocks a gem.
export const gemUnlockCopy: Record<AppLanguage, {
  unlocked: string; dayStreak: string; keepGoing: string;
}> = {
  en: { unlocked: "New gem unlocked", dayStreak: "day streak", keepGoing: "Keep it up" },
  es: { unlocked: "Nueva gema desbloqueada", dayStreak: "días de racha", keepGoing: "Sigue así" },
  pt: { unlocked: "Nova gema desbloqueada", dayStreak: "dias de sequência", keepGoing: "Continue assim" },
  fr: { unlocked: "Nouvelle gemme débloquée", dayStreak: "jours de série", keepGoing: "Continuez comme ça" },
  de: { unlocked: "Neuer Edelstein freigeschaltet", dayStreak: "Tage Serie", keepGoing: "Weiter so" },
  it: { unlocked: "Nuova gemma sbloccata", dayStreak: "giorni di serie", keepGoing: "Continua così" },
  zh: { unlocked: "解锁新宝石", dayStreak: "天连续", keepGoing: "继续保持" },
  ja: { unlocked: "新しい宝石を獲得", dayStreak: "日連続", keepGoing: "この調子で" },
  ko: { unlocked: "새 보석 획득", dayStreak: "일 연속", keepGoing: "계속 이대로" },
  ru: { unlocked: "Новый камень открыт", dayStreak: "дней подряд", keepGoing: "Так держать" },
  tr: { unlocked: "Yeni taş açıldı", dayStreak: "günlük seri", keepGoing: "Böyle devam" },
  nl: { unlocked: "Nieuwe edelsteen vrijgespeeld", dayStreak: "dagen op rij", keepGoing: "Ga zo door" },
  pl: { unlocked: "Nowy klejnot zdobyty", dayStreak: "dni z rzędu", keepGoing: "Tak trzymaj" }
};
