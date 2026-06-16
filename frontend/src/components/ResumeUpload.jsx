import { useState } from "react"

function ResumeUpload({ onUpload }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function handleFileChange(e) {
    setFile(e.target.files[0])
    setError(null)
  }

  async function handleUpload() {
    if (!file) {
      setError("Please select a file first")
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("http://127.0.0.1:8000/upload-resume", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail)
        return
      }

      onUpload(data)
    } catch (err) {
      setError("Could not connect to server. Is FastAPI running?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Upload Your Resume</h2>
      <input
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileChange}
      />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload Resume"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {file && <p>Selected: {file.name}</p>}
    </div>
  )
}

export default ResumeUpload