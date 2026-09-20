import { db } from "@/lib/db";
import { formatCurrency, formatDuration } from "@/lib/utils";
import Link from "next/link";
import { Plus, Star } from "lucide-react";

export default async function AdminPackagesPage() {
  const packages = await db.travelPackage.findMany({
    include: {
      destination: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Travel Packages</h1>
          <p className="text-gray-500 mt-1">Manage, create, and update available travel packages.</p>
        </div>
        <Link
          href="#"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Package
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm font-medium">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Destination</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Base Price</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {packages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No packages found.
                  </td>
                </tr>
              ) : (
                packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {pkg.title}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {pkg.destination.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDuration(pkg.duration)}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatCurrency(pkg.priceFrom, pkg.currency)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span>{pkg.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {pkg.published ? (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full border bg-green-100 text-green-800 border-green-200">
                          Published
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full border bg-gray-100 text-gray-800 border-gray-200">
                          Draft
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
