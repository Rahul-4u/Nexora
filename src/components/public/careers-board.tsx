"use client";

import * as React from "react";
import { Briefcase, Check, ChevronRight, MapPin, Upload } from "lucide-react";
import { toast } from "sonner";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

export function CareersBoard({ jobs }: { jobs: JobItem[] }) {
  const [department, setDepartment] = React.useState("All");
  const [selectedJob, setSelectedJob] = React.useState<JobItem | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const [form, setForm] = React.useState({
    applicantName: "",
    email: "",
    phone: "",
    portfolioUrl: "",
    resumeUrl: "",
    coverLetter: "",
  });

  const departments = React.useMemo(
    () => ["All", ...Array.from(new Set(jobs.map((j) => j.department)))],
    [jobs]
  );

  const filtered = React.useMemo(
    () =>
      department === "All"
        ? jobs
        : jobs.filter((j) => j.department === department),
    [jobs, department]
  );

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/public/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setForm((prev) => ({ ...prev, resumeUrl: data.url }));
      toast.success(`Uploaded resume: ${data.originalName}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Resume upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedJob) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/careers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobListingId: selectedJob.id,
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit application");
      toast.success(
        "Application submitted! Our HR & Recruitment team can now review your profile."
      );
      setSelectedJob(null);
      setForm({
        applicantName: "",
        email: "",
        phone: "",
        portfolioUrl: "",
        resumeUrl: "",
        coverLetter: "",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap gap-2">
        {departments.map((dept) => (
          <button
            key={dept}
            type="button"
            onClick={() => setDepartment(dept)}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              department === dept
                ? "bg-[var(--webtec-accent)] text-white"
                : "border border-[var(--webtec-border)] bg-[var(--webtec-surface)] text-[var(--webtec-heading)]"
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filtered.map((job) => (
          <div
            key={job.id}
            className="flex flex-col justify-between gap-6 rounded-3xl border border-[var(--webtec-border)] bg-[var(--webtec-surface-alt)] p-8 lg:flex-row lg:items-center"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider">
                <span className="rounded-full bg-[var(--webtec-accent)]/10 px-3 py-1 text-[var(--webtec-accent)]">
                  {job.department}
                </span>
                <span className="inline-flex items-center gap-1 text-[var(--webtec-body)]">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.location}
                </span>
                <span className="inline-flex items-center gap-1 text-[var(--webtec-body)]">
                  <Briefcase className="h-3.5 w-3.5" />
                  {job.employmentType}
                </span>
                {job.salaryRange ? (
                  <span className="text-[var(--webtec-heading)]">
                    {job.salaryRange}
                  </span>
                ) : null}
              </div>

              <h2 className="font-heading text-2xl font-bold text-[var(--webtec-heading)]">
                {job.title}
              </h2>
              <p className="max-w-3xl text-sm leading-relaxed text-[var(--webtec-body)]">
                {job.description}
              </p>

              {job.requirements.length > 0 ? (
                <ul className="grid gap-1.5 pt-2 sm:grid-cols-2">
                  {job.requirements.slice(0, 4).map((req) => (
                    <li
                      key={req}
                      className="flex items-center gap-2 text-xs font-medium text-[var(--webtec-heading)]"
                    >
                      <Check className="h-3.5 w-3.5 text-[var(--webtec-accent)]" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={() => setSelectedJob(job)}
                className="webtec-btn-primary cursor-pointer"
              >
                <span className="webtec-btn-circle">
                  <ChevronRight className="h-4 w-4 stroke-[2.5]" />
                </span>
                <span>APPLY NOW</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={Boolean(selectedJob)}
        onOpenChange={(open) => !open && setSelectedJob(null)}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
            <DialogDescription>
              {selectedJob?.department} • {selectedJob?.location}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleApply} className="space-y-4 pt-2">
            <div>
              <Label htmlFor="applicantName">Full Name</Label>
              <Input
                id="applicantName"
                required
                value={form.applicantName}
                onChange={(e) =>
                  setForm({ ...form, applicantName: e.target.value })
                }
                placeholder="Alex Morgan"
                className="mt-1"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="applicantEmail">Email</Label>
                <Input
                  id="applicantEmail"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="alex@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="applicantPhone">Phone</Label>
                <Input
                  id="applicantPhone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 (555) 019-2834"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="portfolioUrl">Portfolio / LinkedIn URL</Label>
              <Input
                id="portfolioUrl"
                value={form.portfolioUrl}
                onChange={(e) =>
                  setForm({ ...form, portfolioUrl: e.target.value })
                }
                placeholder="https://linkedin.com/in/..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="resumeUpload">Resume Upload (PDF / DOCX)</Label>
              <div className="mt-1 flex items-center gap-3">
                <label
                  htmlFor="resumeUpload"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent"
                >
                  <Upload className="h-4 w-4" />
                  <span>{uploading ? "Uploading..." : "Upload Resume"}</span>
                </label>
                <input
                  id="resumeUpload"
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                  onChange={handleResumeUpload}
                  className="sr-only"
                />
                {form.resumeUrl ? (
                  <span className="truncate text-xs font-medium text-emerald-600">
                    Attached: {form.resumeUrl}
                  </span>
                ) : null}
              </div>
            </div>

            <div>
              <Label htmlFor="coverLetter">Cover Letter / Note</Label>
              <Textarea
                id="coverLetter"
                rows={4}
                value={form.coverLetter}
                onChange={(e) =>
                  setForm({ ...form, coverLetter: e.target.value })
                }
                placeholder="Tell us about the products you've shipped..."
                className="mt-1"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || uploading}
              className="webtec-btn-primary w-full justify-center disabled:opacity-60 cursor-pointer"
            >
              <span className="webtec-btn-circle">
                <ChevronRight className="h-4 w-4" />
              </span>
              <span>{submitting ? "SUBMITTING..." : "SUBMIT APPLICATION"}</span>
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
