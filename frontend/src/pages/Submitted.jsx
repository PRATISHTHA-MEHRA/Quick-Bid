import { useState, useEffect } from "react";
import { MoreVertical, RefreshCw, AlertCircle } from "lucide-react";

const SubmittedRFPs = () => {
  const [submittedData, setSubmittedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BACKEND_URL = "http://127.0.0.1:5000";

  // Fetch submitted RFPs from backend
  const fetchSubmitted = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/submitted`);
      const result = await response.json();

      if (result.success && result.data) {
        setSubmittedData(result.data);
      } else {
        setError(result.error || "Failed to fetch submitted RFPs");
        setSubmittedData([]);
      }
    } catch (err) {
      setError(
        `Connection error: ${err.message}. Make sure Flask backend is running on port 5000.`
      );
      console.error("Fetch error:", err);
      setSubmittedData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on component mount
  useEffect(() => {
    fetchSubmitted();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB").replace(/\//g, "-");
    } catch {
      return dateStr;
    }
  };

  return (
    <main className="flex-1 bg-white">
      <div className="px-10 pt-6 pb-4">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Submitted RFPs
        </h1>
        <p className="text-[14px] text-gray-500 mt-1">
          Track proposals that have been successfully submitted.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-10 pb-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
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
                onClick={fetchSubmitted}
                className="text-xs text-red-700 underline mt-2 hover:text-red-800"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="px-10 pb-8 flex justify-center items-center py-20">
          <div className="text-center">
            <RefreshCw
              size={48}
              className="animate-spin text-blue-600 mx-auto mb-4"
            />
            <p className="text-gray-600 font-medium">
              Loading submitted RFPs...
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && submittedData.length > 0 && (
        <div className="px-10 pb-8">
          <div className="border rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">RFP Title</th>
                  <th className="px-6 py-3 text-left">Client / Org</th>
                  <th className="px-6 py-3 text-left">Deadline</th>
                  <th className="px-6 py-3 text-center">Match Score</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {submittedData.map((rfp) => (
                  <tr key={rfp.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 max-w-xs">
                      {rfp.title}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{rfp.client}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(rfp.deadline)}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-blue-600">
                      {rfp.match_percent > 0
                        ? `${rfp.match_percent.toFixed(1)}%`
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs rounded-lg bg-green-100 text-green-700 font-medium">
                        {rfp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-gray-200 rounded">
                        <MoreVertical size={16} className="text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Results Count */}
            <div className="px-6 py-4 bg-gray-50 border-t">
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold">{submittedData.length}</span>{" "}
                submitted RFPs
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && submittedData.length === 0 && !error && (
        <div className="px-10 pb-8 flex justify-center items-center py-20">
          <div className="text-center">
            <AlertCircle size={56} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold text-lg">
              No submitted RFPs
            </p>
            <p className="text-sm text-gray-500 mt-2 mb-4">
              RFPs with closed status will appear here
            </p>
            <button
              onClick={fetchSubmitted}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default SubmittedRFPs;
