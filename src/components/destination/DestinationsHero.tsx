export function DestinationsHero() {
  return (
    <div className="relative overflow-hidden bg-charcoal-950 pt-24 pb-16">
      {/* Decorative pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-5">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>
      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-16">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500">
          Explore the world
        </p>
        <h1 className="font-display text-display-lg font-bold text-white">
          All destinations
        </h1>
        <p className="mt-4 max-w-lg text-stone-400">
          100+ handpicked destinations across every continent, curated by our team
          of expert travelers and local guides.
        </p>
      </div>
    </div>
  );
}
