import { LEGAL } from "@/lib/legal-config";
import type { LegalContent } from "@/components/legal/legal-document";

const { serviceName: S, operatorName: OP, operatorTaxId: TAX, operatorAddress: ADDR, contactEmail: MAIL } = LEGAL;

export const termsContent: { es: LegalContent; en: LegalContent } = {
  es: {
    title: "Términos y condiciones",
    intro: `Estos términos regulan el uso de ${S} (el "Servicio"), operado por ${OP} (CUIT ${TAX}), con domicilio en ${ADDR} (el "Responsable"). Al crear una cuenta o usar el Servicio aceptas estos términos.`,
    sections: [
      {
        title: "El Servicio",
        body: [
          `${S} es una aplicación para organizar tareas que incluye un asistente de inteligencia artificial llamado Milo. El Servicio se ofrece "tal cual está" y puede cambiar, tener interrupciones o incorporar nuevas funciones.`
        ]
      },
      {
        title: "Cuenta y uso permitido",
        body: [
          "Necesitás una cuenta para usar el Servicio. Eres responsable de la actividad de tu cuenta y de mantener seguro tu acceso. Tienes que ser mayor de 18 años, o contar con autorización de tu representante legal si eres menor.",
          "No puedes usar el Servicio para actividades ilegales, para intentar vulnerar su seguridad, para automatizar el acceso de forma abusiva ni para revenderlo sin autorización."
        ]
      },
      {
        title: "Inteligencia artificial",
        body: [
          "Milo genera respuestas con modelos de lenguaje de terceros. Las respuestas pueden ser incorrectas, incompletas o desactualizadas. No constituyen asesoramiento médico, legal, financiero ni profesional. Verifica la información importante antes de actuar en base a ella.",
          "Los mensajes que le envías a Milo y las tareas relevantes se envían a proveedores de IA para generar la respuesta (ver la Política de privacidad)."
        ]
      },
      {
        title: "Planes, precios y pagos",
        body: [
          `El Servicio ofrece un plan gratuito y planes pagos por suscripción mensual (Plus y Pro). Los precios de referencia son USD ${LEGAL.prices.plus} (Plus) y USD ${LEGAL.prices.pro} (Pro) por mes. En Argentina los cobros pueden realizarse en peeres argentinos a través de Mercado Pago, según el valor informado al momento de suscribirte.`,
          "Los pagos son procesados por terceros (Mercado Pago y, cuando esté disponible, otro procesador para pagos internacionales). El Responsable no almacena los datos de tu tarjeta.",
          `El plan Plus puede incluir un período de prueba gratuito de ${LEGAL.trialDays} días, por única vez por persona. Los planes y precios pueden modificarse; los cambios se comunican con anticipación y no afectan el período ya abonado.`,
          "Los límites de uso diario de las funciones de IA dependen del plan y pueden ajustarse."
        ]
      },
      {
        title: "Renovación, cancelación y reembolsos",
        body: [
          "La suscripción se renueva automáticamente cada mes hasta que la canceles. Puedes cancelarla en cualquier momento desde tu cuenta o escribiendo a " + MAIL + "; seguirás con acceso al plan hasta el final del período ya pagado, sin cargos posteriores.",
          "Si contrataste a distancia desde Argentina, tienes derecho a revocar la contratación dentro de los 10 días corridos desde que la contrataste (art. 34 de la Ley 24.240 de Defensa del Consumidor), pidiéndolo a " + MAIL + ". En ese caso se reembolsa el importe pagado.",
          "Fuera de ese plazo, y salvo que la ley disponga otra cosa, los períodos ya iniciados no se reembolsan."
        ]
      },
      {
        title: "Tu contenido",
        body: [
          "Eres titular del contenido que cargas (tareas, mensajes). Le otorgas al Responsable el permiso limitado necesario para almacenarlo y procesarlo con el único fin de prestarte el Servicio. Puedes eliminar tus tareas cuando quieras y pedir la eliminación de tu cuenta escribiendo a " + MAIL + "."
        ]
      },
      {
        title: "Propiedad intelectual",
        body: [
          `El software, la marca ${S}, el diseño y la mascota Milo pertenecen al Responsable. Estos términos no te transfieren ningún derecho sobre ellos, más allá del uso personal del Servicio.`
        ]
      },
      {
        title: "Limitación de responsabilidad",
        body: [
          "En la máxima medida permitida por la ley, el Responsable no responde por daños indirectos, pérdida de datos, de ganancias u oportunidades derivados del uso o la imposibilidad de usar el Servicio, ni por decisiones tomadas en base a respuestas de la IA. Nada de lo aquí dispuesto limita los derechos que la ley te reconoce como consumidor."
        ]
      },
      {
        title: "Suspensión y baja",
        body: [
          "Podemos suspender o cerrar cuentas que incumplan estos términos o hagan un uso abusivo del Servicio. Vos puedes dejar de usarlo y eliminar tu cuenta en cualquier momento."
        ]
      },
      {
        title: "Ley aplicable y contacto",
        body: [
          `Estos términos se rigen por las leyes de la República Argentina. Para reclamos de consumo puedes acudir a la autoridad de Defensa del Consumidor de tu jurisdicción (argentina.gob.ar/produccion/defensadelconsumidor). Consultas: ${MAIL}.`
        ]
      }
    ]
  },
  en: {
    title: "Terms of Service",
    intro: `These terms govern your use of ${S} (the "Service"), operated by ${OP} (Tax ID ${TAX}), located at ${ADDR} (the "Operator"). By creating an account or using the Service you agree to these terms.`,
    sections: [
      {
        title: "The Service",
        body: [
          `${S} is a task-organizing app that includes an AI assistant called Milo. The Service is provided "as is" and may change, experience interruptions or add new features.`
        ]
      },
      {
        title: "Account and acceptable use",
        body: [
          "You need an account to use the Service. You are responsible for activity on your account and for keeping your access secure. You must be at least 18, or have your legal guardian's permission.",
          "You may not use the Service for illegal activity, to attempt to breach its security, to abusively automate access, or to resell it without permission."
        ]
      },
      {
        title: "Artificial intelligence",
        body: [
          "Milo generates answers using third-party language models. Answers may be incorrect, incomplete or outdated, and are not medical, legal, financial or professional advice. Verify important information before acting on it.",
          "The messages you send to Milo and relevant tasks are sent to AI providers to generate a response (see the Privacy Policy)."
        ]
      },
      {
        title: "Plans, prices and payments",
        body: [
          `The Service offers a free plan and paid monthly subscriptions (Plus and Pro). Reference prices are USD ${LEGAL.prices.plus} (Plus) and USD ${LEGAL.prices.pro} (Pro) per month. In Argentina, charges may be made in Argentine peeres through Mercado Pago at the amount shown when you subscribe.`,
          "Payments are processed by third parties (Mercado Pago and, when available, another processor for international payments). The Operator does not store your card details.",
          `The Plus plan may include a free ${LEGAL.trialDays}-day trial, once per person. Plans and prices may change; changes are announced in advance and do not affect an already-paid period.`,
          "Daily usage limits for AI features depend on your plan and may be adjusted."
        ]
      },
      {
        title: "Renewal, cancellation and refunds",
        body: [
          "Subscriptions renew automatically every month until you cancel. You can cancel at any time from your account or by writing to " + MAIL + "; you keep access until the end of the period you already paid for, with no further charges.",
          "If you purchased remotely from Argentina, you may withdraw within 10 calendar days of purchase (Argentine Consumer Protection Law 24.240, art. 34) by writing to " + MAIL + ", and the amount paid will be refunded.",
          "Outside that window, and unless the law provides otherwise, periods already started are not refunded."
        ]
      },
      {
        title: "Your content",
        body: [
          "You own the content you upload (tasks, messages). You grant the Operator the limited permission needed to store and process it solely to provide the Service. You can delete your tasks at any time and request account deletion by writing to " + MAIL + "."
        ]
      },
      {
        title: "Intellectual property",
        body: [
          `The software, the ${S} brand, the design and the Milo mascot belong to the Operator. These terms grant you no rights over them beyond personal use of the Service.`
        ]
      },
      {
        title: "Limitation of liability",
        body: [
          "To the maximum extent permitted by law, the Operator is not liable for indirect damages, loss of data, profits or opportunities arising from use of, or inability to use, the Service, or for decisions made based on AI answers. Nothing here limits the rights you have as a consumer under applicable law."
        ]
      },
      {
        title: "Suspension and termination",
        body: [
          "We may suspend or close accounts that breach these terms or abuse the Service. You may stop using it and delete your account at any time."
        ]
      },
      {
        title: "Governing law and contact",
        body: [
          `These terms are governed by the laws of the Argentine Republic. Questions: ${MAIL}.`
        ]
      }
    ]
  }
};

export const privacyContent: { es: LegalContent; en: LegalContent } = {
  es: {
    title: "Política de privacidad",
    intro: `${OP} (CUIT ${TAX}), con domicilio en ${ADDR}, es el responsable del tratamiento de tus datos personales en ${S}. Esta política explica qué datos tratamos, para qué y qué derechos tienes. Contacto: ${MAIL}.`,
    sections: [
      {
        title: "Qué datos recolectamos",
        body: [
          "Cuenta: email, nombre y datos de acceso, gestionados por nuestro proveedor de autenticación (Clerk).",
          "Contenido: tus tareas (título, categoría, descripción, prioridad, duración, fecha), tus mensajes a Milo y un resumen breve generado por IA sobre tus hábitos y preferencias (la \"memoria\" de Milo).",
          "Suscripción: plan contratado, estado y email de pago. Los datos de tarjeta los procesa el procesador de pagos y no llegan a nosotros.",
          "Uso: contadores de uso diario de las funciones de IA y registros técnicos de errores."
        ]
      },
      {
        title: "Para qué los usamos",
        body: [
          "Para prestarte el Servicio (guardar tus tareas, responder con Milo, recomendarte prioridades), gestionar tu suscripción, aplicar límites de uso, prevenir abueres y mejorar la estabilidad del Servicio. No vendemos tus datos ni los usamos para publicidad."
        ]
      },
      {
        title: "Con quién los compartimos",
        body: [
          "Usamos proveedores que tratan datos por nuestra cuenta: Clerk (autenticación), Neon (base de datos), Vercel (alojamiento), Groq (modelos de IA que procesan tus mensajes y tareas), Tavily (búsqueda web cuando Milo la usa; se envían los términos de la consulta), Mercado Pago y, cuando esté disponible, Lemon Squeezy u otro procesador (pagos).",
          "Estos proveedores pueden estar ubicados fuera de Argentina, incluidos Estados Unidos, por lo que tus datos pueden transferirse internacionalmente. Solo los compartimos en la medida necesaria para prestar el Servicio."
        ]
      },
      {
        title: "Inteligencia artificial",
        body: [
          "Lo que escribes en el chat de Milo y las tareas relevantes se envían al proveedor de IA para generar respuestas. No introduzcas información sensible (contraseñas, datos bancarios, datos de salud) en el chat."
        ]
      },
      {
        title: "Cookies y almacenamiento local",
        body: [
          "Usamos cookies esenciales para mantener tu sesión iniciada (Clerk) y almacenamiento local del navegador para recordar tu idioma. No usamos cookies publicitarias ni de seguimiento de terceros."
        ]
      },
      {
        title: "Conservación",
        body: [
          "Conservamos tus datos mientras tu cuenta esté activa. Si pides la eliminación de tu cuenta, borramos tus tareas, tu memoria de Milo y tus datos asociados, salvo lo que debamos conservar por obligaciones legales o contables (por ejemplo, registros de facturación)."
        ]
      },
      {
        title: "Tus derechos",
        body: [
          `Puedes acceder, rectificar y suprimir tus datos y oponerte a su tratamiento escribiendo a ${MAIL}. Respondemos dentro de los plazos legales.`,
          "En Argentina, la Agencia de Acceso a la Información Pública (AAIP), órgano de control de la Ley 25.326 de Protección de Datos Personales, tiene la atribución de atender denuncias y reclamos relacionados con el incumplimiento de las normas de protección de datos personales.",
          "Si estás en el Espacio Económico Europeo o el Reino Unido, también tienes los derechos que reconoce el GDPR, incluido el de reclamar ante tu autoridad de control."
        ]
      },
      {
        title: "Seguridad",
        body: [
          "Aplicamos medidas técnicas razonables (conexiones cifradas, control de acceso por usuario), pero ningún sistema es 100% seguro."
        ]
      },
      {
        title: "Menores y cambios",
        body: [
          "El Servicio no está dirigido a menores de 18 años. Podemos actualizar esta política; publicaremos la nueva versión con su fecha y, si el cambio es importante, te avisaremos."
        ]
      }
    ]
  },
  en: {
    title: "Privacy Policy",
    intro: `${OP} (Tax ID ${TAX}), located at ${ADDR}, is the controller of your personal data in ${S}. This policy explains what data we process, why, and your rights. Contact: ${MAIL}.`,
    sections: [
      {
        title: "Data we collect",
        body: [
          "Account: email, name and sign-in data, managed by our authentication provider (Clerk).",
          "Content: your tasks (title, category, description, priority, duration, date), your messages to Milo, and a short AI-generated summary of your habits and preferences (Milo's \"memory\").",
          "Subscription: plan, status and billing email. Card details are handled by the payment processor and never reach us.",
          "Usage: daily usage counters for AI features and technical error logs."
        ]
      },
      {
        title: "How we use it",
        body: [
          "To provide the Service (store your tasks, answer with Milo, recommend priorities), manage your subscription, enforce usage limits, prevent abuse and keep the Service stable. We do not sell your data or use it for advertising."
        ]
      },
      {
        title: "Who we share it with",
        body: [
          "We use providers that process data on our behalf: Clerk (authentication), Neon (database), Vercel (hosting), Groq (AI models that process your messages and tasks), Tavily (web search when Milo uses it; the query terms are sent), Mercado Pago and, when available, Lemon Squeezy or another processor (payments).",
          "These providers may be located outside Argentina, including the United States, so your data may be transferred internationally. We share it only as needed to provide the Service."
        ]
      },
      {
        title: "Artificial intelligence",
        body: [
          "What you type in Milo's chat and relevant tasks are sent to the AI provider to generate answers. Do not enter sensitive information (passwords, banking or health data) in the chat."
        ]
      },
      {
        title: "Cookies and local storage",
        body: [
          "We use essential cookies to keep you signed in (Clerk) and browser local storage to remember your language. We do not use advertising or third-party tracking cookies."
        ]
      },
      {
        title: "Retention",
        body: [
          "We keep your data while your account is active. If you request account deletion, we delete your tasks, Milo's memory and associated data, except what we must keep for legal or accounting obligations (e.g. billing records)."
        ]
      },
      {
        title: "Your rights",
        body: [
          `You may access, correct and delete your data and object to its processing by writing to ${MAIL}. We respond within the legal deadlines.`,
          "In Argentina, the Access to Public Information Agency (AAIP), the supervisory authority under Law 25.326 on Personal Data Protection, handles complaints about breaches of data protection rules.",
          "If you are in the European Economic Area or the UK, you also have the rights granted by the GDPR, including the right to lodge a complaint with your supervisory authority."
        ]
      },
      {
        title: "Security",
        body: [
          "We apply reasonable technical measures (encrypted connections, per-user access control), but no system is 100% secure."
        ]
      },
      {
        title: "Minors and changes",
        body: [
          "The Service is not directed at people under 18. We may update this policy; we will publish the new version with its date and notify you of important changes."
        ]
      }
    ]
  }
};
