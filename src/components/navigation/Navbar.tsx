"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Heart,
  Bell,
  User,
  ChevronDown,
  Menu,
  X,
  Globe,
  Sparkles,
  MapPin,
  Package,
  Building2,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileNav } from "./MobileNav";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  description?: string;
}

// ─── Navigation Data ──────────────────────────────────────────────────────────
const navItems: NavItem[] = [
  {
    label: "DESTINATIONS",
    href: "/destinations",
    icon: Globe,
  },
  {
    label: "JOURNEYS",
    href: "/packages",
    icon: Package,
  },
  {
    label: "AI CONCIERGE",
    href: "/ai-planner",
    icon: Sparkles,
  },
  {
    label: "OUR APPROACH",
    href: "/about",
    icon: Compass,
  },
];

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo({ scrolled }: { scrolled: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 group" aria-label="ZyroTrip home">
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-300",
          scrolled ? "bg-amber-500" : "bg-white"
        )}
      >
        <MapPin
          className={cn(
            "h-4 w-4 transition-colors duration-300",
            scrolled ? "text-white" : "text-amber-500"
          )}
          strokeWidth={2.5}
        />
      </div>
      <span
        className={cn(
          "font-display text-xl font-bold tracking-tight transition-colors duration-300",
          scrolled ? "text-charcoal-950" : "text-white"
        )}
      >
        ZyroTrip
      </span>
    </Link>
  );
}

import type { Session } from "next-auth";

// ─── Navbar Component ─────────────────────────────────────────────────────────
export function Navbar({ session }: { session?: Session | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  // Determine if we're on a page that needs transparent navbar
  const isHeroPage = pathname === "/" || pathname.startsWith("/destinations/") || pathname.startsWith("/packages/");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isTransparent = isHeroPage && !scrolled;

  return (
    <>
      <motion.header
        role="banner"
        className={cn(
          "fixed top-0 z-[200] w-full transition-all duration-500",
          isTransparent
            ? "bg-transparent"
            : "border-b border-stone-200/60 bg-white/95 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-charcoal-950/95"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-16">
          {/* Logo */}
          <Logo scrolled={!isTransparent} />

          {/* Desktop Navigation */}
          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Main navigation"
          >
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200",
                    isTransparent
                      ? isActive
                        ? "text-white"
                        : "text-white/80 hover:text-white"
                      : isActive
                        ? "text-charcoal-950 dark:text-white"
                        : "text-charcoal-500 hover:text-charcoal-950 dark:text-stone-400 dark:hover:text-white"
                  )}
                >
                  {item.icon === Sparkles && (
                    <item.icon
                      className={cn(
                        "h-3.5 w-3.5 transition-colors",
                        isTransparent ? "text-amber-300" : "text-amber-500"
                      )}
                    />
                  )}
                  {item.label}
                  {isActive && (
                    <motion.span
                      className={cn(
                        "absolute -bottom-0.5 left-3.5 right-3.5 h-0.5 rounded-full",
                        isTransparent ? "bg-white" : "bg-amber-500"
                      )}
                      layoutId="activeNavIndicator"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Profile / Auth */}
              {session?.user ? (
                <Link
                  href="/profile"
                  className={cn(
                    "ml-1 hidden items-center gap-2 px-4 py-2 text-[11px] font-bold tracking-widest uppercase transition-all duration-200 sm:flex",
                    isTransparent
                      ? "text-white hover:text-white/70"
                      : "text-charcoal-950 hover:text-charcoal-600 dark:text-white dark:hover:text-stone-300"
                  )}
                >
                  <User className="h-4 w-4" />
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className={cn(
                    "ml-1 hidden items-center gap-2 px-4 py-2 text-[11px] font-bold tracking-widest uppercase transition-all duration-200 sm:flex",
                    isTransparent
                      ? "text-white hover:text-white/70"
                      : "text-charcoal-950 hover:text-charcoal-600 dark:text-white dark:hover:text-stone-300"
                  )}
                >
                  Sign In
                </Link>
              )}

            {/* Plan a Journey Button */}
            <Link
              href="/ai-planner"
              className={cn(
                "hidden items-center gap-2 rounded-full px-6 py-2.5 text-[11px] font-bold tracking-widest uppercase transition-all duration-200 sm:flex",
                isTransparent
                  ? "bg-[#d3b482] text-charcoal-950 hover:bg-[#ebd2a9]"
                  : "bg-charcoal-950 text-white hover:bg-charcoal-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-950 focus-visible:ring-offset-2 active:bg-charcoal-900 active:text-white dark:bg-white dark:!text-[#141310] dark:hover:bg-stone-200 dark:hover:!text-[#141310] dark:focus-visible:!ring-white dark:active:bg-stone-300"
              )}
            >
              Plan A Journey
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              className={cn(
                "ml-1 flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 lg:hidden",
                isTransparent
                  ? "text-white hover:bg-white/10"
                  : "text-charcoal-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-white/10"
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation */}
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} navItems={navItems} />

      {/* Search Modal Placeholder — implemented in Phase 8 */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[400] flex items-start justify-center bg-black/40 pt-24 backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white p-2 shadow-2xl dark:bg-charcoal-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3 dark:bg-charcoal-800">
              <Search className="h-5 w-5 text-charcoal-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search destinations, packages, hotels..."
                className="flex-1 bg-transparent text-base text-charcoal-950 placeholder:text-charcoal-400 outline-none dark:text-white"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="rounded-md px-2 py-1 text-xs text-charcoal-400 hover:text-charcoal-600"
              >
                Esc
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
