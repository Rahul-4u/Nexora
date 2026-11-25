"use client";

import * as React from "react";
import {
  Briefcase,
  CheckCircle2,
  Loader2,
  MapPin,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { WebtecButton } from "@/components/public/webtec-button";
import { cn } from "@/lib/utils";

interface JobItem {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  employmentType: string;
  salaryRange: string | null;
  description: string;
  requirements: string[];
  benefits: string[];
}

export function CareersClient({ jobs }: { jobs: JobItem[] }) {
  const departments = React.useMemo(
    () => ["All", ...Array.from(new Set(jobs.map((j) => j.department)))],
    [jobs]
  );
  const [department, setDepartment] = React.useState("All");
  const [selectedJob, setSelectedJob] = React.useState<JobItem | null>(
    jobs[0] ?? null
  );
  const [applyOpen, setApplyOpen] = React.useState(false);

  const [form, setForm] = React.useState({
    applicantName: "",
    email: "",
    phone: "",
    portfolioUrl: "",
    resumeUrl: "",
    coverLetter: "",
  });
  const [uploadingResume, setUploadingResume] = React.useState(false);
  const [resumeFileName, setResumeFileName] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const filtered = React.useMemo(
    () =>
      department === "All"
        ? jobs
        : jobs.filter((j) => j.department === department),
    [jobs, department]
  );

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/public/upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Resume upload failed.");
      } else {
        setForm((f) => ({ ...f, resumeUrl: json.url }));
        setResumeFileName(json.originalName || file.name);
        toast.success("Resume uploaded successfully.");
      }
    } catch {
      toast.error("Failed to upload resume.");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/careers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          jobListingId: selectedJob.id,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Could not submit application.");
      } else {
        toast.success(json.message || "Application submitted!");
        setApplyOpen(false);
        setForm({
          applicantName: "",
          email: "",
          phone: "",
          portfolioUrl: "",
          resumeUrl: "",
          coverLetter: "",
        });
        setResumeFileName("");
      }
    } catch {
      toast.error("Network error submitting application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Department Filter */}
      <div className="flex flex-wrap justify-center gap-2.5">
        {departments.map((dept) => (
          <button
            key={dept}
            type="button"
            onClick={() => setDepartment(dept)}
            className={cn(
              "rounded-full px-5 py-2.5 font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer",
              department === dept
                ? "bg-[var(--webtec-accent)] text-white"
                : "border border-[var(--webtec-border)] bg-[var(--webtec-surface)] text-[var(--webtec-heading)] hover:border-[var(--webtec-accent)]"
            )}
          >
            {dept}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Job List */}
        <div className="space-y-4 lg:col-span-5">
          {filtered.map((job) => {
            const active = selectedJob?.id === job.id;
            return (
              <button
                key={job.id}
                type="button"
                onClick={() => setSelectedJob(job)}
                className={cn(
                  "w-full rounded-[22px] border p-6 text-left transition cursor-pointer",
                  active
                    ? "border-[var(--webtec-accent)] bg-[var(--webtec-accent)]/5 shadow-md"
                    : "border-[var(--webtec-border)] bg-[var(--webtec-surface)] hover:border-[var(--webtec-accent)]/50"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-[var(--webtec-accent)]/10 px-3 py-1 text-xs font-bold text-[var(--webtec-accent)]">
                    {job.department}
                  </span>
                  <span className="text-xs font-semibold text-[var(--webtec-body)]">
                    {job.employmentType}
                  </span>
                </div>
                <h3 className="mt-3 font-heading text-xl font-bold text-[var(--webtec-heading)]">
                  {job.title}
                </h3>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[var(--webtec-body)]">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[var(--webtec-accent)]" />
                    {job.location}
                  </span>
                  {job.salaryRange && (
                    <span className="inline-flex items-center gap-1 font-semibold text-[var(--webtec-heading)]">
                      <Briefcase className="h-3.5 w-3.5 text-[var(--webtec-accent)]" />
                      {job.salaryRange}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Job Details */}
        <div className="lg:col-span-7">
          {selectedJob ? (
            <div className="rounded-[26px] border border-[var(--webtec-border)] bg-[var(--webtec-surface-alt)] p-8 sm:p-10">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--webtec-border)] pb-6">
                <div>
                  <span className="font-heading text-xs font-bold uppercase tracking-widest text-[var(--webtec-accent)]">
                    {selectedJob.department} &bull; {selectedJob.employmentType}
                  </span>
                  <h2 className="mt-2 font-heading text-3xl font-bold text-[var(--webtec-heading)]">
                    {selectedJob.title}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--webtec-body)]">
                    {selectedJob.location}
                    {selectedJob.salaryRange
                      ? ` • ${selectedJob.salaryRange}`
                      : ""}
                  </p>
                </div>
                <WebtecButton onClick={() => setApplyOpen(true)}>
                  APPLY NOW
                </WebtecButton>
              </div>

              <div className="mt-7 space-y-6">
                <div>
                  <h3 className="font-heading text-lg font-bold text-[var(--webtec-heading)]">
                    Role Overview
                  </h3>
                  <p className="mt-2 text-sm leading-[1.85] text-[var(--webtec-body)]">
                    {selectedJob.description}
                  </p>
                </div>

                {selectedJob.requirements.length > 0 && (
                  <div>
                    <h3 className="font-heading text-lg font-bold text-[var(--webtec-heading)]">
                      What We&apos;re Looking For
                    </h3>
                    <ul className="mt-3 space-y-2.5">
                      {selectedJob.requirements.map((req) => (
                        <li
                          key={req}
                          className="flex items-start gap-2.5 text-sm text-[var(--webtec-body)]"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--webtec-accent)]" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedJob.benefits.length > 0 && (
                  <div>
                    <h3 className="font-heading text-lg font-bold text-[var(--webtec-heading)]">
                      Perks &amp; Benefits
                    </h3>
                    <ul className="mt-3 space-y-2.5">
                      {selectedJob.benefits.map((ben) => (
                        <li
                          key={ben}
                          className="flex items-start gap-2.5 text-sm text-[var(--webtec-body)]"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{ben}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--webtec-border)] p-12 text-center">
              <p className="text-[var(--webtec-body)]">
                Select an open position to view full details and apply.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Application Modal */}
      {applyOpen && selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[24px] border border-border bg-card p-7 shadow-2xl">
            <button
              type="button"
              onClick={() => setApplyOpen(false)}
              aria-label="Close application modal"
              className="absolute right-5 top-5 rounded-full p-2 text-muted-foreground hover:bg-muted cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="font-heading text-xs font-bold uppercase tracking-widest text-[var(--webtec-accent)]">
              Apply for position
            </span>
            <h3 className="mt-1 font-heading text-2xl font-bold text-foreground">
              {selectedJob.title}
            </h3>

            <form onSubmit={handleApply} className="mt-6 space-y-4">
              <input
                type="text"
                required
                placeholder="Full Name *"
                value={form.applicantName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, applicantName: e.target.value }))
                }
                className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none focus:border-[var(--webtec-accent)]"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="email"
                  required
                  placeholder="Email Address *"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none focus:border-[var(--webtec-accent)]"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none focus:border-[var(--webtec-accent)]"
                />
              </div>

              <input
                type="url"
                placeholder="Portfolio / LinkedIn / GitHub URL"
                value={form.portfolioUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, portfolioUrl: e.target.value }))
                }
                className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none focus:border-[var(--webtec-accent)]"
              />

              {/* Resume File Upload */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Resume / CV (PDF, DOC, DOCX — max 10MB)
                </label>
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-input bg-muted/40 px-4 py-3 text-sm transition hover:border-[var(--webtec-accent)]">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    {uploadingResume ? (
                      <Loader2 className="h-4 w-4 animate-spin text-[var(--webtec-accent)]" />
                    ) : (
                      <Upload className="h-4 w-4 text-[var(--webtec-accent)]" />
                    )}
                    {resumeFileName || "Choose resume file to upload"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                rows={4}
                placeholder="Cover letter or brief introduction..."
                value={form.coverLetter}
                onChange={(e) =>
                  setForm((f) => ({ ...f, coverLetter: e.target.value }))
                }
                className="w-full rounded-xl border border-input bg-background p-4 text-sm text-foreground outline-none focus:border-[var(--webtec-accent)]"
              />

              <WebtecButton
                type="submit"
                disabled={submitting || uploadingResume}
                className="w-full justify-center"
              >
                {submitting ? "SUBMITTING..." : "SUBMIT APPLICATION"}
              </WebtecButton>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
