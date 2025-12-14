import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Download,
  Send,
  ArrowLeft,
  Edit2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import html2pdf from "html2pdf.js";

const ProposalEdit = () => {
  const { rfpId } = useParams();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState(null);
  const [editedProposal, setEditedProposal] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [rfpDetails, setRfpDetails] = useState(null);

  const BACKEND_URL = "http://127.0.0.1:5000";

  // Fetch proposal and RFP details
  useEffect(() => {
    fetchProposalData();
  }, [rfpId]);

  const fetchProposalData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch matched products which includes RFP details and proposal
      const response = await fetch(
        `${BACKEND_URL}/rfps/${rfpId}/matched-products`
      );
      const result = await response.json();

      if (result.success) {
        setRfpDetails(result.rfp);

        // Generate proposal from first matched product
        if (result.matched_products && result.matched_products.length > 0) {
          const topMatch = result.matched_products[0];
          const proposalText = generateProposal(result.rfp, topMatch);
          setProposal({
            rfp_id: result.rfp.rfp_id,
            title: result.rfp.title,
            organization: result.rfp.organization,
            proposal_text: proposalText,
            matched_product: topMatch,
            match_percent: topMatch.match_percent,
          });
          setEditedProposal(proposalText);
        }
      } else {
        setError(result.error || "Failed to load proposal data");
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Generate proposal text
  const generateProposal = (rfp, product) => {
    return `TECHNICAL & COMMERCIAL PROPOSAL
============================================================

RFP Reference Details
RFP ID: ${rfp.rfp_id}
Title: ${rfp.title}
Issuing Authority: ${rfp.organization}
Department: ${rfp.department}
Deadline: ${rfp.deadline}

Match Summary
Match Confidence: ${product.match_percent}%
Recommended SKU: ${product.sku}
Matched Product: ${product.product_name}
Category: ${product.category}

Technical Offer
Product Specifications:
- Conductor Material: ${product.conductor_material}
- Conductor Size: ${product.conductor_size_sqmm} sqmm
- Voltage Rating: ${product.voltage_rating} kV
- Compliance Standard: ${product.standard_iec}

Commercial Offer
Unit Price: ₹${product.unit_price.toFixed(2)}
Testing Charges: ₹${product.test_price.toFixed(2)}
Total Base Price: ₹${(product.unit_price + product.test_price).toFixed(2)}

(Final pricing will depend on the quantity specified in the BOQ.)

Why Our Product Fits the Requirement
- Fully compliant with ${product.standard_iec} standards
- High-quality ${product.conductor_material} conductor material
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
• Conformance with ${product.standard_iec} standards  

Thank you for considering our proposal. We look forward to supporting your project with high-quality products and reliable service.

Best Regards  
Simrat Pyrotech  
simratpyrotech@gmail.com  
============================================================`;
  };

  // Handle proposal edit
  const handleEditChange = (e) => {
    setEditedProposal(e.target.value);
  };

  // Save edited proposal
  const handleSaveEdit = () => {
    setProposal({
      ...proposal,
      proposal_text: editedProposal,
    });
    setIsEditing(false);
  };

  // Download as PDF - Captures entire content
  const handleDownloadPDF = () => {
    if (!proposal) return;

    // Create a temporary container with full content
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
    contentDiv.textContent = editedProposal || proposal.proposal_text;
    element.appendChild(contentDiv);

    // PDF options
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Proposal_${proposal.rfp_id}.pdf`,
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
        setError("Failed to generate PDF. Please try again.");
      });
  };

  // Submit proposal
  const handleSubmitProposal = async () => {
    if (!proposal) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${BACKEND_URL}/submit-proposal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rfp_id: proposal.rfp_id,
          rfp_title: proposal.title,
          organization: proposal.organization,
          proposal_text: editedProposal || proposal.proposal_text,
          from_email: "simratpyrotech@gmail.com",
          to_email:
            rfpDetails?.submission_email || "simratoberoi2006@gmail.com",
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        // Navigate to success page with RFP data
        setTimeout(() => {
          navigate("/rfps/submission-success", {
            state: {
              rfpData: {
                rfp_id: proposal.rfp_id,
                title: proposal.title,
              },
            },
          });
        }, 500);
      } else {
        setError(result.error || "Failed to submit proposal");
      }
    } catch (err) {
      setError(`Submission error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin text-blue-600 mb-4"
            style={{ fontSize: "48px" }}
          >
            ⟳
          </div>
          <p className="text-gray-600 font-medium">Loading proposal...</p>
        </div>
      </main>
    );
  }

  if (!proposal) {
    return (
      <main className="flex-1 bg-gray-50 min-h-screen p-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertCircle size={56} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold">Proposal not found</p>
            <button
              onClick={() => navigate("/rfps/new")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to RFPs
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="px-10 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/rfps/new")}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Edit Proposal
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  RFP ID: {proposal.rfp_id} | Match:{" "}
                  {proposal.match_percent.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedProposal(proposal.proposal_text);
                    }}
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
                  >
                    <Edit2 size={18} />
                    Edit
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
                  >
                    <Download size={18} />
                    Download PDF
                  </button>
                  <button
                    onClick={handleSubmitProposal}
                    disabled={submitting}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
                  >
                    <Send size={18} />
                    {submitting ? "Submitting..." : "Submit Proposal"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mx-10 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle
            size={20}
            className="text-green-600 mt-0.5 flex-shrink-0"
          />
          <div>
            <p className="text-sm font-semibold text-green-800">
              Proposal submitted successfully!
            </p>
            <p className="text-xs text-green-600 mt-1">
              Redirecting to submitted RFPs...
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-10 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle
            size={20}
            className="text-red-600 mt-0.5 flex-shrink-0"
          />
          <div>
            <p className="text-sm font-semibold text-red-800">Error</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="px-10 py-6">
        {isEditing ? (
          // Edit Mode
          <div className="bg-white rounded-xl border shadow-sm p-8">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Edit Proposal Content
              </label>
              <textarea
                value={editedProposal}
                onChange={handleEditChange}
                className="w-full h-96 p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-gray-500">
              You can edit the proposal content above. Click "Save Changes" when
              done.
            </p>
          </div>
        ) : (
          // View Mode
          <div className="bg-white rounded-xl border shadow-sm p-8">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-6 rounded-lg overflow-auto max-h-96 border">
              {editedProposal || proposal.proposal_text}
            </pre>

            {/* RFP & Product Summary */}
            <div className="mt-8 grid grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-xs font-semibold text-blue-900 mb-2">
                  RFP Details
                </h3>
                <div className="space-y-1 text-xs text-blue-800">
                  <p>
                    <strong>Title:</strong> {proposal.title}
                  </p>
                  <p>
                    <strong>Organization:</strong> {proposal.organization}
                  </p>
                  <p>
                    <strong>Deadline:</strong> {rfpDetails?.deadline || "N/A"}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-xs font-semibold text-green-900 mb-2">
                  Matched Product
                </h3>
                <div className="space-y-1 text-xs text-green-800">
                  <p>
                    <strong>Product:</strong>{" "}
                    {proposal.matched_product.product_name}
                  </p>
                  <p>
                    <strong>Match:</strong> {proposal.match_percent.toFixed(1)}%
                  </p>
                  <p>
                    <strong>Price:</strong> ₹
                    {proposal.matched_product.unit_price.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="text-xs font-semibold text-purple-900 mb-2">
                  Download
                </h3>
                <button
                  onClick={handleDownloadPDF}
                  className="w-full px-3 py-2 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition font-medium flex items-center justify-center gap-1"
                >
                  <Download size={14} />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ProposalEdit;
