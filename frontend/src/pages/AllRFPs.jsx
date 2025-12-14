import { useState, useEffect } from "react";
import {
  Search,
  MoreVertical,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  Plus,
} from "lucide-react";

const getStatusStyles = (status) => {
  const statusMap = {
    "In Progress": "bg-orange-100 text-orange-700",
    Pending: "bg-gray-300 text-gray-700",
    Submitted: "bg-green-100 text-green-700",
    Won: "bg-blue-100 text-blue-700",
    Open: "bg-green-100 text-green-700",
    Active: "bg-blue-100 text-blue-700",
    Closed: "bg-gray-300 text-gray-700",
    "Closing Soon": "bg-red-100 text-red-700",
  };
  return statusMap[status] || "bg-gray-200 text-gray-700";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openFilter, setOpenFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [submittedRfpIds, setSubmittedRfpIds] = useState([]);

  const BACKEND_URL = "http://127.0.0.1:5000";

  // Fetch submitted RFP IDs from backend
  const fetchSubmittedRfpIds = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/submitted`);
      const result = await response.json();

      if (result.success && result.data) {
        const ids = result.data.map((rfp) => rfp.rfp_id);
        setSubmittedRfpIds(ids);
      }
    } catch (err) {
      console.error("Error fetching submitted RFPs:", err);
    }
  };

  // Fetch scraped RFPs from backend
  const fetchRFPs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/scrape`);
      const result = await response.json();

      if (result.success && result.data) {
        // Enrich empty fields with sample data for testing
        const enrichedData = result.data.map((rfp, idx) => ({
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
          // Override status if RFP is submitted
          status: submittedRfpIds.includes(rfp.rfp_id)
            ? "Submitted"
            : rfp.status,
        }));
        setRfpData(enrichedData);
      } else {
        setError(result.error || "Failed to fetch RFPs");
      }
    } catch (err) {
      setError(
        `Connection error: ${err.message}. Make sure Flask backend is running on port 5000.`
      );
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch submitted RFP IDs on component mount
  useEffect(() => {
    fetchSubmittedRfpIds();
  }, []);

  // Fetch RFPs when submitted IDs are loaded
  useEffect(() => {
    if (submittedRfpIds.length >= 0) {
      fetchRFPs();
    }
  }, [submittedRfpIds]);

  const toggleDropdown = (key) =>
    setOpenFilter(openFilter === key ? null : key);

  // Get unique statuses and categories
  const uniqueStatuses = [
    "All",
    ...new Set(rfpData.map((r) => r.status).filter(Boolean)),
  ];
  const uniqueCategories = [
    "All",
    ...new Set(rfpData.map((r) => r.category).filter(Boolean)),
  ];

  // Filter data
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
    <main className="flex-1 bg-gray-50 min-h-screen">
      {/* HEADER TITLE */}
      <div className="px-10 pt-8 pb-6 bg-white border-b">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All RFPs</h1>
            <p className="text-sm text-gray-600 mt-2">
              Manage and track all incoming Requests for Proposals
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchRFPs}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition font-medium"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mx-10 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
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
              onClick={fetchRFPs}
              className="text-xs text-red-700 underline mt-2 hover:text-red-800"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* STATS CARDS */}
      {!loading && rfpData.length > 0 && (
        <div className="px-10 py-6 grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-xs text-gray-500 uppercase font-medium">
              Total RFPs
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {rfpData.length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-xs text-gray-500 uppercase font-medium">Open</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {rfpData.filter((r) => r.status === "Open").length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-xs text-gray-500 uppercase font-medium">
              Closing Soon
            </p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {rfpData.filter((r) => r.status === "Closing Soon").length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-xs text-gray-500 uppercase font-medium">Won</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {rfpData.filter((r) => r.status === "Won").length}
            </p>
          </div>
        </div>
      )}

      {/* SEARCH + FILTERS */}
      <div className="px-10 pb-6 flex justify-between items-center">
        {/* Search */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by title, client, RFP ID…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 pr-4 py-2.5 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* DROPDOWNS */}
        <div className="flex gap-3">
          {/* Status Filter */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("status")}
              className="border border-gray-300 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 bg-white hover:bg-gray-50 font-medium min-w-[140px] justify-between"
            >
              <span className="text-gray-700">Status: {statusFilter}</span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {openFilter === "status" && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg text-sm border p-2 w-48 z-20">
                {uniqueStatuses.map((s) => (
                  <div
                    key={s}
                    onClick={() => {
                      setStatusFilter(s);
                      setOpenFilter(null);
                    }}
                    className={`px-3 py-2 hover:bg-gray-100 cursor-pointer rounded ${
                      statusFilter === s
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : ""
                    }`}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("category")}
              className="border border-gray-300 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 bg-white hover:bg-gray-50 font-medium min-w-[160px] justify-between"
            >
              <span className="text-gray-700">Category: {categoryFilter}</span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {openFilter === "category" && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg text-sm border p-2 w-56 z-20 max-h-72 overflow-y-auto">
                {uniqueCategories.map((c) => (
                  <div
                    key={c}
                    onClick={() => {
                      setCategoryFilter(c);
                      setOpenFilter(null);
                    }}
                    className={`px-3 py-2 hover:bg-gray-100 cursor-pointer rounded ${
                      categoryFilter === c
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : ""
                    }`}
                  >
                    {c}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="px-10 pb-8 flex justify-center items-center py-20">
          <div className="text-center">
            <RefreshCw
              size={48}
              className="animate-spin text-blue-600 mx-auto mb-4"
            />
            <p className="text-gray-600 font-medium">
              Loading RFPs from backend...
            </p>
            <p className="text-sm text-gray-500 mt-1">
              This may take a few moments
            </p>
          </div>
        </div>
      )}

      {/* TABLE */}
      {!loading && filteredData.length > 0 && (
        <div className="px-10 pb-8">
          <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    RFP ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredData.map((rfp, index) => (
                  <tr
                    key={rfp.rfp_id || index}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-blue-600 font-medium">
                        {rfp.rfp_id || "N/A"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 mb-1 max-w-md">
                        {rfp.title || "Untitled RFP"}
                      </div>
                      {rfp.category && (
                        <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                          {rfp.category}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-gray-900 max-w-xs">
                        {rfp.organization || "N/A"}
                      </div>
                      {rfp.department && (
                        <div className="text-xs text-gray-500 mt-1">
                          {rfp.department}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-900 font-medium">
                        {formatDate(rfp.deadline)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1.5 text-xs rounded-full font-semibold inline-block ${getStatusStyles(
                          rfp.status
                        )}`}
                      >
                        {rfp.status || "Unknown"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <MoreVertical size={18} className="text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RESULTS COUNT */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold">{filteredData.length}</span> of{" "}
              <span className="font-semibold">{rfpData.length}</span> results
            </p>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading &&
        !error &&
        filteredData.length === 0 &&
        rfpData.length === 0 && (
          <div className="px-10 pb-8 flex justify-center items-center py-20">
            <div className="text-center">
              <AlertCircle size={56} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-900 font-semibold text-lg">
                No RFPs found
              </p>
              <p className="text-sm text-gray-500 mt-2 mb-4">
                Click "Refresh" to fetch RFPs from the backend
              </p>
              <button
                onClick={fetchRFPs}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Fetch RFPs Now
              </button>
            </div>
          </div>
        )}

      {/* NO RESULTS AFTER FILTERING */}
      {!loading &&
        !error &&
        filteredData.length === 0 &&
        rfpData.length > 0 && (
          <div className="px-10 pb-8 flex justify-center items-center py-20">
            <div className="text-center">
              <Search size={56} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-900 font-semibold text-lg">
                No matching RFPs
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          </div>
        )}
    </main>
  );
};

export default AllRFPs;
