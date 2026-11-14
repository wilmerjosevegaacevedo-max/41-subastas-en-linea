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
    return <div className="h-8 w-24 rounded bg-stone-800 animate-pulse" aria-hidden="true" />;
  }

  if (user === null) {
    return (
      <Link
        href="/login"
        className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-semibold text-xs tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        Iniciar Sesión
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex flex-col text-right">
        <p className="text-xs font-medium text-stone-200 leading-tight">{user.nombre}</p>
        <p className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold">{user.rol}</p>
      </div>
      <button
        type="button"
        onClick={() => void handleLogout()}
        className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-300 hover:text-stone-100 text-xs transition-all border border-stone-700"
        title="Cerrar Sesión"
      >
        Salir
      </button>
    </div>
  );
}
