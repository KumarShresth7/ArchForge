"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { getProgressMap } from "@/lib/progress";
import { syncLocalDataToServer } from "@/lib/auth-api";

const DRAFT_PREFIX = "archforge_draft_";

function collectLocalDrafts(): Record<string, unknown> {
  const drafts: Record<string, unknown> = {};
  if (typeof window === "undefined") return drafts;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(DRAFT_PREFIX)) {
      const slug = key.replace(DRAFT_PREFIX, "");
      try {
        drafts[slug] = JSON.parse(localStorage.getItem(key)!);
      } catch {
        /* skip invalid */
      }
    }
  }
  return drafts;
}

export default function AuthSync() {
  const { data: session, status } = useSession();
  const synced = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.accessToken || synced.current) return;

    const progress = getProgressMap();
    const drafts = collectLocalDrafts();
    const hasLocal = Object.keys(progress).length > 0 || Object.keys(drafts).length > 0;

    if (hasLocal) {
      syncLocalDataToServer(session.accessToken, progress, drafts as Record<string, import("@/lib/drafts").DraftGraph>)
        .then(() => {
          synced.current = true;
        })
        .catch(console.error);
    } else {
      synced.current = true;
    }
  }, [status, session]);

  return null;
}
