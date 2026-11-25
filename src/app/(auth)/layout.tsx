import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NexoraLogo } from "@/components/shared/nexora-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-background px-4 py-6 sm:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-blue-600/15 blur-[130px]" />
        <div className="absolute -bottom-32 right-1/4 h-96 w-96 rounded-full bg-indigo-600/15 blur-[130px]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link href="/">
          <NexoraLogo variant="dashboard" />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Public Site</span>
          </Link>
          <ThemeToggle variant="dashboard" />
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 items-center py-10">
        {children}
      </main>

      <footer className="relative z-10 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Nexora Agency &amp; CRM Platform.
      </footer>
    </div>
  );
}
