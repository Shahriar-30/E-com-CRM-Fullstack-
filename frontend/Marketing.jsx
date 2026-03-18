import { useEffect, useState } from "react";
import api from "./axios";
import toast from "react-hot-toast";
import { Plus, Send } from "lucide-react";

const Marketing = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/campaign");
        setCampaigns(data.data.campaigns);
      } catch (error) {
        toast.error("Failed to fetch campaigns.");
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Marketing</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={20} /> Create Campaign
        </button>
      </div>
      {/* Campaigns List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
            <tr>
              <th className="px-6 py-3">Campaign Name</th>
              <th className="px-6 py-3">Segment</th>
              <th className="px-6 py-3">Coupon</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center p-6">
                  Loading...
                </td>
              </tr>
            ) : (
              campaigns.map((campaign) => (
                <tr
                  key={campaign._id}
                  className="bg-white border-b hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium">{campaign.name}</td>
                  <td className="px-6 py-4">
                    {campaign.segmentId?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 font-mono">
                    {campaign.couponId?.code || "N/A"}
                  </td>
                  <td className="px-6 py-4">{campaign.state}</td>
                  <td className="px-6 py-4">
                    {campaign.state !== "sent" && (
                      <button className="text-blue-600 hover:text-blue-800">
                        <Send size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Marketing;
