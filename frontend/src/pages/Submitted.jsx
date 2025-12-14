import { useState, useEffect } from "react";
import { MoreVertical, RefreshCw, AlertCircle, Download } from "lucide-react";
import html2pdf from "html2pdf.js";

const SubmittedRFPs = () => {
  const [submittedData, setSubmittedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BACKEND_URL = "http://127.0.0.1:5000";

  // Fetch submitted RFPs from backend
  const fetchSubmitted = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/submitted`);
      const result = await response.json();

      if (result.success && result.data) {
        setSubmittedData(result.data);
      } else {
        setError(result.error || "Failed to fetch submitted RFPs");
        setSubmittedData([]);
      }
    } catch (err) {
      setError(
        `Connection error: ${err.message}. Make sure Flask backend is running on port 5000.`
      );
      console.error("Fetch error:", err);
      setSubmittedData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on component mount
  useEffect(() => {
    fetchSubmitted();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      // Handle ISO format (YYYY-MM-DD)
      if (typeof dateStr === "string" && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateStr.split("-");
        return `${day}-${month}-${year}`;
      }
      return new Date(dateStr).toLocaleDateString("en-GB").replace(/\//g, "-");
    } catch {
      return dateStr;
    }
  };

  // Download proposal as PDF
  const handleDownloadProposal = async (rfp) => {
    try {
      // Fetch the full proposal details from matched-products endpoint
      const response = await fetch(
        `${BACKEND_URL}/rfps/${rfp.rfp_id}/matched-products`
      );
      const result = await response.json();

      if (!result.success) {
        alert("Failed to fetch proposal details. Please try again.");
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
        filename: `Proposal_${rfp.rfp_id}.pdf`,
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
        });
    } catch (err) {
      console.error("Error downloading proposal:", err);
      alert("Failed to download proposal. Please try again.");
    }
  };

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

      {/* Error Message */}
      {error && (
        <div className="px-10 pb-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle
              size={20}
              className="text-red-600 mt-0.5 flex-shrink-0"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">
                Error loading RFPs
              </p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
              <button
                onClick={fetchSubmitted}
                className="text-xs text-red-700 underline mt-2 hover:text-red-800"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="px-10 pb-8 flex justify-center items-center py-20">
          <div className="text-center">
            <RefreshCw
              size={48}
              className="animate-spin text-blue-600 mx-auto mb-4"
            />
            <p className="text-gray-600 font-medium">
              Loading submitted RFPs...
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && submittedData.length > 0 && (
        <div className="px-10 pb-8">
          <div className="border rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">RFP Title</th>
                  <th className="px-6 py-3 text-left">Client / Org</th>
                  <th className="px-6 py-3 text-left">Deadline</th>
                  <th className="px-6 py-3 text-center">Match Score</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {submittedData.map((rfp) => (
                  <tr key={rfp.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 max-w-xs">
                      {rfp.title}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{rfp.client}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(rfp.deadline)}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-blue-600">
                      {rfp.match_percent > 0
                        ? `${rfp.match_percent.toFixed(1)}%`
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs rounded-lg bg-green-100 text-green-700 font-medium">
                        {rfp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDownloadProposal(rfp)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition font-medium"
                      >
                        <Download size={14} />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Results Count */}
            <div className="px-6 py-4 bg-gray-50 border-t">
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold">{submittedData.length}</span>{" "}
                submitted RFPs
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && submittedData.length === 0 && !error && (
        <div className="px-10 pb-8 flex justify-center items-center py-20">
          <div className="text-center">
            <AlertCircle size={56} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold text-lg">
              No submitted RFPs
            </p>
            <p className="text-sm text-gray-500 mt-2 mb-4">
              RFPs with submitted proposals will appear here
            </p>
            <button
              onClick={fetchSubmitted}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default SubmittedRFPs;
