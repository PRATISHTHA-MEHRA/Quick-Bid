from flask import Flask, jsonify, request
from flask_cors import CORS
from scrape import scrape_rfps
from match import match_rfps_with_catalogue
from generate import generate_proposal
import pandas as pd
from datetime import datetime

app = Flask(__name__)
CORS(app)


# --------------------------------------------------------
# Fix Date Function
# --------------------------------------------------------
def fix_date(date_str):
    """Convert scraped date into ISO (YYYY-MM-DD). Returns None if invalid."""

    if not date_str or not isinstance(date_str, str):
        return None

    # Remove time, timezone, commas
    cleaned = (
        date_str.replace("IST", "")
                .replace("at", "")
                .replace(",", "")
                .strip()
    )

    # Extract only the date part
    cleaned = cleaned.split(" ")[0]

    # All possible formats from your scraper + site
    formats = [
        "%d-%b-%Y",     # 18-Dec-2025
        "%d-%b-%y",     # 18-Dec-25
        "%d-%m-%Y",     # 18-12-2025
        "%d-%m-%y",     # 18-12-25   (actual site!)
        "%d/%m/%Y",     # 18/12/2025
        "%d %B %Y",     # 18 December 2025
        "%b %d %Y",     # Dec 18 2025
    ]

    for fmt in formats:
        try:
            dt = datetime.strptime(cleaned, fmt)
            return dt.strftime("%Y-%m-%d")
        except:
            continue

    return None

# --------------------------------------------------------
# Health Check
# --------------------------------------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "✓ Backend running",
        "message": "RFP Automation API",
        "endpoints": {
            "/": "Health check",
            "/run": "Run full pipeline (scrape → match → generate)",
            "/scrape": "Scrape RFPs only",
            "/match": "Match scraped RFPs with catalogue",
            "/proposals": "Generate proposals from matched data",
            "/new-incoming": "Fetch new incoming RFPs with matches and priorities",
            "/dashboard-rfps": "Fetch all RFPs for dashboard display"
        }
    })


# --------------------------------------------------------
# Main Pipeline: Scrape → Match → Generate
# --------------------------------------------------------
@app.route("/run", methods=["GET"])
def run_pipeline():
    try:
        print("\n" + "="*60)
        print("STARTING RFP AUTOMATION PIPELINE")
        print("="*60)

        # 1. SCRAPE
        print("\n[1/3] Scraping RFP listings...")
        scraped_df = scrape_rfps()

        if scraped_df is None or scraped_df.empty:
            return jsonify({"error": "Scraping returned no results"}), 500

        # Fix all scraped dates
        if "deadline" in scraped_df.columns:
            scraped_df["deadline"] = scraped_df["deadline"].apply(fix_date)

        # 2. MATCH
        print("\n[2/3] Matching RFPs with product catalogue...")
        matched_df = match_rfps_with_catalogue(scraped_df)

        if matched_df is None or matched_df.empty:
            return jsonify({"error": "Matching failed"}), 500

        # Fix dates in match results too
        if "deadline" in matched_df.columns:
            matched_df["deadline"] = matched_df["deadline"].apply(fix_date)

        # 3. GENERATE PROPOSALS
        print("\n[3/3] Generating proposals...")
        proposals = []
        for idx, row in matched_df.iterrows():
            proposal_text = generate_proposal(row)

            proposals.append({
                "rfp_id": row.get("rfp_id"),
                "title": row.get("title"),
                "organization": row.get("organization"),
                "deadline": fix_date(row.get("deadline")),
                "matched_sku": row.get("matched_sku"),
                "match_percent": float(row.get("match_percent", 0)),
                "matched_product": row.get("matched_product_name"),
                "unit_price": float(row.get("unit_price", 0)),
                "proposal": proposal_text
            })

        print(f"\n✓ Pipeline completed successfully!")
        print("="*60 + "\n")

        return jsonify({
            "success": True,
            "summary": {
                "total_rfps": len(scraped_df),
                "matched_rfps": len(matched_df),
                "proposals_generated": len(proposals),
                "avg_match_score": float(matched_df["match_percent"].mean())
            },
            "scraped_rfps": scraped_df.to_dict(orient="records"),
            "match_results": matched_df[["rfp_id", "title", "matched_sku", "match_percent"]].to_dict(orient="records"),
            "proposals": proposals
        })

    except Exception as e:
        import traceback
        return jsonify({"error": str(e), "traceback": traceback.format_exc()}), 500


# --------------------------------------------------------
# Scrape Only
# --------------------------------------------------------
@app.route("/scrape", methods=["GET"])
def scrape_only():
    try:
        df = scrape_rfps()

        if df is None or df.empty:
            return jsonify({"success": False, "error": "No RFPs found"}), 404

        # Fix deadlines before returning to frontend
        if "deadline" in df.columns:
            df["deadline"] = df["deadline"].apply(fix_date)

        return jsonify({
            "success": True,
            "count": len(df),
            "data": df.to_dict(orient="records")
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# --------------------------------------------------------
# Match Only
# --------------------------------------------------------
@app.route("/match", methods=["POST"])
def match_only():
    try:
        df = pd.read_csv("scraped_rfps.csv")

        # Ensure deadlines exist and are fixed
        if "deadline" in df.columns:
            df["deadline"] = df["deadline"].apply(fix_date)

        matched_df = match_rfps_with_catalogue(df)

        if matched_df is None:
            return jsonify({"error": "Matching failed"}), 500

        if "deadline" in matched_df.columns:
            matched_df["deadline"] = matched_df["deadline"].apply(fix_date)

        return jsonify({
            "success": True,
            "count": len(matched_df),
            "data": matched_df.to_dict(orient="records")
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --------------------------------------------------------
# New Incoming RFPs (for NewIncoming page)
# --------------------------------------------------------
@app.route("/new-incoming", methods=["GET"])
def new_incoming():
    """
    Fetch newly scraped RFPs with match percentages and priority levels
    Excludes RFPs with 'Closed' status
    Returns: List of new/incoming RFPs with priority assignment
    """
    try:
        print("\n[NEW-INCOMING] Fetching and processing new RFPs...")
        
        # 1. SCRAPE fresh RFPs
        scraped_df = scrape_rfps()
        
        if scraped_df is None or scraped_df.empty:
            return jsonify({
                "success": False,
                "error": "No RFPs found during scraping",
                "data": []
            }), 404
        
        # Filter out closed RFPs
        scraped_df = scraped_df[scraped_df["status"].str.lower() != "closed"]
        
        if scraped_df.empty:
            return jsonify({
                "success": False,
                "error": "No open RFPs found (all are closed)",
                "data": []
            }), 404
        
        # Fix dates
        if "deadline" in scraped_df.columns:
            scraped_df["deadline"] = scraped_df["deadline"].apply(fix_date)
        
        # 2. MATCH with catalogue
        matched_df = match_rfps_with_catalogue(scraped_df)
        
        if matched_df is None or matched_df.empty:
            return jsonify({
                "success": False,
                "error": "Matching failed",
                "data": []
            }), 500
        
        # Fix dates in matched results
        if "deadline" in matched_df.columns:
            matched_df["deadline"] = matched_df["deadline"].apply(fix_date)
        
        # 3. Format response for frontend
        new_incoming_data = []
        for idx, row in matched_df.iterrows():
            new_incoming_data.append({
                "id": idx + 1,
                "rfp_id": row.get("rfp_id", ""),
                "title": row.get("title", ""),
                "client": row.get("organization", ""),
                "department": row.get("department", ""),
                "deadline": row.get("deadline", ""),
                "detection": "Recently detected",
                "match_percent": float(row.get("match_percent", 0)),
                "priority": row.get("priority", "Low"),
                "matched_product": row.get("matched_product_name", ""),
                "matched_sku": row.get("matched_sku", ""),
                "category": row.get("category", ""),
                "status": row.get("status", "")
            })
        
        print(f"✓ Retrieved {len(new_incoming_data)} new incoming RFPs (closed RFPs excluded)")
        
        return jsonify({
            "success": True,
            "count": len(new_incoming_data),
            "data": new_incoming_data
        })
    
    except Exception as e:
        import traceback
        print(f"✗ Error in /new-incoming: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc(),
            "data": []
        }), 500

# --------------------------------------------------------
# Submitted RFPs (Closed Status)
# --------------------------------------------------------
@app.route("/submitted", methods=["GET"])
def submitted():
    """
    Fetch RFPs with 'Closed' status to display as submitted proposals
    Returns: List of closed/submitted RFPs
    """
    try:
        print("\n[SUBMITTED] Fetching submitted (closed) RFPs...")
        
        # 1. SCRAPE RFPs
        scraped_df = scrape_rfps()
        
        if scraped_df is None or scraped_df.empty:
            return jsonify({
                "success": False,
                "error": "No RFPs found during scraping",
                "data": []
            }), 404
        
        # Filter only closed RFPs
        submitted_df = scraped_df[scraped_df["status"].str.lower() == "closed"]
        
        if submitted_df.empty:
            return jsonify({
                "success": True,
                "error": "No submitted (closed) RFPs found",
                "count": 0,
                "data": []
            }), 200
        
        # Fix dates
        if "deadline" in submitted_df.columns:
            submitted_df["deadline"] = submitted_df["deadline"].apply(fix_date)
        
        # 2. MATCH with catalogue for additional details
        matched_df = match_rfps_with_catalogue(submitted_df)
        
        if matched_df is None:
            matched_df = submitted_df
        else:
            # Fix dates in matched results
            if "deadline" in matched_df.columns:
                matched_df["deadline"] = matched_df["deadline"].apply(fix_date)
        
        # 3. Format response for frontend
        submitted_data = []
        for idx, row in matched_df.iterrows():
            submitted_data.append({
                "id": idx + 1,
                "rfp_id": row.get("rfp_id", ""),
                "title": row.get("title", ""),
                "client": row.get("organization", ""),
                "deadline": row.get("deadline", ""),
                "status": "Submitted",
                "priority": row.get("priority", "Medium"),
                "match_percent": float(row.get("match_percent", 0)) if "match_percent" in row else 0,
                "matched_product": row.get("matched_product_name", ""),
                "matched_sku": row.get("matched_sku", ""),
                "department": row.get("department", ""),
                "category": row.get("category", "")
            })
        
        print(f"✓ Retrieved {len(submitted_data)} submitted RFPs")
        
        return jsonify({
            "success": True,
            "count": len(submitted_data),
            "data": submitted_data
        })
    
    except Exception as e:
        import traceback
        print(f"✗ Error in /submitted: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc(),
            "data": []
        }), 500

# --------------------------------------------------------
# All RFPs for Dashboard
# --------------------------------------------------------
@app.route("/dashboard-rfps", methods=["GET"])
def dashboard_rfps():
    """
    Fetch all scraped RFPs for dashboard display
    Maps status: Open/Active → 'In Progress', Closed → 'Submitted'
    Returns: List of all RFPs with mapped status
    """
    try:
        print("\n[DASHBOARD] Fetching all RFPs for dashboard...")
        
        # 1. SCRAPE all RFPs
        scraped_df = scrape_rfps()
        
        if scraped_df is None or scraped_df.empty:
            return jsonify({
                "success": False,
                "error": "No RFPs found during scraping",
                "data": []
            }), 404
        
        # Fix dates
        if "deadline" in scraped_df.columns:
            scraped_df["deadline"] = scraped_df["deadline"].apply(fix_date)
        
        # 2. MATCH with catalogue for additional details
        matched_df = match_rfps_with_catalogue(scraped_df)
        
        if matched_df is None:
            matched_df = scraped_df
        else:
            # Fix dates in matched results
            if "deadline" in matched_df.columns:
                matched_df["deadline"] = matched_df["deadline"].apply(fix_date)
        
        # 3. Map status and format response for frontend
        dashboard_data = []
        for idx, row in matched_df.iterrows():
            # Map scraped status to display status
            original_status = str(row.get("status", "")).lower()
            if original_status == "closed":
                display_status = "Submitted"
            elif original_status in ["open", "active", "opening soon"]:
                display_status = "In Progress"
            else:
                display_status = "Pending"
            
            dashboard_data.append({
                "id": idx + 1,
                "rfp_id": row.get("rfp_id", ""),
                "title": row.get("title", ""),
                "client": row.get("organization", ""),
                "deadline": row.get("deadline", ""),
                "status": display_status,
                "match": float(row.get("match_percent", 0)),
                "priority": row.get("priority", "Medium"),
                "matched_product": row.get("matched_product_name", ""),
                "matched_sku": row.get("matched_sku", ""),
                "department": row.get("department", ""),
                "category": row.get("category", ""),
                "original_status": original_status
            })
        
        print(f"✓ Retrieved {len(dashboard_data)} RFPs for dashboard")
        
        return jsonify({
            "success": True,
            "count": len(dashboard_data),
            "data": dashboard_data
        })
    
    except Exception as e:
        import traceback
        print(f"✗ Error in /dashboard-rfps: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc(),
            "data": []
        }), 500

# --------------------------------------------------------
# Local Server
# --------------------------------------------------------
if __name__ == "__main__":
    print("\n" + "="*60)
    print("RFP AUTOMATION BACKEND SERVER")
    print("="*60)
    app.run(debug=True, host='0.0.0.0', port=5000)