const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

import type { ProblemDetail, ProblemSummary } from "./types";

export async function fetchProblems(): Promise<ProblemSummary[]> {
  const res = await fetch(`${API_BASE}/api/problems`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to fetch problems");
  return res.json();
}

export async function fetchProblem(slug: string): Promise<ProblemDetail> {
  const res = await fetch(`${API_BASE}/api/problems/${slug}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Problem not found");
  return res.json();
}

export function getWsUrl(sessionId: string): string {
  const base = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";
  return `${base}/ws/${sessionId}`;
}

export function getApiBase(): string {
  return API_BASE;
}
