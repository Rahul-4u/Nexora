import { ContactForm } from "@/components/public/contact-form";

interface HomeContactSectionProps {
  services: Array<{ title: string; slug: string }>;
}

export function HomeContactSection({ services }: HomeContactSectionProps) {
  return (
    <section className="bg-[var(--webtec-surface)] px-3 py-12 sm:px-4 lg:py-20">
      <div className="mx-auto max-w-[1867px] overflow-hidden rounded-[32px] lg:rounded-[50px] bg-[var(--webtec-surface-silver)]">
        <div className="grid lg:grid-cols-12">
          {/* Left Full-Height Photo */}
          <div className="relative min-h-[340px] lg:col-span-6 lg:min-h-[620px]">
            <img
              src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=85"
              alt="Agency team collaborating on digital strategy"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Right Form Container */}
          <div className="flex items-center p-7 sm:p-12 lg:col-span-6 lg:p-16 xl:p-20">
            <div className="w-full max-w-[660px]">
              <span className="inline-block font-heading text-xs font-bold tracking-[0.2em] uppercase text-[var(--webtec-accent)]">
                SEND MESSAGE
              </span>
              <h2 className="mt-3 font-heading text-3xl font-bold leading-[1.2] text-[var(--webtec-heading)] sm:text-4xl lg:text-[46px]">
                Crafting Digital Strategies That Work
              </h2>

              <div className="mt-8">
                <ContactForm services={services} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
