import React, { useState, useEffect } from 'react'
import axiosInstance from '../services/axiosConfig'

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    pendingApprovals: 0
  })
  const [pendingDoctors, setPendingDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, pendingRes, patientsRes] = await Promise.all([
        axiosInstance.get('/admin/stats'),
        axiosInstance.get('/admin/pending-doctors'),
        axiosInstance.get('/admin/patients')
      ])
      setStats(statsRes.data)
      setPendingDoctors(pendingRes.data)
      setPatients(patientsRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const approveDoctor = async (doctorId) => {
    try {
      await axiosInstance.put(`/admin/doctors/${doctorId}/approve`)
      fetchDashboardData()
    } catch (error) {
      console.error('Error approving doctor:', error)
    }
  }

  const rejectDoctor = async (doctorId) => {
    if (window.confirm('Are you sure you want to reject this doctor?')) {
      try {
        await axiosInstance.put(`/admin/doctors/${doctorId}/reject`)
        fetchDashboardData()
      } catch (error) {
        console.error('Error rejecting doctor:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-lg p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-purple-100">Manage users, approve doctors, and monitor platform activity.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
                <p className="text-sm text-gray-500">👨‍⚕️ {stats.totalDoctors} Doctors | 👤 {stats.totalPatients} Patients</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">${stats.totalRevenue}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === 'overview'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-6 py-3 font-medium transition flex items-center gap-2 ${
                  activeTab === 'pending'
                    ? 'text-yellow-600 border-b-2 border-yellow-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Pending Approvals
                {pendingDoctors.length > 0 && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    {pendingDoctors.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('patients')}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === 'patients'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Patients
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">New doctor registration</p>
                      <p className="text-sm text-gray-500">Dr. Sarah Johnson applied to join</p>
                    </div>
                    <span className="text-sm text-gray-400">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">New appointment booked</p>
                      <p className="text-sm text-gray-500">Patient booked with Dr. Smith</p>
                    </div>
                    <span className="text-sm text-gray-400">5 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">Revenue milestone</p>
                      <p className="text-sm text-gray-500">Total revenue crossed $10,000</p>
                    </div>
                    <span className="text-sm text-gray-400">Yesterday</span>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'pending' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Pending Doctor Approvals</h2>
                {pendingDoctors.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending approvals</p>
                ) : (
                  <div className="space-y-4">
                    {pendingDoctors.map((doctor) => (
                      <div key={doctor.id} className="border rounded-lg p-4">
                        <div className="flex flex-wrap justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-800">Dr. {doctor.name}</h3>
                            <p className="text-sm text-gray-600">{doctor.specialization}</p>
                            <p className="text-sm text-gray-500">{doctor.email}</p>
                            <p className="text-sm text-gray-500">License: {doctor.licenseNumber}</p>
                            {doctor.bio && (
                              <p className="text-sm text-gray-600 mt-2">{doctor.bio.substring(0, 100)}...</p>
                            )}
                          </div>
                          <div className="flex gap-2 mt-2 md:mt-0">
                            <button
                              onClick={() => approveDoctor(doctor.id)}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectDoctor(doctor.id)}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'patients' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">All Patients</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Phone</th>
                        <th className="text-left py-3 px-4">Appointments</th>
                        <th className="text-left py-3 px-4">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((patient) => (
                        <tr key={patient.id} className="border-t">
                          <td className="py-3 px-4">{patient.name}</td>
                          <td className="py-3 px-4 text-gray-600">{patient.email}</td>
                          <td className="py-3 px-4 text-gray-600">{patient.phone || 'N/A'}</td>
                          <td className="py-3 px-4 text-gray-600">{patient.appointmentCount || 0}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(patient.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard