#!/usr/bin/env python3
import os
import sys
import json
import re
import urllib.request

# Default model
MODEL_NAME = "gemini-2.0-flash"

def extract_text_from_pdf(pdf_path):
    """Try to extract text from a PDF file using pypdf."""
    try:
        import pypdf
        reader = pypdf.PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text
    except ImportError:
        print("Warning: 'pypdf' package not installed. Cannot parse PDF files.", file=sys.stderr)
        print("Please install it using: pip install pypdf", file=sys.stderr)
        print("Or convert your resume to a plain text (.txt) file first.", file=sys.stderr)
        sys.exit(1)

def get_file_content(file_path):
    """Read file content based on file extension."""
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}", file=sys.stderr)
        sys.exit(1)
        
    _, ext = os.path.splitext(file_path.lower())
    if ext == '.pdf':
        return extract_text_from_pdf(file_path)
    else:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()

def find_api_key():
    """Attempt to find Gemini API key in environment or local files."""
    # 1. Check environment variable
    key = os.environ.get("GEMINI_API_KEY")
    if key:
        return key
        
    # 2. Check test_gemini.sh
    sh_path = "/Users/ryanbotha/Crewcation App/test_gemini.sh"
    if os.path.exists(sh_path):
        try:
            with open(sh_path, 'r') as f:
                content = f.read()
                match = re.search(r'API_KEY=["\']([^"\']+)["\']', content)
                if match:
                    return match.group(1)
        except Exception:
            pass
            
    # 3. Check local .env files
    env_paths = [".env", ".env.local", "../Crewcation App/.env.local"]
    for path in env_paths:
        if os.path.exists(path):
            try:
                with open(path, 'r') as f:
                    for line in f:
                        if line.startswith("GEMINI_API_KEY="):
                            return line.split("=")[1].strip().strip('"').strip("'")
            except Exception:
                pass
                
    return None

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 compare_resume.py <resume_file_path> <job_desc_file_path>", file=sys.stderr)
        sys.exit(1)
        
    resume_path = sys.argv[1]
    job_desc_path = sys.argv[2]
    
    api_key = find_api_key()
    if not api_key:
        print("Error: Gemini API key not found in environment, .env, or test_gemini.sh", file=sys.stderr)
        sys.exit(1)
        
    print(f"Reading resume: {resume_path}...")
    resume_text = get_file_content(resume_path)
    
    print(f"Reading job description: {job_desc_path}...")
    job_desc_text = get_file_content(job_desc_path)
    
    if not resume_text.strip() or not job_desc_text.strip():
        print("Error: Resume or job description content is empty.", file=sys.stderr)
        sys.exit(1)
        
    print("Comparing resume with job description using Gemini API...")
    
    prompt = (
        "You are an expert ATS (Applicant Tracking System) parser and optimizer.\n"
        "Compare the following resume text to the job description text.\n"
        "Analyze the matching skills, missing critical keywords, and provide recommendations.\n\n"
        "Return a JSON response matching this structure exactly:\n"
        "{\n"
        "  \"match_percentage\": <number between 0 and 100>,\n"
        "  \"matching_skills\": [<list of skills present in both>],\n"
        "  \"missing_keywords\": [<list of important skills/keywords from job description missing in resume>],\n"
        "  \"improvements\": [<list of clear action points to make resume match better>]\n"
        "}\n\n"
        f"Resume:\n{resume_text}\n\n"
        f"Job Description:\n{job_desc_text}\n"
    )
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent?key={api_key}"
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            res_json = json.loads(res_body)
            
            # Extract generated text from Gemini structure
            text_response = res_json['candidates'][0]['content']['parts'][0]['text']
            
            # Parse the inner JSON
            result = json.loads(text_response)
            
            # Print beautiful output
            print("\n" + "="*50)
            print(f"ATS MATCH SCORE: {result.get('match_percentage', 0)}%")
            print("="*50)
            
            print("\nMatching Skills:")
            for skill in result.get('matching_skills', []):
                print(f" ✅ {skill}")
                
            print("\nMissing Keywords / Gaps:")
            for keyword in result.get('missing_keywords', []):
                print(f" ❌ {keyword}")
                
            print("\nRecommendations for Improvement:")
            for imp in result.get('improvements', []):
                print(f" 💡 {imp}")
            print("="*50 + "\n")
            
    except urllib.error.HTTPError as e:
        print(f"\nAPI Error (HTTP {e.code}): {e.reason}", file=sys.stderr)
        try:
            print(e.read().decode('utf-8'), file=sys.stderr)
        except Exception:
            pass
        sys.exit(1)
    except Exception as e:
        print(f"\nError running comparison: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
