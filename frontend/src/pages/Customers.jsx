import { useEffect, useState } from "react";
import api from "../../axios";
import { Search, Plus, X, Trash2, Edit, Save } from "lucide-react";
import toast from "react-hot-toast";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(
          `/customer/findcustomer?search=${search}`,
        );
        setCustomers(data.data.allCustomer);
      } catch (error) {
        toast.error("Failed to fetch customers.");
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => clearTimeout(debounce);
  }, [search]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/customer/findcustomer?search=${search}`);
      setCustomers(data.data.allCustomer);
    } catch (error) {
      toast.error("Failed to fetch customers.");
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (customer) => {
    try {
      const { data } = await api.get(
        `/customer/customermodify/${customer._id}`,
      );
      setSelectedCustomer(data.data);
      setFormData(data.data);
      setIsModalOpen(true);
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to fetch customer details.");
    }
  };

  const handleAddNewCustomer = () => {
    setSelectedCustomer(null);
    setFormData({ name: "", email: "", phone: "", source: "" });
    setIsModalOpen(true);
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
    setIsEditing(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (selectedCustomer) {
      // Update customer
      try {
        await api.put(`/customer/customermodify/${selectedCustomer._id}`, {
          dataObj: formData,
        });
        toast.success("Customer updated successfully!");
        fetchCustomers();
        handleCloseModal();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to update customer.",
        );
      }
    } else {
      // Create new customer
      try {
        await api.post("/customer/createcustomer", formData);
        toast.success("Customer created successfully!");
        fetchCustomers();
        handleCloseModal();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to create customer.",
        );
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedCustomer) return;
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await api.delete(`/customer/customermodify/${selectedCustomer._id}`);
        toast.success("Customer deleted successfully!");
        fetchCustomers();
        handleCloseModal();
      } catch (error) {
        toast.error("Failed to delete customer.");
      }
    }
  };

  const handleUnsubscribe = async () => {
    if (!selectedCustomer) return;
    try {
      await api.post(`/customer/${selectedCustomer._id}/unsubscribe`);
      toast.success("Customer unsubscribed successfully!");
      // Optimistically update UI or refetch
      setSelectedCustomer((prev) => ({
        ...prev,
        emailSettings: { ...prev.emailSettings, subscribed: false },
      }));
      fetchCustomers(); // Or just update the single customer in the list
    } catch (error) {
      toast.error("Failed to unsubscribe customer.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-64"
            />
          </div>
          <button
            onClick={handleAddNewCustomer}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} />
            New Customer
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Orders</th>
              <th className="px-6 py-3">Created By</th>
              <th className="px-6 py-3">Total Spent</th>
              <th className="px-6 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center p-6">
                  Loading...
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr
                  key={customer._id}
                  className="bg-white border-b hover:bg-gray-50"
                  onClick={() => handleRowClick(customer)}
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4">{customer.email}</td>
                  <td className="px-6 py-4">{customer.orderCount}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {customer.createdBy?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-4">
                    ${customer.totalSpent.toFixed(2)}
                  </td>

                  <td className="px-6 py-4">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-6">
              {selectedCustomer
                ? isEditing
                  ? "Edit Customer"
                  : "Customer Details"
                : "Add New Customer"}
            </h2>

            <form onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleFormChange}
                    readOnly={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleFormChange}
                    readOnly={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleFormChange}
                    readOnly={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Source
                  </label>
                  <input
                    type="text"
                    name="source"
                    value={formData.source || ""}
                    onChange={handleFormChange}
                    readOnly={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                  />
                </div>
                {selectedCustomer && !isEditing && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">
                        Total Spent:{" "}
                        <span className="font-medium text-gray-800">
                          ${selectedCustomer.totalSpent.toFixed(2)}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Orders:{" "}
                        <span className="font-medium text-gray-800">
                          {selectedCustomer.orderCount}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Subscription:{" "}
                        <span
                          className={`font-medium ${
                            selectedCustomer.emailSettings?.subscribed
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {selectedCustomer.emailSettings?.subscribed
                            ? "Subscribed"
                            : "Unsubscribed"}
                        </span>
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-8 flex justify-between items-center">
                <div>
                  {selectedCustomer && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium"
                    >
                      <Trash2 size={16} /> Delete Customer
                    </button>
                  )}
                </div>
                <div className="flex gap-4">
                  {selectedCustomer &&
                    !isEditing &&
                    selectedCustomer.emailSettings?.subscribed && (
                      <button
                        type="button"
                        onClick={handleUnsubscribe}
                        className="px-4 py-2 border border-yellow-500 text-yellow-600 rounded-md hover:bg-yellow-50"
                      >
                        Unsubscribe
                      </button>
                    )}
                  {selectedCustomer && !isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      <Edit size={16} /> Edit
                    </button>
                  )}
                  {isEditing && (
                    <>
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-4 py-2 border rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        <Save size={16} /> Save Changes
                      </button>
                    </>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    // </div>
  );
};

export default Customers;
