import Link from "next/link";
import { MapPin, Instagram, Twitter, Facebook, Youtube, Mail, Phone } from "lucide-react";

const footerLinks = {
  Explore: [
    { label: "Destinations", href: "/destinations" },
    { label: "Travel Packages", href: "/packages" },
    { label: "Hotels", href: "/hotels" },
    { label: "Experiences", href: "/experiences" },
    { label: "AI Trip Planner", href: "/ai-planner" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Partners", href: "/partners" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "Cancellation Policy", href: "/cancellation-policy" },
    { label: "Safety Information", href: "/safety" },
    { label: "Accessibility", href: "/accessibility" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Refund Policy", href: "/refunds" },
  ],
};

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "Twitter", href: "https://twitter.com", icon: Twitter },
  { label: "Facebook", href: "https://facebook.com", icon: Facebook },
  { label: "YouTube", href: "https://youtube.com", icon: Youtube },
];

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-charcoal-950 dark:border-white/10">
      {/* Newsletter Banner */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10 xl:px-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="font-display text-2xl font-semibold text-white">
                Get inspired for your next journey
              </h3>
              <p className="mt-2 text-stone-400">
                Curated destinations, exclusive deals, and travel guides delivered weekly.
              </p>
            </div>
            <form className="flex w-full max-w-md gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-stone-500 outline-none transition-colors focus:border-amber-500/50 focus:bg-white/8"
              />
              <button
                type="submit"
                className="flex-shrink-0 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-10 xl:px-16">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-6">
          {/* Brand Column */}
          <div className="col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
                <MapPin className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display text-xl font-bold text-white">ZyroTrip</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone-400">
              Premium travel discovery, planning, and booking platform. We help curious
              travelers explore the world with confidence and style.
            </p>

            {/* Contact */}
            <div className="mt-6 space-y-2">
              <a
                href="mailto:hello@zyrotrip.com"
                className="flex items-center gap-2 text-sm text-stone-400 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4" />
                hello@zyrotrip.com
              </a>
              <a
                href="tel:+18001234567"
                className="flex items-center gap-2 text-sm text-stone-400 transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4" />
                +1 800 123 4567
              </a>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`ZyroTrip on ${social.label}`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-stone-400 transition-all hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-stone-300">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-stone-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone-500">
            © {new Date().getFullYear()} ZyroTrip, Inc. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4">
            <span className="text-xs text-stone-600">🌍 Available worldwide</span>
            <span className="text-xs text-stone-600">🔒 Secure & encrypted</span>
          </div>
        </div>

        {/* Giant Logo */}
        <div className="mt-12 flex w-full justify-center overflow-hidden pb-4">
          <h2 className="font-display text-[15vw] font-normal leading-[0.75] tracking-tighter text-white">
            ZyroTrip
          </h2>
        </div>
      </div>
    </footer>
  );
}
