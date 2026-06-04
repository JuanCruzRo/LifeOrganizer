"use client";

import { FormEvent, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "motion/react";
import { AnimatedLogo } from "@/components/animated-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signIn, signUp } from "@/lib/auth";

type LoginFormProps = {
  onLogin: (user: User) => void;
};

type Mode = "login" | "register";

export function LoginForm({ onLogin }: LoginFormProps) {
  const [logoComplete, setLogoComplete] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const user = await signIn(email, password);
        if (user) onLogin(user);
      } else {
        if (!name.trim()) { setError("Ingresá tu nombre."); setLoading(false); return; }
        const user = await signUp(email, password, name.trim());
        if (user) {
          if (!user.confirmed_at) {
            setRegistered(true);
          } else {
            onLogin(user);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  }

  if (registered) {
    return (
      <div className="flex h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            ✓
          </div>
          <h2 className="text-xl font-semibold">Revisá tu email</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Te enviamos un link de confirmación a <strong>{email}</strong>.
            Confirmá tu cuenta y volvé a iniciar sesión.
          </p>
          <Button className="mt-6 w-full" onClick={() => { setRegistered(false); setMode("login"); }}>
            Ir al login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">

        {/* Logo — el formulario aparece recién cuando onComplete se llama */}
        <AnimatedLogo onComplete={() => setLogoComplete(true)} />

        <AnimatePresence>
          {logoComplete && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              {/* Subtítulo */}
              <p className="mb-6 text-center text-sm text-muted-foreground">
                {mode === "login" ? "Iniciá sesión para continuar" : "Creá tu cuenta"}
              </p>

              {/* Mode tabs */}
              <div className="mb-6 flex rounded-xl border border-border p-1">
                {(["login", "register"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError(""); }}
                    className="relative flex-1 rounded-lg py-2 text-sm font-medium"
                  >
                    {mode === m && (
                      <motion.span
                        layoutId="tab-pill"
                        className="absolute inset-0 rounded-lg bg-primary"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className={cn(
                      "relative z-10 transition-colors duration-200",
                      mode === m ? "text-primary-foreground" : "text-muted-foreground"
                    )}>
                      {m === "login" ? "Iniciar sesión" : "Registrarse"}
                    </span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {mode === "register" && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Tu nombre"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                      autoComplete="name"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                </div>

                {error && (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <Button type="submit" disabled={loading} className="mt-1 w-full">
                  {loading
                    ? "Cargando..."
                    : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
