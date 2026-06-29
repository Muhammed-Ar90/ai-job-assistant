# AI Job Search Assistant

An AI-powered full-stack web application that helps job seekers analyze their resume against job descriptions, identify skill gaps, improve their resume, and track their applications.

🔗 **Live Demo:** [https://ai-job-assistant-ruby.vercel.app]

---

## Features

- **Resume Strength Score** — Analyzes your resume across 5 dimensions (Impact, Action Verbs, Completeness, Clarity, ATS Friendliness) and scores it out of 100
- **Job Description Analyzer** — Extracts required skills, keywords, seniority level, and role type from any job description
- **Match Score Engine** — Compares your resume against the JD and returns an overall match % and ATS compatibility score
- **Skill Gap Analysis** — Lists missing skills with priority ranking and keyword density analysis
- **Seniority Fit Check** — Detects if you're applying to the right level (Junior/Mid/Senior) with reasoning
- **Resume Rewrite Suggestions** — AI rewrites weak bullet points using missing keywords, with honesty flags for skills you don't have
- **Cover Letter Generator** — Personalized cover letter based on your resume and the specific job description
- **Application Tracker** — Track applied jobs, update status (Applied/Interview/Offer/Rejected), stored locally in your browser

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | FastAPI (Python) |
| AI | Groq API — Llama 3.3 70B |
| File Parsing | PyMuPDF + python-docx |
| Deployment | Vercel (frontend) + Render (backend) |

---

## How It Works
User uploads resume (PDF/DOCX)

↓

PyMuPDF/python-docx extracts clean text

↓

User pastes job description

↓

FastAPI sends structured prompt to Groq API

↓

AI extracts skills, keywords, seniority

↓

Second AI call compares resume vs JD

↓

Returns match score, gaps, suggestions

↓

React displays structured results

---

## Project Structure
ai-job-assistant/

├── frontend/

│   ├── src/

│   │   ├── components/

│   │   │   ├── ResumeUpload.jsx

│   │   │   ├── JobDescriptionAnalyzer.jsx

│   │   │   ├── MatchResults.jsx

│   │   │   ├── ResumeStrength.jsx

│   │   │   ├── ResumeRewrite.jsx

│   │   │   ├── CoverLetter.jsx

│   │   │   └── ApplicationTracker.jsx

│   │   ├── App.jsx

│   │   └── index.css

│   └── package.json

├── backend/

│   ├── main.py

│   ├── parser.py

│   ├── analyzer.py

│   └── requirements.txt

└── README.md

---

## Run Locally

**Prerequisites:** Node.js 18+, Python 3.10+, Groq API key (free at [console.groq.com](https://console.groq.com))

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
echo GROQ_API_KEY=your_key > .env
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
echo VITE_API_URL=http://127.0.0.1:8000 > .env
npm run dev
```

Open `http://localhost:5173`

---

## Key Engineering Decisions

**Why Groq over OpenAI/Claude?**
Groq's free tier (14,400 requests/day) makes this project fully free to run — anyone can clone and use it without any API costs.

**Why FastAPI over Flask/Django?**
FastAPI natively supports async operations (essential for AI API calls), has automatic API documentation, and Pydantic models for request validation.

**Why localStorage for the tracker?**
Avoids the need for user authentication while keeping data private per user. For a production version, I would add JWT-based authentication with a PostgreSQL database.

**Prompt Engineering approach:**
Used explicit JSON format templates, score range anchors, and self-verification instructions to get consistent structured outputs from an open-source LLM. Iterated through 5+ prompt versions to fix classification inconsistencies.

---

## What I Learned

- End-to-end full-stack development with React and FastAPI
- Prompt engineering for reliable structured JSON outputs from LLMs
- File parsing with PyMuPDF and python-docx
- Handling CORS, environment variables, and deployment across two platforms
- Iterative debugging of AI outputs — testing, identifying failure patterns, and fixing prompts

---

## Future Improvements

- Add user authentication with JWT tokens and PostgreSQL for persistent cross-device tracking
- Replace keyword matching with vector embeddings for semantic similarity scoring
- Add a job recommendation feed using a jobs API
- Add LinkedIn profile URL analysis alongside resume upload

---

## Screenshots




---

Built with React + FastAPI + Groq API
