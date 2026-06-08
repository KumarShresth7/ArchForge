import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "Sign In | ArchForge",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-950/40 via-zinc-950 to-zinc-950" />
      <div className="relative">
        <LoginForm />
      </div>
    </div>
  );
}
