export function PartnerLogosSection() {
  const brands = [
    "SUPREME",
    "BRIGHTLABS",
    "INNOVATETECH",
    "VAULTPAY",
    "GREENTECH",
  ];

  return (
    <section className="bg-[var(--webtec-surface)] py-16">
      <div className="mx-auto max-w-[1290px] px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-center">
          <div className="h-px w-full bg-[var(--webtec-border)]" />
          <span className="shrink-0 bg-[var(--webtec-surface)] px-6 font-heading text-xs font-bold tracking-[0.22em] uppercase text-[var(--webtec-heading)]">
            1K+ BRANDS TRUST US
          </span>
          <div className="h-px w-full bg-[var(--webtec-border)]" />
        </div>

        <div className="mt-10 grid grid-cols-2 items-center gap-8 text-center sm:grid-cols-3 lg:grid-cols-5">
          {brands.map((brand) => (
            <div
              key={brand}
              className="flex items-center justify-center py-3 font-heading text-xl font-extrabold tracking-[0.18em] text-[var(--webtec-body)]/55 transition-colors hover:text-[var(--webtec-heading)]"
            >
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
