import pandas as pd
import os
from pathlib import Path

# Fix for the BASE_DIR error
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent  # goes 4 levels up to your project root
# or if your structure is exactly like the logs:
BASE_DIR = Path(r"E:\COMPUTER\JobFindr.ai\JobFindr.AI\App")

def clean_jobs():
    input_path = "tools/job_search/py/scraped_jobs.csv"
    output_path = "tools/job_search/py/cleaned_jobs.csv"
    
    # Check if scraped file exists
    if not os.path.exists(input_path):
        print(f"File not found: {input_path}")
        # Return empty if no scraped jobs yet
        return 0
    
    try:
        df = pd.read_csv(input_path)
        
        if df.empty:
            return 0
        
        # Remove duplicates based on title + company
        df = df.drop_duplicates(subset=['title', 'company'], keep='first')
        
        # Standardize job types
        job_type_map = {
            'full-time': 'Full-time',
            'full time': 'Full-time',
            'fulltime': 'Full-time',
            'part-time': 'Part-time',
            'part time': 'Part-time',
            'parttime': 'Part-time',
            'contract': 'Contract',
            'contractor': 'Contract',
            'intern': 'Internship',
            'internship': 'Internship',
            'temporary': 'Temporary',
            'temp': 'Temporary'
        }
        
        if 'job_type' in df.columns:
            df['job_type'] = df['job_type'].fillna('Full-time')
            df['job_type'] = df['job_type'].str.lower().map(
                lambda x: job_type_map.get(x, 'Full-time')
            )
        else:
            df['job_type'] = 'Full-time'
        
        # Standardize experience levels
        level_map = {
            'entry': 'Entry level',
            'entry-level': 'Entry level',
            'junior': 'Entry level',
            'associate': 'Associate',
            'mid': 'Mid-Senior level',
            'senior': 'Mid-Senior level',
            'mid-senior': 'Mid-Senior level',
            'lead': 'Mid-Senior level',
            'principal': 'Director',
            'director': 'Director',
            'vp': 'Executive',
            'executive': 'Executive',
            'c-level': 'Executive'
        }
        
        if 'experience_level' in df.columns:
            df['experience_level'] = df['experience_level'].fillna('Mid-Senior level')
            df['experience_level'] = df['experience_level'].str.lower().map(
                lambda x: level_map.get(x, 'Mid-Senior level')
            )
        else:
            df['experience_level'] = 'Mid-Senior level'
        
        # Save cleaned data
        df.to_csv(output_path, index=False)
        print(f"Cleaned {len(df)} jobs → {output_path}")
        return len(df)
        
    except Exception as e:
        print(f"Error in cleaner: {e}")
        return 0