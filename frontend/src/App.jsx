import { useState } from "react"
import ResumeUpload from "./components/ResumeUpload"
import JobDescriptionAnalyzer from "./components/JobDescriptionAnalyzer"
import MatchResults from "./components/MatchResults"
import ResumeRewrite from "./components/ResumeRewrite"
import CoverLetter from "./components/CoverLetter"
import ResumeStrength from "./components/ResumeStrength"

function App() {
  const [resumeData, setResumeData] = useState(null)
  const [jdData, setJdData] = useState(null)
  const [matchData, setMatchData] = useState(null)
  const [matchLoading, setMatchLoading] = useState(false)
  const [matchError, setMatchError] = useState(null)

  function handleUpload(data) {
    setResumeData(data)
  }

  function handleAnalyze(data) {
    setJdData(data)
  }

  async function handleMatch() {
    setMatchLoading(true)
    setMatchError(null)

    try {
      const response = await fetch("http://127.0.0.1:8000/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume_text: resumeData.text,
          jd_analysis: jdData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMatchError(data.detail)
        return
      }

      setMatchData(data)
    } catch (err) {
      setMatchError("Could not connect to server. Is FastAPI running?")
    } finally {
      setMatchLoading(false)
    }
  }

  return (
    <div>
      <h1>AI Job Search Assistant</h1>

      <ResumeUpload onUpload={handleUpload} />
      {resumeData && (
        <div>
          <h3>Resume Uploaded Successfully!</h3>
          {resumeData && (
            <ResumeStrength resumeText={resumeData.text} />
          )}
          <p>File: {resumeData.filename}</p>
          <p>Word Count: {resumeData.word_count}</p>
        </div>
      )}

      <hr />

      <JobDescriptionAnalyzer onAnalyze={handleAnalyze} />
      {jdData && (
        <div>
          <h3>Job Description Analysis</h3>
          <p><strong>Role:</strong> {jdData.role_title}</p>
          <p><strong>Type:</strong> {jdData.role_type}</p>
          <p><strong>Seniority:</strong> {jdData.seniority}</p>
          <p style={{ fontSize: "14px", color: "gray" }}>{jdData.seniority_reasoning}</p>
          <p><strong>Experience Required:</strong> {jdData.experience_required}</p>

          <p><strong>Required Skills:</strong></p>
          <ul>
            {jdData.required_skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>

          <p><strong>Important Keywords:</strong></p>
          <ul>
            {jdData.important_keywords.map((keyword, index) => (
              <li key={index}>{keyword}</li>
            ))}
          </ul>
        </div>
      )}

      <hr />

      {resumeData && jdData && (
        <div>
          <button onClick={handleMatch} disabled={matchLoading}>
            {matchLoading ? "Matching..." : "Match Resume to Job"}
          </button>
          {matchError && <p style={{ color: "red" }}>{matchError}</p>}
        </div>
      )}

      <MatchResults matchData={matchData} />

      {matchData && resumeData && jdData && (
        <ResumeRewrite
          resumeText={resumeData.text}
          missingSkills={matchData.missing_skills}
          roleTitle={jdData.role_title}
        />
      )}
      {resumeData && jdData && (
        <CoverLetter
          resumeText={resumeData.text}
          jdAnalysis={jdData}
        />
    )}
    </div>
  )
}

export default App