"use client";

import { useSearchParams } from "next/navigation";
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

interface LoginFormInputsProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
}

function LoginFormInputs({ email, setEmail, password, setPassword }: LoginFormInputsProps) {
  return (
    <>
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
    </>
  );
}

interface LoginTabProps {
  redirectUrl: string;
}

function LoginTabContent({ redirectUrl }: LoginTabProps) {
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
      window.location.assign(redirectUrl);
    } catch {
      setErrorMessage("Error de conexión al iniciar sesión");
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email.trim() === "" || password.length < 6) {
      setErrorMessage("Por favor ingresa un correo válido y contraseña de al menos 6 caracteres");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        setErrorMessage("Correo o contraseña incorrectos");
        setIsLoading(false);
        return;
      }

      AuthSessionResponseSchema.parse(await res.json());
      window.location.assign(redirectUrl);
    } catch {
      setErrorMessage("Error de conexión al iniciar sesión");
      setIsLoading(false);
    }
  };

  return (
    <div>
      <DemoAccountsSection
        isLoading={isLoading}
        onSelectDemo={(uid) => {
          void handleDemoLogin(uid);
        }}
      />

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <p className="text-xs text-ink-muted font-medium uppercase tracking-widest whitespace-nowrap">
          O con credenciales
        </p>
        <div className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
        {errorMessage !== null && (
          <div role="alert" className="p-3 rounded-lg bg-red-50 border border-danger/30 text-danger text-xs">
            <p>{errorMessage}</p>
          </div>
        )}

        <LoginFormInputs email={email} setEmail={setEmail} password={password} setPassword={setPassword} />

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full py-2.5 px-4 rounded-lg bg-ink hover:bg-slate-800 active:scale-[0.98] text-white font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
}

interface RegisterFormInputsProps {
  nombre: string;
  setNombre: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  rol: "COMPRADOR" | "VENDEDOR";
  setRol: (val: "COMPRADOR" | "VENDEDOR") => void;
}

function RegisterFormInputs({
  nombre,
  setNombre,
  email,
  setEmail,
  password,
  setPassword,
  rol,
  setRol,
}: RegisterFormInputsProps) {
  return (
    <>
      <div>
        <label htmlFor="register-nombre" className="block text-xs font-medium text-ink-muted mb-1.5">
          Nombre Completo
        </label>
        <input
          id="register-nombre"
          type="text"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej. Juan Pérez"
          className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-control-border text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>

      <div>
        <label htmlFor="register-email" className="block text-xs font-medium text-ink-muted mb-1.5">
          Correo Electrónico
        </label>
        <input
          id="register-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu-correo@ejemplo.com"
          className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-control-border text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>

      <div>
        <label htmlFor="register-password" className="block text-xs font-medium text-ink-muted mb-1.5">
          Contraseña (mínimo 6 caracteres)
        </label>
        <input
          id="register-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-control-border text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>

      <div>
        <label htmlFor="register-rol" className="block text-xs font-medium text-ink-muted mb-1.5">
          Tipo de Cuenta
        </label>
        <select
          id="register-rol"
          value={rol}
          onChange={(e) => {
            if (e.target.value === "VENDEDOR") {
              setRol("VENDEDOR");
            } else {
              setRol("COMPRADOR");
            }
          }}
          className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-control-border text-ink focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        >
          <option value="COMPRADOR">Comprador (Participar en pujas)</option>
          <option value="VENDEDOR">Vendedor (Publicar y subastar artículos)</option>
        </select>
      </div>
    </>
  );
}

interface RegisterTabProps {
  redirectUrl: string;
}

function RegisterTabContent({ redirectUrl }: RegisterTabProps) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<"COMPRADOR" | "VENDEDOR">("COMPRADOR");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (nombre.trim().length < 2) {
      setErrorMessage("El nombre debe tener al menos 2 caracteres");
      return;
    }
    if (email.trim() === "" || password.length < 6) {
      setErrorMessage("Por favor ingresa un correo válido y contraseña de al menos 6 caracteres");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          email: email.trim(),
          password,
          rol,
        }),
      });

      if (!res.ok) {
        if (res.status === 409) {
          setErrorMessage("El correo electrónico ya se encuentra registrado");
        } else {
          setErrorMessage("Error al registrar usuario. Verifica los datos.");
        }
        setIsLoading(false);
        return;
      }

      AuthSessionResponseSchema.parse(await res.json());
      window.location.assign(redirectUrl);
    } catch {
      setErrorMessage("Error de conexión al registrar usuario");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
      {errorMessage !== null && (
        <div role="alert" className="p-3 rounded-lg bg-red-50 border border-danger/30 text-danger text-xs">
          <p>{errorMessage}</p>
        </div>
      )}

      <RegisterFormInputs
        nombre={nombre}
        setNombre={setNombre}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        rol={rol}
        setRol={setRol}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-hover active:scale-[0.98] text-white font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
      >
        Crear Cuenta
      </button>
    </form>
  );
}

interface TabsProps {
  activeTab: "login" | "register";
  onChange: (tab: "login" | "register") => void;
}

function TabsHeader({ activeTab, onChange }: TabsProps) {
  let loginClass = "flex-1 py-2 text-xs font-semibold rounded-md transition-all text-ink-muted hover:text-ink";
  let registerClass = "flex-1 py-2 text-xs font-semibold rounded-md transition-all text-ink-muted hover:text-ink";

  if (activeTab === "login") {
    loginClass = "flex-1 py-2 text-xs font-semibold rounded-md transition-all bg-surface text-ink shadow-sm";
  } else {
    registerClass = "flex-1 py-2 text-xs font-semibold rounded-md transition-all bg-surface text-ink shadow-sm";
  }

  return (
    <div className="flex rounded-lg bg-surface-alt p-1 mb-6 border border-line" role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "login"}
        onClick={() => onChange("login")}
        className={loginClass}
      >
        Iniciar Sesión
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "register"}
        onClick={() => onChange("register")}
        className={registerClass}
      >
        Crear Cuenta
      </button>
    </div>
  );
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect");
  let redirectUrl = "/";
  if (rawRedirect !== null && rawRedirect.startsWith("/")) {
    redirectUrl = rawRedirect;
  }

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  let title = "Crear Cuenta";
  let subtitle = "Regístrate para comenzar a comprar o vender en la plataforma";
  if (activeTab === "login") {
    title = "Iniciar Sesión";
    subtitle = "Ingresa a tu cuenta para realizar pujas o publicar tus subastas";
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-8 rounded-2xl bg-surface border border-line shadow-lg text-ink">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
        <p className="mt-2 text-sm text-ink-muted">{subtitle}</p>
      </div>

      <TabsHeader activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "login" && <LoginTabContent redirectUrl={redirectUrl} />}
      {activeTab === "register" && <RegisterTabContent redirectUrl={redirectUrl} />}
    </div>
  );
}
