const NOTES_PREFIX = "archforge_note_";

export function loadLocalNote(slug: string): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(`${NOTES_PREFIX}${slug}`) ?? "";
}

export function saveLocalNote(slug: string, content: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${NOTES_PREFIX}${slug}`, content);
}
