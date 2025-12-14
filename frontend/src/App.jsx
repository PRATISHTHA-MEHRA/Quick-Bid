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
import ProductCatalogue from "./pages/productCatalogue";
import PricingCatalogue from "./pages/pricingCatalogue";
import MatchedProducts from "./pages/matchedProducts";
import ProposalEdit from "./pages/ProposalEdit";
import SubmissionSuccess from "./pages/SubmissionSuccess";

import "./index.css";
import "./App.css";

const App = () => (
  <TooltipProvider>
    <Sonner />
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page (no sidebar) */}
        <Route path="/" element={<Index />} />

        {/* Success Page (no sidebar) */}
        <Route
          path="/rfps/submission-success"
          element={<SubmissionSuccess />}
        />

        {/* Dashboard Layout Pages */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rfps" element={<AllRFPs />} />
          <Route path="/rfps/submitted" element={<SubmittedRFPs />} />
          <Route path="/rfps/new" element={<NewIncoming />} />
          <Route path="/productCatalogue" element={<ProductCatalogue />} />
          <Route path="/pricingCatalogue" element={<PricingCatalogue />} />
          <Route path="/new-incoming" element={<NewIncoming />} />
          <Route
            path="/rfps/:rfpId/matched-products"
            element={<MatchedProducts />}
          />
          <Route path="/rfps/:rfpId/edit-proposal" element={<ProposalEdit />} />

          {/* 404 must stay at the bottom */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
