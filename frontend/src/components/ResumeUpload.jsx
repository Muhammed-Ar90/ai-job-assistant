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
      <label style={{
        display: "block",
        border: "1.5px dashed #CBD5E1",
        borderRadius: "10px",
        padding: "1.5rem",
        textAlign: "center",
        background: "#F8FAFC",
        cursor: "pointer",
        transition: "border-color 0.15s"
      }}>
        <div style={{ fontSize: "28px", marginBottom: "8px" }}>📄</div>
        <div style={{ fontSize: "13px", fontWeight: "500", color: "#1E293B", marginBottom: "4px" }}>
          {file ? file.name : "Click to browse or drop your resume"}
        </div>
        <div style={{ fontSize: "12px", color: "#94A3B8" }}>
          PDF or DOCX supported
        </div>
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </label>

      {file && (
        <button
          className="primary"
          onClick={handleUpload}
          disabled={loading}
          style={{ marginTop: "12px", width: "100%" }}
        >
          {loading ? "Uploading..." : "Upload Resume"}
        </button>
      )}

      {error && <p className="error-text">{error}</p>}
    </div>
  )
}

export default ResumeUpload