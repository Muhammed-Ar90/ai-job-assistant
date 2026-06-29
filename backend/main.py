from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List
from parser import parse_resume
from analyzer import analyze_job_description, match_resume_to_jd, generate_resume_rewrite, generate_cover_letter, analyze_resume_strength
app = FastAPI()

from database import init_db
init_db()

import os

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        os.getenv("FRONTEND_URL", "*")
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

class JobDescription(BaseModel):
    text: str

class MatchRequest(BaseModel):
    resume_text: str
    jd_analysis: Dict[str, Any]

class RewriteRequest(BaseModel):
    resume_text: str
    missing_skills: List[str]
    role_title: str

class CoverLetterRequest(BaseModel):
    resume_text: str
    jd_analysis: Dict[str, Any]

class ResumeOnlyRequest(BaseModel):
    resume_text: str

@app.get("/")
def home():
    return {"message": "AI Job Assistant API is running!"}

@app.get("/test")
def test():
    return {"status": "success", "phase": 1}

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.endswith((".pdf", ".docx")):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
    
    file_bytes = await file.read()
    text = parse_resume(file_bytes, file.filename)
    
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text from file")
    
    return {
        "filename": file.filename,
        "text": text,
        "word_count": len(text.split())
    }

@app.post("/analyze-jd")
async def analyze_jd(jd: JobDescription):
    if not jd.text.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty")
    
    result = analyze_job_description(jd.text)
    return result

@app.post("/match")
async def match(request: MatchRequest):
    if not request.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty")
    
    if not request.jd_analysis:
        raise HTTPException(status_code=400, detail="Job description analysis is required")
    
    result = match_resume_to_jd(request.resume_text, request.jd_analysis)
    return result

@app.post("/rewrite-resume")
async def rewrite_resume(request: RewriteRequest):
    if not request.missing_skills:
        raise HTTPException(status_code=400, detail="No missing skills provided")
    
    result = generate_resume_rewrite(request.resume_text, request.missing_skills, request.role_title)
    return result

@app.post("/cover-letter")
async def cover_letter(request: CoverLetterRequest):
    if not request.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty")
    
    if not request.jd_analysis:
        raise HTTPException(status_code=400, detail="Job description analysis is required")
    
    result = generate_cover_letter(request.resume_text, request.jd_analysis)
    return result

@app.post("/resume-strength")
async def resume_strength(request: ResumeOnlyRequest):
    if not request.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty")
    
    result = analyze_resume_strength(request.resume_text)
    return result