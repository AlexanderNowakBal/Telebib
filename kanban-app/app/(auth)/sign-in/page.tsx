"use client";

import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const json = await res.json();
    if (json.data?.sent) {
      setSent(true);
    } else {
      setError(json.error?.message ?? "Erreur inconnue");
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-xl border bg-white p-8 shadow-sm text-center">
          <h1 className="text-2xl font-bold mb-3">Vérifiez vos emails</h1>
          <p className="text-neutral-600">
            Un lien de connexion a été envoyé à <strong>{email}</strong>.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-2">Connexion</h1>
        <p className="text-neutral-600 mb-6 text-sm">
          Entrez votre email pour recevoir un lien de connexion instantané.
        </p>

        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <div className="grid gap-1">
            <label htmlFor="email" className="text-sm font-medium">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              required
              autoComplete="email"
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-describedby={error ? "sign-in-error" : undefined}
            />
            {error && (
              <p id="sign-in-error" role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            aria-busy={loading}
          >
            {loading ? "Envoi…" : "Envoyer le lien"}
          </button>
        </form>
      </div>
    </main>
  );
}
