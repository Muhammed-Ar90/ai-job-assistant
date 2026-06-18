import os
from dotenv import load_dotenv
from groq import Groq
import json

load_dotenv(dotenv_path="../.env")

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def analyze_job_description(jd_text):
    prompt = f"""You are a job description analyzer. Analyze the following job description and extract information.

IMPORTANT RULES FOR DETERMINING SENIORITY:
- Prioritize sections labeled "Must Have", "Essential", "Required", or "Key Responsibilities" over sections labeled "Good to Have", "Nice to Have", or "Preferred"
- A high education requirement (Master's, PhD) combined with deep technical ownership (building production systems, leading research) signals Mid or Senior level, even if a low "years of experience" number appears in a secondary or "good to have" section
- If experience requirements conflict between sections, weigh the core responsibilities and essential requirements more heavily than bonus qualifications
- Junior/Entry level = minimal independent ownership, mostly learning and supporting
- Mid level = independent ownership of features/projects with some guidance
- Senior level = full ownership, architectural decisions, mentoring, or research leadership expected

SKILLS EXTRACTION RULES:
- Extract both named tools/technologies AND skills described as capabilities or phrases (e.g. "causal inference modeling", "LLM fine-tuning", "handling large-scale datasets")
- Do not limit skills to single-word tool names only — read full sentences in "Must Have" sections, since many real skills are described as actions or phrases, not just tool names
- Prioritize skills explicitly under "Must Have", "Essential", or "Required" sections over "Good to Have" sections
- Include 8-12 required skills for technically detailed job descriptions, not just 4-6

KEYWORD EXTRACTION RULES:
- Extract 8-12 important keywords, not just 3-4
- Include domain-specific terms (e.g. specific platforms, methodologies, business context), not only generic tech terms
- Include terms that are repeated multiple times in the JD — repetition signals importance
- Include both technical terms (e.g. "fine-tuning", "causal inference") and contextual terms (e.g. "production systems", "OTT platforms")

Return ONLY a JSON object. No explanation. No markdown. No code blocks. No extra text before or after.

Exactly this format:
{{
  "role_title": "the job title",
  "role_type": "Analyst/Engineer/Scientist/Other",
  "seniority": "Junior/Mid/Senior",
  "seniority_reasoning": "one short sentence explaining why this seniority was chosen",
  "required_skills": ["skill1", "skill2", "skill3"],
  "important_keywords": ["keyword1", "keyword2"],
  "experience_required": "e.g. 2-3 years"
}}

Job Description:
{jd_text}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )

    result_text = response.choices[0].message.content.strip()
    
    try:
        result = json.loads(result_text)
        return result
    except json.JSONDecodeError:
        return {"error": "Could not parse AI response", "raw": result_text}
    

def match_resume_to_jd(resume_text, jd_analysis):
    required_skills = ", ".join(jd_analysis.get("required_skills", []))
    keywords = ", ".join(jd_analysis.get("important_keywords", []))
    seniority = jd_analysis.get("seniority", "Unknown")
    role_title = jd_analysis.get("role_title", "Unknown")

    prompt = f"""You are an expert resume reviewer and ATS (Applicant Tracking System) simulator.

Compare the RESUME below against the JOB REQUIREMENTS and return a detailed match analysis.

JOB REQUIREMENTS:
- Role: {role_title}
- Seniority Level Required: {seniority}
- Required Skills: {required_skills}
- Important Keywords: {keywords}

RESUME:
{resume_text}

SCORING RULES:
- match_score: Calculate based on what percentage of required skills and keywords genuinely appear in the resume (directly or as close synonyms). Be realistic, not generous — a resume missing half the required skills should score below 50, not 70+.
- ats_score: Simulate how a real ATS would score this resume. ATS systems do simple keyword matching, not semantic understanding. Penalize resumes that lack exact keyword matches even if synonyms are present.
- missing_skills: List required skills that do NOT appear anywhere in the resume, even as synonyms. CRITICAL: Before listing any skill as missing, re-read the full resume text once more and confirm the exact word or a close synonym is truly absent. Double-check tool names and skill names specifically (e.g. Excel, SQL, Python) since these are often mentioned briefly within sentences rather than in a dedicated skills list.
- strengths: List skills/keywords that DO appear in the resume and match well.
- keyword_density: For each important keyword, state how many times it appears in the resume (0 if absent).
- seniority_match: Compare the candidate's apparent experience level (based on resume content) against the required seniority. State if they are Underqualified, Good Fit, or Overqualified, with a one-sentence reason.
Return ONLY a JSON object. No explanation. No markdown. No code blocks.

Exactly this format:
{{
  "match_score": 78,
  "ats_score": 65,
  "missing_skills": ["skill1", "skill2"],
  "strengths": ["skill1", "skill2"],
  "keyword_density": [
    {{"keyword": "SQL", "count": 2}},
    {{"keyword": "Power BI", "count": 0}}
  ],
  "seniority_match": {{
    "status": "Good Fit",
    "reason": "one sentence explanation"
  }},
  "improvement_suggestions": ["suggestion1", "suggestion2"]
}}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )

    result_text = response.choices[0].message.content.strip()

    try:
        result = json.loads(result_text)
        return result
    except json.JSONDecodeError:
        return {"error": "Could not parse AI response", "raw": result_text}