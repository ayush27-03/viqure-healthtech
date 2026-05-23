import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'

function PatientDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')

  useEffect(() => {
    fetchAppointments()
    fetchMedicalRecords()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await axiosInstance.get('/appointments/patient')
      setAppointments(response.data)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMedicalRecords = async () => {
    try {
      const response = await axiosInstance.get('/medical-records')
      console.log('Medical records:', response.data)
    } catch (error) {
      console.error('Error fetching medical records:', error)
    }
  }

  const cancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await axiosInstance.put(`/appointments/${appointmentId}/cancel`)
        fetchAppointments()
      } catch (error) {
        console.error('Error cancelling appointment:', error)
      }
    }
  }

  const upcomingAppointments = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending')
  const pastAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled')

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-blue-100">Manage your appointments, view medical records, and track your health journey.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-800">{appointments.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Upcoming</p>
                <p className="text-2xl font-bold text-green-600">{upcomingAppointments.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{pastAppointments.filter(a => a.status === 'completed').length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Spent</p>
                <p className="text-2xl font-bold text-gray-800">
                  ${appointments.reduce((sum, a) => sum + (a.fee || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/doctors" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800">Find Doctors</h3>
            <p className="text-sm text-gray-500 mt-1">Book a new appointment</p>
          </Link>
          
          <Link to="/profile/edit" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800">Edit Profile</h3>
            <p className="text-sm text-gray-500 mt-1">Update your information</p>
          </Link>
          
          <Link to="/medical-records" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800">Medical Records</h3>
            <p className="text-sm text-gray-500 mt-1">View your health history</p>
          </Link>
        </div>

        {/* Appointments Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === 'upcoming'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Upcoming Appointments
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === 'past'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Past Appointments
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {(activeTab === 'upcoming' ? upcomingAppointments : pastAppointments).map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex flex-wrap justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">Dr. {appointment.doctorName}</h3>
                        <p className="text-sm text-gray-500">{appointment.specialization}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600">
                            📅 {new Date(appointment.date).toLocaleDateString()} at {appointment.slot}
                          </p>
                          <p className="text-sm text-gray-600">📍 {appointment.type === 'video' ? 'Video Consultation' : 'In-Clinic Visit'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status.toUpperCase()}
                        </span>
                        <p className="text-sm text-gray-600 mt-2">💰 ${appointment.fee}</p>
                        {appointment.status === 'pending' && (
                          <button
                            onClick={() => cancelAppointment(appointment.id)}
                            className="mt-2 text-red-600 text-sm hover:underline"
                          >
                            Cancel
                          </button>
                        )}
                        {appointment.status === 'confirmed' && appointment.type === 'video' && (
                          <button className="mt-2 bg-green-600 text-white px-4 py-1 rounded text-sm hover:bg-green-700">
                            Join Call
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {(activeTab === 'upcoming' ? upcomingAppointments : pastAppointments).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No appointments found</p>
                    <Link to="/doctors" className="text-blue-600 hover:underline mt-2 inline-block">
                      Book your first appointment →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientDashboard