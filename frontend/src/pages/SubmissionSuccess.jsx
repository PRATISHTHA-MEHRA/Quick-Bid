import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Download, Eye, Home } from "lucide-react";
import html2pdf from "html2pdf.js";

const SubmissionSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [submissionTime, setSubmissionTime] = useState("");
  const [rfpData, setRfpData] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const BACKEND_URL = "http://127.0.0.1:5000";

  // Get RFP data from location state
  useEffect(() => {
    if (location.state?.rfpData) {
      setRfpData(location.state.rfpData);
      const now = new Date();
      setSubmissionTime(
        now.toLocaleString("en-GB", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }
  }, [location]);

  // Download proposal as PDF
  const handleDownloadProposal = async () => {
    if (!rfpData) return;

    setDownloading(true);

    try {
      // Fetch the full proposal details from matched-products endpoint
      const response = await fetch(
        `${BACKEND_URL}/rfps/${rfpData.rfp_id}/matched-products`
      );
      const result = await response.json();

      if (!result.success) {
        alert("Failed to fetch proposal details. Please try again.");
        setDownloading(false);
        return;
      }

      const rfpDetails = result.rfp;
      const matchedProduct = result.matched_products[0];

      // Create proposal text from generate.py template
      const proposalText = `TECHNICAL & COMMERCIAL PROPOSAL
============================================================

RFP Reference Details
RFP ID: ${rfpDetails.rfp_id}
Title: ${rfpDetails.title}
Issuing Authority: ${rfpDetails.organization}
Department: ${rfpDetails.department}
Deadline: ${rfpDetails.deadline}

Match Summary
Match Confidence: ${matchedProduct.match_percent}%
Recommended SKU: ${matchedProduct.sku}
Matched Product: ${matchedProduct.product_name}
Category: ${matchedProduct.category}

Technical Offer
Product Specifications:
- Conductor Material: ${matchedProduct.conductor_material}
- Conductor Size: ${matchedProduct.conductor_size_sqmm} sqmm
- Voltage Rating: ${matchedProduct.voltage_rating} kV
- Compliance Standard: ${matchedProduct.standard_iec}

Commercial Offer
Unit Price: ₹${matchedProduct.unit_price.toFixed(2)}
Testing Charges: ₹${matchedProduct.test_price.toFixed(2)}
Total Base Price: ₹${(
        matchedProduct.unit_price + matchedProduct.test_price
      ).toFixed(2)}

(Final pricing will depend on the quantity specified in the BOQ.)

Why Our Product Fits the Requirement
- Fully compliant with ${matchedProduct.standard_iec} standards
- High-quality ${matchedProduct.conductor_material} conductor material
- Low resistance and durable insulation design
- Manufactured in certified facilities with strong QA processes
- Competitive pricing with complete transparency
- Extensive testing procedures included
- Reliable support and warranty coverage

Delivery and Terms
Expected Delivery: As per project schedule
Warranty: Standard OEM warranty applies
Payment Terms: To be mutually agreed
Proposal Validity: 90 days from date of issue

Compliance Statement
We confirm that the proposed product meets all requirements specified in the RFP, including:
• Conductor and insulation specifications  
• Voltage and resistance parameters  
• Type and routine testing obligations  
• Conformance with ${matchedProduct.standard_iec} standards  

Thank you for considering our proposal. We look forward to supporting your project with high-quality products and reliable service.

Best Regards  
Simrat Pyrotech  
simratpyrotech@gmail.com  
============================================================`;

      // Create a temporary container with full proposal content
      const element = document.createElement("div");
      element.style.padding = "20px";
      element.style.fontFamily = "Arial, sans-serif";
      element.style.fontSize = "12px";
      element.style.lineHeight = "1.6";
      element.style.color = "#333";

      // Add title
      const title = document.createElement("h1");
      title.textContent = "TECHNICAL & COMMERCIAL PROPOSAL";
      title.style.textAlign = "center";
      title.style.marginBottom = "20px";
      element.appendChild(title);

      // Add content as formatted text
      const contentDiv = document.createElement("div");
      contentDiv.style.whiteSpace = "pre-wrap";
      contentDiv.style.wordWrap = "break-word";
      contentDiv.textContent = proposalText;
      element.appendChild(contentDiv);

      // PDF options
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Proposal_${rfpData.rfp_id}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, logging: false },
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
      };

      // Generate PDF from entire content
      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .catch((err) => {
          console.error("PDF generation error:", err);
          alert("Failed to generate PDF. Please try again.");
        })
        .finally(() => {
          setDownloading(false);
        });
    } catch (err) {
      console.error("Error downloading proposal:", err);
      alert("Failed to download proposal. Please try again.");
      setDownloading(false);
    }
  };

  // Navigate to submitted RFPs page
  const handleViewSubmitted = () => {
    navigate("/rfps/submitted");
  };

  // Navigate to dashboard
  const handleGoHome = () => {
    navigate("/dashboard");
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse"></div>
              <CheckCircle size={80} className="text-green-600 relative z-10" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Proposal Submitted!
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 text-sm mb-6">
            Your proposal has been successfully submitted to the organization.
          </p>

          {/* RFP Details */}
          {rfpData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="mb-3">
                <p className="text-xs text-gray-500 uppercase font-semibold">
                  RFP ID
                </p>
                <p className="text-lg font-mono font-bold text-gray-900">
                  {rfpData.rfp_id}
                </p>
              </div>
              <div className="mb-3">
                <p className="text-xs text-gray-500 uppercase font-semibold">
                  RFP Title
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {rfpData.title}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">
                  Submission Time
                </p>
                <p className="text-sm text-gray-700">{submissionTime}</p>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-gray-200 my-6"></div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Download Proposal Button */}
            <button
              onClick={handleDownloadProposal}
              disabled={downloading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium text-sm"
            >
              <Download size={18} />
              {downloading ? "Generating PDF..." : "Download Proposal"}
            </button>

            {/* View Submitted RFPs Button */}
            <button
              onClick={handleViewSubmitted}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
            >
              <Eye size={18} />
              View Submitted RFPs
            </button>

            {/* Go to Dashboard Button */}
            <button
              onClick={handleGoHome}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
            >
              <Home size={18} />
              Back to Dashboard
            </button>
          </div>

          {/* Footer Message */}
          <p className="text-xs text-gray-500 mt-6 leading-relaxed">
            A confirmation email has been sent to the organization. You can
            track this proposal in your submitted RFPs list.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubmissionSuccess;
