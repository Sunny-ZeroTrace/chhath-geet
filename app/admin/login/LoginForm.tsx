"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("Incorrect email or password.");
        return;
      }

      const redirectTo = searchParams.get("redirectedFrom") || "/admin";
      router.replace(redirectTo);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-xs uppercase tracking-wide text-cream/60">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gold-500/20 bg-ghat-900/60 px-4 py-2.5 text-sm text-cream focus:border-gold-500/60 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-xs uppercase tracking-wide text-cream/60">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gold-500/20 bg-ghat-900/60 px-4 py-2.5 text-sm text-cream focus:border-gold-500/60 focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-gold-500 py-2.5 text-sm font-semibold text-ghat-900 transition hover:bg-gold-400 disabled:opacity-60"
      >
        {isPending ? "Logging in…" : "Login"}
      </button>
    </form>
  );
}
