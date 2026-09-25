import type { AppLanguage } from "@/lib/i18n";

export type LandingCopy = {
  metaTitle: string;
  metaDescription: string;
  login: string;
  badge: string;
  heroTitle: string;
  heroText: string;
  seePlans: string;
  noCard: string;
  featuresTitle: string;
  features: { title: string; text: string }[];
  howTitle: string;
  steps: { title: string; text: string }[];
  priceNote: string;
  faqTitle: string;
  faqs: { q: string; a: string }[];
  finalTitle: string;
  finalCta: string;
  appDescription: string;
};

// Plan names, feature lists, "/month", trial badge and plan CTAs are reused from lib/i18n (copy.plans).
export const landingCopy: Record<AppLanguage, LandingCopy> = {
  en: {
    metaTitle: "Spark — AI task organizer",
    metaDescription: "Spark is your AI task organizer. Milo helps you prioritize, schedule and decide what to do today. Start free.",
    login: "Log in",
    badge: "AI task organizer",
    heroTitle: "Stop wondering what to do first.",
    heroText: "Add your tasks and Milo, your AI assistant, tells you what makes the most sense to do today based on priority, due date and available time.",
    seePlans: "See plans",
    noCard: "No card needed. Cancel anytime.",
    featuresTitle: "Everything you need to get organized",
    features: [
      { title: "Knows what to do first", text: "Combines priority, due date and available time to recommend the task that makes the most sense today." },
      { title: "Milo, your assistant", text: "Chat with an AI that knows your task list, searches the web and remembers your habits." },
      { title: "Schedule by talking", text: 'Say "remind me about the bank every Tuesday" and Milo creates the tasks for you.' },
      { title: "Calendar and stats", text: "See your week at a glance and track your progress with completed tasks." }
    ],
    howTitle: "How it works",
    steps: [
      { title: "Add your tasks", text: "With a title, priority, duration and date. It takes seconds." },
      { title: "Spark sorts them", text: "Clear scoring plus Milo's AI pick what matters most." },
      { title: "Do it and check it off", text: "Start with what matters and watch your progress." }
    ],
    priceNote: "Reference prices in US dollars. In Argentina, payment is made in pesos through Mercado Pago.",
    faqTitle: "Frequently asked questions",
    faqs: [
      { q: "Is it free?", a: "Yes. The Free plan costs nothing and needs no card. If you want more, you can try Plus free for 14 days." },
      { q: "Can I cancel anytime?", a: "Yes. You can cancel from your account whenever you like and keep your plan until the end of the paid period." },
      { q: "How do I pay?", a: "Payments are handled securely by third-party processors. In Argentina you can pay in pesos with Mercado Pago." },
      { q: "Is the AI always right?", a: "No. Milo is an aid and can be wrong: verify important things before acting on its answers." },
      { q: "What happens to my data?", a: "Your tasks are yours. We don't sell your data or use it for advertising. More details in the Privacy Policy." }
    ],
    finalTitle: "Start today, it's free",
    finalCta: "Create my account",
    appDescription: "Task organizer with an AI assistant."
  },
  es: {
    metaTitle: "Spark — Organizador de tareas con IA",
    metaDescription: "Spark es tu organizador de tareas con IA. Milo te ayuda a priorizar, agendar y decidir qué hacer hoy. Empieza gratis.",
    login: "Iniciar sesión",
    badge: "Organizador de tareas con IA",
    heroTitle: "Deja de pensar qué hacer primero.",
    heroText: "Carga tus tareas y Milo, tu asistente con IA, te dice qué conviene hacer hoy según la prioridad, el vencimiento y el tiempo disponible.",
    seePlans: "Ver planes",
    noCard: "Sin tarjeta. Cancela cuando quieras.",
    featuresTitle: "Todo lo que necesitas para organizarte",
    features: [
      { title: "Sabe qué hacer primero", text: "Cruza prioridad, vencimiento y tiempo disponible para recomendarte la tarea que más conviene hoy." },
      { title: "Milo, tu asistente", text: "Chatea con una IA que conoce tu lista de tareas, busca en la web y recuerda tus hábitos." },
      { title: "Agenda hablando", text: 'Dile "recuérdame lo del banco cada martes" y Milo crea las tareas por ti.' },
      { title: "Calendario y estadísticas", text: "Mira tu semana de un vistazo y sigue tu progreso con las tareas completadas." }
    ],
    howTitle: "Cómo funciona",
    steps: [
      { title: "Carga tus tareas", text: "Con título, prioridad, duración y fecha. Toma segundos." },
      { title: "Spark las ordena", text: "Un puntaje claro y la IA de Milo eligen lo más importante." },
      { title: "Hazlo y márcalo", text: "Empieza por lo que importa y mira cómo avanzas." }
    ],
    priceNote: "Precios de referencia en dólares estadounidenses. En Argentina el cobro se realiza en pesos mediante Mercado Pago.",
    faqTitle: "Preguntas frecuentes",
    faqs: [
      { q: "¿Es gratis?", a: "Sí. El plan Free no tiene costo ni pide tarjeta. Si quieres más, puedes probar Plus 14 días sin cargo." },
      { q: "¿Puedo cancelar cuando quiera?", a: "Sí. Cancelas desde tu cuenta cuando quieras y conservas el plan hasta el final del período pagado." },
      { q: "¿Cómo se paga?", a: "Los pagos los procesan proveedores externos de forma segura. En Argentina puedes pagar en pesos con Mercado Pago." },
      { q: "¿La IA siempre acierta?", a: "No. Milo es una ayuda y puede equivocarse: verifica lo importante antes de actuar según sus respuestas." },
      { q: "¿Qué pasa con mis datos?", a: "Tus tareas son tuyas. No vendemos tus datos ni los usamos para publicidad. Más detalles en la Política de privacidad." }
    ],
    finalTitle: "Empieza hoy, es gratis",
    finalCta: "Crear mi cuenta",
    appDescription: "Organizador de tareas con asistente de IA."
  },
  pt: {
    metaTitle: "Spark — Organizador de tarefas com IA",
    metaDescription: "O Spark é seu organizador de tarefas com IA. O Milo ajuda você a priorizar, agendar e decidir o que fazer hoje. Comece grátis.",
    login: "Entrar",
    badge: "Organizador de tarefas com IA",
    heroTitle: "Pare de pensar no que fazer primeiro.",
    heroText: "Adicione suas tarefas e o Milo, seu assistente com IA, diz o que vale mais a pena fazer hoje conforme a prioridade, o prazo e o tempo disponível.",
    seePlans: "Ver planos",
    noCard: "Sem cartão. Cancele quando quiser.",
    featuresTitle: "Tudo o que você precisa para se organizar",
    features: [
      { title: "Sabe o que fazer primeiro", text: "Combina prioridade, prazo e tempo disponível para recomendar a tarefa que mais vale a pena hoje." },
      { title: "Milo, seu assistente", text: "Converse com uma IA que conhece sua lista de tarefas, pesquisa na web e lembra dos seus hábitos." },
      { title: "Agende conversando", text: 'Diga "me lembre do banco toda terça" e o Milo cria as tarefas para você.' },
      { title: "Calendário e estatísticas", text: "Veja sua semana rapidamente e acompanhe seu progresso com as tarefas concluídas." }
    ],
    howTitle: "Como funciona",
    steps: [
      { title: "Adicione suas tarefas", text: "Com título, prioridade, duração e data. Leva segundos." },
      { title: "O Spark organiza", text: "Uma pontuação clara e a IA do Milo escolhem o mais importante." },
      { title: "Faça e marque", text: "Comece pelo que importa e acompanhe seu avanço." }
    ],
    priceNote: "Preços de referência em dólares americanos. Na Argentina, a cobrança é feita em pesos pelo Mercado Pago.",
    faqTitle: "Perguntas frequentes",
    faqs: [
      { q: "É grátis?", a: "Sim. O plano Free não tem custo e não pede cartão. Se quiser mais, você pode testar o Plus por 14 dias sem custo." },
      { q: "Posso cancelar quando quiser?", a: "Sim. Você cancela pela sua conta quando quiser e mantém o plano até o fim do período pago." },
      { q: "Como pago?", a: "Os pagamentos são processados com segurança por provedores externos. Na Argentina, você pode pagar em pesos com o Mercado Pago." },
      { q: "A IA sempre acerta?", a: "Não. O Milo é um apoio e pode errar: confira o que for importante antes de agir com base nas respostas." },
      { q: "O que acontece com meus dados?", a: "Suas tarefas são suas. Não vendemos seus dados nem os usamos para publicidade. Mais detalhes na Política de Privacidade." }
    ],
    finalTitle: "Comece hoje, é grátis",
    finalCta: "Criar minha conta",
    appDescription: "Organizador de tarefas com assistente de IA."
  },
  fr: {
    metaTitle: "Spark — Organisateur de tâches avec IA",
    metaDescription: "Spark est votre organisateur de tâches avec IA. Milo vous aide à prioriser, planifier et décider quoi faire aujourd'hui. Commencez gratuitement.",
    login: "Se connecter",
    badge: "Organisateur de tâches avec IA",
    heroTitle: "Arrêtez de vous demander quoi faire en premier.",
    heroText: "Ajoutez vos tâches et Milo, votre assistant IA, vous dit ce qu'il est le plus pertinent de faire aujourd'hui selon la priorité, l'échéance et le temps disponible.",
    seePlans: "Voir les plans",
    noCard: "Sans carte. Annulez à tout moment.",
    featuresTitle: "Tout ce qu'il faut pour vous organiser",
    features: [
      { title: "Sait quoi faire en premier", text: "Croise priorité, échéance et temps disponible pour vous recommander la tâche la plus pertinente aujourd'hui." },
      { title: "Milo, votre assistant", text: "Discutez avec une IA qui connaît votre liste de tâches, cherche sur le web et se souvient de vos habitudes." },
      { title: "Planifiez en parlant", text: 'Dites « rappelle-moi la banque tous les mardis » et Milo crée les tâches pour vous.' },
      { title: "Calendrier et statistiques", text: "Voyez votre semaine d'un coup d'œil et suivez vos progrès grâce aux tâches terminées." }
    ],
    howTitle: "Comment ça marche",
    steps: [
      { title: "Ajoutez vos tâches", text: "Avec un titre, une priorité, une durée et une date. Cela prend quelques secondes." },
      { title: "Spark les trie", text: "Un score clair et l'IA de Milo choisissent ce qui compte le plus." },
      { title: "Faites-le et cochez", text: "Commencez par l'essentiel et regardez votre progression." }
    ],
    priceNote: "Prix de référence en dollars américains. En Argentine, le paiement se fait en pesos via Mercado Pago.",
    faqTitle: "Questions fréquentes",
    faqs: [
      { q: "Est-ce gratuit ?", a: "Oui. Le plan Free est gratuit et ne demande pas de carte. Si vous en voulez plus, vous pouvez essayer Plus gratuitement pendant 14 jours." },
      { q: "Puis-je annuler à tout moment ?", a: "Oui. Vous annulez depuis votre compte quand vous voulez et gardez votre plan jusqu'à la fin de la période payée." },
      { q: "Comment payer ?", a: "Les paiements sont traités en toute sécurité par des prestataires externes. En Argentine, vous pouvez payer en pesos avec Mercado Pago." },
      { q: "L'IA a-t-elle toujours raison ?", a: "Non. Milo est une aide et peut se tromper : vérifiez les informations importantes avant d'agir selon ses réponses." },
      { q: "Que deviennent mes données ?", a: "Vos tâches vous appartiennent. Nous ne vendons pas vos données et ne les utilisons pas pour la publicité. Plus de détails dans la Politique de confidentialité." }
    ],
    finalTitle: "Commencez aujourd'hui, c'est gratuit",
    finalCta: "Créer mon compte",
    appDescription: "Organisateur de tâches avec assistant IA."
  },
  de: {
    metaTitle: "Spark — KI-Aufgabenplaner",
    metaDescription: "Spark ist dein KI-Aufgabenplaner. Milo hilft dir, zu priorisieren, zu planen und zu entscheiden, was heute ansteht. Starte kostenlos.",
    login: "Anmelden",
    badge: "KI-Aufgabenplaner",
    heroTitle: "Hör auf zu überlegen, was zuerst dran ist.",
    heroText: "Trag deine Aufgaben ein und Milo, dein KI-Assistent, sagt dir, was heute am sinnvollsten ist – nach Priorität, Fälligkeit und verfügbarer Zeit.",
    seePlans: "Pläne ansehen",
    noCard: "Keine Karte nötig. Jederzeit kündbar.",
    featuresTitle: "Alles, was du zum Organisieren brauchst",
    features: [
      { title: "Weiß, was zuerst dran ist", text: "Verbindet Priorität, Fälligkeit und verfügbare Zeit und empfiehlt dir die Aufgabe, die heute am meisten Sinn ergibt." },
      { title: "Milo, dein Assistent", text: "Chatte mit einer KI, die deine Aufgabenliste kennt, im Web sucht und sich an deine Gewohnheiten erinnert." },
      { title: "Planen per Gespräch", text: 'Sag „erinnere mich jeden Dienstag an die Bank“ und Milo legt die Aufgaben für dich an.' },
      { title: "Kalender und Statistiken", text: "Sieh deine Woche auf einen Blick und verfolge deinen Fortschritt anhand erledigter Aufgaben." }
    ],
    howTitle: "So funktioniert's",
    steps: [
      { title: "Aufgaben eintragen", text: "Mit Titel, Priorität, Dauer und Datum. Dauert nur Sekunden." },
      { title: "Spark sortiert", text: "Eine klare Bewertung und Milos KI wählen das Wichtigste aus." },
      { title: "Erledigen und abhaken", text: "Fang mit dem Wichtigen an und sieh deinen Fortschritt." }
    ],
    priceNote: "Referenzpreise in US-Dollar. In Argentinien erfolgt die Zahlung in Pesos über Mercado Pago.",
    faqTitle: "Häufige Fragen",
    faqs: [
      { q: "Ist es kostenlos?", a: "Ja. Der Free-Plan kostet nichts und braucht keine Karte. Wenn du mehr willst, kannst du Plus 14 Tage kostenlos testen." },
      { q: "Kann ich jederzeit kündigen?", a: "Ja. Du kündigst jederzeit in deinem Konto und behältst deinen Plan bis zum Ende des bezahlten Zeitraums." },
      { q: "Wie bezahle ich?", a: "Zahlungen werden sicher von externen Anbietern abgewickelt. In Argentinien kannst du in Pesos mit Mercado Pago zahlen." },
      { q: "Hat die KI immer recht?", a: "Nein. Milo ist eine Hilfe und kann sich irren: Prüfe Wichtiges, bevor du nach seinen Antworten handelst." },
      { q: "Was passiert mit meinen Daten?", a: "Deine Aufgaben gehören dir. Wir verkaufen deine Daten nicht und nutzen sie nicht für Werbung. Mehr in der Datenschutzerklärung." }
    ],
    finalTitle: "Starte heute, es ist kostenlos",
    finalCta: "Konto erstellen",
    appDescription: "Aufgabenplaner mit KI-Assistent."
  },
  it: {
    metaTitle: "Spark — Organizzatore di attività con IA",
    metaDescription: "Spark è il tuo organizzatore di attività con IA. Milo ti aiuta a dare priorità, pianificare e decidere cosa fare oggi. Inizia gratis.",
    login: "Accedi",
    badge: "Organizzatore di attività con IA",
    heroTitle: "Smetti di chiederti cosa fare per primo.",
    heroText: "Aggiungi le tue attività e Milo, il tuo assistente IA, ti dice cosa conviene fare oggi in base a priorità, scadenza e tempo disponibile.",
    seePlans: "Vedi i piani",
    noCard: "Nessuna carta. Annulli quando vuoi.",
    featuresTitle: "Tutto ciò che serve per organizzarti",
    features: [
      { title: "Sa cosa fare per primo", text: "Incrocia priorità, scadenza e tempo disponibile per consigliarti l'attività più adatta oggi." },
      { title: "Milo, il tuo assistente", text: "Chatta con un'IA che conosce la tua lista di attività, cerca sul web e ricorda le tue abitudini." },
      { title: "Pianifica parlando", text: 'Di\' "ricordami la banca ogni martedì" e Milo crea le attività per te.' },
      { title: "Calendario e statistiche", text: "Guarda la tua settimana a colpo d'occhio e segui i progressi con le attività completate." }
    ],
    howTitle: "Come funziona",
    steps: [
      { title: "Aggiungi le attività", text: "Con titolo, priorità, durata e data. Bastano pochi secondi." },
      { title: "Spark le ordina", text: "Un punteggio chiaro e l'IA di Milo scelgono ciò che conta di più." },
      { title: "Fai e spunta", text: "Parti da ciò che conta e guarda i tuoi progressi." }
    ],
    priceNote: "Prezzi di riferimento in dollari statunitensi. In Argentina il pagamento avviene in pesos tramite Mercado Pago.",
    faqTitle: "Domande frequenti",
    faqs: [
      { q: "È gratis?", a: "Sì. Il piano Free non ha costi e non richiede carta. Se vuoi di più, puoi provare Plus gratis per 14 giorni." },
      { q: "Posso annullare quando voglio?", a: "Sì. Annulli dal tuo account quando vuoi e mantieni il piano fino alla fine del periodo pagato." },
      { q: "Come si paga?", a: "I pagamenti sono gestiti in modo sicuro da fornitori esterni. In Argentina puoi pagare in pesos con Mercado Pago." },
      { q: "L'IA ha sempre ragione?", a: "No. Milo è un aiuto e può sbagliare: verifica le cose importanti prima di agire in base alle sue risposte." },
      { q: "Che succede ai miei dati?", a: "Le tue attività sono tue. Non vendiamo i tuoi dati né li usiamo per la pubblicità. Maggiori dettagli nell'Informativa sulla privacy." }
    ],
    finalTitle: "Inizia oggi, è gratis",
    finalCta: "Crea il mio account",
    appDescription: "Organizzatore di attività con assistente IA."
  },
  zh: {
    metaTitle: "Spark — AI 任务管理工具",
    metaDescription: "Spark 是你的 AI 任务管理工具。Milo 帮你排优先级、安排日程，并决定今天该做什么。免费开始。",
    login: "登录",
    badge: "AI 任务管理工具",
    heroTitle: "别再纠结先做什么。",
    heroText: "添加你的任务，你的 AI 助手 Milo 会根据优先级、截止日期和可用时间，告诉你今天最适合做什么。",
    seePlans: "查看方案",
    noCard: "无需绑卡，随时取消。",
    featuresTitle: "高效安排所需的一切",
    features: [
      { title: "知道先做什么", text: "综合优先级、截止日期和可用时间，为你推荐今天最值得做的任务。" },
      { title: "Milo，你的助手", text: "与了解你任务清单的 AI 聊天，它能联网搜索，还会记住你的习惯。" },
      { title: "说话就能安排", text: "说「每周二提醒我去银行」，Milo 就会为你创建任务。" },
      { title: "日历与统计", text: "一眼看清本周安排，并通过已完成的任务追踪进度。" }
    ],
    howTitle: "使用方法",
    steps: [
      { title: "添加任务", text: "填写标题、优先级、时长和日期，几秒钟即可完成。" },
      { title: "Spark 帮你排序", text: "清晰的评分加上 Milo 的 AI，挑出最重要的事。" },
      { title: "完成并打勾", text: "从最重要的开始，看着自己的进展。" }
    ],
    priceNote: "参考价格以美元计。在阿根廷，通过 Mercado Pago 以比索付款。",
    faqTitle: "常见问题",
    faqs: [
      { q: "免费吗？", a: "是的。Free 方案免费，无需绑卡。想要更多功能，可以免费试用 Plus 14 天。" },
      { q: "可以随时取消吗？", a: "可以。你可随时在账户中取消，并在已付费周期结束前继续使用当前方案。" },
      { q: "如何付款？", a: "付款由第三方支付服务商安全处理。在阿根廷，你可以通过 Mercado Pago 以比索付款。" },
      { q: "AI 总是正确吗？", a: "不是。Milo 只是辅助工具，可能出错：依据其回答行动前，请核实重要信息。" },
      { q: "我的数据会怎样？", a: "你的任务归你所有。我们不会出售你的数据，也不会用于广告。详情见隐私政策。" }
    ],
    finalTitle: "今天就开始，免费使用",
    finalCta: "创建我的账户",
    appDescription: "带 AI 助手的任务管理工具。"
  },
  ja: {
    metaTitle: "Spark — AIタスク管理",
    metaDescription: "SparkはAIタスク管理アプリです。Miloが優先順位付けやスケジュール、今日やることの判断をサポートします。無料で始められます。",
    login: "ログイン",
    badge: "AIタスク管理",
    heroTitle: "何からやるか、もう迷わない。",
    heroText: "タスクを追加すると、AIアシスタントのMiloが優先度・期限・使える時間から、今日やるべきことを教えてくれます。",
    seePlans: "プランを見る",
    noCard: "カード不要。いつでも解約できます。",
    featuresTitle: "整理に必要なものがすべて揃っています",
    features: [
      { title: "最初にやることがわかる", text: "優先度・期限・使える時間を組み合わせて、今日いちばん適したタスクをおすすめします。" },
      { title: "Milo、あなたのアシスタント", text: "タスク一覧を把握し、Web検索もして、あなたの習慣を覚えているAIとチャットできます。" },
      { title: "話すだけで予定に追加", text: "「毎週火曜に銀行のことをリマインドして」と言えば、Miloがタスクを作成します。" },
      { title: "カレンダーと統計", text: "1週間をひと目で確認し、完了したタスクで進捗を追えます。" }
    ],
    howTitle: "使い方",
    steps: [
      { title: "タスクを追加", text: "タイトル、優先度、所要時間、日付を入力。数秒で完了します。" },
      { title: "Sparkが並べ替え", text: "明確なスコアとMiloのAIが、最も重要なものを選びます。" },
      { title: "実行してチェック", text: "大事なことから始めて、進み具合を確認しましょう。" }
    ],
    priceNote: "参考価格は米ドル表示です。アルゼンチンではMercado Pago経由でペソでの決済となります。",
    faqTitle: "よくある質問",
    faqs: [
      { q: "無料ですか？", a: "はい。Freeプランは無料で、カードも不要です。さらに使いたい場合は、Plusを14日間無料で試せます。" },
      { q: "いつでも解約できますか？", a: "はい。アカウントからいつでも解約でき、支払い済みの期間の終わりまでプランを利用できます。" },
      { q: "支払い方法は？", a: "支払いは外部の決済事業者が安全に処理します。アルゼンチンではMercado Pagoでペソ払いが可能です。" },
      { q: "AIは常に正しいですか？", a: "いいえ。Miloは補助ツールで、間違うこともあります。重要なことは、回答に基づいて行動する前に確認してください。" },
      { q: "データはどうなりますか？", a: "タスクはあなたのものです。データを販売したり、広告に利用したりしません。詳細はプライバシーポリシーをご覧ください。" }
    ],
    finalTitle: "今日から始めよう、無料です",
    finalCta: "アカウントを作成",
    appDescription: "AIアシスタント付きタスク管理アプリ。"
  },
  ko: {
    metaTitle: "Spark — AI 할 일 관리",
    metaDescription: "Spark는 AI 할 일 관리 앱입니다. Milo가 우선순위 정리, 일정 등록, 오늘 할 일 결정을 도와드려요. 무료로 시작하세요.",
    login: "로그인",
    badge: "AI 할 일 관리",
    heroTitle: "무엇부터 할지 더 이상 고민하지 마세요.",
    heroText: "할 일을 추가하면 AI 어시스턴트 Milo가 우선순위, 마감일, 가능한 시간을 고려해 오늘 하면 좋은 일을 알려줍니다.",
    seePlans: "요금제 보기",
    noCard: "카드 필요 없음. 언제든 해지할 수 있어요.",
    featuresTitle: "정리에 필요한 모든 것",
    features: [
      { title: "무엇부터 할지 알려줘요", text: "우선순위, 마감일, 가능한 시간을 종합해 오늘 가장 적합한 할 일을 추천합니다." },
      { title: "Milo, 나의 어시스턴트", text: "할 일 목록을 알고, 웹을 검색하고, 내 습관을 기억하는 AI와 대화하세요." },
      { title: "말로 일정 등록", text: '"매주 화요일에 은행 일 알려줘"라고 말하면 Milo가 할 일을 만들어 줍니다.' },
      { title: "캘린더와 통계", text: "한 주를 한눈에 보고, 완료한 할 일로 진행 상황을 확인하세요." }
    ],
    howTitle: "이용 방법",
    steps: [
      { title: "할 일 추가", text: "제목, 우선순위, 소요 시간, 날짜를 입력하세요. 몇 초면 됩니다." },
      { title: "Spark가 정렬", text: "명확한 점수와 Milo의 AI가 가장 중요한 일을 골라줍니다." },
      { title: "실행하고 체크", text: "중요한 일부터 시작하고 진행 상황을 확인하세요." }
    ],
    priceNote: "참고 가격은 미국 달러 기준입니다. 아르헨티나에서는 Mercado Pago를 통해 페소로 결제됩니다.",
    faqTitle: "자주 묻는 질문",
    faqs: [
      { q: "무료인가요?", a: "네. Free 요금제는 무료이며 카드가 필요 없습니다. 더 필요하시면 Plus를 14일간 무료로 체험할 수 있어요." },
      { q: "언제든 해지할 수 있나요?", a: "네. 계정에서 언제든 해지할 수 있고, 결제한 기간이 끝날 때까지 요금제를 이용할 수 있습니다." },
      { q: "결제는 어떻게 하나요?", a: "결제는 외부 결제 업체가 안전하게 처리합니다. 아르헨티나에서는 Mercado Pago로 페소 결제가 가능합니다." },
      { q: "AI가 항상 맞나요?", a: "아니요. Milo는 보조 도구이며 틀릴 수 있습니다. 중요한 내용은 답변에 따라 행동하기 전에 확인하세요." },
      { q: "내 데이터는 어떻게 되나요?", a: "할 일은 여러분의 것입니다. 데이터를 판매하거나 광고에 사용하지 않습니다. 자세한 내용은 개인정보 처리방침을 확인하세요." }
    ],
    finalTitle: "오늘 시작하세요, 무료입니다",
    finalCta: "계정 만들기",
    appDescription: "AI 어시스턴트가 있는 할 일 관리 앱."
  },
  ru: {
    metaTitle: "Spark — Планировщик задач с ИИ",
    metaDescription: "Spark — ваш планировщик задач с ИИ. Milo помогает расставлять приоритеты, планировать и решать, что делать сегодня. Начните бесплатно.",
    login: "Войти",
    badge: "Планировщик задач с ИИ",
    heroTitle: "Хватит гадать, с чего начать.",
    heroText: "Добавьте задачи, и Milo, ваш ИИ-ассистент, подскажет, что лучше сделать сегодня, исходя из приоритета, срока и свободного времени.",
    seePlans: "Смотреть тарифы",
    noCard: "Без карты. Отмена в любой момент.",
    featuresTitle: "Всё, что нужно для порядка в делах",
    features: [
      { title: "Знает, с чего начать", text: "Учитывает приоритет, срок и свободное время, чтобы порекомендовать самую подходящую задачу на сегодня." },
      { title: "Milo, ваш ассистент", text: "Общайтесь с ИИ, который знает ваш список задач, ищет в интернете и помнит ваши привычки." },
      { title: "Планируйте голосом", text: "Скажите «напоминай про банк каждый вторник», и Milo создаст задачи за вас." },
      { title: "Календарь и статистика", text: "Смотрите неделю одним взглядом и отслеживайте прогресс по выполненным задачам." }
    ],
    howTitle: "Как это работает",
    steps: [
      { title: "Добавьте задачи", text: "С названием, приоритетом, длительностью и датой. Это занимает секунды." },
      { title: "Spark расставит порядок", text: "Понятная оценка и ИИ Milo выбирают самое важное." },
      { title: "Делайте и отмечайте", text: "Начинайте с главного и следите за прогрессом." }
    ],
    priceNote: "Ориентировочные цены указаны в долларах США. В Аргентине оплата производится в песо через Mercado Pago.",
    faqTitle: "Частые вопросы",
    faqs: [
      { q: "Это бесплатно?", a: "Да. Тариф Free бесплатный и не требует карты. Если хотите больше, можно бесплатно попробовать Plus в течение 14 дней." },
      { q: "Можно отменить в любой момент?", a: "Да. Вы отменяете подписку в аккаунте когда угодно и сохраняете тариф до конца оплаченного периода." },
      { q: "Как оплатить?", a: "Платежи безопасно обрабатывают сторонние платёжные сервисы. В Аргентине можно платить в песо через Mercado Pago." },
      { q: "ИИ всегда прав?", a: "Нет. Milo — это помощник, и он может ошибаться: проверяйте важное, прежде чем действовать по его ответам." },
      { q: "Что будет с моими данными?", a: "Ваши задачи принадлежат вам. Мы не продаём ваши данные и не используем их для рекламы. Подробнее — в Политике конфиденциальности." }
    ],
    finalTitle: "Начните сегодня — это бесплатно",
    finalCta: "Создать аккаунт",
    appDescription: "Планировщик задач с ИИ-ассистентом."
  },
  tr: {
    metaTitle: "Spark — Yapay zekâlı görev planlayıcı",
    metaDescription: "Spark, yapay zekâlı görev planlayıcınızdır. Milo önceliklendirmenize, planlamanıza ve bugün ne yapacağınıza karar vermenize yardımcı olur. Ücretsiz başlayın.",
    login: "Giriş yap",
    badge: "Yapay zekâlı görev planlayıcı",
    heroTitle: "Önce ne yapacağınızı düşünmeyi bırakın.",
    heroText: "Görevlerinizi ekleyin; yapay zekâ asistanınız Milo, öncelik, son tarih ve müsait zamana göre bugün ne yapmanın en mantıklı olduğunu söylesin.",
    seePlans: "Planları gör",
    noCard: "Kart gerekmez. İstediğiniz zaman iptal edin.",
    featuresTitle: "Düzenlenmek için ihtiyacınız olan her şey",
    features: [
      { title: "Önce ne yapacağını bilir", text: "Öncelik, son tarih ve müsait zamanı birleştirerek bugün için en uygun görevi önerir." },
      { title: "Milo, asistanınız", text: "Görev listenizi bilen, web'de arama yapan ve alışkanlıklarınızı hatırlayan bir yapay zekâyla sohbet edin." },
      { title: "Konuşarak planlayın", text: '"Her salı bana bankayı hatırlat" deyin, Milo görevleri sizin için oluştursun.' },
      { title: "Takvim ve istatistikler", text: "Haftanıza tek bakışta göz atın ve tamamlanan görevlerle ilerlemenizi takip edin." }
    ],
    howTitle: "Nasıl çalışır",
    steps: [
      { title: "Görevlerinizi ekleyin", text: "Başlık, öncelik, süre ve tarihle. Saniyeler sürer." },
      { title: "Spark sıralar", text: "Net bir puanlama ve Milo'nun yapay zekâsı en önemli olanı seçer." },
      { title: "Yapın ve işaretleyin", text: "Önemli olandan başlayın ve ilerlemenizi izleyin." }
    ],
    priceNote: "Referans fiyatlar ABD doları cinsindendir. Arjantin'de ödeme, Mercado Pago üzerinden peso ile yapılır.",
    faqTitle: "Sık sorulan sorular",
    faqs: [
      { q: "Ücretsiz mi?", a: "Evet. Free planı ücretsizdir ve kart istemez. Daha fazlasını isterseniz Plus'ı 14 gün ücretsiz deneyebilirsiniz." },
      { q: "İstediğim zaman iptal edebilir miyim?", a: "Evet. Hesabınızdan istediğiniz zaman iptal edebilir ve ödenen dönemin sonuna kadar planınızı kullanabilirsiniz." },
      { q: "Nasıl ödeme yaparım?", a: "Ödemeler üçüncü taraf ödeme sağlayıcıları tarafından güvenle işlenir. Arjantin'de Mercado Pago ile peso olarak ödeyebilirsiniz." },
      { q: "Yapay zekâ her zaman doğru mudur?", a: "Hayır. Milo bir yardımcıdır ve yanılabilir: yanıtlarına göre hareket etmeden önce önemli bilgileri doğrulayın." },
      { q: "Verilerime ne olur?", a: "Görevleriniz size aittir. Verilerinizi satmayız ve reklam için kullanmayız. Ayrıntılar Gizlilik Politikası'nda." }
    ],
    finalTitle: "Bugün başlayın, ücretsiz",
    finalCta: "Hesabımı oluştur",
    appDescription: "Yapay zekâ asistanlı görev planlayıcı."
  },
  nl: {
    metaTitle: "Spark — Taakplanner met AI",
    metaDescription: "Spark is jouw taakplanner met AI. Milo helpt je prioriteren, plannen en beslissen wat je vandaag doet. Begin gratis.",
    login: "Inloggen",
    badge: "Taakplanner met AI",
    heroTitle: "Stop met piekeren over wat je eerst doet.",
    heroText: "Voeg je taken toe en Milo, je AI-assistent, vertelt wat vandaag het meest zinvol is op basis van prioriteit, deadline en beschikbare tijd.",
    seePlans: "Bekijk abonnementen",
    noCard: "Geen kaart nodig. Altijd opzegbaar.",
    featuresTitle: "Alles wat je nodig hebt om georganiseerd te blijven",
    features: [
      { title: "Weet wat je eerst moet doen", text: "Combineert prioriteit, deadline en beschikbare tijd om de taak aan te raden die vandaag het meest zinvol is." },
      { title: "Milo, je assistent", text: "Chat met een AI die je takenlijst kent, op het web zoekt en je gewoontes onthoudt." },
      { title: "Plan door te praten", text: 'Zeg "herinner me elke dinsdag aan de bank" en Milo maakt de taken voor je aan.' },
      { title: "Agenda en statistieken", text: "Zie je week in één oogopslag en volg je voortgang met afgeronde taken." }
    ],
    howTitle: "Zo werkt het",
    steps: [
      { title: "Voeg je taken toe", text: "Met titel, prioriteit, duur en datum. Het kost slechts seconden." },
      { title: "Spark sorteert ze", text: "Een duidelijke score en de AI van Milo kiezen wat het belangrijkst is." },
      { title: "Doe het en vink af", text: "Begin met wat telt en zie je voortgang." }
    ],
    priceNote: "Referentieprijzen in Amerikaanse dollars. In Argentinië wordt in pesos betaald via Mercado Pago.",
    faqTitle: "Veelgestelde vragen",
    faqs: [
      { q: "Is het gratis?", a: "Ja. Het Free-abonnement kost niets en vraagt geen kaart. Wil je meer, dan kun je Plus 14 dagen gratis proberen." },
      { q: "Kan ik altijd opzeggen?", a: "Ja. Je zegt op in je account wanneer je wilt en houdt je abonnement tot het einde van de betaalde periode." },
      { q: "Hoe betaal ik?", a: "Betalingen worden veilig verwerkt door externe betaaldiensten. In Argentinië kun je in pesos betalen met Mercado Pago." },
      { q: "Heeft de AI altijd gelijk?", a: "Nee. Milo is een hulpmiddel en kan zich vergissen: controleer belangrijke dingen voordat je op de antwoorden handelt." },
      { q: "Wat gebeurt er met mijn gegevens?", a: "Je taken zijn van jou. We verkopen je gegevens niet en gebruiken ze niet voor reclame. Meer details in het Privacybeleid." }
    ],
    finalTitle: "Begin vandaag, het is gratis",
    finalCta: "Mijn account aanmaken",
    appDescription: "Taakplanner met AI-assistent."
  },
  pl: {
    metaTitle: "Spark — Organizer zadań z AI",
    metaDescription: "Spark to Twój organizer zadań z AI. Milo pomaga ustalać priorytety, planować i decydować, co zrobić dziś. Zacznij za darmo.",
    login: "Zaloguj się",
    badge: "Organizer zadań z AI",
    heroTitle: "Przestań się zastanawiać, co zrobić najpierw.",
    heroText: "Dodaj zadania, a Milo, Twój asystent AI, podpowie, co najlepiej zrobić dziś – na podstawie priorytetu, terminu i dostępnego czasu.",
    seePlans: "Zobacz plany",
    noCard: "Bez karty. Anuluj, kiedy chcesz.",
    featuresTitle: "Wszystko, czego potrzebujesz do organizacji",
    features: [
      { title: "Wie, co zrobić najpierw", text: "Łączy priorytet, termin i dostępny czas, aby polecić zadanie, które najbardziej ma sens dziś." },
      { title: "Milo, Twój asystent", text: "Rozmawiaj z AI, która zna Twoją listę zadań, szuka w sieci i pamięta Twoje nawyki." },
      { title: "Planuj, mówiąc", text: 'Powiedz „przypominaj mi o banku w każdy wtorek”, a Milo utworzy zadania za Ciebie.' },
      { title: "Kalendarz i statystyki", text: "Zobacz swój tydzień na pierwszy rzut oka i śledź postępy dzięki ukończonym zadaniom." }
    ],
    howTitle: "Jak to działa",
    steps: [
      { title: "Dodaj zadania", text: "Z tytułem, priorytetem, czasem trwania i datą. Zajmuje to kilka sekund." },
      { title: "Spark je porządkuje", text: "Czytelna punktacja i AI Milo wybierają to, co najważniejsze." },
      { title: "Zrób i odhacz", text: "Zacznij od tego, co ważne, i obserwuj swoje postępy." }
    ],
    priceNote: "Ceny orientacyjne w dolarach amerykańskich. W Argentynie płatność odbywa się w pesos przez Mercado Pago.",
    faqTitle: "Najczęstsze pytania",
    faqs: [
      { q: "Czy to jest darmowe?", a: "Tak. Plan Free jest bezpłatny i nie wymaga karty. Jeśli chcesz więcej, możesz przetestować Plus przez 14 dni za darmo." },
      { q: "Czy mogę anulować w dowolnym momencie?", a: "Tak. Anulujesz w swoim koncie, kiedy chcesz, i zachowujesz plan do końca opłaconego okresu." },
      { q: "Jak zapłacić?", a: "Płatności bezpiecznie obsługują zewnętrzni operatorzy. W Argentynie możesz płacić w pesos przez Mercado Pago." },
      { q: "Czy AI zawsze ma rację?", a: "Nie. Milo jest pomocą i może się mylić: sprawdzaj ważne rzeczy, zanim zadziałasz na podstawie jego odpowiedzi." },
      { q: "Co dzieje się z moimi danymi?", a: "Twoje zadania należą do Ciebie. Nie sprzedajemy Twoich danych ani nie używamy ich do reklam. Więcej w Polityce prywatności." }
    ],
    finalTitle: "Zacznij dziś, to nic nie kosztuje",
    finalCta: "Utwórz konto",
    appDescription: "Organizer zadań z asystentem AI."
  }
};

// Headings shown above the Clerk forms (Clerk's own header is hidden by lib/clerk-appearance.ts).
export const authHeadings: Record<AppLanguage, { signIn: string; signUp: string }> = {
  en: { signIn: "Log in", signUp: "Create your account" },
  es: { signIn: "Inicia sesión", signUp: "Crea tu cuenta" },
  pt: { signIn: "Entrar", signUp: "Crie sua conta" },
  fr: { signIn: "Connexion", signUp: "Créez votre compte" },
  de: { signIn: "Anmelden", signUp: "Konto erstellen" },
  it: { signIn: "Accedi", signUp: "Crea il tuo account" },
  zh: { signIn: "登录", signUp: "创建账户" },
  ja: { signIn: "ログイン", signUp: "アカウント作成" },
  ko: { signIn: "로그인", signUp: "계정 만들기" },
  ru: { signIn: "Вход", signUp: "Создайте аккаунт" },
  tr: { signIn: "Giriş yap", signUp: "Hesap oluştur" },
  nl: { signIn: "Inloggen", signUp: "Account aanmaken" },
  pl: { signIn: "Zaloguj się", signUp: "Utwórz konto" }
};

export const sendLabels: Record<AppLanguage, string> = {
  en: "Send", es: "Enviar", pt: "Enviar", fr: "Envoyer", de: "Senden", it: "Invia",
  zh: "发送", ja: "送信", ko: "보내기", ru: "Отправить", tr: "Gönder", nl: "Verzenden", pl: "Wyślij"
};

// Sample content for the product preview on the landing page.
export const demoCopy: Record<AppLanguage, { rec: string; reason: string; tasks: [string, string, string] }> = {
  en: { rec: "Prepare client presentation", reason: "High priority and due in 2 days. It's a long task, so starting now avoids a last-minute rush.", tasks: ["Pay credit card", "Team meeting", "Read 20 pages"] },
  es: { rec: "Preparar presentación para el cliente", reason: "Prioridad alta y vence en 2 días. Es una tarea larga, así que empezar ahora evita correr a último momento.", tasks: ["Pagar la tarjeta de crédito", "Reunión con el equipo", "Leer 20 páginas"] },
  pt: { rec: "Preparar apresentação para o cliente", reason: "Prioridade alta e vence em 2 dias. É uma tarefa longa, então começar agora evita a correria de última hora.", tasks: ["Pagar o cartão de crédito", "Reunião com a equipe", "Ler 20 páginas"] },
  fr: { rec: "Préparer la présentation client", reason: "Priorité haute et échéance dans 2 jours. C'est une longue tâche : commencer maintenant évite la course de dernière minute.", tasks: ["Payer la carte de crédit", "Réunion d'équipe", "Lire 20 pages"] },
  de: { rec: "Kundenpräsentation vorbereiten", reason: "Hohe Priorität und in 2 Tagen fällig. Es ist eine lange Aufgabe – jetzt anzufangen vermeidet Stress in letzter Minute.", tasks: ["Kreditkarte bezahlen", "Team-Meeting", "20 Seiten lesen"] },
  it: { rec: "Preparare la presentazione per il cliente", reason: "Priorità alta e scadenza tra 2 giorni. È un'attività lunga: iniziare ora evita la corsa all'ultimo minuto.", tasks: ["Pagare la carta di credito", "Riunione di squadra", "Leggere 20 pagine"] },
  zh: { rec: "准备客户演示文稿", reason: "优先级高，2 天后到期。这是一项耗时的任务，现在开始可以避免最后一刻手忙脚乱。", tasks: ["还信用卡", "团队会议", "读 20 页书"] },
  ja: { rec: "クライアント向けプレゼンの準備", reason: "優先度が高く、期限は2日後です。時間のかかる作業なので、今始めれば直前に慌てずに済みます。", tasks: ["クレジットカードの支払い", "チームミーティング", "20ページ読む"] },
  ko: { rec: "고객 발표 자료 준비", reason: "우선순위가 높고 마감이 2일 남았어요. 시간이 오래 걸리는 작업이라 지금 시작하면 막판에 서두르지 않아도 돼요.", tasks: ["신용카드 결제", "팀 회의", "20쪽 읽기"] },
  ru: { rec: "Подготовить презентацию для клиента", reason: "Высокий приоритет, срок — через 2 дня. Задача долгая, поэтому начать сейчас — значит не спешить в последний момент.", tasks: ["Оплатить кредитную карту", "Встреча с командой", "Прочитать 20 страниц"] },
  tr: { rec: "Müşteri sunumunu hazırla", reason: "Yüksek öncelikli ve 2 gün içinde bitiyor. Uzun bir görev olduğu için şimdi başlamak son dakika telaşını önler.", tasks: ["Kredi kartını öde", "Ekip toplantısı", "20 sayfa oku"] },
  nl: { rec: "Klantpresentatie voorbereiden", reason: "Hoge prioriteit en over 2 dagen klaar. Het is een lange taak, dus nu beginnen voorkomt haast op het laatste moment.", tasks: ["Creditcard betalen", "Teamvergadering", "20 pagina's lezen"] },
  pl: { rec: "Przygotować prezentację dla klienta", reason: "Wysoki priorytet i termin za 2 dni. To długie zadanie, więc start teraz pozwala uniknąć pośpiechu w ostatniej chwili.", tasks: ["Zapłacić kartę kredytową", "Spotkanie zespołu", "Przeczytać 20 stron"] }
};
