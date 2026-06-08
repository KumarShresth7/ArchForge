import type { ProblemProgress, ProblemStatus, ProgressMap } from "./types";

const PROGRESS_KEY = "archforge_progress";

const DEFAULT: ProblemProgress = {
  status: "not_started",
  bestScore: null,
  attemptCount: 0,
  lastAttemptAt: null,
};

export function getProgressMap(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function getProblemProgress(slug: string): ProblemProgress {
  return getProgressMap()[slug] ?? { ...DEFAULT };
}

export function recordSubmission(slug: string, score: number): ProblemProgress {
  const map = getProgressMap();
  const current = map[slug] ?? { ...DEFAULT };

  const bestScore =
    current.bestScore === null ? score : Math.max(current.bestScore, score);

  const status: ProblemStatus =
    bestScore >= 70 ? "solved" : "attempted";

  const updated: ProblemProgress = {
    status,
    bestScore,
    attemptCount: current.attemptCount + 1,
    lastAttemptAt: new Date().toISOString(),
  };

  map[slug] = updated;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
  return updated;
}

export function markInProgress(slug: string): void {
  const map = getProgressMap();
  const current = map[slug] ?? { ...DEFAULT };
  if (current.status === "not_started") {
    map[slug] = { ...current, status: "attempted" };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
  }
}

export function areHintsUnlockedLocally(slug: string): boolean {
  const p = getProblemProgress(slug);
  return p.attemptCount >= 1 && p.bestScore !== null && p.bestScore < 70;
}

export function getStats() {
  const map = getProgressMap();
  const entries = Object.values(map);
  return {
    total: entries.length,
    solved: entries.filter((p) => p.status === "solved").length,
    attempted: entries.filter((p) => p.status === "attempted").length,
    avgScore:
      entries.filter((p) => p.bestScore !== null).length > 0
        ? Math.round(
            entries
              .filter((p) => p.bestScore !== null)
              .reduce((sum, p) => sum + (p.bestScore ?? 0), 0) /
              entries.filter((p) => p.bestScore !== null).length
          )
        : null,
  };
}
