import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { BookingFlow } from "@/components/booking/BookingFlow";

export default async function BookPackagePage({ params }: { params: Promise<{ packageId: string }> }) {
  const resolvedParams = await params;
  
  const pkg = await db.travelPackage.findUnique({
    where: { id: resolvedParams.packageId },
    include: {
      destination: {
        include: { country: true }
      },
      images: { where: { order: 0 }, take: 1 }
    }
  });

  if (!pkg) {
    notFound();
  }

  // Create a minimal version of the package to pass to the client
  const clientPackage = {
    id: pkg.id,
    title: pkg.title,
    slug: pkg.slug,
    duration: pkg.duration,
    priceFrom: Number(pkg.priceDiscount || pkg.priceFrom),
    heroImage: pkg.images[0]?.url,
    destination: {
      name: pkg.destination.name,
      country: { name: pkg.destination.country.name }
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-charcoal-950 pt-24 pb-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-16">
        <BookingFlow pkg={clientPackage} />
      </div>
    </div>
  );
}
