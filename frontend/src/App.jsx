import { useState } from "react"
import ResumeUpload from "./components/ResumeUpload"

function App() {
  const [resumeData, setResumeData] = useState(null)

  function handleUpload(data) {
    setResumeData(data)
  }

  return (
    <div>
      <h1>AI Job Search Assistant</h1>
      <ResumeUpload onUpload={handleUpload} />
      {resumeData && (
        <div>
          <h3>Resume Uploaded Successfully!</h3>
          <p>File: {resumeData.filename}</p>
          <p>Word Count: {resumeData.word_count}</p>
          <h4>Extracted Text:</h4>
          <pre>{resumeData.text}</pre>
        </div>
      )}
    </div>
  )
}

export default App