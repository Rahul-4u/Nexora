"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Unable to send reset email");
      } else {
        setSent(true);
        toast.success("Check your email for reset instructions.");
      }
    } catch {
      toast.error("Network error requesting reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nexora-glass-card w-full p-8">
      <h1 className="font-heading text-2xl font-bold text-foreground">
        Reset Your Password
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your account email to receive a secure password reset link.
      </p>

      {sent ? (
        <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
          <p className="mt-3 text-sm font-medium text-foreground">
            If an account exists for <strong>{email}</strong>, a reset link has
            been dispatched.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
          >
            Return to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fp-email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="fp-email"
                type="email"
                required
                placeholder="you@nexora.agency"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending Reset Link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}
