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
  "role_title": " Extract the exact job title if explicitly stated. If no clear title is given, infer the most appropriate title from the responsibilities and required skills described.",
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


def generate_resume_rewrite(resume_text, missing_skills, role_title):
    skills_list = ", ".join(missing_skills)

    prompt = f"""You are an expert resume writer specializing in ATS optimization.

The candidate is applying for: {role_title}

Their current resume:
{resume_text}

The following skills/keywords are missing from their resume but required for the job:
{skills_list}

YOUR TASK:
For each missing skill, suggest ONE realistic resume bullet point the candidate could add, based on plausible extensions of their existing experience or projects. 

RULES:
- For each missing skill, judge plausibility using these exact three conditions:
  * CONDITION 1: The exact tool or library is mentioned anywhere in their resume (e.g. resume mentions "Pandas" → "Data Engineering with Pandas" is plausible)
  * CONDITION 2: The same category of work is explicitly described in their resume (e.g. resume mentions "built data pipelines" → "Data Engineering" is plausible)
  * CONDITION 3: A closely related technique in the same domain is listed (e.g. resume mentions "RAG pipelines" → "Python-based ETL pipelines" is plausible since both involve data movement and transformation)
- If AT LEAST ONE condition is met → classify as PLAUSIBLE EXTENSION
- If NONE of the three conditions are met → classify as NOT A PLAUSIBLE EXTENSION
- If PLAUSIBLE EXTENSION: write the bullet point in confident past tense, as a normal resume bullet (action verb + task + measurable outcome where possible)
- If NOT A PLAUSIBLE EXTENSION: the bullet point text MUST use tentative/learning language such as "Exploring", "Currently learning", "Familiar with", or "Completed self-study in" — NEVER write it in confident past tense
- The bullet point wording and the honesty_note MUST always match in tone — if honesty_note says "Requires actual experience", the bullet text must visibly reflect that uncertainty
- Do not fabricate specific company names, exact percentages, or specific project details not mentioned in the resume. Use [X%] as placeholder where a number would go
- Keep each bullet point under 25 words

Return ONLY a JSON object. No explanation. No markdown. No code blocks.

Exactly this format:
{{
  "rewrites": [
    {{
      "missing_skill": "skill name",
      "suggested_bullet": "the rewritten bullet point text",
      "honesty_note": "Plausible extension" or "Requires actual experience - mention as familiarity only"
    }}
  ]
}}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.4
    )

    result_text = response.choices[0].message.content.strip()

    try:
        result = json.loads(result_text)
        return result
    except json.JSONDecodeError:
        return {"error": "Could not parse AI response", "raw": result_text}
    

def generate_cover_letter(resume_text, jd_analysis):
    role_title = jd_analysis.get("role_title", "the position")
    required_skills = ", ".join(jd_analysis.get("required_skills", []))
    keywords = ", ".join(jd_analysis.get("important_keywords", []))
    seniority = jd_analysis.get("seniority", "")

    prompt = f"""You are an expert cover letter writer.

Write a professional, personalized cover letter for the following candidate applying for the following role.

JOB DETAILS:
- Role: {role_title}
- Seniority: {seniority}
- Required Skills: {required_skills}
- Important Keywords: {keywords}

CANDIDATE RESUME:
{resume_text}

COVER LETTER RULES:
- Write in first person (I, my, me)
- 3 paragraphs only: opening (why this role), middle (relevant experience mapped to requirements), closing (call to action)
- Reference specific skills and projects from the resume that are relevant to this role — do not invent experience that isn't there
- Naturally weave in 3-5 of the important keywords from the job description
- Keep total length under 300 words
- Professional but not robotic — write like a real human, not a template
- Do not include placeholders like [Company Name] or [Your Name] — write the letter as if ready to send, using "your team" instead of a company name
- Start directly with "Dear Hiring Manager," — no preamble

Return ONLY a JSON object. No explanation. No markdown. No code blocks.

Exactly this format:
{{
  "cover_letter": "the full cover letter text here",
  "keywords_used": ["keyword1", "keyword2"],
  "word_count": 0
}}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.5
    )

    result_text = response.choices[0].message.content.strip()

    try:
        result = json.loads(result_text)
        if "cover_letter" in result:
            result["word_count"] = len(result["cover_letter"].split())
        return result
    except json.JSONDecodeError:
        return {"error": "Could not parse AI response", "raw": result_text}
    

def analyze_resume_strength(resume_text):
    prompt = f"""You are an expert resume reviewer and career coach.

Analyze the following resume and score it across 5 dimensions. Be honest and realistic — do not inflate scores. A perfect 20/20 should be extremely rare.

RESUME:
{resume_text}

SCORING DIMENSIONS (each scored 0-20):

1. IMPACT (0-20)
- 18-20: Most bullets have specific numbers, percentages, or measurable outcomes
- 12-17: Some quantified achievements but many bullets are vague
- 6-11: Very few numbers, mostly describes duties not achievements
- 0-5: No quantified achievements at all

2. ACTION VERBS (0-20)
- 18-20: Almost every bullet starts with a strong, varied action verb
- 12-17: Most bullets use action verbs but some are weak or repeated
- 6-11: Many bullets start with weak phrases like "Responsible for" or "Helped with"
- 0-5: Most bullets are passive or noun-heavy

3. COMPLETENESS (0-20)
- 18-20: Has all 5 sections: Professional Summary, Work Experience, Skills, Projects, Education
- 12-17: Missing one minor section or one section is very thin
- 6-11: Missing two sections or major sections are incomplete
- 0-5: Missing three or more sections

4. CLARITY (0-20)
- 18-20: Writing is concise, specific, and easy to scan. No filler phrases
- 12-17: Mostly clear but has some generic filler or overly long sentences
- 6-11: Several vague or generic statements that add no value
- 0-5: Mostly vague, wordy, or hard to scan

5. ATS FRIENDLINESS (0-20)
- 18-20: Clean structure, standard section headings, no complex formatting
- 12-17: Mostly clean but has some formatting that might confuse ATS
- 6-11: Some problematic elements like unusual section names or heavy formatting
- 0-5: Heavy use of tables, columns, or graphics that break ATS parsing

Return ONLY a JSON object. No explanation. No markdown. No code blocks.

Exactly this format:
{{
  "overall_score": 0,
  "dimensions": {{
    "impact": {{"score": 0, "feedback": "specific feedback here"}},
    "action_verbs": {{"score": 0, "feedback": "specific feedback here"}},
    "completeness": {{"score": 0, "feedback": "specific feedback here"}},
    "clarity": {{"score": 0, "feedback": "specific feedback here"}},
    "ats_friendliness": {{"score": 0, "feedback": "specific feedback here"}}
  }},
  "top_strengths": ["strength1", "strength2"],
  "top_improvements": ["improvement1", "improvement2", "improvement3"],
  "overall_feedback": "2-3 sentence honest summary of the resume"
}}

Calculate overall_score as the sum of all 5 dimension scores.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )

    result_text = response.choices[0].message.content.strip()

    try:
        result = json.loads(result_text)
        return result
    except json.JSONDecodeError:
        return {"error": "Could not parse AI response", "raw": result_text}