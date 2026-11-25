"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export function FaqExplorer({ faqs }: { faqs: FaqItem[] }) {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("All");

  const categories = React.useMemo(
    () => ["All", ...Array.from(new Set(faqs.map((f) => f.category)))],
    [faqs]
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return faqs.filter((f) => {
      const catMatch = category === "All" || f.category === category;
      const queryMatch =
        !q ||
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q);
      return catMatch && queryMatch;
    });
  }, [faqs, category, search]);

  const midpoint = Math.ceil(filtered.length / 2);
  const leftCol = filtered.slice(0, midpoint);
  const rightCol = filtered.slice(midpoint);

  return (
    <div className="space-y-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                category === cat
                  ? "bg-[var(--webtec-accent)] text-white"
                  : "border border-[var(--webtec-border)] bg-[var(--webtec-surface)] text-[var(--webtec-heading)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--webtec-body)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--webtec-border)] p-12 text-center text-[var(--webtec-body)]">
          No FAQs matched your query.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {[leftCol, rightCol].map((col, colIndex) => (
            <Accordion
              key={colIndex}
              type="single"
              collapsible
              className="space-y-4"
            >
              {col.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="rounded-2xl border border-[var(--webtec-border)] bg-[var(--webtec-surface-alt)] px-6"
                >
                  <AccordionTrigger className="text-[var(--webtec-heading)]">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-[var(--webtec-body)]">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ))}
        </div>
      )}
    </div>
  );
}
