import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom' 
import axiosInstance from '../services/axiosConfig'

function DoctorDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [earnings, setEarnings] = useState({ total: 0, monthly: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')

  useEffect(() => {
    fetchAppointments()
    fetchEarnings()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await axiosInstance.get('/appointments/doctor')
      setAppointments(response.data)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    }
  }


  const fetchEarnings = async () => {
    try {
      const response = await axiosInstance.get('/doctors/earnings')
      setEarnings(response.data)
    } catch (error) {
      console.error('Error fetching earnings:', error)
    }
  }

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await axiosInstance.put(`/appointments/${appointmentId}/status`, { status })
      fetchAppointments()
    } catch (error) {
      console.error('Error updating appointment:', error)
    }
  }

  const pendingAppointments = appointments.filter(a => a.status === 'pending')
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed')
  const completedAppointments = appointments.filter(a => a.status === 'completed')

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg shadow-lg p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome, Dr. {user?.name}!</h1>
          <p className="text-green-100">Manage your appointments, availability, and track your earnings.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">${earnings.total}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">This Month</p>
                <p className="text-2xl font-bold text-blue-600">${earnings.monthly}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Approvals</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingAppointments.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Patients</p>
                <p className="text-2xl font-bold text-purple-600">{appointments.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    
          <Link to="/profile/edit" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800">Edit Profile</h3>
            <p className="text-sm text-gray-500 mt-1">Update your bio and fees</p>
          </Link>
        </div>

        {/* Appointments Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-6 py-3 font-medium transition whitespace-nowrap ${
                  activeTab === 'upcoming'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Upcoming ({confirmedAppointments.length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-6 py-3 font-medium transition whitespace-nowrap ${
                  activeTab === 'pending'
                    ? 'text-yellow-600 border-b-2 border-yellow-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Pending ({pendingAppointments.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-6 py-3 font-medium transition whitespace-nowrap ${
                  activeTab === 'completed'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Completed ({completedAppointments.length})
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {(() => {
              let displayAppointments = []
              if (activeTab === 'upcoming') displayAppointments = confirmedAppointments
              if (activeTab === 'pending') displayAppointments = pendingAppointments
              if (activeTab === 'completed') displayAppointments = completedAppointments
              
              return displayAppointments.map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-4 mb-4 hover:shadow-md transition">
                  <div className="flex flex-wrap justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{appointment.patientName}</h3>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                          📅 {new Date(appointment.date).toLocaleDateString()} at {appointment.slot}
                        </p>
                        <p className="text-sm text-gray-600">
                          📝 {appointment.reason || 'No reason provided'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">💰 ${appointment.fee}</p>
                      {appointment.status === 'pending' && (
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                          className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            })()}
          </div>
        </div>
      </div>

    </div>
  )
}

export default DoctorDashboard