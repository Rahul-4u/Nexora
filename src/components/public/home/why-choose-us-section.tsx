import { Award, Code2, Layers, TrendingUp } from "lucide-react";

export function WhyChooseUsSection() {
  const features = [
    {
      title: "Digital Growths",
      description:
        "Full-funnel conversion architecture engineered to turn qualified traffic into predictable CRM pipeline.",
      icon: TrendingUp,
    },
    {
      title: "Digital Solutions",
      description:
        "Bespoke web platforms, design systems, and automated business workflows tailored to your growth stage.",
      icon: Layers,
    },
    {
      title: "Best Consultancy",
      description:
        "Senior product strategists and technical architects partnering closely with your leadership team.",
      icon: Award,
    },
    {
      title: "Expert Developers",
      description:
        "Full-stack Next.js, TypeScript, and PostgreSQL engineers shipping resilient, audited production software.",
      icon: Code2,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[var(--webtec-surface)] py-20 lg:py-28">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          {/* Left Column: 3-Photo Asymmetric Collage + Central Red Seal */}
          <div className="relative lg:col-span-6">
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-4 sm:space-y-5">
                <div className="overflow-hidden rounded-[26px] shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=700&q=85"
                    alt="Agency sprint planning"
                    className="h-52 w-full object-cover sm:h-64"
                  />
                </div>
                <div className="overflow-hidden rounded-[26px] shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=700&q=85"
                    alt="Engineering architecture review"
                    className="h-44 w-full object-cover sm:h-52"
                  />
                </div>
              </div>
              <div className="pt-10">
                <div className="overflow-hidden rounded-[26px] shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=700&q=85"
                    alt="Executive strategy workshop"
                    className="h-72 w-full object-cover sm:h-96"
                  />
                </div>
              </div>
            </div>

            {/* Central Circular Red Seal */}
            <div className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-4 border-[var(--webtec-surface)] bg-[var(--webtec-accent)] p-3 text-center text-white shadow-2xl">
              <span className="font-heading text-[11px] font-bold tracking-[0.14em] uppercase leading-tight">
                Digital Creative Agency
              </span>
            </div>
          </div>

          {/* Right Column: 2x2 Feature Grid */}
          <div className="lg:col-span-6">
            <span className="inline-block font-heading text-xs font-bold tracking-[0.2em] uppercase text-[var(--webtec-accent)]">
              WHY CHOOSE US
            </span>
            <h2 className="mt-3 font-heading text-3xl font-bold leading-[1.2] text-[var(--webtec-heading)] sm:text-4xl lg:text-[48px]">
              Why You Should Choose Our Agency
            </h2>

            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {features.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div key={feat.title} className="group">
                    <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[var(--webtec-surface)] text-[var(--webtec-accent)] shadow-[0_4px_40px_rgba(0,0,0,0.09)] transition-all duration-300 group-hover:bg-[var(--webtec-accent)] group-hover:text-white dark:border dark:border-white/10">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 font-heading text-[22px] font-semibold text-[var(--webtec-heading)]">
                      {feat.title}
                    </h3>
                    <p className="mt-2.5 text-[15px] leading-[1.75] text-[var(--webtec-body)]">
                      {feat.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
