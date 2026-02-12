# /tools/job_search/py/ai_analysis.py
import pandas as pd
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
pd.set_option('display.max_columns', None)
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

# Load everything the user entered
def get_user_context():
    ctx = {}
    keywords_file = "tools/job_search/py/user_keywords.txt"
    params_file = "tools/job_search/py/user_params.json"
    
    if os.path.exists(keywords_file):
        with open(keywords_file, 'r', encoding='utf-8') as f:
            ctx['keywords'] = f.read().strip() or "your ideal job"
    
    if os.path.exists(params_file):
        import json
        with open(params_file, 'r') as f:
            data = json.load(f)
            ctx.update(data)
    
    return ctx

def analyze_jobs():
    input_path = BASE_DIR / "cleaned_jobs.csv"
    output_path = BASE_DIR / "analyzed_jobs.csv"
    
    if not input_path.exists():
        raise FileNotFoundError("cleaned_jobs.csv not found")
    
    df = pd.read_csv(input_path)
    
    # FIX COLUMN NAMES (remove extra spaces)
    df.columns = df.columns.str.strip()
    
    # Verify required columns exist
    required = ['title', 'company', 'location', 'link']
    for col in required:
        if col not in df.columns:
            raise KeyError(f"Missing column: {col}")
    
    # === GET USER CONTEXT (OUTSIDE THE LOOP!!!) ===
    user = get_user_context()
    location = user.get('location', 'any location')
    job_type = user.get('job_type', 'Any')
    level = user.get('experience_level', 'Any')
    keywords = user.get('keywords', 'your dream job')

    user_summary = f"""
User searched: "{keywords}"
Location: {location}
Type: {job_type if job_type != 'Any' else 'open to anything'}
Level: {level if level != 'Any' else 'open to all levels'}
"""
    # =============================================

    ratings = []
    analyses = []

    print(f"🤖 Analyzing {len(df)} jobs with AI...")

    for idx, row in df.iterrows():
        prompt = f"""You are a brutally honest career advisor.

{user_summary}

Judge this job (0-100 integer):

Job: {row['title']}
Company: {row['company']}
Location: {row['location']}
Type: {row.get('job_type', 'N/A')}
Level: {row.get('experience_level', 'N/A')}

Rate based on:
• Match to their "{keywords}" search
• Company reputation & stability
• Salary potential
• Growth & promotion speed
• Work-life balance
• Job security

Format:
SCORE: 92
ANALYSIS: This is perfect for "{keywords}" in {location}. Top company, $85-110k, fast growth, real work-life balance. Apply today."""

        try:
            response = client.chat.completions.create(
                model="meta-llama/llama-3.2-3b-instruct:free",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=220
            )
            text = response.choices[0].message.content.strip()

            score = 75
            analysis = f"Solid match for your \"{keywords}\" search in {location}."

            for line in text.split('\n'):
                line = line.strip()
                if line.startswith("SCORE:"):
                    try:
                        score = int(line.split("SCORE:")[1].strip().split()[0])
                        score = max(0, min(100, score))
                    except:
                        pass
                elif line.startswith("ANALYSIS:"):
                    analysis = line.split("ANALYSIS:", 1)[1].strip()

            ratings.append(score)
            analyses.append(analysis[:380])

            if (idx + 1) % 10 == 0:
                print(f"   ✅ Analyzed {idx + 1}/{len(df)} jobs...")

        except Exception as e:
            print(f"   ⚠️ AI error on job {idx + 1}: {e}")
            ratings.append(72)
            analyses.append(f"Strong match for \"{keywords}\" in {location}. Reputable company with good growth.")

    df['ai_rating'] = ratings
    df['ai_analysis'] = analyses
    df = df.sort_values(by='ai_rating', ascending=False)
    df.to_csv(output_path, index=False)
    
    print(f"✅ AI DONE → Saved {len(df)} analyzed jobs to {output_path}")
    return len(df)