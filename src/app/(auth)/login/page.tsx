"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";
  const verified = searchParams.get("verified");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (verified === "1") {
      toast.success("Email verified! You may now sign in.");
    }
  }, [verified]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Sign in failed");
        return;
      }
      toast.success(`Welcome back, ${json.user.name}`);
      router.push(redirectPath);
      router.refresh();
    } catch {
      toast.error("Unable to reach authentication server.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Nexora@2026!");
  };

  return (
    <div className="nexora-glass-card w-full p-8">
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <ShieldCheck className="h-3.5 w-3.5" />
          Nexora Workspace Access
        </span>
        <h1 className="mt-3 font-heading text-2xl font-bold text-foreground">
          Sign In To Your Account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Access CRM pipelines, CMS publishing, HR, projects, and finance.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="login-email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-email"
              type="email"
              required
              placeholder="admin@nexora.agency"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full h-11">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      {/* Quick Demo Account Selector */}
      <div className="mt-6 rounded-xl border border-border bg-muted/40 p-3.5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Seeded Demo Roles (Password: Nexora@2026!)
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[
            { label: "Super Admin", email: "admin@nexora.agency" },
            { label: "Sales Manager", email: "sales@nexora.agency" },
            { label: "HR Manager", email: "hr@nexora.agency" },
            { label: "Finance Mgr", email: "finance@nexora.agency" },
          ].map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => fillDemo(acc.email)}
              className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-left text-xs font-medium text-foreground transition hover:border-primary hover:text-primary cursor-pointer"
            >
              {acc.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Need a new agency workspace?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Create Workspace
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="nexora-glass-card w-full p-8 text-center text-sm text-muted-foreground">
          Loading sign-in form...
        </div>
      }
    >
      <LoginFormInner />
    </React.Suspense>
  );
}
