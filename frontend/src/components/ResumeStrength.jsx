import { useState } from "react"

function ResumeStrength({ resumeText }) {
  const [strengthData, setStrengthData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleAnalyze() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/resume-strength`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resumeText }),
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
    if (score >= 16) return "#3B6D11"
    if (score >= 10) return "#854F0B"
    return "#A32D2D"
  }

  function getOverallColor(score) {
    if (score >= 75) return "#3B6D11"
    if (score >= 50) return "#854F0B"
    return "#A32D2D"
  }

  const dimensions = [
    { key: "impact", label: "Impact" },
    { key: "action_verbs", label: "Action verbs" },
    { key: "completeness", label: "Completeness" },
    { key: "clarity", label: "Clarity" },
    { key: "ats_friendliness", label: "ATS friendliness" },
  ]

  return (
    <div>
      {!strengthData && (
        <div>
          <p style={{ fontSize: "13px", color: "#64748B", marginBottom: "12px" }}>
            Get an honest score on your resume's impact, clarity, ATS friendliness and more — no job description needed.
          </p>
          <button
            className="primary"
            onClick={handleAnalyze}
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading ? "Analyzing..." : "Analyze Resume Strength"}
          </button>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      {strengthData && (
        <div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            background: "#F8FAFC",
            borderRadius: "10px",
            padding: "1rem 1.25rem",
            marginBottom: "1rem"
          }}>
            <div>
              <div style={{ fontSize: "12px", color: "#64748B", marginBottom: "4px" }}>
                Overall score
              </div>
              <div style={{
                fontSize: "32px",
                fontWeight: "500",
                color: getOverallColor(strengthData.overall_score)
              }}>
                {strengthData.overall_score}
                <span style={{ fontSize: "16px", color: "#94A3B8" }}>/100</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="progress-bar" style={{ height: "8px" }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${strengthData.overall_score}%`,
                    background: getOverallColor(strengthData.overall_score)
                  }}
                />
              </div>
              <p style={{
                fontSize: "12px",
                color: "#64748B",
                marginTop: "8px",
                lineHeight: "1.5"
              }}>
                {strengthData.overall_feedback}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            {dimensions.map((dim) => (
              <div key={dim.key} className="dim-row">
                <span className="dim-label">{dim.label}</span>
                <div className="dim-bar">
                  <div
                    className="dim-fill"
                    style={{
                      width: `${(strengthData.dimensions[dim.key].score / 20) * 100}%`,
                      background: getScoreColor(strengthData.dimensions[dim.key].score)
                    }}
                  />
                </div>
                <span className="dim-score" style={{
                  color: getScoreColor(strengthData.dimensions[dim.key].score)
                }}>
                  {strengthData.dimensions[dim.key].score}/20
                </span>
              </div>
            ))}
          </div>

          <div style={{
            fontSize: "12px",
            color: "#64748B",
            marginTop: "4px",
            lineHeight: "1.6"
          }}>
            {dimensions.map((dim) => (
              <div key={dim.key} style={{
                padding: "6px 0",
                borderBottom: "0.5px solid #F1F5F9"
              }}>
                <span style={{ fontWeight: "500", color: "#475569" }}>
                  {dim.label}:
                </span>{" "}
                {strengthData.dimensions[dim.key].feedback}
              </div>
            ))}
          </div>

          <div className="two-col" style={{ marginTop: "1rem" }}>
            <div>
              <div className="col-label">Top strengths</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                {strengthData.top_strengths.map((item, i) => (
                  <div key={i} style={{
                    fontSize: "13px",
                    color: "#3B6D11",
                    padding: "6px 10px",
                    background: "#EAF3DE",
                    borderRadius: "6px"
                  }}>
                    ✓ {item}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="col-label">Top improvements</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                {strengthData.top_improvements.map((item, i) => (
                  <div key={i} style={{
                    fontSize: "13px",
                    color: "#854F0B",
                    padding: "6px 10px",
                    background: "#FAEEDA",
                    borderRadius: "6px"
                  }}>
                    → {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResumeStrength