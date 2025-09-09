import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...')

  useEffect(() => {
    // Test backend connection
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/test`)
      .then(res => res.json())
      .then(data => setBackendStatus(data.message))
      .catch(err => setBackendStatus('Backend connection failed'))
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>🐧 Linux Club</h1>
        <h2>Master Linux & Launch Your Tech Career</h2>
        <p>Join thousands of students learning Linux fundamentals that prepare you for DevOps, Cloud Computing, Cybersecurity, and Networking careers.</p>
        
        <div className="features">
          <div className="feature-card">
            <h3>🚀 Career-Ready Skills</h3>
            <p>Learn Linux fundamentals for high-demand tech careers</p>
          </div>
          <div className="feature-card">
            <h3>💰 100% Free Access</h3>
            <p>Complete access to all courses for 6 months</p>
          </div>
          <div className="feature-card">
            <h3>🎯 Hands-on Learning</h3>
            <p>Interactive terminal sessions and real-world projects</p>
          </div>
        </div>

        <div className="status">
          <p><strong>Backend Status:</strong> {backendStatus}</p>
          <p><strong>Demo Account:</strong> demo@linuxclub.tech / demo123</p>
        </div>

        <button className="cta-button">
          Start Learning Now
        </button>
      </header>
    </div>
  )
}

export default App
