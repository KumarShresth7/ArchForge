const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

import type { DashboardData, ProblemProgress, ProgressMap } from "./types";
import type { DraftGraph } from "./drafts";

export async function authFetch(path: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function fetchDashboard(token: string): Promise<DashboardData> {
  return authFetch("/api/dashboard", token);
}

export async function fetchServerProgress(token: string): Promise<ProgressMap> {
  const rows = await authFetch("/api/progress", token) as Array<{
    problem_slug: string;
    status: string;
    best_score: number | null;
    attempt_count: number;
    last_attempt_at: string | null;
  }>;
  const map: ProgressMap = {};
  for (const row of rows) {
    map[row.problem_slug] = {
      status: row.status as ProblemProgress["status"],
      bestScore: row.best_score,
      attemptCount: row.attempt_count,
      lastAttemptAt: row.last_attempt_at,
    };
  }
  return map;
}

export async function fetchServerDraft(token: string, slug: string): Promise<DraftGraph | null> {
  const draft = await authFetch(`/api/drafts/${slug}`, token);
  if (!draft) return null;
  return draft.graph_json as DraftGraph;
}

export async function saveServerDraft(token: string, slug: string, graph: DraftGraph) {
  return authFetch(`/api/drafts/${slug}`, token, {
    method: "PUT",
    body: JSON.stringify({ graph_json: graph }),
  });
}

export async function deleteServerDraft(token: string, slug: string) {
  return authFetch(`/api/drafts/${slug}`, token, { method: "DELETE" });
}

export async function syncLocalDataToServer(
  token: string,
  progress: ProgressMap,
  drafts: Record<string, DraftGraph>
) {
  const progressPayload: Record<string, Record<string, unknown>> = {};
  for (const [slug, p] of Object.entries(progress)) {
    progressPayload[slug] = {
      status: p.status,
      bestScore: p.bestScore,
      attemptCount: p.attemptCount,
      lastAttemptAt: p.lastAttemptAt,
    };
  }
  return authFetch("/api/users/me/sync-local", token, {
    method: "POST",
    body: JSON.stringify({ progress: progressPayload, drafts }),
  });
}

export async function fetchProblemContext(
  slug: string,
  token?: string
): Promise<import("./types").ProblemContext | null> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/problems/${slug}/context`, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchSubmission(token: string, id: string): Promise<import("./types").SubmissionDetail> {
  return authFetch(`/api/submissions/${id}`, token);
}

export async function fetchSubmissions(
  token: string,
  problemSlug?: string,
  limit = 20
): Promise<import("./types").SubmissionSummary[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (problemSlug) params.set("problem_slug", problemSlug);
  return authFetch(`/api/submissions?${params}`, token);
}

export async function fetchNote(token: string, slug: string): Promise<{ content: string; updated_at: string | null }> {
  return authFetch(`/api/notes/${slug}`, token);
}

export async function saveNote(token: string, slug: string, content: string) {
  return authFetch(`/api/notes/${slug}`, token, {
    method: "PUT",
    body: JSON.stringify({ content }),
  });
}
