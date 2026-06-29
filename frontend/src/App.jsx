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
    setJdData(null)
    setMatchData(null)
  }

  function handleAnalyze(data) {
    setJdData(data)
    setMatchData(null)
  }

  async function handleMatch() {
    setMatchLoading(true)
    setMatchError(null)

    try {
      const response = await fetch("http://127.0.0.1:8000/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 1.5rem 3rem" }}>

      {/* Navbar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 0",
        marginBottom: "1.5rem",
        borderBottom: "0.5px solid #E2E8F0"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px",
            background: "#185FA5",
            borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ color: "white", fontSize: "16px" }}>✦</span>
          </div>
          <span style={{ fontWeight: "500", fontSize: "15px" }}>AI Job Assistant</span>
        </div>
        <span style={{ fontSize: "13px", color: "#64748B" }}>
          Built with React + FastAPI + Groq
        </span>
      </div>

      {/* Intro Section */}
      <div style={{ textAlign: "center", padding: "2rem 0 1.5rem" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "500", marginBottom: "8px" }}>
          AI Job Search Assistant
        </h1>
        <p style={{ fontSize: "14px", color: "#64748B", marginBottom: "1.5rem" }}>
          Upload your resume and paste any job description — get instant AI analysis
        </p>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          justifyContent: "center",
          marginBottom: "2rem"
        }}>
          {[
            "✦ Resume Strength Score",
            "✦ Match Score",
            "✦ Skill Gap Analysis",
            "✦ ATS Score",
            "✦ Resume Rewrite",
            "✦ Cover Letter",
          ].map((feature, i) => (
            <span key={i} style={{
              fontSize: "12px",
              padding: "4px 12px",
              borderRadius: "99px",
              background: "#E6F1FB",
              color: "#185FA5",
              fontWeight: "500"
            }}>
              {feature}
            </span>
          ))}
        </div>
      </div>   


      {/* Step 1 - Resume Upload */}
      <div className="card">
        <div className="card-header">
          <div className="step-badge">1</div>
          <span className="card-title">Upload your resume</span>
        </div>
        <ResumeUpload onUpload={handleUpload} />
        {resumeData && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "#EAF3DE", color: "#3B6D11",
            fontSize: "12px", padding: "4px 10px",
            borderRadius: "99px", marginTop: "10px"
          }}>
            ✓ {resumeData.filename} · {resumeData.word_count} words
          </div>
        )}
      </div>

      {/* Step 2 - Resume Strength */}
      {resumeData && (
        <div className="card">
          <div className="card-header">
            <div className="step-badge">2</div>
            <span className="card-title">Resume strength score</span>
          </div>
          <ResumeStrength resumeText={resumeData.text} />
        </div>
      )}

      {/* Step 3 - JD Analyzer */}
      {resumeData && (
        <div className="card">
          <div className="card-header">
            <div className="step-badge">3</div>
            <span className="card-title">Paste job description</span>
          </div>
          <JobDescriptionAnalyzer onAnalyze={handleAnalyze} />
        </div>
      )}

      {/* Step 4 - Match */}
      {resumeData && jdData && (
        <div className="card">
          <div className="card-header">
            <div className="step-badge">4</div>
            <span className="card-title">Match results</span>
          </div>

          {!matchData && (
            <div>
              <p style={{ fontSize: "13px", color: "#64748B", marginBottom: "12px" }}>
                Ready to compare your resume against the job description.
              </p>
              <button className="primary" onClick={handleMatch} disabled={matchLoading}>
                {matchLoading ? "Analyzing..." : "Match Resume to Job"}
              </button>
              {matchError && <p className="error-text">{matchError}</p>}
            </div>
          )}

          <MatchResults matchData={matchData} />
        </div>
      )}

      {/* Step 5 - AI Features */}
      {matchData && resumeData && jdData && (
        <div className="card">
          <div className="card-header">
            <div className="step-badge">5</div>
            <span className="card-title">AI powered tools</span>
          </div>
          <ResumeRewrite
            resumeText={resumeData.text}
            missingSkills={[
              ...new Set([
                ...matchData.missing_skills,
                ...matchData.keyword_density
                  .filter(k => k.count === 0)
                  .map(k => k.keyword)
              ])
            ]}
            roleTitle={jdData.role_title}
          />
          <hr className="divider" />
          <CoverLetter
            resumeText={resumeData.text}
            jdAnalysis={jdData}
          />
        </div>
      )}

    </div>
  )
}

export default App