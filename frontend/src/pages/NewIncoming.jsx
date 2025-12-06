import { Search, Filter } from "lucide-react";

const incomingRFPs = [
  {
    id: 1,
    title:
      "Supply of Speaker Wire Twin Parallel for Audio Systems Upgrade",
    client: "Audio Engineering Division, SoundTech Solutions Pvt. Ltd.",
    detection: "2 days ago",
    priority: "High (85)",
  },
];

const getPriorityStyles = (priority) => {
  if (priority.includes("High")) return "bg-red-100 text-red-700";
  if (priority.includes("Medium")) return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
};

const NewIncoming = () => {
  return (
    <main className="flex-1 p-8 bg-gray-50">

      {/* Title */}
      <h1 className="text-2xl font-semibold text-gray-900">
        New / Incoming RFPs
      </h1>

      {/* Subtitle */}
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Newly detected work opportunities waiting to be reviewed.
      </p>

      {/* Search & Filter */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-80">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by RFP title or client name..."
            className="pl-10 pr-3 py-2 w-full border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button className="px-3 py-2 border rounded-md text-sm flex items-center gap-2 bg-white hover:bg-gray-100">
          <Filter size={15} /> Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">RFP Title</th>
              <th className="px-6 py-3 text-left">Client / Organization Name</th>
              <th className="px-6 py-3 text-left">Detection</th>
              <th className="px-6 py-3 text-left">Priority</th>
              <th className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {incomingRFPs.map((rfp) => (
              <tr key={rfp.id} className="border-b hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-gray-900 font-medium">
                  {rfp.title}
                </td>
                <td className="px-6 py-4 text-gray-700">{rfp.client}</td>
                <td className="px-6 py-4 text-gray-700">{rfp.detection}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-md font-medium ${getPriorityStyles(
                      rfp.priority
                    )}`}
                  >
                    {rfp.priority}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button className="px-4 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition">
                    Generate Proposal
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center gap-2 mt-3 text-xs text-gray-600">
        <button className="border px-3 py-1 rounded hover:bg-gray-100">{'<'}</button>
        <button className="border px-3 py-1 rounded bg-gray-200">1</button>
        <button className="border px-3 py-1 rounded hover:bg-gray-100">{'>'}</button>
      </div>
    </main>
  );
};

export default NewIncoming;
