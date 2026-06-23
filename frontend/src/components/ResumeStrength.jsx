import { useState } from "react"

function ResumeStrength({ resumeText }) {
  const [strengthData, setStrengthData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleAnalyze() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("http://127.0.0.1:8000/resume-strength", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume_text: resumeText,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail)
        return
      }

      setStrengthData(data)
    } catch (err) {
      setError("Could not connect to server. Is FastAPI running?")
    } finally {
      setLoading(false)
    }
  }

  function getScoreColor(score) {
    if (score >= 16) return "green"
    if (score >= 10) return "orange"
    return "red"
  }

  function getOverallColor(score) {
    if (score >= 75) return "green"
    if (score >= 50) return "orange"
    return "red"
  }

  const dimensions = strengthData ? [
    { key: "impact", label: "Impact" },
    { key: "action_verbs", label: "Action Verbs" },
    { key: "completeness", label: "Completeness" },
    { key: "clarity", label: "Clarity" },
    { key: "ats_friendliness", label: "ATS Friendliness" },
  ] : []

  return (
    <div>
      <h3>Resume Strength Score</h3>
      <p>Analyze your resume independently — no job description needed.</p>

      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze Resume Strength"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {strengthData && (
        <div>
          <h2 style={{ color: getOverallColor(strengthData.overall_score) }}>
            Overall Score: {strengthData.overall_score}/100
          </h2>

          <p>{strengthData.overall_feedback}</p>

          <h4>Dimension Breakdown</h4>
          {dimensions.map((dim) => (
            <div
              key={dim.key}
              style={{
                border: "1px solid gray",
                padding: "10px",
                marginTop: "8px",
              }}
            >
              <p>
                <strong>{dim.label}:</strong>{" "}
                <span style={{ color: getScoreColor(strengthData.dimensions[dim.key].score) }}>
                  {strengthData.dimensions[dim.key].score}/20
                </span>
              </p>
              <p style={{ fontSize: "14px", color: "gray" }}>
                {strengthData.dimensions[dim.key].feedback}
              </p>
            </div>
          ))}

          <h4>Top Strengths</h4>
          <ul>
            {strengthData.top_strengths.map((item, index) => (
              <li key={index} style={{ color: "green" }}>{item}</li>
            ))}
          </ul>

          <h4>Top Improvements</h4>
          <ul>
            {strengthData.top_improvements.map((item, index) => (
              <li key={index} style={{ color: "orange" }}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default ResumeStrength