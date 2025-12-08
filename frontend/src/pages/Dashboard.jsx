// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import {
  FileText,
  Send,
  TrendingUp,
  Clock,
  MoreVertical,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

// Dashboard Stats (static)
// const stats = [
//   { label: "Active RFPs", value: "24", icon: FileText, change: "+3 this week" },
//   {
//     label: "Proposals Sent",
//     value: "156",
//     icon: Send,
//     change: "+12 this month",
//   },
//   {
//     label: "Win Rate",
//     value: "42%",
//     icon: TrendingUp,
//     change: "+5% vs last quarter",
//   },
//   {
//     label: "Avg Response Time",
//     value: "2.4 days",
//     icon: Clock,
//     change: "-1.2 days improved",
//   },
// ];

const Dashboard = () => {
  const [rfpData, setRfpData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState([
    { label: "Active RFPs", value: "0", icon: FileText, change: "" },
    { label: "Proposals Sent", value: "0", icon: Send, change: "" },
    { label: "Win Rate", value: "0%", icon: TrendingUp, change: "" },
    {
      label: "Avg Response Time",
      value: "2.4 days",
      icon: Clock,
      change: "-1.2 days improved",
    },
  ]);

  const BACKEND_URL = "http://127.0.0.1:5000";

  // Fetch dashboard RFPs from backend
  const fetchDashboardRFPs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/dashboard-rfps`);
      const result = await response.json();

      if (result.success && result.data) {
        setRfpData(result.data);

        // Calculate stats from data
        calculateStats(result.data);
      } else {
        setError(result.error || "Failed to fetch RFPs");
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

  // Calculate stats from RFP data
  const calculateStats = (data) => {
    // Count open RFPs (Active RFPs)
    const activeRFPs = data.filter(
      (rfp) => rfp.status === "In Progress"
    ).length;

    // Count submitted RFPs (Proposals Sent)
    const submittedRFPs = data.filter(
      (rfp) => rfp.status === "Submitted"
    ).length;

    // Calculate win rate as percentage of submitted proposals
    const totalRFPs = data.length;
    const winRate =
      totalRFPs > 0 ? ((submittedRFPs / totalRFPs) * 100).toFixed(1) : 0;

    // Update stats
    const updatedStats = [
      {
        label: "Active RFPs",
        value: activeRFPs.toString(),
        icon: FileText,
        change: `+${Math.max(0, activeRFPs - 3)} this week`,
      },
      {
        label: "Proposals Sent",
        value: submittedRFPs.toString(),
        icon: Send,
        change: `+${Math.max(0, submittedRFPs - 12)} this month`,
      },
      {
        label: "Win Rate",
        value: `${winRate}%`,
        icon: TrendingUp,
        change: `${submittedRFPs} of ${totalRFPs} submitted`,
      },
      {
        label: "Avg Response Time",
        value: "2.4 days",
        icon: Clock,
        change: "-1.2 days improved",
      },
    ];

    setStats(updatedStats);
  };

  // Fetch on component mount
  useEffect(() => {
    fetchDashboardRFPs();
  }, []);

  // Filter data based on search
  const filteredData = rfpData.filter((rfp) => {
    const matchesSearch =
      searchTerm === "" ||
      rfp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfp.client?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";

    try {
      // If already in YYYY-MM-DD format from backend (ISO format)
      if (typeof dateStr === "string" && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateStr.split("-");
        return `${day}-${month}-${year}`;
      }

      // Try parsing as standard date string
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return dateStr; // Return original if unparseable
      }

      return date.toLocaleDateString("en-GB").replace(/\//g, "-");
    } catch (e) {
      console.error("Date formatting error:", dateStr, e);
      return dateStr || "N/A";
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "In Progress":
        return "bg-orange-100 text-orange-700";
      case "Pending":
        return "bg-gray-200 text-gray-700";
      case "Submitted":
        return "bg-green-100 text-green-700";
      case "Won":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <main className="flex-1">
      {/* WHITE HEADER BAR */}
      <div className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>

        <div className="relative w-80 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search RFPs, proposals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="px-8 py-6 space-y-10">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="flex justify-between">
                <stat.icon className="text-blue-500 w-6 h-6" />
                <span className="text-xs text-gray-400">{stat.change}</span>
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* RECENT RFP TABLE */}
        <div className="bg-white border rounded-xl shadow-sm">
          <div className="p-5 border-b flex justify-between items-center">
            <h2 className="font-semibold text-lg text-gray-900">Recent RFPs</h2>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-2 text-gray-500"
                />
                <input
                  className="pl-9 pr-4 py-2 border rounded-md text-sm w-44"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button
                onClick={fetchDashboardRFPs}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-gray-100 disabled:bg-gray-100 transition"
              >
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
              </button>

              <button className="px-3 py-2 border rounded-md text-sm flex items-center gap-2 hover:bg-gray-100">
                <Filter size={15} /> Filter
              </button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200 flex items-start gap-3">
              <AlertCircle
                size={20}
                className="text-red-600 mt-0.5 flex-shrink-0"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">
                  Error loading RFPs
                </p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <RefreshCw
                  size={40}
                  className="animate-spin text-blue-600 mx-auto mb-3"
                />
                <p className="text-gray-600 font-medium text-sm">
                  Loading RFPs...
                </p>
              </div>
            </div>
          )}

          {/* Table */}
          {!loading && filteredData.length > 0 && (
            <>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left">RFP Title</th>
                    <th className="px-6 py-3 text-left">
                      Client / Issuing Organization
                    </th>
                    <th className="px-6 py-3 text-left">Deadline</th>
                    <th className="px-6 py-3 text-left">Match</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>

                <tbody>
                  {filteredData.map((rfp) => (
                    <tr
                      key={rfp.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-gray-900 font-medium max-w-xs whitespace-normal">
                        {rfp.title}
                      </td>
                      <td className="px-6 py-4 text-gray-800 max-w-xs whitespace-normal">
                        {rfp.client}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">
                        {formatDate(rfp.deadline)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-blue-600 font-semibold">
                        {rfp.match.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-md font-medium ${getStatusStyles(
                            rfp.status
                          )}`}
                        >
                          {rfp.status}
                        </span>
                      </td>
                      <td className="px-6 text-right">
                        <button className="p-1.5 hover:bg-gray-200 rounded-md transition">
                          <MoreVertical size={16} className="text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Results Count */}
              <div className="px-6 py-3 bg-gray-50 border-t text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold">{filteredData.length}</span> of{" "}
                <span className="font-semibold">{rfpData.length}</span> results
              </div>
            </>
          )}

          {/* Empty State */}
          {!loading && rfpData.length === 0 && !error && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <AlertCircle size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-900 font-semibold">No RFPs found</p>
                <p className="text-sm text-gray-500 mt-1 mb-4">
                  Click refresh to fetch RFPs from backend
                </p>
                <button
                  onClick={fetchDashboardRFPs}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Fetch Now
                </button>
              </div>
            </div>
          )}

          {/* No Search Results */}
          {!loading && rfpData.length > 0 && filteredData.length === 0 && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <Search size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-900 font-semibold">No matching RFPs</p>
                <p className="text-sm text-gray-500 mt-1">
                  Try adjusting your search term
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
