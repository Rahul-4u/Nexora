import { CheckCircle2 } from "lucide-react";
import { WebtecButton } from "@/components/public/webtec-button";

export function AboutSection() {
  const highlights = [
    "Innovative Solutions",
    "User-Friendly Interface",
    "Secure Transactions",
    "Real-Time Analytics",
  ];

  return (
    <section className="overflow-hidden bg-[var(--webtec-surface)] py-20 lg:py-28">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          {/* Left Column: Asymmetric Office Collage */}
          <div className="relative lg:col-span-6">
            <div className="relative mx-auto max-w-[540px]">
              <div className="overflow-hidden rounded-[28px] shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=85"
                  alt="Nexora creative and engineering team collaborating"
                  className="h-[380px] w-full object-cover sm:h-[460px]"
                />
              </div>

              {/* Overlapping Secondary Cutout Photo */}
              <div className="relative -mt-20 ml-auto w-[62%] overflow-hidden rounded-[24px] border-[8px] border-[var(--webtec-surface)] shadow-2xl sm:-mt-28">
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=85"
                  alt="Product strategy review"
                  className="h-[200px] w-full object-cover sm:h-[240px]"
                />
              </div>

              {/* Decorative 3D Crimson/Violet Accent Coil */}
              <div
                aria-hidden="true"
                className="absolute -bottom-4 left-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#ff3838] via-[#a855f7] to-[#6366f1] p-1 shadow-xl"
              >
                <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[var(--webtec-surface)] text-center">
                  <span className="font-heading text-xl font-extrabold text-[var(--webtec-accent)]">
                    10+
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--webtec-heading)]">
                    Years
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-6">
            <span className="inline-block font-heading text-xs font-bold tracking-[0.2em] uppercase text-[var(--webtec-accent)]">
              KNOW ABOUT US
            </span>

            <h2 className="mt-3 font-heading text-3xl font-bold leading-[1.2] text-[var(--webtec-heading)] sm:text-4xl lg:text-[48px]">
              We Optimize Your Funnel For Higher Conversions
            </h2>

            <p className="mt-5 text-base leading-[1.85] text-[var(--webtec-body)]">
              Nexora unites bold digital brand craft with enterprise-grade CRM,
              CMS, and revenue automation. Every touchpoint from first impression
              to signed contract is engineered for measurable conversion velocity.
            </p>

            {/* Webtec Soft Rose Checklist Card */}
            <div className="mt-8 rounded-[20px] border-[8px] border-[var(--webtec-surface)] bg-[#ff3838]/10 p-6 shadow-[0_0_30px_rgba(0,0,0,0.08)] sm:p-7">
              <div className="grid gap-4 sm:grid-cols-2">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 font-heading text-[17px] font-bold text-[var(--webtec-heading)]"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--webtec-accent)]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Webtec Marketing 86% Progress Bar */}
            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-heading text-lg font-semibold text-[var(--webtec-heading)]">
                  Marketing
                </span>
                <span className="font-heading text-base font-bold text-[var(--webtec-accent)]">
                  86%
                </span>
              </div>
              <div className="h-[13px] w-full overflow-hidden rounded-full bg-[#DFDFDF] dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-[var(--webtec-accent)] transition-all duration-700"
                  style={{ width: "86%" }}
                />
              </div>
            </div>

            <div className="mt-10">
              <WebtecButton href="/about">DISCOVER MORE</WebtecButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
