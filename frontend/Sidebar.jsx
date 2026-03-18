import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Ticket,
  Megaphone,
  MessageSquare,
  BarChart3,
  LogOut,
} from "lucide-react";
import { useAuth } from "./AuthContext";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/customers", icon: Users, label: "Customers" },
  { href: "/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/products", icon: Package, label: "Products" },
  { href: "/coupons", icon: Ticket, label: "Coupons" },
  { href: "/marketing", icon: Megaphone, label: "Marketing" },
  { href: "/support", icon: MessageSquare, label: "Support" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
];

const Sidebar = () => {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-900 text-white flex flex-col fixed h-full">
      <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-gray-800">
        CRM
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
              pathname === item.href
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
            {user?.fullName?.[0].toUpperCase() || "A"}
          </div>
          <div>
            <p className="font-semibold">{user?.fullName || "Admin"}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
