import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileForm } from "@/components/account/ProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      preferredCurrency: true,
      preferredLanguage: true,
      newsletterOptIn: true,
      createdAt: true
    }
  });

  if (!user) {
    redirect("/auth/login");
  }

  const stats = await db.$transaction([
    db.booking.count({ where: { userId: session.user.id } }),
    db.wishlistItem.count({ where: { wishlist: { userId: session.user.id } } })
  ]);

  return (
    <div>
      <h2 className="mb-6 font-display text-2xl font-bold text-charcoal-950 dark:text-white">
        Personal Information
      </h2>
      
      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-charcoal-950/50">
          <p className="text-xs font-medium text-stone-500 uppercase">Bookings</p>
          <p className="mt-1 text-2xl font-bold text-charcoal-950 dark:text-white">{stats[0]}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-charcoal-950/50">
          <p className="text-xs font-medium text-stone-500 uppercase">Wishlist</p>
          <p className="mt-1 text-2xl font-bold text-charcoal-950 dark:text-white">{stats[1]}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 sm:col-span-2 dark:border-white/10 dark:bg-charcoal-950/50">
          <p className="text-xs font-medium text-stone-500 uppercase">Member Since</p>
          <p className="mt-1 text-lg font-bold text-charcoal-950 dark:text-white">
            {new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
          </p>
        </div>
      </div>

      {/* Form */}
      <ProfileForm user={user} />
    </div>
  );
}
