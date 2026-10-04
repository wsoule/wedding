"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="mt-8 space-y-3">
      <label className="block">
        <span className="mb-1.5 block font-medium">Password</span>
        <input name="password" type="password" autoComplete="current-password" required className="field" autoFocus />
      </label>
      {error && (
        <p role="alert" className="text-foxglove-dark">
          {error}
        </p>
      )}
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
