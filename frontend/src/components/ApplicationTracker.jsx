import { useState, useEffect } from "react"

const STATUSES = ["Applied", "Interview", "Offer", "Rejected"]

const STATUS_STYLES = {
  Applied: { background: "#E6F1FB", color: "#185FA5" },
  Interview: { background: "#FAEEDA", color: "#854F0B" },
  Offer: { background: "#EAF3DE", color: "#3B6D11" },
  Rejected: { background: "#FCEBEB", color: "#A32D2D" },
}

function ApplicationTracker({ matchData, jdData }) {
  const [applications, setApplications] = useState([])
  const [company, setCompany] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("applications")
    if (stored) {
      setApplications(JSON.parse(stored))
    }
  }, [])

  function saveToStorage(apps) {
    localStorage.setItem("applications", JSON.stringify(apps))
    setApplications(apps)
  }

  function handleSave() {
    if (!matchData || !jdData) return

    const newApp = {
      id: Date.now(),
      role_title: jdData.role_title,
      company: company.trim() || "Unknown",
      match_score: matchData.match_score,
      ats_score: matchData.ats_score,
      seniority_fit: matchData.seniority_match.status,
      status: "Applied",
      date_added: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }),
      missing_skills: matchData.missing_skills.slice(0, 3)
    }

    const updated = [newApp, ...applications]
    saveToStorage(updated)
    setCompany("")
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleStatusChange(id, newStatus) {
    const updated = applications.map(app =>
      app.id === id ? { ...app, status: newStatus } : app
    )
    saveToStorage(updated)
  }

  function handleDelete(id) {
    const updated = applications.filter(app => app.id !== id)
    saveToStorage(updated)
  }

  return (
    <div>

      {matchData && jdData && (
        <div style={{
          background: "#F8FAFC",
          border: "0.5px solid #E2E8F0",
          borderRadius: "10px",
          padding: "1rem",
          marginBottom: "1.5rem"
        }}>
          <div style={{ fontSize: "13px", fontWeight: "500", marginBottom: "10px" }}>
            Save this application
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="Company name (optional)"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              className="primary"
              onClick={handleSave}
              style={{ whiteSpace: "nowrap" }}
            >
              {saved ? "✓ Saved!" : "Save Application"}
            </button>
          </div>
        </div>
      )}

      {applications.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "2rem",
          color: "#94A3B8",
          fontSize: "13px"
        }}>
          No applications saved yet. Run a match analysis and save it here.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {applications.map(app => (
            <div key={app.id} style={{
              border: "0.5px solid #E2E8F0",
              borderRadius: "10px",
              padding: "1rem 1.25rem",
              background: "white"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "10px",
                flexWrap: "wrap",
                gap: "8px"
              }}>
                <div>
                  <div style={{ fontWeight: "500", fontSize: "14px" }}>
                    {app.role_title}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
                    {app.company} · {app.date_added}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    style={{
                      fontSize: "12px",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      border: "0.5px solid #E2E8F0",
                      background: STATUS_STYLES[app.status].background,
                      color: STATUS_STYLES[app.status].color,
                      fontWeight: "500",
                      cursor: "pointer"
                    }}
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDelete(app.id)}
                    style={{
                      fontSize: "12px",
                      padding: "4px 8px",
                      color: "#A32D2D",
                      border: "0.5px solid #FCEBEB",
                      background: "#FCEBEB",
                      borderRadius: "6px"
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span className="tag tag-blue">
                  Match: {app.match_score}%
                </span>
                <span className="tag tag-blue">
                  ATS: {app.ats_score}%
                </span>
                <span style={{
                  ...STATUS_STYLES[app.seniority_fit] || STATUS_STYLES["Applied"],
                  fontSize: "12px",
                  padding: "3px 10px",
                  borderRadius: "99px",
                  fontWeight: "500"
                }}>
                  {app.seniority_fit}
                </span>
                {app.missing_skills.map((skill, i) => (
                  <span key={i} className="tag tag-red">{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ApplicationTracker