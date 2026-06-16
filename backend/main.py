from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from parser import parse_resume

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "AI Job Assistant API is running!"}

@app.get("/test")
def test():
    return {"status": "success", "phase": 1}

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    # Check file type
    if not file.filename.endswith((".pdf", ".docx")):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
    
    # Read file bytes
    file_bytes = await file.read()
    
    # Extract text
    text = parse_resume(file_bytes, file.filename)
    
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text from file")
    
    return {
        "filename": file.filename,
        "text": text,
        "word_count": len(text.split())
    }