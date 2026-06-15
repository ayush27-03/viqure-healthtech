import React, { useState, useEffect } from 'react'
import axiosInstance from "../../services/axiosConfig"

function AdminDoctors() {
  const [doctors, setDoctors] = useState([])
  const [pendingDoctors, setPendingDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('approved')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [approvedRes, pendingRes] = await Promise.all([
        axiosInstance.get('/admin/doctors'),
        axiosInstance.get('/admin/pending-doctors')
      ])
      setDoctors(approvedRes.data)
      setPendingDoctors(pendingRes.data)
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const approveDoctor = async (doctorId) => {
    try {
      await axiosInstance.put(`/admin/doctors/${doctorId}/approve`)
      fetchData()
    } catch (error) {
      console.error('Error approving doctor:', error)
    }
  }

  const rejectDoctor = async (doctorId) => {
    if (window.confirm('Reject this doctor registration?')) {
      try {
        await axiosInstance.put(`/admin/doctors/${doctorId}/reject`)
        fetchData()
      } catch (error) {
        console.error('Error rejecting doctor:', error)
      }
    }
  }

  const deleteDoctor = async (doctorId) => {
    if (window.confirm('Delete this doctor permanently?')) {
      try {
        await axiosInstance.delete(`/admin/doctors/${doctorId}`)
        fetchData()
      } catch (error) {
        console.error('Error deleting doctor:', error)
      }
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Doctor Management</h2>
        <p className="text-gray-500">Manage approved and pending doctor registrations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 font-medium transition ${activeTab === 'approved' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
        >
          Approved Doctors ({doctors.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium transition ${activeTab === 'pending' ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-500'}`}
        >
          Pending Approvals ({pendingDoctors.length})
        </button>
      </div>

      {activeTab === 'approved' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4">Doctor</th>
                <th className="text-left py-3 px-4">Specialization</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Fee</th>
                <th className="text-left py-3 px-4">Joined</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor._id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium">{doctor.doctorName}</div>
                    <div className="text-xs text-gray-500">{doctor.city || 'N/A'}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{doctor.specializations?.join(', ') || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-600">{doctor.email}</td>
                  <td className="py-3 px-4 text-gray-600">₹{doctor.consultationFees}</td>
                  <td className="py-3 px-4 text-gray-600">{formatDate(doctor.createdAt)}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => deleteDoctor(doctor._id)} className="text-red-500 hover:text-red-700">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {doctors.length === 0 && (
            <div className="text-center py-8 text-gray-500">No doctors found</div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {pendingDoctors.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">No pending approvals</div>
          ) : (
            pendingDoctors.map((doctor) => (
              <div key={doctor._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">{doctor.doctorName}</h3>
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    <p className="text-sm text-gray-500">{doctor.email}</p>
                    <p className="text-sm text-gray-500">License: {doctor.licenseNumber}</p>
                    <p className="text-sm text-gray-500">Experience: {doctor.experience} years</p>
                    <p className="text-sm text-gray-500">Fee: ₹{doctor.consultationFee}</p>
                    {doctor.bio && <p className="text-sm text-gray-600 mt-2">{doctor.bio.substring(0, 100)}...</p>}
                    <p className="text-xs text-gray-400 mt-1">Submitted: {formatDate(doctor.submittedAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => approveDoctor(doctor._id)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                      Approve
                    </button>
                    <button onClick={() => rejectDoctor(doctor._id)} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default AdminDoctors