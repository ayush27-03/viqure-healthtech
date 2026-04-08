import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [healthStatus, setHealthStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Your task: Function to call /api/health
  const checkHealth = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/health')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setHealthStatus(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching health:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Full Stack App
        </h1>
        
        <div className="space-y-4">
          <div className="border-t border-b border-gray-200 py-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              Backend Health Check
            </h2>
            
            {loading && (
              <div className="text-blue-500 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                Checking server status...
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-red-600 font-medium">Error:</p>
                <p className="text-red-500 text-sm">{error}</p>
                <button 
                  onClick={checkHealth}
                  className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            )}
            
            {healthStatus && !loading && (
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-green-600 font-medium">✓ Connected!</p>
                <p className="text-gray-700 text-sm mt-1">
                  Status: {healthStatus.status}
                </p>
                <p className="text-gray-700 text-sm">
                  Message: {healthStatus.message}
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  Timestamp: {new Date(healthStatus.timestamp).toLocaleString()}
                </p>
              </div>
            )}
          </div>
          
          <button
            onClick={checkHealth}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Refresh Health Status
          </button>
        </div>
      </div>
    </div>
  )
}

export default App