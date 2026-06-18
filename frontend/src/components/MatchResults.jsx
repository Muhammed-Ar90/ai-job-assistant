function MatchResults({ matchData }) {
  if (!matchData) return null

  return (
    <div>
      <h2>Match Analysis</h2>

      <div>
        <h3>Match Score: {matchData.match_score}%</h3>
        <h3>ATS Score: {matchData.ats_score}%</h3>
      </div>

      <div>
        <h4>Seniority Fit: {matchData.seniority_match.status}</h4>
        <p>{matchData.seniority_match.reason}</p>
      </div>

      <div>
        <h4>Strengths</h4>
        <ul>
          {matchData.strengths.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div>
        <h4>Missing Skills</h4>
        <ul>
          {matchData.missing_skills.map((item, index) => (
            <li key={index} style={{ color: "red" }}>{item}</li>
          ))}
        </ul>
      </div>

      <div>
        <h4>Keyword Density</h4>
        <table border="1">
          <thead>
            <tr>
              <th>Keyword</th>
              <th>Times Found</th>
            </tr>
          </thead>
          <tbody>
            {matchData.keyword_density.map((item, index) => (
              <tr key={index}>
                <td>{item.keyword}</td>
                <td>{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h4>Improvement Suggestions</h4>
        <ul>
          {matchData.improvement_suggestions.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default MatchResults