"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Loader2, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = React.useState({
    name: "",
    organizationName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Registration failed");
        return;
      }
      toast.success("Workspace created! Redirecting to dashboard...");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Network error creating account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nexora-glass-card w-full p-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Create Agency Workspace
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Launch an isolated multi-tenant CRM, CMS, and project workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="reg-name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="reg-name"
              required
              placeholder="Alex Rivera"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-org">Organization Name</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="reg-org"
              required
              placeholder="Northstar Digital Studio"
              value={form.organizationName}
              onChange={(e) =>
                setForm((f) => ({ ...f, organizationName: e.target.value }))
              }
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-email">Work Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="reg-email"
              type="email"
              required
              placeholder="alex@northstar.io"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-pass">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="reg-pass"
              type="password"
              required
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              className="pl-10"
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full h-11">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating Workspace...
            </>
          ) : (
            "Create Workspace"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
