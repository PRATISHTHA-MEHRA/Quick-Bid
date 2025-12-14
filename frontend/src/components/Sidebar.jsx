import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Folder,
  Send,
  CheckCircle,
  FileText,
  Box,
  DollarSign,
  Settings,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path);

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 p-6 hidden lg:flex flex-col">
      {/* Branding */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-green-500 rounded-full"></div>
        <div>
          <h2 className="font-semibold text-gray-900 text-lg">
            RFP Automation
          </h2>
          <p className="text-xs text-gray-500">WSC Inc.</p>
        </div>
      </div>

      {/* Dashboard */}
      <Link
        to="/dashboard"
        className={`px-4 py-3 rounded-lg flex items-center gap-3 text-sm ${
          isActive("/dashboard")
            ? "bg-blue-100 text-blue-600 font-medium"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <LayoutDashboard size={18} /> Dashboard
      </Link>

      {/* RFP Section */}
      <p className="text-xs text-gray-400 uppercase mt-6 mb-1 px-4 tracking-wide">
        RFPs
      </p>

      {/* All RFPs */}
      <Link
        to="/rfps"
        className={`px-4 py-3 rounded-lg flex items-center gap-3 text-sm ${
          isActive("/rfps") &&
          !location.pathname.includes("/rfps/new") &&
          !location.pathname.includes("/rfps/submitted")
            ? "bg-blue-100 text-blue-600 font-medium"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <Folder size={18} /> All RFPs
      </Link>

      {/* New Incoming */}
      <Link
        to="/rfps/new"
        className={`px-4 py-3 rounded-lg flex items-center gap-3 text-sm ${
          isActive("/rfps/new")
            ? "bg-blue-100 text-blue-600 font-medium"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <Send size={18} /> New / Incoming
      </Link>

      {/* Submitted RFPs */}
      <Link
        to="/rfps/submitted"
        className={`px-4 py-3 rounded-lg flex items-center gap-3 text-sm ${
          isActive("/rfps/submitted")
            ? "bg-blue-100 text-blue-600 font-medium"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <CheckCircle size={18} /> Submitted
      </Link>

      {/* Tools Section */}
      <p className="text-xs text-gray-400 uppercase mt-6 mb-1 px-4 tracking-wide">
        Tools
      </p>

      <Link
        to="/productCatalogue"
        className={`px-4 py-3 rounded-lg flex items-center gap-3 text-sm ${
          isActive("/productCatalogue")
            ? "bg-blue-100 text-blue-600 font-medium"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <Box size={18} /> Product Catalogue
      </Link>

      <Link
        to="/pricingCatalogue"
        className={`px-4 py-3 rounded-lg flex items-center gap-3 text-sm ${
          isActive("/pricing")
            ? "bg-blue-100 text-blue-600 font-medium"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <DollarSign size={18} /> Pricing
      </Link>
    </aside>
  );
};

export default Sidebar;
