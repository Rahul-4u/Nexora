"use client";

import * as React from "react";
import { Search } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export function FaqClient({ faqs }: { faqs: FaqItem[] }) {
  const categories = React.useMemo(
    () => ["All", ...Array.from(new Set(faqs.map((f) => f.category)))],
    [faqs]
  );
  const [category, setCategory] = React.useState("All");
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return faqs.filter((f) => {
      const matchCat = category === "All" || f.category === category;
      const matchQuery =
        !q ||
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [faqs, category, search]);

  const midpoint = Math.ceil(filtered.length / 2);
  const leftColumn = filtered.slice(0, midpoint);
  const rightColumn = filtered.slice(midpoint);

  return (
    <div className="space-y-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full px-5 py-2 font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer",
                category === cat
                  ? "bg-[var(--webtec-accent)] text-white"
                  : "border border-[var(--webtec-border)] bg-[var(--webtec-surface)] text-[var(--webtec-heading)] hover:border-[var(--webtec-accent)]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="h-11 w-full rounded-full border border-[var(--webtec-border)] bg-[var(--webtec-surface)] pl-11 pr-4 text-sm text-[var(--webtec-heading)] outline-none focus:border-[var(--webtec-accent)]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--webtec-border)] py-12 text-center">
          <p className="font-heading text-base font-semibold text-[var(--webtec-heading)]">
            No FAQs matched your search.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <Accordion
            type="single"
            collapsible
            className="rounded-2xl border border-[var(--webtec-border)] bg-[var(--webtec-surface-alt)] px-6 py-2"
          >
            {leftColumn.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-[var(--webtec-heading)]">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-[var(--webtec-body)]">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {rightColumn.length > 0 && (
            <Accordion
              type="single"
              collapsible
              className="rounded-2xl border border-[var(--webtec-border)] bg-[var(--webtec-surface-alt)] px-6 py-2"
            >
              {rightColumn.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="text-[var(--webtec-heading)]">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-[var(--webtec-body)]">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      )}
    </div>
  );
}
