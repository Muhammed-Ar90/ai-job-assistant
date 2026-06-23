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
        headers: {
          "Content-Type": "application/json",
        },
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
      <h3>Cover Letter Generator</h3>
      <p>Generate a personalized cover letter based on your resume and the job description.</p>

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Cover Letter"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {coverLetter && (
        <div>
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <p><strong>Word Count:</strong> {coverLetter.word_count}</p>
          </div>

          <p><strong>Keywords Used:</strong> {coverLetter.keywords_used.join(", ")}</p>

          <div style={{
            border: "1px solid gray",
            padding: "15px",
            marginTop: "10px",
            whiteSpace: "pre-wrap",
            lineHeight: "1.6"
          }}>
            {coverLetter.cover_letter}
          </div>

          <button onClick={handleCopy} style={{ marginTop: "10px" }}>
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>
        </div>
      )}
    </div>
  )
}

export default CoverLetter