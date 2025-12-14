import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, RefreshCw, AlertCircle, Package } from "lucide-react";

const getPriorityStyles = (priority) => {
  if (priority === "High") return "bg-red-100 text-red-700";
  if (priority === "Medium") return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
};

const NewIncoming = () => {
  const [rfpData, setRfpData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedRfpIds, setSubmittedRfpIds] = useState([]);
  const navigate = useNavigate();

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

  // Fetch new incoming RFPs from backend
  const fetchNewIncoming = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/new-incoming`);
      const result = await response.json();

      if (result.success && result.data) {
        setRfpData(result.data);
      } else {
        setError(result.error || "Failed to fetch new RFPs");
        setRfpData([]);
      }
    } catch (err) {
      setError(
        `Connection error: ${err.message}. Make sure Flask backend is running on port 5000.`
      );
      console.error("Fetch error:", err);
      setRfpData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch submitted RFP IDs on component mount
  useEffect(() => {
    fetchSubmittedRfpIds();
  }, []);

  // Fetch new incoming RFPs when component mounts or submitted IDs change
  useEffect(() => {
    fetchNewIncoming();
  }, [submittedRfpIds]);

  // Navigate to matched products page
  const handleViewMatches = (rfpId) => {
    navigate(`/rfps/${rfpId}/matched-products`);
  };

  // Navigate to proposal edit page
  const handleGenerateProposal = (rfpId) => {
    navigate(`/rfps/${rfpId}/edit-proposal`);
  };

  // Filter data based on search and exclude submitted RFPs
  const filteredData = rfpData.filter((rfp) => {
    const matchesSearch =
      searchTerm === "" ||
      rfp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfp.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfp.rfp_id?.toLowerCase().includes(searchTerm.toLowerCase());

    // Exclude submitted RFPs
    const isNotSubmitted = !submittedRfpIds.includes(rfp.rfp_id);

    return matchesSearch && isNotSubmitted;
  });

  return (
    <main className="flex-1 p-8 bg-gray-50 min-h-screen">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          New / Incoming RFPs
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Newly detected work opportunities waiting to be reviewed. Match scores
          indicate product fit with requirements.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
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
              onClick={fetchNewIncoming}
              className="text-xs text-red-700 underline mt-2 hover:text-red-800"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by RFP title or client name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-3 py-2 w-full border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={fetchNewIncoming}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm bg-white hover:bg-gray-100 disabled:bg-gray-100 transition font-medium"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>

        <button className="px-4 py-2 border rounded-lg text-sm flex items-center gap-2 bg-white hover:bg-gray-100 font-medium">
          <Filter size={16} /> Filter
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <RefreshCw
              size={48}
              className="animate-spin text-blue-600 mx-auto mb-4"
            />
            <p className="text-gray-600 font-medium">
              Fetching new RFPs from backend...
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Scanning, scraping, and matching with catalogue
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && filteredData.length > 0 && (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs border-b">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">RFP ID</th>
                <th className="px-6 py-4 text-left font-semibold">RFP Title</th>
                <th className="px-6 py-4 text-left font-semibold">
                  Client / Organization
                </th>
                <th className="px-6 py-4 text-center font-semibold">
                  Match Score
                </th>
                <th className="px-6 py-4 text-center font-semibold">
                  Priority
                </th>
                <th className="px-6 py-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredData.map((rfp) => (
                <tr key={rfp.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-blue-600 font-medium">
                      {rfp.rfp_id || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 max-w-sm">
                      {rfp.title}
                    </div>
                    {rfp.category && (
                      <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded mt-1">
                        {rfp.category}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 font-medium max-w-xs">
                      {rfp.client || "N/A"}
                    </div>
                    {rfp.department && (
                      <div className="text-xs text-gray-500 mt-1">
                        {rfp.department}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-lg font-bold text-blue-600">
                      {rfp.match_percent.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1.5 text-xs rounded-full font-semibold inline-block ${getPriorityStyles(
                        rfp.priority
                      )}`}
                    >
                      {rfp.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleViewMatches(rfp.rfp_id)}
                        className="px-3 py-2 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 transition font-medium flex items-center gap-1"
                      >
                        <Package size={14} />
                        View Matches
                      </button>
                      <button
                        onClick={() => handleGenerateProposal(rfp.rfp_id)}
                        className="px-3 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition font-medium"
                      >
                        View Proposal
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Results Count */}
          <div className="px-6 py-4 bg-gray-50 border-t">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold">{filteredData.length}</span> of{" "}
              <span className="font-semibold">
                {rfpData.length - submittedRfpIds.length}
              </span>{" "}
              results
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredData.length === 0 && !error && (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <AlertCircle size={56} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold text-lg">
              No new RFPs found
            </p>
            <p className="text-sm text-gray-500 mt-2 mb-4">
              {rfpData.length > 0 && submittedRfpIds.length > 0
                ? "All new RFPs have been submitted or no matching RFPs available"
                : 'Click "Refresh" to scan for new incoming RFPs'}
            </p>
            <button
              onClick={fetchNewIncoming}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Fetch Now
            </button>
          </div>
        </div>
      )}

      {/* No Search Results */}
      {!loading &&
        rfpData.length > 0 &&
        filteredData.length === 0 &&
        error === null && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Search size={56} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-900 font-semibold text-lg">
                No matching RFPs
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your search term
              </p>
            </div>
          </div>
        )}
    </main>
  );
};

export default NewIncoming;
