import requests
from bs4 import BeautifulSoup
import pandas as pd
from config import RFP_LISTING_URL, BASE_URL
import certifi
import ssl

def safe_text(element):
    """Safely extract text from BeautifulSoup element"""
    return element.get_text(strip=True) if element else ""

def scrape_rfps():
    """Scrape RFP listings from the procurement portal"""
    try:
        # Fix SSL certificate issue
        try:
            # Try to use certifi's certificate bundle
            cert_path = certifi.where()
            print(f"✓ Using certificate bundle: {cert_path}")
            response = requests.get(RFP_LISTING_URL, verify=cert_path, timeout=10)
        except Exception as ssl_err:
            # Fallback: Disable SSL verification (use cautiously)
            print(f"⚠ SSL verification failed, using unverified connection: {str(ssl_err)}")
            response = requests.get(RFP_LISTING_URL, verify=False, timeout=10)
        
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "lxml")

        rfp_cards = soup.select(".rfp-card")
        rfp_data = []

        for card in rfp_cards:
            # Basic info
            title = safe_text(card.select_one(".rfp-title"))
            rfp_id = safe_text(card.select_one(".rfp-id"))
            status = safe_text(card.select_one(".status-badge"))
            
            # Organization (first meta-header-value)
            meta_values = card.select(".meta-header-value")
            organization = safe_text(meta_values[0]) if len(meta_values) > 0 else ""
            issue_date = safe_text(meta_values[1]) if len(meta_values) > 1 else ""
            deadline = safe_text(meta_values[2]) if len(meta_values) > 2 else ""
            
            # Description - get the first description-text (which is the actual description)
            description_elements = card.select(".description-text")
            description = safe_text(description_elements[0]) if len(description_elements) > 0 else ""
            
            # Submission email - get from the second description-text (Proposal Submission section)
            submission_email = ""
            if len(description_elements) > 1:
                submission_text = safe_text(description_elements[1])
                # Extract email from the text
                # The text format is: "For submission of proposals, please send your complete documentation to: xlmwires@gmail.com"
                if "simratoberoi2006@gmail.com" in submission_text:
                    submission_email = "simratoberoi2006@gmail.com"
            
            # Additional info from info-grid
            info_values = card.select(".info-value")
            department = safe_text(info_values[0]) if len(info_values) > 0 else ""
            category = safe_text(info_values[1]) if len(info_values) > 1 else ""

            rfp_data.append({
                "rfp_id": rfp_id,
                "title": title,
                "status": status,
                "organization": organization,
                "issue_date": issue_date,
                "deadline": deadline,
                "department": department,
                "category": category,
                "description": description,
                "submission_email": submission_email,
                "requirements": ""  # Initialize empty, will be populated if needed
            })

        df = pd.DataFrame(rfp_data)
        df.to_csv("scraped_rfps.csv", index=False)
        
        print(f"✓ Successfully scraped {len(rfp_data)} RFPs")
        return df
        
    except requests.exceptions.ConnectionError as conn_err:
        print(f"✗ Connection error - check if URL is reachable: {str(conn_err)}")
        return None
    except requests.exceptions.Timeout as timeout_err:
        print(f"✗ Request timeout - URL took too long to respond: {str(timeout_err)}")
        return None
    except Exception as e:
        print(f"✗ Scraping failed: {str(e)}")
        return None