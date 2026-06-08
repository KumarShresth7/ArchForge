"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      name: name || email.split("@")[0],
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError("Sign in failed. Please try again.");
    } else {
      window.location.href = "/dashboard";
    }
  };

  const githubEnabled = process.env.NEXT_PUBLIC_GITHUB_ENABLED === "true";

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-xl font-bold text-white shadow-lg shadow-sky-500/30">
          A
        </div>
        <h1 className="text-2xl font-bold text-zinc-100">Welcome to ArchForge</h1>
        <p className="mt-2 text-sm text-zinc-500">Sign in to save progress across devices</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/5 bg-zinc-900/50 p-6 backdrop-blur-xl">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-500">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-white/10 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-sky-500/50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-500">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Optional"
            className="w-full rounded-xl border border-white/10 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-sky-500/50"
          />
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Continue with Email"}
        </button>

        {githubEnabled && (
          <>
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-xs text-zinc-600">
                <span className="bg-zinc-900 px-2">or</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              className="w-full rounded-xl border border-white/10 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              Continue with GitHub
            </button>
          </>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600">
        <Link href="/problems" className="text-zinc-400 hover:text-zinc-200">
          Browse problems without signing in →
        </Link>
      </p>
    </div>
  );
}
