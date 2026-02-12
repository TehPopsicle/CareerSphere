import os
import subprocess
import sys
from pathlib import Path

# LOAD .ENV FIRST
from dotenv import load_dotenv
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

from flask import Flask, send_from_directory, request, jsonify, send_file

# Auto-install requirements
def install_requirements():
    try:
        import pandas
    except ImportError:
        print("Installing requirements...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

install_requirements()

# Import job search modules (updated path)
from tools.job_search.py.scraper import scrape_jobs
from tools.job_search.py.cleaner import clean_jobs
from tools.job_search.py.ai_analysis import analyze_jobs

app = Flask(__name__, static_folder=None)

# ============= MAIN WEBSITE ROUTES =============
@app.route('/')
@app.route('/index')
@app.route('/Index.html')
def homepage():
    return send_file('Index.html')

@app.route('/dashboard')
@app.route('/Dashboard.html')
def dashboard():
    return send_file('Dashboard.html')

@app.route('/contact')
@app.route('/Contact.html')
def contact():
    return send_file('Contact.html')

@app.errorhandler(404)
def not_found(e):
    if os.path.exists('404.html'):
        return send_file('404.html'), 404
    return "404 - Page not found", 404

# ============= STATIC FILES =============
@app.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory('css', filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory('js', filename)

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory('assets', filename)

# ============= JOB SEARCH TOOL (updated paths) =============
@app.route('/tools/job_search')
@app.route('/tools/job_search/')
@app.route('/tools/job_search/Index.html')
def job_search_tool():
    return send_file('tools/job_search/Index.html')  # Updated path

# ============= JOB SEARCH APIs =============
@app.route('/api/job_search/scrape', methods=['POST'])
def api_scrape():
    data = request.get_json()
    try:
        os.makedirs("tools/job_search/py", exist_ok=True)
        
        with open("tools/job_search/py/user_keywords.txt", 'w', encoding='utf-8') as f:
            f.write(data.get('keywords', ''))
        
        import json
        user_data = {
            "location": data.get('location', ''),
            "keywords": data.get('keywords', ''),
            "job_type": data.get('job_type', 'Any'),
            "experience_level": data.get('experience_level', 'Any')
        }
        with open("tools/job_search/py/user_params.json", 'w') as f:
            json.dump(user_data, f)

        count = scrape_jobs(
            keywords=data.get('keywords', ''),
            location=data.get('location', ''),
            max_jobs=250,
            job_type=data.get('job_type'),
            experience_level=data.get('experience_level')
        )
        return jsonify({"success": True, "jobs_scraped": count})
    except Exception as e:
        print(f"Scrape error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/job_search/clean', methods=['POST'])
def api_clean():
    try:
        count = clean_jobs()
        return jsonify({"success": True, "count": count})
    except Exception as e:
        print(f"Clean error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/job_search/analyze', methods=['POST'])
def api_analyze():
    try:
        jobs = analyze_jobs()
        if isinstance(jobs, list):
            jobs = sorted(jobs, key=lambda x: x.get('ai_rating', 0), reverse=True)
        return jsonify({"success": True, "jobs": jobs})
    except Exception as e:
        print(f"Analyze error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("CareerSphere Ready")
    print("="*60)
    print("Pages available:")
    print("→ http://localhost:8000/")
    print("→ http://localhost:8000/Dashboard.html")
    print("→ http://localhost:8000/Contact.html")
    print("→ http://localhost:8000/tools/job_search")
    print("="*60 + "\n")
    
    app.run(host='127.0.0.1', port=8000, debug=True)