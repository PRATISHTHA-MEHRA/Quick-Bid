import { useState, useEffect, useRef } from "react";
import {
  Search,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  MoreVertical,
} from "lucide-react";

const BACKEND_URL = "http://127.0.0.1:5000";

const getStatusStyles = (status) => {
  const map = {
    "In Progress": "bg-orange-100 text-orange-700",
    Pending: "bg-gray-300 text-gray-700",
    Submitted: "bg-green-100 text-green-700",
    Won: "bg-blue-100 text-blue-700",
    Open: "bg-green-100 text-green-700",
    Active: "bg-blue-100 text-blue-700",
    Closed: "bg-gray-300 text-gray-700",
    "Closing Soon": "bg-red-100 text-red-700",
  };
  return map[status] || "bg-gray-200 text-gray-700";
};

const formatDate = (date) => {
  if (!date) return "N/A";
  try {
    return new Date(date).toLocaleDateString("en-GB").replace(/\//g, "-");
  } catch {
    return date;
  }
};

const AllRFPs = () => {
  const [rfpData, setRfpData] = useState([]);
  const [submittedRfpIds, setSubmittedRfpIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openFilter, setOpenFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const hasInitialized = useRef(false);

  const fetchSubmittedRfpIds = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/submitted`);
      const result = await response.json();
      if (result.success && result.data) {
        return result.data.map((r) => r.rfp_id);
      }
      return [];
    } catch (err) {
      console.error("Error fetching submitted RFPs:", err);
      return [];
    }
  };

  const fetchRFPs = async (submittedIds = []) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/scrape`);
      const result = await response.json();
      if (result.success && result.data) {
        const enriched = result.data.map((rfp, idx) => ({
          ...rfp,
          organization: rfp.organization || `Organization ${idx + 1}`,
          deadline:
            rfp.deadline ||
            new Date(Date.now() + (idx + 1) * 86400000 * 10)
              .toISOString()
              .split("T")[0],
          department: rfp.department || `Department ${idx + 1}`,
          category: rfp.category || "General",
          issue_date:
            rfp.issue_date ||
            new Date(Date.now() - 86400000 * 5).toISOString().split("T")[0],
          status: submittedIds.includes(rfp.rfp_id) ? "Submitted" : rfp.status,
        }));
        setRfpData(enriched);
      } else {
        setError(result.error || "Failed to fetch RFPs");
      }
    } catch (err) {
      setError(`Connection error: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on component mount - ONLY ONCE
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeData = async () => {
      const submittedIds = await fetchSubmittedRfpIds();
      setSubmittedRfpIds(submittedIds);
      await fetchRFPs(submittedIds);
    };
    initializeData();
  }, []);

  // Manual refresh handler
  const handleRefresh = async () => {
    const submittedIds = await fetchSubmittedRfpIds();
    setSubmittedRfpIds(submittedIds);
    await fetchRFPs(submittedIds);
  };

  const toggleDropdown = (key) =>
    setOpenFilter(openFilter === key ? null : key);

  const uniqueStatuses = [
    "All",
    ...new Set(rfpData.map((r) => r.status).filter(Boolean)),
  ];
  const uniqueCategories = [
    "All",
    ...new Set(rfpData.map((r) => r.category).filter(Boolean)),
  ];

  const filteredData = rfpData.filter((rfp) => {
    const matchesSearch =
      searchTerm === "" ||
      rfp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfp.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfp.rfp_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || rfp.status === statusFilter;
    const matchesCategory =
      categoryFilter === "All" || rfp.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <main className="flex-1 bg-gray-50 min-h-screen transition-all duration-300">
      {/* HEADER */}
      <div className="px-6 lg:px-10 pt-8 pb-6 bg-white border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">All RFPs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track all incoming Requests for Proposals
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition font-medium text-sm"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">
            {loading ? "Refreshing..." : "Refresh"}
          </span>
        </button>
      </div>

      {/* ERROR */}
      {error && !loading && (
        <div className="mx-6 lg:mx-10 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex flex-col sm:flex-row gap-3">
          <AlertCircle
            size={20}
            className="text-red-600 mt-0.5 flex-shrink-0"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">
              Error loading RFPs
            </p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
            <button
              onClick={handleRefresh}
              className="text-xs text-red-700 underline mt-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center items-center py-32">
          <div className="text-center">
            <RefreshCw
              size={48}
              className="animate-spin text-blue-600 mx-auto mb-4"
            />
            <p className="text-gray-600 font-medium">Loading RFPs...</p>
          </div>
        </div>
      )}

      {/* SEARCH + FILTER */}
      {!loading && (
        <div className="px-6 lg:px-10 py-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, client, RFP ID…"
              className="pl-11 pr-4 py-2.5 w-full border rounded-lg text-sm"
            />
          </div>

          <div className="flex gap-3 flex-wrap sm:flex-nowrap">
            {/* STATUS FILTER */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("status")}
                className="border px-4 py-2.5 rounded-lg text-sm bg-white flex justify-between min-w-[140px] hover:bg-gray-50 transition"
              >
                Status: {statusFilter}
                <ChevronDown size={16} />
              </button>
              {openFilter === "status" && (
                <div className="absolute right-0 mt-2 bg-white border rounded-lg w-48 z-20 shadow-lg">
                  {uniqueStatuses.map((s) => (
                    <div
                      key={s}
                      onClick={() => {
                        setStatusFilter(s);
                        setOpenFilter(null);
                      }}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CATEGORY FILTER */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("category")}
                className="border px-4 py-2.5 rounded-lg text-sm bg-white flex justify-between min-w-[160px] hover:bg-gray-50 transition"
              >
                Category: {categoryFilter}
                <ChevronDown size={16} />
              </button>
              {openFilter === "category" && (
                <div className="absolute right-0 mt-2 bg-white border rounded-lg w-56 z-20 max-h-72 overflow-y-auto shadow-lg">
                  {uniqueCategories.map((c) => (
                    <div
                      key={c}
                      onClick={() => {
                        setCategoryFilter(c);
                        setOpenFilter(null);
                      }}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {c}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      {!loading && filteredData.length > 0 && (
        <div className="px-6 lg:px-10 pb-8">
          <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">RFP ID</th>
                  <th className="px-6 py-3 text-left">Title</th>
                  <th className="px-6 py-3 text-left">Organization</th>
                  <th className="px-6 py-3 text-center">Deadline</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredData.map((rfp) => (
                  <tr key={rfp.rfp_id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono text-xs text-blue-600">
                      {rfp.rfp_id}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {rfp.title}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {rfp.organization}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700">
                      {formatDate(rfp.deadline)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-semibold ${getStatusStyles(
                          rfp.status
                        )}`}
                      >
                        {rfp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <MoreVertical size={16} className="text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filteredData.length === 0 && !error && (
        <div className="px-6 lg:px-10 py-32 text-center">
          <AlertCircle size={56} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold text-lg">
            No matching RFPs
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </main>
  );
};

export default AllRFPs;
