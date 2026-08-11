#!/usr/bin/env python3
import os
import sys
import json
import re
import urllib.request

# Default model
MODEL_NAME = "gemini-2.5-flash"

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
        print("Usage: python3 compare_resume.py <resume_file_path> <job_desc_file_path> [atsMatch|eval|improve]", file=sys.stderr)
        sys.exit(1)
        
    resume_path = sys.argv[1]
    job_desc_path = sys.argv[2]
    
    mode = "atsMatch"
    if len(sys.argv) > 3:
        val = sys.argv[3].lower()
        if "eval" in val:
            mode = "professionalEvaluation"
        elif "improve" in val or "coach" in val:
            mode = "skillsImprovement"
        else:
            mode = "atsMatch"
            
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
        
    print(f"Comparing resume with job description using Gemini API (Mode: {mode})...")
    
    prompt = ""
    if mode == "atsMatch":
        prompt = (
            "You are a skilled and very experienced ATS (Application Tracking System) parser and optimizer with a deep understanding of the tech field, software engineering, data science, data analyst, and big data engineer. Your task is to evaluate the resume based on the given job description.\n"
            "You must consider the job market is very competitive and you should provide the best assistance for improving the resumes.\n"
            "Assign the percentage matching based on the job description and the missing keywords with high accuracy.\n\n"
            "Return a JSON response matching this structure exactly:\n"
            "{\n"
            "  \"match_percentage\": <number between 0 and 100>,\n"
            "  \"matching_skills\": [<list of technical skills present in both>],\n"
            "  \"missing_keywords\": [<list of important technical skills/keywords from job description missing in resume>],\n"
            "  \"profile_summary\": \"<brief professional analysis of the candidate's strengths and weaknesses in 3-4 sentences>\"\n"
            "}\n\n"
            f"Resume:\n{resume_text}\n\n"
            f"Job Description:\n{job_desc_text}\n"
        )
    elif mode == "professionalEvaluation":
        prompt = (
            "You are an experienced Technical Human Resource Manager specializing in the tech field, software engineering, data science, data analyst, and big data engineer roles. Your task is to review the provided resume against the job description.\n"
            "Please share your professional evaluation on whether the candidate's profile aligns with the role. Highlight the strengths and weaknesses of the applicant against the specified job requirements.\n\n"
            "Return a JSON response matching this structure exactly:\n"
            "{\n"
            "  \"alignment_score\": <number between 0 and 100>,\n"
            "  \"strengths\": [<list of candidate's key strengths for this role>],\n"
            "  \"weaknesses\": [<list of candidate's key weaknesses or alignment gaps for this role>],\n"
            "  \"evaluation_summary\": \"<detailed HR evaluation statement, about 4-6 sentences, highlighting candidate's overall suitability>\"\n"
            "}\n\n"
            f"Resume:\n{resume_text}\n\n"
            f"Job Description:\n{job_desc_text}\n"
        )
    elif mode == "skillsImprovement":
        prompt = (
            "You are an experienced Technical Recruiter and Career Coach specializing in the tech field, software engineering, data science, data analyst, and big data engineer roles. Your task is to review the provided resume against the job description.\n"
            "Please share your professional evaluation on how the candidate can improve their skills. Highlight the specific areas of improvement and provide concrete, actionable recommendations on how to acquire these skills or represent them better.\n\n"
            "Return a JSON response matching this structure exactly:\n"
            "{\n"
            "  \"priority_skills_to_add\": [<list of key technical skills/tools the candidate lacks from the JD>],\n"
            "  \"certifications_recommendations\": [<list of recommended certifications, courses, or study areas>],\n"
            "  \"bullet_point_improvements\": [\n"
            "    {\n"
            "      \"original\": \"<original text or concept from resume to improve>\",\n"
            "      \"improved\": \"<improved version incorporating keywords, action verbs, or impact metrics>\"\n"
            "    }\n"
            "  ],\n"
            "  \"general_advice\": \"<general career coaching advice for landing this role, about 3-4 sentences>\"\n"
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
            
            # Print beautiful output based on mode
            if mode == "atsMatch":
                print("\n" + "="*50)
                print(f"ATS MATCH SCORE: {result.get('match_percentage', 0)}%")
                print("="*50)
                
                print("\nMatching Keywords:")
                for skill in result.get('matching_skills', []):
                    print(f" ✅ {skill}")
                    
                print("\nMissing Keywords / Gaps:")
                for keyword in result.get('missing_keywords', []):
                    print(f" ❌ {keyword}")
                    
                print("\nProfile Summary:")
                print(result.get('profile_summary', ''))
                print("="*50 + "\n")
                
            elif mode == "professionalEvaluation":
                print("\n" + "="*50)
                print(f"HR ALIGNMENT SCORE: {result.get('alignment_score', 0)}%")
                print("="*50)
                
                print("\nKey Strengths:")
                for strength in result.get('strengths', []):
                    print(f" ✓ {strength}")
                    
                print("\nAlignment Gaps / Weaknesses:")
                for weakness in result.get('weaknesses', []):
                    print(f" ⚠ {weakness}")
                    
                print("\nProfessional HR Statement:")
                print(result.get('evaluation_summary', ''))
                print("="*50 + "\n")
                
            elif mode == "skillsImprovement":
                print("\n" + "="*50)
                print("SKILLS COACH RECOMMENDATIONS")
                print("="*50)
                
                print("\nPriority Skills to Add:")
                for skill in result.get('priority_skills_to_add', []):
                    print(f" 🔵 {skill}")
                    
                print("\nRecommended Certifications / Training:")
                for cert in result.get('certifications_recommendations', []):
                    print(f" 🎓 {cert}")
                    
                print("\nSuggested Resume Bullet Point Refinements:")
                for item in result.get('bullet_point_improvements', []):
                    print("-"*50)
                    print(f" [Original]: {item.get('original', '')}")
                    print(f" [Optimized]: {item.get('improved', '')}")
                print("-"*50)
                
                print("\nCareer Coaching Advice:")
                print(result.get('general_advice', ''))
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
