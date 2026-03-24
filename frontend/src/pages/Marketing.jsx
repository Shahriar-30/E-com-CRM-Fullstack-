import { useEffect, useState } from "react";
import api from "../../axios";
import toast from "react-hot-toast";
import {
  Plus,
  Send,
  Users,
  Megaphone,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

const Marketing = () => {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [campaigns, setCampaigns] = useState([]);
  const [segments, setSegments] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Visibility
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showSegmentModal, setShowSegmentModal] = useState(false);

  // Forms
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    type: "promotional",
    channel: "email",
    segmentId: "",
    couponId: "",
    scheduledAt: "",
  });

  const [segmentForm, setSegmentForm] = useState({
    name: "new",
    rules: { field: "totalSpent", operator: "gte", value: 0 },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campRes, segRes, coupRes] = await Promise.allSettled([
        api.get("/campaign"),
        api.get("/segment/findsegments"),
        api.get("/coupon/getcoupon"),
      ]);

      if (campRes.status === "fulfilled") {
        setCampaigns(campRes.value.data.data.campaigns || []);
      }
      if (segRes.status === "fulfilled") {
        setSegments(segRes.value.data.data || []);
      }
      if (coupRes.status === "fulfilled") {
        setCoupons(coupRes.value.data.data || []);
      }
    } catch (error) {
      toast.error("Failed to load marketing data.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Campaign Handlers ---

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      await api.post("/campaign", campaignForm);
      toast.success("Campaign created successfully");
      setShowCampaignModal(false);
      fetchData();
      setCampaignForm({
        name: "",
        type: "promotional",
        channel: "email",
        segmentId: "",
        couponId: "",
        scheduledAt: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create campaign");
    }
  };

  const handleSendCampaign = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to send this campaign to all recipients?",
      )
    )
      return;

    const toastId = toast.loading("Sending campaign emails...");
    try {
      await api.post(`/campaign/${id}/send`);
      toast.success("Campaign sent successfully!", { id: toastId });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send campaign", {
        id: toastId,
      });
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign?"))
      return;
    try {
      await api.delete(`/campaign/${id}`);
      toast.success("Campaign deleted");
      setCampaigns((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      toast.error("Failed to delete campaign");
    }
  };

  // --- Segment Handlers ---

  const handleCreateSegment = async (e) => {
    e.preventDefault();
    try {
      await api.post("/segment/createsegment", segmentForm);
      toast.success("Segment created successfully");
      setShowSegmentModal(false);
      fetchData();
      setSegmentForm({
        name: "new",
        rules: { field: "totalSpent", operator: "gte", value: 0 },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create segment");
    }
  };

  const handleRunEngine = async () => {
    const toastId = toast.loading("Running segmentation engine...");
    try {
      await api.post("/segment/runsegmentengine");
      toast.success("Segments updated successfully", { id: toastId });
      fetchData();
    } catch (error) {
      toast.error("Failed to run engine", { id: toastId });
    }
  };

  const handleDeleteSegment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this segment?"))
      return;
    try {
      await api.delete(`/segment/segmentmodify/${id}`);
      toast.success("Segment deleted");
      setSegments((prev) => prev.filter((s) => s._id !== id));
    } catch (error) {
      toast.error("Failed to delete segment");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Marketing</h1>
        <div className="flex gap-2">
          {activeTab === "campaigns" ? (
            <button
              onClick={() => setShowCampaignModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
            >
              <Plus size={20} /> Create Campaign
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleRunEngine}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition"
                title="Update segment counts based on rules"
              >
                <RefreshCw size={18} /> Refresh Rules
              </button>
              <button
                onClick={() => setShowSegmentModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
              >
                <Plus size={20} /> Create Segment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200">
        <button
          className={`pb-3 px-1 flex items-center gap-2 font-medium transition ${
            activeTab === "campaigns"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("campaigns")}
        >
          <Megaphone size={18} /> Campaigns
        </button>
        <button
          className={`pb-3 px-1 flex items-center gap-2 font-medium transition ${
            activeTab === "segments"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("segments")}
        >
          <Users size={18} /> Audience Segments
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading marketing data...
        </div>
      ) : (
        <>
          {/* Campaigns View */}
          {activeTab === "campaigns" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                  <tr>
                    <th className="px-6 py-3">Campaign Name</th>
                    <th className="px-6 py-3">Target</th>
                    <th className="px-6 py-3">Coupon</th>
                    <th className="px-6 py-3">Channel</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {campaigns.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-8 text-gray-500"
                      >
                        No campaigns found.
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((campaign) => (
                      <tr
                        key={campaign._id}
                        className="bg-white hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {campaign.name}
                        </td>
                        <td className="px-6 py-4">
                          {campaign.segmentId?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">
                          {campaign.couponId?.code || "N/A"}
                        </td>
                        <td className="px-6 py-4 capitalize">
                          {campaign.channel}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              campaign.state === "sent"
                                ? "bg-green-100 text-green-800"
                                : campaign.state === "scheduled"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {campaign.state.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {campaign.state !== "sent" && (
                              <button
                                onClick={() => handleSendCampaign(campaign._id)}
                                className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-100 rounded-full transition-colors"
                                title="Send Campaign"
                              >
                                <Send size={20} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteCampaign(campaign._id)}
                              className="text-red-600 hover:text-red-800 p-2 hover:bg-red-100 rounded-full transition-colors"
                              title="Delete Campaign"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Segments View */}
          {activeTab === "segments" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {segments.map((segment) => (
                <div
                  key={segment._id}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative group"
                >
                  <button
                    onClick={() => handleDeleteSegment(segment._id)}
                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
                      <Users size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 capitalize text-lg">
                        {segment.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {segment.count} Customers
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 border border-gray-100">
                    <p>
                      <span className="font-semibold text-gray-600">Rule:</span>{" "}
                      {segment.rules.field}{" "}
                      <span className="font-mono bg-gray-200 px-1 rounded">
                        {segment.rules.operator}
                      </span>{" "}
                      {segment.rules.value}
                    </p>
                  </div>
                </div>
              ))}
              {segments.length === 0 && (
                <div className="col-span-full text-center py-10 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  No segments found. Create one to classify your customers.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">New Campaign</h2>
              <button
                onClick={() => setShowCampaignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Campaign Name
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  value={campaignForm.name}
                  onChange={(e) =>
                    setCampaignForm({ ...campaignForm, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 capitalize"
                    value={campaignForm.type}
                    onChange={(e) =>
                      setCampaignForm({ ...campaignForm, type: e.target.value })
                    }
                  >
                    {[
                      "welcome",
                      "win-back",
                      "promotional",
                      "abandoned cart",
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Channel
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 capitalize"
                    value={campaignForm.channel}
                    onChange={(e) =>
                      setCampaignForm({
                        ...campaignForm,
                        channel: e.target.value,
                      })
                    }
                  >
                    {["email", "sms"].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Scheduled At
                </label>
                <input
                  type="datetime-local"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  value={campaignForm.scheduledAt}
                  onChange={(e) =>
                    setCampaignForm({
                      ...campaignForm,
                      scheduledAt: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Audience Segment
                </label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  value={campaignForm.segmentId}
                  onChange={(e) =>
                    setCampaignForm({
                      ...campaignForm,
                      segmentId: e.target.value,
                    })
                  }
                >
                  <option value="">Select Segment</option>
                  {segments.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.count} users)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Offer Coupon
                </label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  value={campaignForm.couponId}
                  onChange={(e) =>
                    setCampaignForm({
                      ...campaignForm,
                      couponId: e.target.value,
                    })
                  }
                >
                  <option value="">Select Coupon</option>
                  {coupons.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code} (
                      {c.discountType === "percentage"
                        ? `${c.discountValue}%`
                        : `$${c.discountValue}`}
                      )
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCampaignModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Segment Modal */}
      {showSegmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">New Segment</h2>
              <button
                onClick={() => setShowSegmentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateSegment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Segment Category
                </label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 capitalize"
                  value={segmentForm.name}
                  onChange={(e) =>
                    setSegmentForm({ ...segmentForm, name: e.target.value })
                  }
                >
                  {["new", "loyal", "at-risk", "vip"].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg space-y-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700">
                  Conditions
                </h4>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Customer Metric
                  </label>
                  <select
                    className="block w-full rounded-md border-gray-300 text-sm p-2 border"
                    value={segmentForm.rules.field}
                    onChange={(e) =>
                      setSegmentForm({
                        ...segmentForm,
                        rules: { ...segmentForm.rules, field: e.target.value },
                      })
                    }
                  >
                    <option value="totalSpent">Total Spent</option>
                    <option value="orderCount">Order Count</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Operator
                    </label>
                    <select
                      className="block w-full rounded-md border-gray-300 text-sm p-2 border"
                      value={segmentForm.rules.operator}
                      onChange={(e) =>
                        setSegmentForm({
                          ...segmentForm,
                          rules: {
                            ...segmentForm.rules,
                            operator: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="gt">Greater (&gt;)</option>
                      <option value="gte">Greater/Equal (&ge;)</option>
                      <option value="lt">Less (&lt;)</option>
                      <option value="lte">Less/Equal (&le;)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Value
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="block w-full rounded-md border-gray-300 text-sm p-2 border"
                      value={segmentForm.rules.value}
                      onChange={(e) =>
                        setSegmentForm({
                          ...segmentForm,
                          rules: {
                            ...segmentForm.rules,
                            value: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowSegmentModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create Segment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Marketing;
