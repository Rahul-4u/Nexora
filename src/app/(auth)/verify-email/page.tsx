"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

function VerifyEmailInner() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [status, setStatus] = React.useState<"loading" | "success" | "error">(
    token ? "loading" : "error"
  );
  const [message, setMessage] = React.useState(
    token ? "Verifying your email..." : "Missing verification token."
  );

  React.useEffect(() => {
    if (!token) return;
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Verification failed");
        setStatus("success");
        setMessage(d.message || "Email verified!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verification failed");
      });
  }, [token]);

  return (
    <div className="nexora-glass-card w-full max-w-md p-8 text-center">
      {status === "loading" ? (
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
      ) : status === "success" ? (
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
      ) : (
        <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
      )}
      <h1 className="mt-4 font-heading text-xl font-bold text-foreground">
        Email Verification
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <Link
        href="/dashboard"
        className="mt-6 inline-block text-sm font-semibold text-primary hover:underline"
      >
        Continue to Dashboard
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="nexora-glass-card w-full max-w-md p-8 text-center text-sm text-muted-foreground">
          Verifying...
        </div>
      }
    >
      <VerifyEmailInner />
    </React.Suspense>
  );
}
