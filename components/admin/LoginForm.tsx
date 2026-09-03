"use client";

import { useActionState } from "react";
import { login, verifyTotpCode, type LoginState } from "@/app/admin/actions";

const initialState: LoginState = {};

export default function LoginForm() {
  const [credState, credAction, credPending] = useActionState(login, initialState);
  const [codeState, codeAction, codePending] = useActionState(verifyTotpCode, initialState);

  const step = credState.step === "totp" ? "totp" : "credentials";

  return (
    <div className="flex h-screen items-center justify-center px-4">
      {step === "credentials" ? (
        <form action={credAction} className="flex w-full max-w-xs flex-col gap-3">
          <h1 className="mb-2 text-center text-xl font-semibold">Admin login</h1>

          <label className="flex flex-col gap-1 text-sm">
            Email
            <input
              type="email"
              name="email"
              autoComplete="username"
              required
              className="rounded border border-gray-300 px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              className="rounded border border-gray-300 px-3 py-2"
            />
          </label>

          {credState?.error && <p className="text-sm text-red-600">{credState.error}</p>}

          <button
            type="submit"
            disabled={credPending}
            className="mt-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-60 disabled:opacity-40"
          >
            {credPending ? "Checking…" : "Log in"}
          </button>
        </form>
      ) : (
        <form action={codeAction} className="flex w-full max-w-xs flex-col gap-3">
          <h1 className="mb-2 text-center text-xl font-semibold">Enter your code</h1>
          <p className="text-center text-sm text-gray-500">
            Open your authenticator app and enter the 6-digit code.
          </p>

          <label className="flex flex-col gap-1 text-sm">
            Code
            <input
              type="text"
              name="code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoComplete="one-time-code"
              autoFocus
              required
              className="rounded border border-gray-300 px-3 py-2 text-center text-lg tracking-widest"
            />
          </label>

          {codeState?.error && <p className="text-sm text-red-600">{codeState.error}</p>}

          <button
            type="submit"
            disabled={codePending}
            className="mt-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-60 disabled:opacity-40"
          >
            {codePending ? "Verifying…" : "Verify"}
          </button>
        </form>
      )}
    </div>
  );
}
