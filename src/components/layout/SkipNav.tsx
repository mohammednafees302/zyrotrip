'use client';

export function SkipNav() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-lg focus:bg-amber-500 focus:px-4 focus:py-2 focus:text-charcoal-950 focus:font-bold focus:text-sm"
    >
      Skip to main content
    </a>
  );
}
