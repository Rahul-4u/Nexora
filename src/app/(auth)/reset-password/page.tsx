"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

function ResetPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [token, setToken] = React.useState(params.get("token") || "");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Unable to reset password");
        return;
      }
      toast.success("Password updated! Please sign in.");
      router.push("/login");
    } catch {
      toast.error("Network error resetting password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nexora-glass-card w-full p-8">
      <h1 className="font-heading text-2xl font-bold text-foreground">
        Set New Password
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your reset token and choose a strong new password.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="rp-token">Reset Token</Label>
          <Input
            id="rp-token"
            required
            placeholder="Paste reset token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rp-password">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="rp-password"
              type="password"
              required
              minLength={8}
              placeholder="Minimum 8 characters"
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
              Updating Password...
            </>
          ) : (
            "Update Password"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="nexora-glass-card w-full p-8 text-center text-sm text-muted-foreground">
          Loading...
        </div>
      }
    >
      <ResetPasswordInner />
    </React.Suspense>
  );
}
