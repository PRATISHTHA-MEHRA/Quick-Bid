import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">

      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col overflow-y-auto">
       <div className="flex-1 min-h-[80vh] pb-32">
          <Outlet />
        </div>
        <Footer />
      </div>

    </div>
  );
};

export default AppLayout;
