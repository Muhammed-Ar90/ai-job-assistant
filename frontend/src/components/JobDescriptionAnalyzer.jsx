import { useState } from "react"

function JobDescriptionAnalyzer({ onAnalyze }) {
  const [jdText, setJdText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleAnalyze() {
    if (!jdText.trim()) {
      setError("Please paste a job description first")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze-jd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: jdText }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail)
        return
      }

      onAnalyze(data)
    } catch (err) {
      setError("Could not connect to server. Is FastAPI running?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Paste Job Description</h2>
      <textarea
        rows={10}
        cols={60}
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
        placeholder="Paste the job description here..."
      />
      <br />
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze Job Description"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  )
}

export default JobDescriptionAnalyzer