import { useEffect, useState } from "react";
import api from "../../axios";
import toast from "react-hot-toast";
import {
  MessageSquare,
  Plus,
  Search,
  Send,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Edit2,
  Save,
} from "lucide-react";

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", priority: "" });

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Data for creation
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [createForm, setCreateForm] = useState({
    customerId: "",
    orderId: "",
    subject: "",
    priority: "medium",
    message: "",
  });

  // Reply State
  const [replyMessage, setReplyMessage] = useState("");

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      let query = "/support?";
      if (filters.status) query += `status=${filters.status}&`;
      if (filters.priority) query += `priority=${filters.priority}&`;

      const { data } = await api.get(query);
      setTickets(data.data.tickets);
    } catch (error) {
      toast.error("Failed to fetch support tickets.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [custRes, orderRes] = await Promise.all([
        api.get("/customer/findcustomer?limit=100"),
        api.get("/order/getorderbystatus?status=all"),
      ]);
      setCustomers(custRes.data.data.allCustomer);
      setOrders(orderRes.data.data); // These are all orders for the user
    } catch (error) {
      toast.error("Failed to load customers or orders");
    }
  };

  const handleOpenCreate = () => {
    fetchDependencies();
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/support", createForm);
      toast.success("Ticket created successfully");
      setIsCreateOpen(false);
      setCreateForm({
        customerId: "",
        orderId: "",
        subject: "",
        priority: "medium",
        message: "",
      });
      fetchTickets();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create ticket");
    }
  };

  const handleRowClick = async (id) => {
    try {
      const { data } = await api.get(`/support/${id}`);
      setSelectedTicket(data.data);
      setIsEditing(false);
      setIsDetailOpen(true);
    } catch (error) {
      toast.error("Failed to load ticket details");
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    try {
      const { data } = await api.put(`/support/${selectedTicket._id}/reply`, {
        message: replyMessage,
      });
      setSelectedTicket(data.data); // Update local view with new message
      setReplyMessage("");
      toast.success("Reply sent");
      fetchTickets(); // Update list view
    } catch (error) {
      toast.error("Failed to send reply");
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const { data } = await api.put(`/support/${selectedTicket._id}/status`, {
        status: newStatus,
      });
      setSelectedTicket(data.data);
      toast.success(`Status updated to `);
      fetchTickets();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleUpdateTicket = async () => {
    try {
      const { data } = await api.put(`/support/${selectedTicket._id}`, {
        subject: selectedTicket.subject,
        priority: selectedTicket.priority,
        status: selectedTicket.status,
      });
      setSelectedTicket(data.data);
      setIsEditing(false);
      toast.success("Ticket details updated");
      fetchTickets();
    } catch (error) {
      toast.error("Failed to update ticket");
    }
  };

  // Helper to filter orders based on selected customer in create form
  const getCustomerOrders = () => {
    if (!createForm.customerId) return [];
    return orders.filter((o) => o.customerId === createForm.customerId);
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case "resolved":
        return "text-green-600 bg-green-50";
      case "in-progress":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Support Tickets</h1>
        <button
          onClick={handleOpenCreate}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus size={20} /> New Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex-1 max-w-xs">
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Status
          </label>
          <select
            className="w-full border rounded-md p-2 text-sm"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div className="flex-1 max-w-xs">
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Priority
          </label>
          <select
            className="w-full border rounded-md p-2 text-sm"
            value={filters.priority}
            onChange={(e) =>
              setFilters({ ...filters, priority: e.target.value })
            }
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
              <tr>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center p-8 text-gray-500">
                    Loading tickets...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-8 text-gray-500">
                    No tickets found.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    onClick={() => handleRowClick(ticket._id)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {ticket.subject}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900">
                          {ticket.customerId?.name || "Unknown"}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {ticket.customerId?.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)} capitalize`}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)} capitalize flex w-fit items-center gap-1`}
                      >
                        {ticket.status === "resolved" ? (
                          <CheckCircle size={12} />
                        ) : (
                          <Clock size={12} />
                        )}
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(ticket.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-indigo-600">
                        <MoreHorizontal size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-800">
                Create Support Ticket
              </h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer
                </label>
                <select
                  required
                  className="w-full border rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={createForm.customerId}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      customerId: e.target.value,
                      orderId: "",
                    })
                  }
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related Order
                </label>
                <select
                  required
                  disabled={!createForm.customerId}
                  className="w-full border rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
                  value={createForm.orderId}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, orderId: e.target.value })
                  }
                >
                  <option value="">Select Order</option>
                  {getCustomerOrders().map((o) => (
                    <option key={o._id} value={o._id}>
                      Order #{o._id.slice(-6).toUpperCase()} - ${o.total} (
                      {o.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={createForm.subject}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, subject: e.target.value })
                  }
                  placeholder="e.g., Refund request"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  className="w-full border rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={createForm.priority}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, priority: e.target.value })
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Message
                </label>
                <textarea
                  required
                  rows="4"
                  className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  value={createForm.message}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, message: e.target.value })
                  }
                  placeholder="Describe the issue..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Details & Chat Modal */}
      {isDetailOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <div>
                {isEditing ? (
                  <div className="flex flex-col gap-2 w-full max-w-md">
                    <input
                      type="text"
                      className="text-lg font-bold text-gray-800 border rounded px-2 py-1"
                      value={selectedTicket.subject}
                      onChange={(e) =>
                        setSelectedTicket({
                          ...selectedTicket,
                          subject: e.target.value,
                        })
                      }
                    />
                    <select
                      className="text-sm border rounded px-2 py-1 w-fit"
                      value={selectedTicket.priority}
                      onChange={(e) =>
                        setSelectedTicket({
                          ...selectedTicket,
                          priority: e.target.value,
                        })
                      }
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                ) : (
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    {selectedTicket.subject}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border uppercase ${getPriorityColor(selectedTicket.priority)}`}
                    >
                      {selectedTicket.priority}
                    </span>
                  </h2>
                )}
                {selectedTicket && ( // Only render if selectedTicket exists
                  <p className="text-sm text-gray-500 mt-1">
                    Ticket #{selectedTicket._id?.slice(-6)} •{" "}
                    {/* Optional chaining for _id is still good practice */}
                    {selectedTicket.customerId?.name}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <button
                    onClick={handleUpdateTicket}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-full transition"
                    title="Save Changes"
                  >
                    <Save size={20} />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition"
                  >
                    <Edit2 size={18} />
                  </button>
                )}

                <select
                  className={`text-sm border rounded-lg p-1.5 font-medium outline-none ${getStatusColor(selectedTicket.status)}`}
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
              {/* Order Context Card */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-semibold text-indigo-900">
                      Related Order
                    </h4>
                    <p className="text-indigo-700 text-sm">
                      Order #
                      {selectedTicket.orderId?._id
                        ? selectedTicket.orderId._id.slice(-6).toUpperCase()
                        : "N/A"}{" "}
                      • ${selectedTicket.orderId?.total}
                    </p>
                  </div>
                  <span className="text-xs bg-white text-indigo-600 px-2 py-1 rounded border border-indigo-100 uppercase font-semibold">
                    {selectedTicket.orderId?.status}
                  </span>
                </div>
              </div>

              {/* Messages */}
              {selectedTicket.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "agent" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${
                      msg.sender === "agent"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    <p
                      className={`text-[10px] mt-2 ${msg.sender === "agent" ? "text-indigo-200" : "text-gray-400"}`}
                    >
                      {msg.sender === "agent"
                        ? "You"
                        : selectedTicket.customerId?.name}{" "}
                      • {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            <div className="p-4 bg-white border-t">
              <form onSubmit={handleReply} className="flex gap-3">
                <input
                  type="text"
                  className="flex-1 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Type your reply..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!replyMessage.trim()}
                  className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
