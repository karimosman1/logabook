"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "./actions";

type Props = {
  mode: "login" | "signup";
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
};

const inputClass =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const isSignup = mode === "signup";

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-line bg-paper-raised p-8 shadow-sm">
        <h1 className="font-serif text-3xl text-ink">Logabook</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {isSignup ? "Create your reading log." : "Welcome back. Log in to your shelf."}
        </p>

        <form action={formAction} className="mt-6 space-y-4" noValidate>
          {isSignup && (
            <label className="block text-sm">
              <span className="mb-1 block text-ink">Name (optional)</span>
              <input name="display_name" type="text" autoComplete="name" className={inputClass} />
            </label>
          )}
          <label className="block text-sm">
            <span className="mb-1 block text-ink">Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              defaultValue={state.email}
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink">Password</span>
            <input
              name="password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              minLength={6}
              className={inputClass}
            />
          </label>

          {state.error && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          )}
          {state.message && (
            <p role="status" className="rounded-md bg-accent/10 px-3 py-2 text-sm text-accent">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-accent px-4 py-2 font-medium text-white hover:bg-accent/90 disabled:opacity-60"
          >
            {pending ? "One moment…" : isSignup ? "Sign up" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          {isSignup ? "Already have an account? " : "New here? "}
          <Link href={isSignup ? "/login" : "/signup"} className="text-accent underline">
            {isSignup ? "Log in" : "Create an account"}
          </Link>
        </p>
      </div>
    </main>
  );
}
