"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";

interface CmsResponse {
  services: Array<{ id: string; title: string; category: string; status: string }>;
  portfolio: Array<{ id: string; title: string; category: string; status: string }>;
  blogPosts: Array<{
    id: string;
    title: string;
    status: string;
    publishedAt: string | null;
    category: { name: string } | null;
  }>;
  testimonials: Array<{ id: string; authorName: string; authorRole: string; status: string }>;
  faqs: Array<{ id: string; question: string; category: string; status: string }>;
  media: Array<{ id: string; originalName: string; url: string; mimeType: string; sizeBytes: number }>;
  contactSubmissions: Array<{
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  }>;
}

export default function CmsPage() {
  const qc = useQueryClient();

  const [newService, setNewService] = React.useState({
    title: "",
    category: "Digital",
    shortDescription: "",
    description: "",
  });

  const [newPost, setNewPost] = React.useState({
    title: "",
    excerpt: "",
    content: "",
    status: "PUBLISHED",
  });

  const [newFaq, setNewFaq] = React.useState({
    category: "General",
    question: "",
    answer: "",
  });

  const { data } = useQuery<CmsResponse>({
    queryKey: ["cms-all"],
    queryFn: async () => {
      const res = await fetch("/api/cms");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const createMut = useMutation({
    mutationFn: async (payload: { entity: string; data: Record<string, unknown> }) => {
      const res = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save CMS item");
    },
    onSuccess: () => {
      toast.success("CMS item published");
      qc.invalidateQueries({ queryKey: ["cms-all"] });
    },
  });

  const statusMut = useMutation({
    mutationFn: async (payload: {
      entity: string;
      id: string;
      data: Record<string, unknown>;
    }) => {
      await fetch("/api/cms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast.success("Publication status updated");
      qc.invalidateQueries({ queryKey: ["cms-all"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async ({ entity, id }: { entity: string; id: string }) => {
      await fetch(`/api/cms?entity=${entity}&id=${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: ["cms-all"] });
    },
  });

  const uploadMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/cms/media", { method: "POST", body: fd });
    if (res.ok) {
      toast.success("Uploaded to media library");
      qc.invalidateQueries({ queryKey: ["cms-all"] });
    } else {
      toast.error("Upload failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          CMS &amp; Media Library
        </h1>
        <p className="text-sm text-muted-foreground">
          Publish services, portfolio projects, blog posts, FAQs, and media
          directly to the public agency website.
        </p>
      </div>

      <Tabs defaultValue="blog">
        <TabsList className="flex-wrap">
          <TabsTrigger value="blog">Blog Posts</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="media">Media Library</TabsTrigger>
          <TabsTrigger value="inbox">Contact Inbox</TabsTrigger>
        </TabsList>

        {/* BLOG TAB */}
        <TabsContent value="blog" className="space-y-4">
          <div className="nexora-glass-card p-5">
            <h2 className="font-heading text-sm font-bold text-foreground mb-3">
              Publish Blog Article
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMut.mutate({ entity: "blogPost", data: newPost });
                setNewPost({ title: "", excerpt: "", content: "", status: "PUBLISHED" });
              }}
              className="space-y-3"
            >
              <Input
                required
                placeholder="Article Title"
                value={newPost.title}
                onChange={(e) => setNewPost((p) => ({ ...p, title: e.target.value }))}
              />
              <Input
                required
                placeholder="Short Excerpt"
                value={newPost.excerpt}
                onChange={(e) => setNewPost((p) => ({ ...p, excerpt: e.target.value }))}
              />
              <Textarea
                required
                rows={3}
                placeholder="Full article body..."
                value={newPost.content}
                onChange={(e) => setNewPost((p) => ({ ...p, content: e.target.value }))}
              />
              <Button type="submit" size="sm">
                <Plus className="h-4 w-4" />
                Create Blog Post
              </Button>
            </form>
          </div>

          <div className="nexora-glass-card divide-y divide-border">
            {data?.blogPosts.map((post) => (
              <div
                key={post.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4"
              >
                <div>
                  <p className="font-heading text-sm font-bold text-foreground">
                    {post.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {post.category?.name || "Insights"} &bull;{" "}
                    {formatDate(post.publishedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={post.status}
                    onChange={(e) =>
                      statusMut.mutate({
                        entity: "blogPost",
                        id: post.id,
                        data: { status: e.target.value },
                      })
                    }
                    className="h-8 rounded border border-input bg-background px-2 text-xs"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => deleteMut.mutate({ entity: "blogPost", id: post.id })}
                    className="text-muted-foreground hover:text-destructive cursor-pointer"
                    aria-label="Delete post"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* SERVICES TAB */}
        <TabsContent value="services" className="space-y-4">
          <div className="nexora-glass-card p-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMut.mutate({
                  entity: "service",
                  data: { ...newService, status: "PUBLISHED" },
                });
                setNewService({ title: "", category: "Digital", shortDescription: "", description: "" });
              }}
              className="grid gap-3 sm:grid-cols-2"
            >
              <Input
                required
                placeholder="Service Title"
                value={newService.title}
                onChange={(e) =>
                  setNewService((s) => ({ ...s, title: e.target.value }))
                }
              />
              <Input
                required
                placeholder="Category"
                value={newService.category}
                onChange={(e) =>
                  setNewService((s) => ({ ...s, category: e.target.value }))
                }
              />
              <Input
                required
                placeholder="Short Summary"
                value={newService.shortDescription}
                onChange={(e) =>
                  setNewService((s) => ({ ...s, shortDescription: e.target.value }))
                }
              />
              <Input
                required
                placeholder="Detailed Description"
                value={newService.description}
                onChange={(e) =>
                  setNewService((s) => ({ ...s, description: e.target.value }))
                }
              />
              <Button type="submit" size="sm" className="sm:col-span-2 w-fit">
                Add Service
              </Button>
            </form>
          </div>

          <div className="nexora-glass-card divide-y divide-border">
            {data?.services.map((srv) => (
              <div
                key={srv.id}
                className="flex items-center justify-between p-4 text-sm"
              >
                <div>
                  <p className="font-bold text-foreground">{srv.title}</p>
                  <p className="text-xs text-muted-foreground">{srv.category}</p>
                </div>
                <select
                  value={srv.status}
                  onChange={(e) =>
                    statusMut.mutate({
                      entity: "service",
                      id: srv.id,
                      data: { status: e.target.value },
                    })
                  }
                  className="h-8 rounded border border-input bg-background px-2 text-xs"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* PORTFOLIO TAB */}
        <TabsContent value="portfolio" className="nexora-glass-card divide-y divide-border">
          {data?.portfolio.map((proj) => (
            <div key={proj.id} className="flex items-center justify-between p-4 text-sm">
              <div>
                <p className="font-bold text-foreground">{proj.title}</p>
                <p className="text-xs text-muted-foreground">{proj.category}</p>
              </div>
              <select
                value={proj.status}
                onChange={(e) =>
                  statusMut.mutate({
                    entity: "portfolio",
                    id: proj.id,
                    data: { status: e.target.value },
                  })
                }
                className="h-8 rounded border border-input bg-background px-2 text-xs"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          ))}
        </TabsContent>

        {/* FAQS TAB */}
        <TabsContent value="faqs" className="space-y-4">
          <div className="nexora-glass-card p-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMut.mutate({ entity: "faq", data: newFaq });
                setNewFaq({ category: "General", question: "", answer: "" });
              }}
              className="space-y-3"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  required
                  placeholder="Category"
                  value={newFaq.category}
                  onChange={(e) => setNewFaq((f) => ({ ...f, category: e.target.value }))}
                />
                <Input
                  required
                  placeholder="Question"
                  value={newFaq.question}
                  onChange={(e) => setNewFaq((f) => ({ ...f, question: e.target.value }))}
                />
              </div>
              <Textarea
                required
                placeholder="Answer"
                value={newFaq.answer}
                onChange={(e) => setNewFaq((f) => ({ ...f, answer: e.target.value }))}
              />
              <Button type="submit" size="sm">
                Add FAQ
              </Button>
            </form>
          </div>
          <div className="nexora-glass-card divide-y divide-border">
            {data?.faqs.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-4 text-sm">
                <div>
                  <p className="font-bold text-foreground">{f.question}</p>
                  <p className="text-xs text-muted-foreground">{f.category}</p>
                </div>
                <Badge variant="success">{f.status}</Badge>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* MEDIA TAB */}
        <TabsContent value="media" className="space-y-4">
          <div className="nexora-glass-card p-5">
            <Label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-primary/50 bg-primary/5 px-5 py-3 text-sm font-semibold text-primary hover:bg-primary/10">
              <Upload className="h-4 w-4" />
              <span>Upload Asset To Media Library</span>
              <input type="file" onChange={uploadMedia} className="hidden" />
            </Label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {data?.media.map((m) => (
              <div key={m.id} className="nexora-glass-card overflow-hidden p-3">
                {m.mimeType.startsWith("image/") ? (
                  <img
                    src={m.url}
                    alt={m.originalName}
                    className="h-32 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-lg bg-muted text-xs font-mono">
                    {m.mimeType}
                  </div>
                )}
                <p className="mt-2 truncate text-xs font-semibold text-foreground">
                  {m.originalName}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* CONTACT INBOX TAB */}
        <TabsContent value="inbox" className="nexora-glass-card divide-y divide-border">
          {data?.contactSubmissions.map((msg) => (
            <div key={msg.id} className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-heading text-sm font-bold text-foreground">
                  {msg.name} ({msg.email}) — {msg.subject}
                </p>
                <span className="text-xs text-muted-foreground">
                  {formatDate(msg.createdAt)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{msg.message}</p>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
