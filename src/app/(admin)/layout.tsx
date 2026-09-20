import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Book, Package, Users } from "lucide-react";

export const metadata = {
  title: "Admin Dashboard - ZyroTrip",
  description: "ZyroTrip Administration",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Bookings", href: "/admin/bookings", icon: Book },
    { name: "Packages", href: "/admin/packages", icon: Package },
    { name: "Users", href: "/admin/users", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-900 text-white flex flex-col h-auto md:min-h-screen">
        <div className="p-6 border-b border-gray-800">
          <Link href="/admin" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="bg-blue-600 text-white p-1 rounded">
              <Package className="w-5 h-5" />
            </span>
            ZyroTrip Admin
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors group"
            >
              <item.icon className="w-5 h-5 text-gray-400 group-hover:text-white" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800 text-sm text-gray-400">
          Logged in as {session?.user?.name || session?.user?.email}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 lg:p-10 w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
