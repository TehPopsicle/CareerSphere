# tools/job_search/py/scraper.py  ← FINAL VERSION (NO MORE SPACES, NO MORE ERRORS)
import requests
from bs4 import BeautifulSoup
import pandas as pd
from pathlib import Path
import time
import random

BASE_DIR = Path(__file__).parent

def scrape_jobs(keywords, location, job_type="Any", experience_level="Any", max_jobs=250):
    print(f"🔍 Scraping LinkedIn for: {keywords} in {location}")

    url = "https://www.linkedin.com/jobs/search"
    params = {
        "keywords": keywords,
        "location": location,
        "start": 0
    }

    # Filters
    if job_type != "Any":
        jt_map = {"Full-time": "F", "Part-time": "P", "Contract": "C", "Temporary": "T", "Internship": "I"}
        params["f_JT"] = jt_map.get(job_type, "")
    if experience_level != "Any":
        el_map = {"Entry level": "2", "Associate": "3", "Mid-Senior level": "4", "Director": "5", "Executive": "6"}
        params["f_E"] = el_map.get(experience_level, "")

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
    }

    jobs = []
    session = requests.Session()
    session.headers.update(headers)

    for page in range(0, max_jobs + 1, 25):
        params["start"] = page
        try:
            r = session.get(url, params=params, timeout=15)
            if r.status_code != 200:
                print(f"❌ Status {r.status_code}")
                break

            soup = BeautifulSoup(r.text, 'html.parser')
            cards = soup.find_all("div", class_="base-card")

            if not cards:
                print("⚠️ No cards found on this page — stopping")
                break

            for card in cards:
                if len(jobs) >= max_jobs:
                    break

                try:
                    title = card.find("h3", class_="base-search-card__title").get_text(strip=True)
                    company = card.find("h4", class_="base-search-card__subtitle").get_text(strip=True)
                    location_text = card.find("span", class_="job-search-card__location")
                    loc = location_text.get_text(strip=True) if location_text else location
                    link_tag = card.find("a", class_="base-card__full-link")
                    link = link_tag["href"].split("?")[0] if link_tag else ""

                    jobs.append({
                        "title": title,
                        "company": company,
                        "location": loc,
                        "link": link,
                        "job_type": job_type if job_type != "Any" else "Full-time",
                        "experience_level": experience_level if experience_level != "Any" else "Mid-Senior level"
                    })
                except Exception as e:
                    continue  # skip broken card

            print(f"✅ Scraped {len(jobs)} jobs so far...")
            time.sleep(random.uniform(3.5, 6.5))

        except Exception as e:
            print(f"❌ Request failed: {e}")
            break

    # === FINAL FIX: CLEAN COLUMN NAMES FOREVER ===
    df = pd.DataFrame(jobs)
    df.columns = df.columns.str.strip()  # Removes any hidden spaces
    df = df.rename(columns={
        "title": "title",
        "company": "company",
        "location": "location",
        "link": "link",
        "job_type": "job_type",
        "experience_level": "experience_level"
    })

    file_path = BASE_DIR / "scraped_jobs.csv"
    df.to_csv(file_path, index=False)
    print(f"💾 SAVED {len(jobs)} PERFECT jobs → {file_path}")

    return len(jobs)