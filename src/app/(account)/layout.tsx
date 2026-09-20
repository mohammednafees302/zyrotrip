import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { User, Map, Heart, Plane, FileText, Tag, Gift, Bell, Settings, LogOut } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/profile");
  }

  const navItems = [
    { name: "Profile", href: "/profile", icon: User },
    { name: "My Trips", href: "/profile/trips", icon: Plane },
    { name: "Bookings", href: "/profile/bookings", icon: FileText },
    { name: "Wishlist", href: "/wishlist", icon: Heart },
    { name: "AI Itineraries", href: "/profile/itineraries", icon: Map },
    { name: "Coupons", href: "/profile/coupons", icon: Tag },
    { name: "Referrals", href: "/profile/referrals", icon: Gift },
    { name: "Notifications", href: "/profile/notifications", icon: Bell },
    { name: "Settings", href: "/profile/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-charcoal-950 pt-24 pb-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-16">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-charcoal-950 dark:text-white">
            My Account
          </h1>
          <p className="mt-1 text-stone-500 dark:text-stone-400">
            Welcome back, {session.user.name || "Traveler"}
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full shrink-0 lg:w-64">
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-charcoal-700 transition-colors hover:bg-stone-100 hover:text-charcoal-950 dark:text-stone-300 dark:hover:bg-charcoal-900 dark:hover:text-white"
                  >
                    <Icon className="h-5 w-5 text-stone-400" />
                    {item.name}
                  </Link>
                );
              })}
              
              <div className="my-4 border-t border-stone-200 dark:border-white/10" />
              
              <SignOutButton className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30">
                <LogOut className="h-5 w-5" />
                Sign Out
              </SignOutButton>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="min-w-0 flex-1">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-charcoal-900 sm:p-8">
              {children}
            </div>
          </main>
        </div>

      </div>
    </div>
  );
}
