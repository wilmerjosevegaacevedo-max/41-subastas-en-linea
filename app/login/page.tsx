import { LoginForm } from "@/features/accounts/ui/login-form";
import { Suspense } from "react";

function LoginFormFallback() {
  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-stone-900 border border-stone-800 animate-pulse text-center">
      <div className="h-6 w-32 bg-stone-800 rounded mx-auto mb-4" />
      <div className="h-4 w-48 bg-stone-800 rounded mx-auto mb-6" />
      <div className="h-32 bg-stone-950 rounded mb-4" />
      <div className="h-10 bg-stone-800 rounded" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-stone-950">
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
