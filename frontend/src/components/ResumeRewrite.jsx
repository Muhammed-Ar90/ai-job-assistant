import { useState } from "react"

function ResumeRewrite({ resumeText, missingSkills, roleTitle }) {
  const [rewrites, setRewrites] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleRewrite() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("http://127.0.0.1:8000/rewrite-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: resumeText,
          missing_skills: missingSkills,
          role_title: roleTitle,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail)
        return
      }

      setRewrites(data.rewrites)
    } catch (err) {
      setError("Could not connect to server. Is FastAPI running?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: "12px" }}>
        <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>
          Resume rewrite suggestions
        </div>
        <div style={{ fontSize: "13px", color: "#64748B" }}>
          AI rewrites bullet points using your missing skills — ready to add to your resume.
        </div>
      </div>

      <button
        className="primary"
        onClick={handleRewrite}
        disabled={loading}
        style={{ width: "100%" }}
      >
        {loading ? "Generating..." : "Generate Rewrite Suggestions"}
      </button>

      {error && <p className="error-text">{error}</p>}

      {rewrites && (
        <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "10px" }}>
          {rewrites.map((item, i) => (
            <div key={i} style={{
              border: "0.5px solid #E2E8F0",
              borderRadius: "8px",
              padding: "12px 14px",
              background: "white"
            }}>
              <div style={{
                fontSize: "11px",
                fontWeight: "500",
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "6px"
              }}>
                {item.missing_skill}
              </div>
              <div style={{
                fontSize: "13px",
                color: "#1E293B",
                lineHeight: "1.5",
                marginBottom: "8px",
                padding: "8px 10px",
                background: "#F8FAFC",
                borderRadius: "6px"
              }}>
                • {item.suggested_bullet}
              </div>
              <div style={{
                fontSize: "11px",
                padding: "3px 8px",
                borderRadius: "99px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                ...(item.honesty_note === "Plausible extension"
                  ? { background: "#EAF3DE", color: "#3B6D11" }
                  : { background: "#FAEEDA", color: "#854F0B" })
              }}>
                {item.honesty_note === "Plausible extension" ? "✓" : "⚠"} {item.honesty_note}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ResumeRewrite