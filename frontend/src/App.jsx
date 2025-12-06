
import { Toaster as Sonner } from "/src/ui/sonner";
import { TooltipProvider } from "/src/ui/tooltip";
import AppLayout from "./layout/AppLayout";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AllRFPs from "./pages/AllRFPs";
import NotFound from "./pages/NotFound";
import SubmittedRFPs from "./pages/Submitted";
import NewIncoming from "./pages/NewIncoming";

import "./index.css";
import "./App.css";

const App = () => (
  <TooltipProvider>
    <Sonner />
    <BrowserRouter>
      <Routes>
  {/* Public Landing Page (no sidebar) */}
  <Route path="/" element={<Index />} />

  {/* Dashboard Layout Pages */}
  <Route element={<AppLayout />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/rfps" element={<AllRFPs />} />
    <Route path="/rfps/submitted" element={<SubmittedRFPs />} />
    <Route path="/rfps/new" element={<NewIncoming />} />


    {/* 404 must stay at the bottom */}
    <Route path="*" element={<NotFound />} />
  </Route>
</Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;

