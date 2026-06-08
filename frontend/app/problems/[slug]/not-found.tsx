import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-center">
      <p className="text-6xl font-bold text-zinc-800">404</p>
      <h1 className="mt-4 text-xl font-semibold text-zinc-200">Problem not found</h1>
      <p className="mt-2 text-sm text-zinc-500">This system design problem doesn&apos;t exist.</p>
      <Link
        href="/problems"
        className="mt-6 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-400"
      >
        Browse Problems
      </Link>
    </div>
  );
}
