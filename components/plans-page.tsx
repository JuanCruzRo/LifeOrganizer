"use client";

import { Check, X, Zap } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: null,
    description: "Para empezar a organizarte sin compromiso.",
    cta: "Empezar gratis",
    highlighted: false,
    features: [
      { text: "Hasta 15 tareas", included: true },
      { text: "Vista de calendario", included: true },
      { text: "Organización por categoría y prioridad", included: true },
      { text: "Chat con Milo", included: false },
      { text: "Recomendación de prioridad con IA", included: false },
      { text: "Ayuda profunda por tarea con IA", included: false },
      { text: "Tareas ilimitadas", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 6,
    description: "La versión completa con toda la inteligencia de Milo.",
    cta: "Suscribirse a Pro",
    highlighted: true,
    features: [
      { text: "Tareas ilimitadas", included: true },
      { text: "Vista de calendario", included: true },
      { text: "Organización por categoría y prioridad", included: true },
      { text: "Chat con Milo", included: true },
      { text: "Recomendación de prioridad con IA", included: true },
      { text: "Ayuda profunda por tarea con IA", included: true },
      { text: "Acceso a todas las funciones futuras", included: true },
    ],
  },
] as const;

export function PlansPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      {/* Header */}
      <motion.div
        className="mb-12 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
          <Zap className="h-3 w-3" />
          Planes
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Simple y sin sorpresas
        </h1>
        <p className="mt-3 max-w-sm text-muted-foreground">
          Empezá gratis. Cuando quieras más de Milo, actualizá a Pro.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="flex w-full max-w-2xl flex-col gap-4 sm:flex-row">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.id}
            className={cn(
              "relative flex flex-1 flex-col rounded-2xl border p-6",
              plan.highlighted
                ? "border-primary/50 bg-primary/5"
                : "border-border bg-card"
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                  Recomendado
                </span>
              </div>
            )}

            {/* Plan name & price */}
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Spark
              </p>
              <h2 className="mt-1 text-2xl font-bold">{plan.name}</h2>
              <div className="mt-3 flex items-end gap-1">
                {plan.price ? (
                  <>
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="mb-1 text-sm text-muted-foreground">/mes</span>
                  </>
                ) : (
                  <span className="text-4xl font-bold">Gratis</span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
            </div>

            {/* Features */}
            <ul className="mb-8 flex flex-col gap-3">
              {plan.features.map((feat) => (
                <li key={feat.text} className="flex items-start gap-2.5 text-sm">
                  {feat.included ? (
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  ) : (
                    <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground/40" />
                  )}
                  <span className={feat.included ? "text-foreground" : "text-muted-foreground/50"}>
                    {feat.text}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-auto">
              <Button
                className="w-full"
                variant={plan.highlighted ? "default" : "outline"}
                onClick={() => {
                  // TODO: connect Stripe or redirect to register
                  window.location.href = "/";
                }}
              >
                {plan.cta}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer note */}
      <motion.p
        className="mt-8 text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        Pagos seguros. Cancelá cuando quieras. Sin costos ocultos.
      </motion.p>
    </div>
  );
}
