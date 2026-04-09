import React from 'react'

function DoctorDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Doctor Dashboard</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Welcome to your doctor dashboard!</p>
          <p className="text-gray-500 mt-2">Your patients, appointments, and schedule will appear here.</p>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard