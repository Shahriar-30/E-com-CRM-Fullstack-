import { useEffect, useState } from "react";
import api from "./axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Users, DollarSign, ShoppingBag, MessageSquare } from "lucide-react";
import StatCard from "./StatCard";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [openTickets, setOpenTickets] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        const analyticsPromise = api.get(
          `/analytics?startDate=${sevenDaysAgo.toISOString()}&endDate=${today.toISOString()}`,
        );
        const ordersPromise = api.get("/order/status?status=pending");
        const supportPromise = api.get("/support?status=open");

        const [analyticsRes, ordersRes, supportRes] = await Promise.all([
          analyticsPromise,
          ordersPromise,
          supportPromise,
        ]);

        setAnalytics(analyticsRes.data.data);
        setOrders(ordersRes.data.data);
        setOpenTickets(supportRes.data.data.total);
      } catch (error) {
        toast.error("Failed to fetch dashboard data.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const summary = analytics?.summary || {};

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue (7d)"
          value={`$${summary.totalRevenue?.toFixed(2) || "0.00"}`}
          icon={DollarSign}
          color="bg-green-500"
          loading={loading}
        />
        <StatCard
          title="New Customers (7d)"
          value={summary.newCustomers || 0}
          icon={Users}
          color="bg-blue-500"
          loading={loading}
        />
        <StatCard
          title="Total Orders (7d)"
          value={summary.totalOrders || 0}
          icon={ShoppingBag}
          color="bg-purple-500"
          loading={loading}
        />
        <StatCard
          title="Open Tickets"
          value={openTickets}
          icon={MessageSquare}
          color="bg-orange-500"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-bold text-lg mb-4">Revenue Last 7 Days</h3>
          {loading ? (
            <div className="h-72 animate-pulse bg-gray-200 rounded-md"></div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(str) =>
                    new Date(str).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Bar
                  dataKey="totalRevenue"
                  fill="#4f46e5"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-bold text-lg mb-4">Recent Orders</h3>
          <div className="space-y-4">
            {loading
              ? Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex justify-between animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-2/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    </div>
                  ))
              : orders.slice(0, 5).map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        Order #{order._id.slice(-6)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-bold text-green-600">
                      ${order.total.toFixed(2)}
                    </p>
                  </div>
                ))}
            {!loading && orders.length === 0 && (
              <p className="text-gray-500">No recent orders.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
