"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchNote, saveNote } from "@/lib/auth-api";
import { loadLocalNote, saveLocalNote } from "@/lib/notes";

export default function ProblemNotes({ problemSlug }: { problemSlug: string }) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    if (session?.accessToken) {
      try {
        const note = await fetchNote(session.accessToken, problemSlug);
        setContent(note.content);
        setSavedAt(note.updated_at);
      } catch {
        setContent("");
      }
    } else {
      setContent(loadLocalNote(problemSlug));
      setSavedAt(null);
    }
  }, [session?.accessToken, problemSlug]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      if (session?.accessToken) {
        try {
          const note = await saveNote(session.accessToken, problemSlug, content);
          setSavedAt(note.updated_at);
        } catch {
          /* ignore */
        }
      } else {
        saveLocalNote(problemSlug, content);
      }
    }, 800);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [content, problemSlug, session?.accessToken]);

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          My Notes
        </h3>
        {savedAt && (
          <span className="text-[10px] text-zinc-600">
            Saved {new Date(savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Jot down ideas, trade-offs, or things to revisit…"
        rows={4}
        className="w-full resize-none rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none focus:border-sky-500/40"
      />
      <p className="mt-1.5 text-[10px] text-zinc-600">
        {session?.accessToken ? "Private · synced to your account" : "Private · saved locally"}
      </p>
    </section>
  );
}
