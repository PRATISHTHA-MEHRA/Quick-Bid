// src/pages/AllRFPs.jsx
import { useState } from "react";
import { Search, MoreVertical, ChevronDown } from "lucide-react";

// 🔹 Full dataset
const fullData = [
  {
    id: 1,
    title:
      "Supply of XLPE Insulated Unarmoured Power Cables for Electrical Infrastructure Project",
    client:
      "Department of Electrical Engineering, Metro Energy Solutions Ltd.",
    deadline: "2025-01-10",
    status: "In Progress",
    priority: "High",
  },
  {
    id: 2,
    title: "Supply of Speaker Wire Twin Parallel for Audio Systems Upgrade",
    client: "Audio Engineering Division, SoundTech Solutions Pvt. Ltd.",
    deadline: "2025-01-15",
    status: "Pending",
    priority: "Medium",
  },
  {
    id: 3,
    title:
      "Supply of Multicore Flexible Aluminium Cables for Industrial Wiring",
    client: "Electrical Projects Division, IndusPower Systems Ltd.",
    deadline: "2025-01-18",
    status: "Submitted",
    priority: "High",
  },
  {
    id: 4,
    title:
      "Supply of Solar DC Cables (TUV Certified) for Renewable Energy Projects",
    client: "Renewable Energy Division, GreenVolt Solutions Ltd.",
    deadline: "2025-01-22",
    status: "Won",
    priority: "Low",
  },
  {
    id: 5,
    title:
      "Procurement of PVC Insulated Aluminium House Wiring Cables",
    client:
      "Public Infrastructure & Housing Development Board (PIHDB)",
    deadline: "2025-01-25",
    status: "In Progress",
    priority: "Medium",
  },
];

// 🔹 Status Badge Styling
const getStatusStyles = (status) =>
  ({
    "In Progress": "bg-orange-100 text-orange-700",
    Pending: "bg-gray-300 text-gray-700",
    Submitted: "bg-green-100 text-green-700",
    Won: "bg-blue-100 text-blue-700",
  }[status] || "bg-gray-200 text-gray-700");

// 🔹 Date Format
const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-GB").replace(/\//g, "-");

const AllRFPs = () => {
  const [openFilter, setOpenFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const toggleDropdown = (key) =>
    setOpenFilter(openFilter === key ? null : key);

  // 🔹 Apply Search + Filters
  const filteredData = fullData.filter((rfp) => {
    const matchesSearch =
      rfp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfp.client.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || rfp.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" || rfp.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <main className="flex-1 bg-white">
      {/* PAGE HEADER */}
      <div className="px-10 pt-6 pb-4">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
          All RFPs
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage and track all incoming Requests for Proposals.
        </p>
      </div>

      {/* SEARCH + FILTERS */}
      <div className="px-10 flex justify-between items-center mb-5">
        {/* Search Input */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by title, client…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-3 py-2 w-full border rounded-lg text-sm"
          />
        </div>

        {/* Filter Drop-downs */}
        <div className="flex gap-3">
          {/* Status Filter */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("status")}
              className="border px-4 py-2 rounded-md text-sm flex items-center gap-2 bg-white"
            >
              Status <ChevronDown size={14} />
            </button>

            {openFilter === "status" && (
              <div className="absolute bg-white shadow-md rounded-lg text-xs border p-2 w-32 z-20">
                {["All", "In Progress", "Pending", "Submitted", "Won"].map(
                  (s) => (
                    <p
                      key={s}
                      onClick={() => {
                        setStatusFilter(s);
                        setOpenFilter(null);
                      }}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {s}
                    </p>
                  )
                )}
              </div>
            )}
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("priority")}
              className="border px-4 py-2 rounded-md text-sm flex items-center gap-2 bg-white"
            >
              Priority <ChevronDown size={14} />
            </button>

            {openFilter === "priority" && (
              <div className="absolute bg-white shadow-md rounded-lg text-xs border p-2 w-32 z-20">
                {["All", "High", "Medium", "Low"].map((p) => (
                  <p
                    key={p}
                    onClick={() => {
                      setPriorityFilter(p);
                      setOpenFilter(null);
                    }}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {p}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="px-10 pb-8">
        <div className="border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">RFP Title</th>
                <th className="px-6 py-3 text-left">Client / Organization</th>
                <th className="px-6 py-3 text-center">Deadline</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((rfp) => (
                <tr
                  key={rfp.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 max-w-xs whitespace-normal">
                    {rfp.title}
                  </td>

                  <td className="px-6 py-4 text-gray-700 max-w-xs whitespace-normal">
                    {rfp.client}
                  </td>

                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap text-center">
                    {formatDate(rfp.deadline)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`px-3 py-1 text-xs rounded-md font-medium inline-block ${getStatusStyles(
                        rfp.status
                      )}`}
                    >
                      {rfp.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-gray-200 rounded transition">
                      <MoreVertical size={16} className="text-gray-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RESULTS COUNT */}
        <p className="text-xs text-gray-500 mt-3">
          Showing {filteredData.length} of {fullData.length} results
        </p>
      </div>
    </main>
  );
};

export default AllRFPs;
