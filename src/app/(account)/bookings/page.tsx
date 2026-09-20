import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Calendar, Users, MapPin, ExternalLink } from "lucide-react";

export default async function BookingsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const bookings = await db.booking.findMany({
    where: { userId: session.user.id },
    include: {
      package: {
        include: { destination: { include: { country: true } }, images: { where: { order: 0 }, take: 1 } }
      },
      hotel: {
        include: { destination: { include: { country: true } }, images: { where: { order: 0 }, take: 1 } }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "PENDING": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "CANCELLED": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "COMPLETED": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300";
    }
  };

  return (
    <div>
      <h2 className="mb-6 font-display text-2xl font-bold text-charcoal-950 dark:text-white">
        My Bookings
      </h2>

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-stone-200 border-dashed py-20 text-center dark:border-white/10">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-charcoal-900">
            <Calendar className="h-8 w-8 text-stone-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-charcoal-950 dark:text-white">No bookings yet</h3>
          <p className="mb-6 max-w-sm text-sm text-stone-500">
            You haven't booked any trips yet. Start exploring our packages and hotels.
          </p>
          <Link 
            href="/packages"
            className="rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
          >
            Explore Packages
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map(booking => {
            const isPackage = !!booking.package;
            const item = booking.package || booking.hotel;
            if (!item) return null;
            
            const image = item.images?.[0]?.url || ('heroImage' in item ? item.heroImage : null);
            
            return (
              <div key={booking.id} className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm sm:flex-row dark:border-white/10 dark:bg-charcoal-950/50">
                <div className="relative h-48 w-full shrink-0 sm:h-auto sm:w-64">
                  <Image src={image || "/placeholder.jpg"} alt={'name' in item ? item.name : item.title} fill className="object-cover" />
                </div>
                
                <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      <span className="text-sm font-medium text-stone-500">Ref: {booking.reference}</span>
                    </div>
                    
                    <h3 className="font-display text-xl font-bold text-charcoal-950 dark:text-white">
                      {'title' in item ? item.title : item.name}
                    </h3>
                    
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-500">
                      <MapPin className="h-4 w-4" />
                      {item.destination.name}, {item.destination.country.name}
                    </p>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4 border-t border-stone-100 pt-4 dark:border-white/10">
                      <div className="flex items-center gap-2 text-sm text-charcoal-700 dark:text-stone-300">
                        <Calendar className="h-4 w-4 text-amber-500" />
                        <div>
                          <p className="font-medium">{formatDate(booking.checkIn.toISOString())}</p>
                          <p className="text-xs text-stone-500">to {formatDate(booking.checkOut.toISOString())}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-charcoal-700 dark:text-stone-300">
                        <Users className="h-4 w-4 text-amber-500" />
                        <div>
                          <p className="font-medium">{booking.adults + booking.children + booking.infants} Travelers</p>
                          <p className="text-xs text-stone-500">{booking.adults} Ad, {booking.children} Ch, {booking.infants} Inf</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-end justify-between border-t border-stone-100 pt-4 dark:border-white/10">
                    <div>
                      <p className="text-xs text-stone-500">Total Paid</p>
                      <p className="text-lg font-bold text-charcoal-950 dark:text-white">
                        {formatCurrency(Number(booking.finalAmount))}
                      </p>
                    </div>
                    
                    <button className="flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-500 dark:text-amber-400">
                      View Details <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
