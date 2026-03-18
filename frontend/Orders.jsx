import { useEffect, useState } from "react";
import api from "./axios";
import toast from "react-hot-toast";
import { X, Plus, Search, Trash2, Save } from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [tempStatus, setTempStatus] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  const [selectionList, setSelectionList] = useState([]);
  const [selectionSearch, setSelectionSearch] = useState("");
  const [createOrderItems, setCreateOrderItems] = useState([]);
  const [createData, setCreateData] = useState({
    customerId: "",
    couponCode: "",
    paymentMethod: "card",
    shippingAddress: "",
  });

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/order/getorderbystatus?status=${status}`,
      );
      setOrders(data.data);
    } catch (error) {
      setOrders([]); // Clear on error
      toast.error(`Failed to fetch ${status} orders.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showCustomerModal || showCouponModal || showProductModal) {
      fetchSelectionData();
    }
  }, [selectionSearch, showCustomerModal, showCouponModal, showProductModal]);

  useEffect(() => {
    fetchOrders();
  }, [status]);

  const handleRowClick = async (orderId) => {
    setLoadingDetails(true);
    try {
      // Fetch Order Details (returns an array based on controller)
      const orderRes = await api.get(`/order/ordermodify/${orderId}`);
      const orderData = Array.isArray(orderRes.data)
        ? orderRes.data[0]
        : orderRes.data;
      setSelectedOrder(orderData);
      setTempStatus(orderData.status);

      // Fetch Order Items
      const itemsRes = await api.get(
        `/orderitem/orderitemmodify?orderId=${orderId}`,
      );
      setOrderItems(itemsRes.data.data);
    } catch (error) {
      toast.error("Failed to fetch order details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setOrderItems([]);
  };

  const handleSaveStatus = async () => {
    if (!selectedOrder) return;
    try {
      await api.post(
        `/order/ordermodify/${selectedOrder._id}?status=${tempStatus}`,
      );
      toast.success("Order status updated.");
      setSelectedOrder((prev) => ({ ...prev, status: tempStatus }));
      fetchOrders(); // Refresh the main list
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;
    if (
      window.confirm(
        "Are you sure you want to delete this order? This action cannot be undone.",
      )
    ) {
      try {
        await api.delete(`/order/ordermodify/${selectedOrder._id}`);
        toast.success("Order deleted successfully!");
        handleCloseModal();
        fetchOrders(); // Refresh the list
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete order.");
      }
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();

    const subTotal = createOrderItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const payload = { ...createData, subTotal };

    try {
      const { data } = await api.post("/order/createorder", payload);
      const newOrderId = data.data._id;

      // Create Order Items
      if (createOrderItems.length > 0) {
        await Promise.all(
          createOrderItems.map((item) =>
            api.post("/orderitem/createorderitem", {
              orderId: newOrderId,
              productId: item.productId,
              quantity: item.quantity,
            }),
          ),
        );
      }

      toast.success("Order created successfully!");
      setShowCreateModal(false);
      setCreateData({
        customerId: "",
        couponCode: "",
        paymentMethod: "card",
        shippingAddress: "",
      });
      setCreateOrderItems([]);
      if (status === "pending") fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create order");
    }
  };

  const fetchSelectionData = async () => {
    try {
      if (showCustomerModal) {
        const { data } = await api.get(
          `/customer/findcustomer?search=${selectionSearch}`,
        );
        setSelectionList(data.data.allCustomer || []);
      } else if (showCouponModal) {
        // Assuming coupon endpoint supports search or return all
        const { data } = await api.get(`/coupon`);
        const allCoupons = data.data || [];
        const filtered = selectionSearch
          ? allCoupons.filter((c) =>
              c.code.toLowerCase().includes(selectionSearch.toLowerCase()),
            )
          : allCoupons;
        setSelectionList(filtered);
      } else if (showProductModal) {
        // Assuming product endpoint returns list
        const { data } = await api.get(`/product`);
        const allProducts = data.data.products || data.data || [];
        const filtered = selectionSearch
          ? allProducts.filter((p) =>
              p.name.toLowerCase().includes(selectionSearch.toLowerCase()),
            )
          : allProducts;
        setSelectionList(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch selection data", error);
      setSelectionList([]);
    }
  };

  const addItemToOrder = (product) => {
    setCreateOrderItems((prev) => {
      const existing = prev.find((item) => item.productId === product._id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          unitPrice: product.price,
          quantity: 1,
        },
      ];
    });
    setShowProductModal(false);
  };

  const updateItemQuantity = (index, newQty) => {
    if (newQty < 1) return;
    setCreateOrderItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: newQty } : item,
      ),
    );
  };

  const removeItem = (index) => {
    setCreateOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const openModal = (type) => {
    setSelectionSearch("");
    setSelectionList([]);
    if (type === "customer") setShowCustomerModal(true);
    if (type === "coupon") setShowCouponModal(true);
    if (type === "product") setShowProductModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
        <div className="flex gap-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} /> Create Order
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
            <tr>
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">Customer ID</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center p-6">
                  Loading...
                </td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order._id}
                  className="bg-white border-b hover:bg-gray-50"
                  onClick={() => handleRowClick(order._id)}
                  style={{ cursor: "pointer" }}
                >
                  <td className="px-6 py-4 font-mono text-indigo-600">
                    #{order._id.slice(-6)}
                  </td>
                  <td className="px-6 py-4 font-mono">{order.customerId}</td>
                  <td className="px-6 py-4">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                        statusColors[order.status] ||
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-6">
                  No orders found for this status.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Order #{selectedOrder._id.slice(-6)}
                </h2>
                <p className="text-sm text-gray-500">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-8 flex-1">
              {loadingDetails ? (
                <div className="text-center py-10">Loading details...</div>
              ) : (
                <>
                  {/* Top Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 border-b pb-2">
                        Customer
                      </h3>
                      <p className="text-gray-700">
                        {selectedOrder.customer_details?.name || "N/A"}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {selectedOrder.customer_details?.email}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {selectedOrder.customer_details?.phone}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 border-b pb-2">
                        Shipping
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedOrder.shippingAddress}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 border-b pb-2">
                        Order Info
                      </h3>
                      <div>
                        <label className="block text-xs text-gray-500 uppercase">
                          Status
                        </label>
                        <select
                          value={tempStatus}
                          onChange={(e) => setTempStatus(e.target.value)}
                          className="mt-1 border rounded px-2 py-1 w-full text-sm font-medium"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <p className="text-sm pt-2">
                        <span className="text-gray-500">Method:</span>{" "}
                        <span className="capitalize">
                          {selectedOrder.paymentMethod}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Order Items
                    </h3>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 font-medium">
                          <tr>
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3 text-right">Price</th>
                            <th className="px-4 py-3 text-center">Qty</th>
                            <th className="px-4 py-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {orderItems.map((item) => (
                            <tr key={item._id}>
                              <td className="px-4 py-3">
                                {item.productId?.name || "Unknown Product"}
                              </td>
                              <td className="px-4 py-3 text-right">
                                ${item.unitPrice.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-3 text-right">
                                ${item.total.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2 text-right">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal:</span>
                        <span>${selectedOrder.subTotal?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Discount:</span>
                        <span>-${selectedOrder.discount?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg text-gray-900 border-t pt-2">
                        <span>Total:</span>
                        <span>${selectedOrder.total?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            {selectedOrder && !loadingDetails && (
              <div className="p-6 mt-auto border-t flex justify-between items-center sticky bottom-0 bg-white z-10">
                <div>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium px-4 py-2 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} /> Delete Order
                  </button>
                </div>
                <div>
                  {tempStatus !== selectedOrder.status && (
                    <button
                      onClick={handleSaveStatus}
                      className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      <Save size={16} /> Save Changes
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generic Selection Modal */}
      {(showCustomerModal || showCouponModal || showProductModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg h-[500px] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold">
                Select{" "}
                {showCustomerModal
                  ? "Customer"
                  : showCouponModal
                    ? "Coupon"
                    : "Product"}
              </h3>
              <button
                onClick={() => {
                  setShowCustomerModal(false);
                  setShowCouponModal(false);
                  setShowProductModal(false);
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 border-b">
              <div className="flex items-center border rounded px-2">
                <Search size={18} className="text-gray-400" />
                <input
                  className="w-full p-2 outline-none"
                  placeholder="Search..."
                  value={selectionSearch}
                  onChange={(e) => setSelectionSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {selectionList.map((item) => (
                <div
                  key={item._id}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b"
                  onClick={() => {
                    if (showCustomerModal) {
                      setCreateData({ ...createData, customerId: item._id });
                      setShowCustomerModal(false);
                    } else if (showCouponModal) {
                      setCreateData({ ...createData, couponCode: item.code });
                      setShowCouponModal(false);
                    } else if (showProductModal) {
                      addItemToOrder(item);
                    }
                  }}
                >
                  {showCustomerModal && (
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.email}</p>
                    </div>
                  )}
                  {showCouponModal && (
                    <div className="flex justify-between">
                      <span className="font-mono font-bold text-indigo-600">
                        {item.code}
                      </span>
                      <span className="text-sm text-gray-600">
                        {item.discountType === "percentage"
                          ? `${item.discountValue}%`
                          : `$${item.discountValue}`}{" "}
                        off
                      </span>
                    </div>
                  )}
                  {showProductModal && (
                    <div className="flex justify-between">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm font-bold">${item.price}</span>
                    </div>
                  )}
                </div>
              ))}
              {selectionList.length === 0 && (
                <p className="text-center p-4 text-gray-500">
                  No results found.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Create New Order
              </h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X size={24} className="text-gray-500 hover:text-gray-800" />
              </button>
            </div>
            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <div
                    onClick={() => openModal("customer")}
                    className="mt-1 block w-full border rounded-md px-3 py-2 cursor-pointer bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
                  >
                    <span
                      className={
                        createData.customerId
                          ? "text-gray-900"
                          : "text-gray-400"
                      }
                    >
                      {createData.customerId || "Select Customer"}
                    </span>
                    <Search size={16} className="text-gray-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Coupon Code
                  </label>
                  <div
                    onClick={() => openModal("coupon")}
                    className="mt-1 block w-full border rounded-md px-3 py-2 cursor-pointer bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
                  >
                    <span
                      className={
                        createData.couponCode
                          ? "text-gray-900"
                          : "text-gray-400"
                      }
                    >
                      {createData.couponCode || "Select Coupon (Optional)"}
                    </span>
                    <Search size={16} className="text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Order Items Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Order Items <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => openModal("product")}
                    className="text-indigo-600 text-sm hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Item
                  </button>
                </div>
                <div className="border rounded-md overflow-hidden bg-gray-50 min-h-[100px]">
                  {createOrderItems.length === 0 ? (
                    <p className="text-gray-400 text-center py-8 text-sm">
                      No items added.
                    </p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 border-b">
                        <tr>
                          <th className="px-3 py-2 text-left">Product</th>
                          <th className="px-3 py-2 text-right">Price</th>
                          <th className="px-3 py-2 text-center w-20">Qty</th>
                          <th className="px-3 py-2 text-right">Total</th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {createOrderItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2">{item.name}</td>
                            <td className="px-3 py-2 text-right">
                              ${item.unitPrice}
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItemQuantity(
                                    idx,
                                    parseInt(e.target.value),
                                  )
                                }
                                className="w-16 p-1 border rounded text-center"
                              />
                            </td>
                            <td className="px-3 py-2 text-right">
                              ${(item.unitPrice * item.quantity).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => removeItem(idx)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <div className="flex justify-end mt-2">
                  <p className="text-lg font-bold">
                    Subtotal: $
                    {createOrderItems
                      .reduce(
                        (sum, item) => sum + item.unitPrice * item.quantity,
                        0,
                      )
                      .toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                  value={createData.paymentMethod}
                  onChange={(e) =>
                    setCreateData({
                      ...createData,
                      paymentMethod: e.target.value,
                    })
                  }
                >
                  <option value="card">Card</option>
                  <option value="mfs">MFS</option>
                  <option value="cash on delivery">Cash on Delivery</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Shipping Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                  value={createData.shippingAddress}
                  onChange={(e) =>
                    setCreateData({
                      ...createData,
                      shippingAddress: e.target.value,
                    })
                  }
                />
              </div>
              <p className="text-xs text-gray-500 pt-2">
                * Indicates a required field
              </p>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
              >
                Create Order
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
