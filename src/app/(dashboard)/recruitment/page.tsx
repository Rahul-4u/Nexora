"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Plus } from "lucide-react";
import { toast } from "sonner";
import { DashboardPageHeader, StatusPill } from "@/components/dashboard/dashboard-widgets";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const APP_STAGES = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];

export default function RecruitmentPage() {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    department: "Engineering",
    location: "Remote",
    employmentType: "Full-Time",
    salaryRange: "$130,000 – $165,000",
    description: "",
    status: "PUBLISHED",
  });

  const { data } = useQuery({
    queryKey: ["recruitment"],
    queryFn: async () => {
      const res = await fetch("/api/recruitment");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const createJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/recruitment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Job listing created");
      setOpen(false);
      setForm({
        title: "",
        department: "Engineering",
        location: "Remote",
        employmentType: "Full-Time",
        salaryRange: "$130,000 – $165,000",
        description: "",
        status: "PUBLISHED",
      });
      qc.invalidateQueries({ queryKey: ["recruitment"] });
    }
  };

  const updateApplicationStatus = async (id: string, status: string) => {
    const res = await fetch("/api/recruitment", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: id, status }),
    });
    if (res.ok) {
      toast.success(`Applicant moved to ${status}`);
      qc.invalidateQueries({ queryKey: ["recruitment"] });
    }
  };

  const updateJobStatus = async (id: string, status: string) => {
    await fetch("/api/recruitment", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: id, status }),
    });
    qc.invalidateQueries({ queryKey: ["recruitment"] });
  };

  const jobs = data?.jobs ?? [];
  const applications = data?.applications ?? [];

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Recruitment & Talent Pipeline"
        description="Manage public career openings and review incoming candidate applications."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Post Job Opening
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Job Listings */}
        <div className="nexora-glass-card p-6 lg:col-span-5 space-y-3">
          <h2 className="font-heading text-base font-bold">Job Listings</h2>
          {jobs.map(
            (j: {
              id: string;
              title: string;
              department: string;
              location: string;
              status: string;
              _count: { applications: number };
            }) => (
              <div
                key={j.id}
                className="rounded-xl border border-border/60 bg-background/40 p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading text-sm font-bold text-foreground">
                      {j.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {j.department} &bull; {j.location} &bull;{" "}
                      {j._count.applications} applicants
                    </p>
                  </div>
                  <StatusPill status={j.status} />
                </div>
                <select
                  value={j.status}
                  onChange={(e) => updateJobStatus(j.id, e.target.value)}
                  className="h-8 rounded border border-input bg-background px-2 text-xs"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            )
          )}
        </div>

        {/* Applicants */}
        <div className="nexora-glass-card p-6 lg:col-span-7 space-y-3">
          <h2 className="font-heading text-base font-bold">
            Candidate Applications
          </h2>
          {applications.length === 0 ? (
            <p className="text-xs text-muted-foreground">No applications yet.</p>
          ) : (
            applications.map(
              (app: {
                id: string;
                applicantName: string;
                email: string;
                resumeUrl: string | null;
                portfolioUrl: string | null;
                status: string;
                jobListing: { title: string };
              }) => (
                <div
                  key={app.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-border/60 bg-background/40 p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {app.applicantName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {app.email} &bull; Applied for {app.jobListing.title}
                    </p>
                    <div className="mt-2 flex gap-3 text-xs">
                      {app.resumeUrl && (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          Resume <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {app.portfolioUrl && (
                        <a
                          href={app.portfolioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          Portfolio <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  <select
                    value={app.status}
                    onChange={(e) =>
                      updateApplicationStatus(app.id, e.target.value)
                    }
                    className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
                  >
                    {APP_STAGES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              )
            )
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post Job Listing</DialogTitle>
          </DialogHeader>
          <form onSubmit={createJob} className="space-y-3">
            <div>
              <Label>Job Title *</Label>
              <Input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Department</Label>
                <Input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Description *</Label>
              <textarea
                rows={4}
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-input bg-background p-3 text-sm"
              />
            </div>
            <Button type="submit" className="w-full">
              Publish Job Listing
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
