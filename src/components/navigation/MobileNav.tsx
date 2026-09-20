"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Globe,
  Package,
  Building2,
  Compass,
  Sparkles,
  Heart,
  Bell,
  User,
  Settings,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  description?: string;
}

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  navItems: NavItem[];
}

const quickLinks = [
  { label: "My Wishlist", href: "/wishlist", icon: Heart },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "My Account", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav({ open, onClose, navItems }: MobileNavProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            ref={overlayRef}
            className="fixed inset-0 z-[190] bg-black/40 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed inset-y-0 right-0 z-[195] flex w-full max-w-sm flex-col bg-white shadow-2xl dark:bg-charcoal-950 lg:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b border-stone-200/60 px-5 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500">
                  <MapPin className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                </div>
                <span className="font-display text-lg font-bold text-charcoal-950 dark:text-white">
                  ZyroTrip
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close navigation menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-charcoal-500 transition-colors hover:bg-stone-100 hover:text-charcoal-950 dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Main Navigation */}
              <div className="px-4 pt-6">
                <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-widest text-charcoal-400 dark:text-stone-500">
                  Explore
                </p>
                <nav className="space-y-1">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.25 }}
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-all hover:bg-stone-50 dark:hover:bg-white/5"
                      >
                        <div
                          className={cn(
                            "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-colors",
                            item.label === "AI Planner"
                              ? "bg-amber-50 text-amber-500"
                              : "bg-stone-100 text-charcoal-600 group-hover:bg-amber-50 group-hover:text-amber-500 dark:bg-white/10 dark:text-stone-400"
                          )}
                        >
                          <item.icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-charcoal-950 dark:text-white">
                            {item.label}
                          </p>
                          {item.description && (
                            <p className="truncate text-xs text-charcoal-400 dark:text-stone-500">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-charcoal-300 dark:text-stone-600" />
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>

              {/* Quick Links */}
              <div className="mt-6 border-t border-stone-100 px-4 pt-6 dark:border-white/5">
                <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-widest text-charcoal-400 dark:text-stone-500">
                  Account
                </p>
                <nav className="space-y-1">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-charcoal-600 transition-colors hover:bg-stone-50 hover:text-charcoal-950 dark:text-stone-400 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="border-t border-stone-100 p-4 dark:border-white/10">
              <Link
                href="/auth/login"
                onClick={onClose}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-charcoal-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-charcoal-800 dark:bg-white dark:text-charcoal-950 dark:hover:bg-stone-100"
              >
                <User className="h-4 w-4" />
                Sign in to ZyroTrip
              </Link>
              <Link
                href="/auth/register"
                onClick={onClose}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 px-4 py-3 text-sm font-medium text-charcoal-700 transition-colors hover:bg-stone-50 dark:border-white/10 dark:text-stone-300 dark:hover:bg-white/5"
              >
                Create free account
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
