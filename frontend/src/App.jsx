import { useState, useEffect } from "react"

function App() {
  const [status, setStatus] = useState(null)

  useEffect(() => {
    fetch("http://127.0.0.1:8000/test")
      .then(res => res.json())
      .then(data => setStatus(data))
  }, [])

  return (
    <div>
      <h1>AI Job Search Assistant</h1>
      {status ? (
        <p>Backend connected! Phase: {status.phase}</p>
      ) : (
        <p>Connecting to backend...</p>
      )}
    </div>
  )
}

export default App