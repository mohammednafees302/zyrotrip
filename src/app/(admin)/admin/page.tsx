import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Users, Book, DollarSign, Activity } from "lucide-react";

export default async function AdminDashboardPage() {
  const totalUsersPromise = db.user.count();
  const totalBookingsPromise = db.booking.count();
  
  const revenuePromise = db.booking.aggregate({
    _sum: { totalAmount: true },
    where: {
      status: {
        in: ["CONFIRMED", "COMPLETED"]
      }
    }
  });

  const [totalUsers, totalBookings, revenueData] = await Promise.all([
    totalUsersPromise,
    totalBookingsPromise,
    revenuePromise
  ]);

  const totalRevenue = revenueData._sum.totalAmount || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your ZyroTrip metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg text-green-700">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-700">
            <Book className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Bookings</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalBookings}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-lg text-purple-700">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalUsers}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-lg text-orange-700">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Packages</p>
            <p className="text-2xl font-bold text-gray-900">
              {/* Optional extra metric */}
              <span className="text-lg text-gray-400 font-normal">View packages</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
