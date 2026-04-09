import React from 'react'

function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Welcome to the admin dashboard!</p>
          <p className="text-gray-500 mt-2">User management, system settings, and analytics will appear here.</p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard