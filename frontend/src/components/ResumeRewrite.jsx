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
        headers: {
          "Content-Type": "application/json",
        },
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
      <h3>Resume Rewrite Suggestions</h3>
      <p>
        Based on your missing skills, here are bullet points you can add to
        your resume:
      </p>
      <button onClick={handleRewrite} disabled={loading}>
        {loading ? "Generating..." : "Generate Rewrite Suggestions"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {rewrites && (
        <div>
          {rewrites.map((item, index) => (
            <div
              key={index}
              style={{
                border: "1px solid gray",
                padding: "10px",
                marginTop: "10px",
              }}
            >
              <p>
                <strong>Missing Skill:</strong> {item.missing_skill}
              </p>
              <p>
                <strong>Suggested Bullet:</strong> {item.suggested_bullet}
              </p>
              <p
                style={{
                  color:
                    item.honesty_note === "Plausible extension"
                      ? "green"
                      : "orange",
                  fontSize: "13px",
                }}
              >
                ⚠ {item.honesty_note}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ResumeRewrite