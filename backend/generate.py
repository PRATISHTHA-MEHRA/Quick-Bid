def generate_proposal(rfp_row):
    """Generate a clean, modern proposal format without tick marks or separators."""
    
    proposal = f"""
TECHNICAL & COMMERCIAL PROPOSAL
============================================================

RFP Reference Details
RFP ID: {rfp_row['rfp_id']}
Title: {rfp_row['title']}
Issuing Authority: {rfp_row.get('organization', 'N/A')}
Submission Deadline: {rfp_row.get('deadline', 'N/A')}

Match Summary
Match Confidence: {rfp_row['match_percent']}%
Recommended SKU: {rfp_row['matched_sku']}
Matched Product: {rfp_row['matched_product_name']}
Category: {rfp_row['matched_category']}

Technical Offer
Product Specifications:
- Conductor Material: {rfp_row.get('matched_conductor_material', 'N/A')}
- Conductor Size: {rfp_row.get('matched_conductor_size', 'N/A')} sqmm
- Voltage Rating: {rfp_row.get('matched_voltage_rating', 'N/A')} kV
- Compliance Standard: {rfp_row['matched_standard']}
- Additional Technical Notes: {rfp_row.get('tech_specs', 'N/A')}

Commercial Offer
Unit Price: ₹{rfp_row['unit_price']:,.2f}
Testing Charges: ₹{rfp_row['test_price']:,.2f}
Total Base Price: ₹{(rfp_row['unit_price'] + rfp_row['test_price']):,.2f}

(Final pricing will depend on the quantity specified in the BOQ.)

Why Our Product Fits the Requirement
- Fully compliant with {rfp_row['matched_standard']} standards
- High-quality {rfp_row.get('matched_conductor_material', '')} conductor material
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
• Conformance with {rfp_row['matched_standard']} standards  

Thank you for considering our proposal. We look forward to supporting your project with high-quality products and reliable service.

Best Regards  
[Your Company Name]  
[Authorized Signatory]  
[Email / Phone]

============================================================
"""
    return proposal
