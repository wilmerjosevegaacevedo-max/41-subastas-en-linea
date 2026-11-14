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
    <div className="mb-6 p-4 rounded-xl bg-stone-950 border border-amber-500/30">
      <p className="text-xs font-semibold text-amber-400 tracking-wider uppercase mb-3">
        Acceso Rápido para Pruebas y Evaluación
      </p>
      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => onSelectDemo("comprador-demo-01")}
          className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-stone-950 font-medium text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-50"
        >
          Entrar como Comprador Demo (Carlos)
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => onSelectDemo("vendedor-demo-01")}
          className="w-full py-2.5 px-4 rounded-lg bg-stone-800 hover:bg-stone-700 active:scale-[0.98] text-stone-200 font-medium text-sm transition-all border border-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-50"
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
        <div role="alert" className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs">
          <p>{errorMessage}</p>
        </div>
      )}

      <div>
        <label htmlFor="login-email" className="block text-xs font-medium text-stone-300 mb-1.5">
          Correo Electrónico
        </label>
        <input
          id="login-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu-correo@ejemplo.com"
          className="w-full px-3.5 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
        />
      </div>

      <div>
        <label htmlFor="login-password" className="block text-xs font-medium text-stone-300 mb-1.5">
          Contraseña
        </label>
        <input
          id="login-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3.5 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 w-full py-2.5 px-4 rounded-lg bg-stone-100 hover:bg-white active:scale-[0.98] text-stone-950 font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 disabled:opacity-50"
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
    <div className="w-full max-w-md mx-auto p-6 md:p-8 rounded-2xl bg-stone-900 border border-stone-800 shadow-xl text-stone-100">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-amber-400">Iniciar Sesión</h1>
        <p className="mt-2 text-sm text-stone-400">Ingresa a tu cuenta para realizar pujas o publicar tus subastas</p>
      </div>

      <DemoAccountsSection
        isLoading={isLoading}
        onSelectDemo={(uid) => {
          void handleDemoLogin(uid);
        }}
      />

      <div className="relative my-6 flex items-center justify-center">
        <div className="w-full border-t border-stone-800" />
        <strong className="absolute px-3 bg-stone-900 text-xs text-stone-500 font-normal uppercase tracking-widest">
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
