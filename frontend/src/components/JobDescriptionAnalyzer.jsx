import { useState } from "react"

function JobDescriptionAnalyzer({ onAnalyze }) {
  const [jdText, setJdText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  async function handleAnalyze() {
    if (!jdText.trim()) {
      setError("Please paste a job description first")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/analyze-jd`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: jdText }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail)
        return
      }

      setResult(data)
      onAnalyze(data)
    } catch (err) {
      setError("Could not connect to server. Is FastAPI running?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <textarea
        rows={6}
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
        placeholder="Paste the job description here..."
        style={{ marginBottom: "10px" }}
      />

      <button
        className="primary"
        onClick={handleAnalyze}
        disabled={loading}
        style={{ width: "100%" }}
      >
        {loading ? "Analyzing..." : "Analyze Job Description"}
      </button>

      {error && <p className="error-text">{error}</p>}

      {result && (
        <div style={{ marginTop: "1.25rem" }}>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "1rem"
          }}>
            <span className="tag tag-blue" style={{ fontSize: "13px", padding: "4px 14px" }}>{result.role_title}</span>
            <span className="tag" style={{ background: "#F1F5F9", color: "#475569", fontSize: "12px", padding: "3px 10px", borderRadius: "99px" }}>{result.role_type}</span>
            <span className="tag" style={{ background: "#F1F5F9", color: "#475569", fontSize: "12px", padding: "3px 10px", borderRadius: "99px" }}>{result.seniority}</span>
            <span className="tag" style={{ background: "#F1F5F9", color: "#475569", fontSize: "12px", padding: "3px 10px", borderRadius: "99px" }}>{result.experience_required}</span>
          </div>

          <div className="two-col">
            <div>
              <div className="col-label">Required skills</div>
              <div className="tag-row">
                {result.required_skills.map((skill, i) => (
                  <span key={i} className="tag tag-blue">{skill}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="col-label">Important keywords</div>
              <div className="tag-row">
                {result.important_keywords.map((kw, i) => (
                  <span key={i} className="tag tag-blue">{kw}</span>
                ))}
              </div>
            </div>
          </div>

          {result.seniority_reasoning && (
            <p style={{
              fontSize: "12px",
              color: "#64748B",
              marginTop: "10px",
              fontStyle: "italic"
            }}>
              {result.seniority_reasoning}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default JobDescriptionAnalyzer