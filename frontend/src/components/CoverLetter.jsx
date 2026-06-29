import { useState } from "react"

function CoverLetter({ resumeText, jdAnalysis }) {
  const [coverLetter, setCoverLetter] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("http://127.0.0.1:8000/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: resumeText,
          jd_analysis: jdAnalysis,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail)
        return
      }

      setCoverLetter(data)
    } catch (err) {
      setError("Could not connect to server. Is FastAPI running?")
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(coverLetter.cover_letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div style={{ marginBottom: "12px" }}>
        <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>
          Cover letter generator
        </div>
        <div style={{ fontSize: "13px", color: "#64748B" }}>
          Personalized cover letter based on your resume and the job description.
        </div>
      </div>

      <button
        className="primary"
        onClick={handleGenerate}
        disabled={loading}
        style={{ width: "100%" }}
      >
        {loading ? "Generating..." : "Generate Cover Letter"}
      </button>

      {error && <p className="error-text">{error}</p>}

      {coverLetter && (
        <div style={{ marginTop: "1rem" }}>
          <div style={{
            display: "flex",
            gap: "12px",
            marginBottom: "10px",
            flexWrap: "wrap"
          }}>
            <span style={{ fontSize: "12px", color: "#64748B" }}>
              {coverLetter.word_count} words
            </span>
            <span style={{ fontSize: "12px", color: "#64748B" }}>
              Keywords used: {coverLetter.keywords_used.join(", ")}
            </span>
          </div>

          <div style={{
            border: "0.5px solid #E2E8F0",
            borderRadius: "8px",
            padding: "1.25rem",
            fontSize: "13px",
            lineHeight: "1.8",
            color: "#1E293B",
            whiteSpace: "pre-wrap",
            background: "#FAFAFA",
            marginBottom: "10px"
          }}>
            {coverLetter.cover_letter}
          </div>

          <button onClick={handleCopy} style={{ width: "100%" }}>
            {copied ? "✓ Copied to clipboard!" : "Copy to clipboard"}
          </button>
        </div>
      )}
    </div>
  )
}

export default CoverLetter