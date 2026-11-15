"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthSessionResponseSchema } from "../schema";

interface DemoAccountsProps {
  isLoading: boolean;
  onSelectDemo: (uid: "comprador-demo-01" | "vendedor-demo-01") => void;
}

function DemoAccountsSection({ isLoading, onSelectDemo }: DemoAccountsProps) {
  return (
    <div className="mb-6 p-4 rounded-xl bg-surface-alt border border-line">
      <p className="text-xs font-semibold text-primary tracking-wider uppercase mb-3">
        Acceso Rápido para Pruebas y Evaluación
      </p>
      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => onSelectDemo("comprador-demo-01")}
          className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-hover active:scale-[0.98] text-white font-medium text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
        >
          Entrar como Comprador Demo (Carlos)
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => onSelectDemo("vendedor-demo-01")}
          className="w-full py-2.5 px-4 rounded-lg bg-surface hover:bg-surface-strong active:scale-[0.98] text-ink font-medium text-sm transition-all border border-control-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
        >
          Entrar como Vendedor Demo (Valeria)
        </button>
      </div>
    </div>
  );
}

interface CredentialsFormProps {
  isLoading: boolean;
  errorMessage: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
}

function CredentialsForm({
  isLoading,
  errorMessage,
  onSubmit,
  email,
  setEmail,
  password,
  setPassword,
}: CredentialsFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {errorMessage !== null && (
        <div role="alert" className="p-3 rounded-lg bg-red-50 border border-danger/30 text-danger text-xs">
          <p>{errorMessage}</p>
        </div>
      )}

      <div>
        <label htmlFor="login-email" className="block text-xs font-medium text-ink-muted mb-1.5">
          Correo Electrónico
        </label>
        <input
          id="login-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu-correo@ejemplo.com"
          className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-control-border text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>

      <div>
        <label htmlFor="login-password" className="block text-xs font-medium text-ink-muted mb-1.5">
          Contraseña
        </label>
        <input
          id="login-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-control-border text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 w-full py-2.5 px-4 rounded-lg bg-ink hover:bg-slate-800 active:scale-[0.98] text-white font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
      >
        Acceder con Correo
      </button>
    </form>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect");
  let redirectUrl = "/";
  if (rawRedirect !== null && rawRedirect.startsWith("/")) {
    redirectUrl = rawRedirect;
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = async (demoUid: "comprador-demo-01" | "vendedor-demo-01") => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demo_uid: demoUid }),
      });

      if (!res.ok) {
        setErrorMessage("No se pudo iniciar sesión con la cuenta demo");
        setIsLoading(false);
        return;
      }

      AuthSessionResponseSchema.parse(await res.json());
      router.push(redirectUrl);
      router.refresh();
    } catch {
      setErrorMessage("Error de conexión al iniciar sesión");
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email.trim() === "" || password.length < 6) {
      setErrorMessage("Por favor ingresa un correo válido y contraseña de al menos 6 caracteres");
      return;
    }

    void handleDemoLogin("comprador-demo-01");
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-8 rounded-2xl bg-surface border border-line shadow-lg text-ink">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Iniciar Sesión</h1>
        <p className="mt-2 text-sm text-ink-muted">Ingresa a tu cuenta para realizar pujas o publicar tus subastas</p>
      </div>

      <DemoAccountsSection
        isLoading={isLoading}
        onSelectDemo={(uid) => {
          void handleDemoLogin(uid);
        }}
      />

      <div className="relative my-6 flex items-center justify-center">
        <div className="w-full border-t border-line" />
        <strong className="absolute px-3 bg-surface text-xs text-ink-muted font-medium uppercase tracking-widest">
          O con credenciales
        </strong>
      </div>

      <CredentialsForm
        isLoading={isLoading}
        errorMessage={errorMessage}
        onSubmit={handleSubmit}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
      />
    </div>
  );
}
