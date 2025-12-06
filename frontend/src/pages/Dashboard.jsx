import {
  FileText,
  Send,
  TrendingUp,
  Clock,
  MoreVertical,
  Search,
  Filter,
} from "lucide-react";

// RFP Data
const recentRFPs = [
  {
    id: 1,
    title:
      "Supply of XLPE Insulated Unarmoured Power Cables for Electrical Infrastructure Project",
    client:
      "Department of Electrical Engineering, Metro Energy Solutions Ltd.",
    deadline: "2025-01-10",
    status: "In Progress",
    match: 94,
  },
  {
    id: 2,
    title: "Supply of Speaker Wire Twin Parallel for Audio Systems Upgrade",
    client: "Audio Engineering Division, SoundTech Solutions Pvt. Ltd.",
    deadline: "2025-01-15",
    status: "Pending",
    match: 87,
  },
  {
    id: 3,
    title:
      "Supply of Multicore Flexible Aluminium Cables for Industrial Wiring",
    client: "Electrical Projects Division, IndusPower Systems Ltd.",
    deadline: "2025-01-18",
    status: "Submitted",
    match: 91,
  },
  {
    id: 4,
    title:
      "Supply of Solar DC Cables (TUV Certified) for Renewable Energy Projects",
    client: "Renewable Energy Division, GreenVolt Solutions Ltd.",
    deadline: "2025-01-22",
    status: "Won",
    match: 96,
  },
  {
    id: 5,
    title:
      "Procurement of PVC Insulated Aluminium House Wiring Cables",
    client:
      "Public Infrastructure & Housing Development Board (PIHDB)",
    deadline: "2025-01-25",
    status: "In Progress",
    match: 89,
  },
];

// Dashboard Stats
const stats = [
  { label: "Active RFPs", value: "24", icon: FileText, change: "+3 this week" },
  { label: "Proposals Sent", value: "156", icon: Send, change: "+12 this month" },
  { label: "Win Rate", value: "42%", icon: TrendingUp, change: "+5% vs last quarter" },
  { label: "Avg Response Time", value: "2.4 days", icon: Clock, change: "-1.2 days improved" },
];

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

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-GB").replace(/\//g, "-");

const Dashboard = () => {
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
            className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="px-8 py-6 space-y-10">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl border shadow-sm"
            >
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

            <div className="relative">
              <Search size={15} className="absolute left-3 top-2 text-gray-500" />
              <input
                className="pl-9 pr-4 py-2 border rounded-md text-sm w-44"
                placeholder="Search..."
              />
            </div>

            <button className="px-3 py-2 border rounded-md text-sm flex items-center gap-2">
              <Filter size={15} /> Filter
            </button>
          </div>

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
              {recentRFPs.map((rfp) => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {formatDate(rfp.deadline)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-blue-600 font-semibold">
                    {rfp.match}%
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
        </div>

      </div>
    </main>
  );
};

export default Dashboard;
