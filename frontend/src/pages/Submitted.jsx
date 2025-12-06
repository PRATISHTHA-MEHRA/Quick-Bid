// src/pages/SubmittedRFPs.jsx
import { MoreVertical } from "lucide-react";

const submittedData = [
  {
    id: 3,
    title: "Supply of Multicore Flexible Aluminium Cables for Industrial Wiring",
    client: "Electrical Projects Division, IndusPower Systems Ltd.",
    deadline: "2025-01-18",
    status: "Submitted",
    priority: "High",
  },
];

const SubmittedRFPs = () => {
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

      <div className="px-10 pb-8">
        <div className="border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">RFP Title</th>
                <th className="px-6 py-3 text-left">Client / Org</th>
                <th className="px-6 py-3 text-left">Deadline</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {submittedData.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 max-w-xs">{r.title}</td>
                  <td className="px-6 py-4 text-gray-700">{r.client}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(r.deadline).toLocaleDateString("en-GB").replace(/\//g, "-")}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs rounded-lg bg-green-100 text-green-700 font-medium">
                      {r.status}
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
        </div>
      </div>
    </main>
  );
};

export default SubmittedRFPs;
