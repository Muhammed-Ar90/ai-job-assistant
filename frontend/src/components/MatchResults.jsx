function MatchResults({ matchData }) {
  if (!matchData) return null

  function getScoreColor(score) {
    if (score >= 75) return "score-green"
    if (score >= 50) return "score-amber"
    return "score-red"
  }

  function getProgressColor(score) {
    if (score >= 75) return "progress-green"
    if (score >= 50) return "progress-amber"
    return "progress-red"
  }

  function getSeniorityStyle(status) {
    if (status === "Good Fit") return { background: "#EAF3DE", color: "#3B6D11" }
    if (status === "Overqualified") return { background: "#FAEEDA", color: "#854F0B" }
    return { background: "#FCEBEB", color: "#A32D2D" }
  }

  return (
    <div>
      <div className="score-grid">
        <div className="score-card">
          <div className="score-label">Match score</div>
          <div className={`score-value ${getScoreColor(matchData.match_score)}`}>
            {matchData.match_score}%
          </div>
          <div className="progress-bar">
            <div
              className={`progress-fill ${getProgressColor(matchData.match_score)}`}
              style={{ width: `${matchData.match_score}%` }}
            />
          </div>
        </div>

        <div className="score-card">
          <div className="score-label">ATS score</div>
          <div className={`score-value ${getScoreColor(matchData.ats_score)}`}>
            {matchData.ats_score}%
          </div>
          <div className="progress-bar">
            <div
              className={`progress-fill ${getProgressColor(matchData.ats_score)}`}
              style={{ width: `${matchData.ats_score}%` }}
            />
          </div>
        </div>

        <div className="score-card">
          <div className="score-label">Seniority fit</div>
          <div style={{ marginTop: "8px" }}>
            <span style={{
              ...getSeniorityStyle(matchData.seniority_match.status),
              fontSize: "12px",
              padding: "4px 10px",
              borderRadius: "99px",
              fontWeight: "500"
            }}>
              {matchData.seniority_match.status}
            </span>
          </div>
          <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "6px", lineHeight: "1.4" }}>
            {matchData.seniority_match.reason}
          </div>
        </div>
      </div>

      <div className="two-col">
        <div>
          <div className="col-label">Strengths</div>
          <div className="tag-row">
            {matchData.strengths.map((item, i) => (
              <span key={i} className="tag tag-green">{item}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="col-label">Missing skills</div>
          <div className="tag-row">
            {matchData.missing_skills.map((item, i) => (
              <span key={i} className="tag tag-red">{item}</span>
            ))}
          </div>
        </div>
      </div>

      <hr className="divider" />

      <div className="col-label" style={{ marginBottom: "8px" }}>Keyword density</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {matchData.keyword_density.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "12px", color: "#475569", minWidth: "160px" }}>
              {item.keyword}
            </span>
            <div className="dim-bar">
              <div
                className="dim-fill"
                style={{ width: `${Math.min(item.count * 25, 100)}%` }}
              />
            </div>
            <span style={{ fontSize: "12px", color: "#185FA5", minWidth: "20px" }}>
              {item.count}
            </span>
          </div>
        ))}
      </div>

      <hr className="divider" />

      <div className="col-label" style={{ marginBottom: "8px" }}>Improvement suggestions</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {matchData.improvement_suggestions.map((item, i) => (
          <div key={i} style={{
            display: "flex", gap: "10px",
            fontSize: "13px", color: "#475569",
            padding: "8px 12px",
            background: "#FAEEDA",
            borderRadius: "8px",
            borderLeft: "3px solid #EF9F27"
          }}>
            <span>→</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MatchResults