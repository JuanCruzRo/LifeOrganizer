import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LegalLinks } from "@/components/legal/legal-links";
import { LEGAL } from "@/lib/legal-config";

export const metadata: Metadata = {
  title: "Spark — Organizador de tareas con IA en español",
  description:
    "Spark es tu organizador de tareas con IA. Milo te ayuda a priorizar, agendar y decidir qué hacer hoy. Empezá gratis.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Spark — Organizador de tareas con IA",
    description: "Cargá tus tareas y dejá que Milo te diga qué conviene hacer hoy.",
    type: "website",
    locale: "es_AR"
  }
};

const features = [
  {
    title: "Sabe qué hacer primero",
    text: "Cruza prioridad, vencimiento y tiempo disponible para recomendarte la tarea que más conviene hoy."
  },
  {
    title: "Milo, tu asistente",
    text: "Chateá con una IA que conoce tu lista de tareas, busca en la web y recuerda tus hábitos."
  },
  {
    title: "Agendá hablando",
    text: 'Decile "recordame el banco cada martes" y Milo crea las tareas por vos.'
  },
  {
    title: "Calendario y estadísticas",
    text: "Mirá tu semana de un vistazo y seguí tu progreso con las tareas completadas."
  }
];

const steps = [
  { n: "1", title: "Cargá tus tareas", text: "Con título, prioridad, duración y fecha. Toma segundos." },
  { n: "2", title: "Spark las ordena", text: "Un scoring claro y la IA de Milo eligen lo más importante." },
  { n: "3", title: "Hacé y marcá", text: "Empezá por lo que importa y mirá cómo avanzás." }
];

const plans = [
  {
    name: "Free",
    price: "Gratis",
    note: "Para probar",
    items: ["Hasta 15 tareas", "Chat con Milo", "Vista de calendario", "Categorías y prioridades"],
    cta: "Empezar gratis",
    highlight: false
  },
  {
    name: "Plus",
    price: `US$${LEGAL.prices.plus}`,
    note: `por mes · ${LEGAL.trialDays} días gratis`,
    items: ["Tareas ilimitadas", "Creá tareas chateando con Milo", "Recomendación de prioridad con IA", "Vista de calendario"],
    cta: "Probar Plus gratis",
    highlight: true
  },
  {
    name: "Pro",
    price: `US$${LEGAL.prices.pro}`,
    note: "por mes",
    items: ["Todo lo de Plus", "Ayuda profunda por tarea con IA", "Búsqueda web avanzada", "Soporte prioritario"],
    cta: "Elegir Pro",
    highlight: false
  }
];

const faqs = [
  {
    q: "¿Es gratis?",
    a: "Sí, el plan Free no tiene costo ni pide tarjeta. Si querés más, podés probar Plus 14 días sin cargo."
  },
  {
    q: "¿Puedo cancelar cuando quiera?",
    a: "Sí. Cancelás desde tu cuenta cuando quieras y seguís con el plan hasta el final del período pagado."
  },
  {
    q: "¿Cómo se paga?",
    a: "En Argentina con Mercado Pago. Los precios de referencia son en dólares."
  },
  {
    q: "¿La IA es siempre correcta?",
    a: "No. Milo es una ayuda y puede equivocarse: verificá lo importante antes de actuar en base a sus respuestas."
  },
  {
    q: "¿Qué pasa con mis datos?",
    a: "Tus tareas son tuyas. No vendemos tus datos ni los usamos para publicidad. Más detalles en la Política de privacidad."
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Spark",
      applicationCategory: "ProductivityApplication",
      operatingSystem: "Web",
      description: "Organizador de tareas con asistente de IA.",
      offers: [
        { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
        { "@type": "Offer", name: "Plus", price: String(LEGAL.prices.plus), priceCurrency: "USD" },
        { "@type": "Offer", name: "Pro", price: String(LEGAL.prices.pro), priceCurrency: "USD" }
      ]
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a }
      }))
    }
  ]
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <span className="font-display text-lg font-semibold tracking-tight">⚡ Spark</span>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/sign-in" className="px-3 py-2 text-muted-foreground hover:text-foreground">
            Ingresar
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90"
          >
            Empezar gratis
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-20 pt-12 md:grid-cols-2 md:pt-20">
          <div>
            <p className="mb-4 inline-block rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              Organizador de tareas con IA
            </p>
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
              Dejá de pensar qué hacer primero.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Cargá tus tareas y Milo, tu asistente con IA, te dice qué conviene hacer hoy según prioridad,
              vencimiento y tiempo disponible.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/sign-up"
                className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90"
              >
                Empezar gratis
              </Link>
              <a href="#planes" className="rounded-lg border border-border px-6 py-3 hover:bg-secondary">
                Ver planes
              </a>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Sin tarjeta. Cancelás cuando quieras.</p>
          </div>
          <div className="flex justify-center">
            <Image
              src="/Mascot.png"
              alt="Milo, el asistente de Spark"
              width={360}
              height={360}
              priority
              className="h-auto w-64 md:w-80"
            />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-3xl font-semibold">Todo lo que necesitás para organizarte</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-3xl font-semibold">Cómo funciona</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n} className="rounded-xl border border-border bg-card p-5">
                <span className="font-display text-2xl text-primary">{s.n}</span>
                <h3 className="mt-2 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="planes" className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-3xl font-semibold">Planes simples, sin sorpresas</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`flex flex-col rounded-xl border bg-card p-6 ${
                  p.highlight ? "border-primary" : "border-border"
                }`}
              >
                <h3 className="font-semibold">{p.name}</h3>
                <p className="mt-3 font-display text-4xl font-semibold">{p.price}</p>
                <p className="text-xs text-muted-foreground">{p.note}</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm">
                  {p.items.map((item) => (
                    <li key={item}>✓ {item}</li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className={`mt-6 rounded-lg px-4 py-2.5 text-center font-medium ${
                    p.highlight ? "bg-primary text-primary-foreground" : "border border-border hover:bg-secondary"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Precios de referencia en dólares. En Argentina el cobro se realiza en pesos vía Mercado Pago.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-16">
          <h2 className="font-display text-3xl font-semibold">Preguntas frecuentes</h2>
          <div className="mt-6 space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="rounded-xl border border-border bg-card p-4">
                <summary className="cursor-pointer font-medium">{f.q}</summary>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 text-center">
          <h2 className="font-display text-3xl font-semibold">Empezá hoy, es gratis</h2>
          <Link
            href="/sign-up"
            className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90"
          >
            Crear mi cuenta
          </Link>
        </section>
      </main>

      <footer className="border-t border-border px-5 py-8">
        <LegalLinks />
        <p className="mt-3 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {LEGAL.serviceName} · {LEGAL.operatorName}
        </p>
      </footer>
    </div>
  );
}
