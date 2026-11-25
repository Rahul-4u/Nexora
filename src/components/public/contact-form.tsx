"use client";

import * as React from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { WebtecButton } from "@/components/public/webtec-button";
import { cn } from "@/lib/utils";

interface ContactFormProps {
  services?: Array<string | { title: string; slug?: string }>;
  showServiceSelect?: boolean;
  defaultSubject?: string;
  compact?: boolean;
  className?: string;
}

export function ContactForm({
  services = [],
  showServiceSelect = true,
  defaultSubject = "",
  compact = false,
  className,
}: ContactFormProps) {
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    subject: defaultSubject,
    service: "",
    message: "",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const serviceTitles = React.useMemo(
    () => services.map((s) => (typeof s === "string" ? s : s.title)),
    [services]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Please check all fields and try again.");
      } else {
        setSubmitted(true);
        toast.success(json.message || "Your message has been sent!");
        setForm({
          name: "",
          email: "",
          phone: "",
          subject: defaultSubject,
          service: "",
          message: "",
        });
      }
    } catch {
      toast.error("Network error submitting your inquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses =
    "h-[56px] w-full rounded-[5px] border border-black/10 bg-transparent px-5 text-sm text-[var(--webtec-heading)] placeholder:text-[var(--webtec-body)] outline-none transition focus:border-[var(--webtec-accent)] dark:border-white/15 dark:text-white dark:placeholder:text-slate-400";

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <h3 className="mt-4 font-heading text-2xl font-bold text-[var(--webtec-heading)]">
          Thank You for Reaching Out!
        </h3>
        <p className="mt-2 text-sm text-[var(--webtec-body)]">
          Your inquiry has been logged directly in our CRM. An agency strategist
          will respond within one business day.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm font-semibold text-[var(--webtec-accent)] underline cursor-pointer"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          type="text"
          required
          aria-label="Your Name"
          placeholder="Your Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={inputClasses}
        />
        <input
          type="email"
          required
          aria-label="E-mail"
          placeholder="E-mail"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className={inputClasses}
        />
        {!compact && (
          <input
            type="tel"
            aria-label="Phone Number"
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className={inputClasses}
          />
        )}
        <input
          type="text"
          required
          aria-label="Subject"
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          className={cn(inputClasses, compact && "sm:col-span-2")}
        />
      </div>

      {showServiceSelect && serviceTitles.length > 0 && !compact && (
        <select
          aria-label="Select Service"
          value={form.service}
          onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
          className={cn(
            inputClasses,
            "bg-[var(--webtec-surface-silver)] dark:bg-[#1a1927]"
          )}
        >
          <option value="">Select Service Interest (Optional)</option>
          {serviceTitles.map((title) => (
            <option key={title} value={title}>
              {title}
            </option>
          ))}
        </select>
      )}

      <textarea
        required
        rows={compact ? 3 : 4}
        aria-label="Message"
        placeholder="Write a Message"
        value={form.message}
        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
        className={cn(inputClasses, "h-auto min-h-[120px] py-4")}
      />

      <div className="pt-2">
        <WebtecButton
          type="submit"
          disabled={submitting}
          className="w-full justify-center sm:w-auto"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              SENDING...
            </span>
          ) : (
            "SEND A MESSAGE"
          )}
        </WebtecButton>
      </div>
    </form>
  );
}
