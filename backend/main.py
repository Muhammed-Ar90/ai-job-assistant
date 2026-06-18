from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
from parser import parse_resume
from analyzer import analyze_job_description, match_resume_to_jd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class JobDescription(BaseModel):
    text: str

class MatchRequest(BaseModel):
    resume_text: str
    jd_analysis: Dict[str, Any]

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