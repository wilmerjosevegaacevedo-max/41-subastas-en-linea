"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type AccountUser, AuthSessionResponseSchema } from "../schema";

export function SessionStatusBadge() {
  const router = useRouter();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok && isMounted) {
          const data = AuthSessionResponseSchema.parse(await res.json());
          setUser(data.usuario);
        }
      } catch {
        // No autenticado
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    }

    void checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      setUser(null);
      router.refresh();
    } catch {
      // Ignorar error al cerrar sesión
    }
  };

  if (!isLoaded) {
    return <div className="h-8 w-24 rounded bg-surface-strong animate-pulse" aria-hidden="true" />;
  }

  if (user === null) {
    return (
      <Link
        href="/login"
        className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover active:scale-95 text-white font-semibold text-xs tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Iniciar Sesión
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex flex-col text-right">
        <p className="text-xs font-semibold text-ink leading-tight">{user.nombre}</p>
        <p className="text-[10px] text-primary uppercase tracking-wider font-bold">{user.rol}</p>
      </div>
      <button
        type="button"
        onClick={() => void handleLogout()}
        className="px-2.5 py-1.5 rounded-md bg-surface hover:bg-surface-alt active:scale-95 text-ink-muted hover:text-ink text-xs font-medium transition-all border border-line"
        title="Cerrar Sesión"
      >
        Salir
      </button>
    </div>
  );
}
