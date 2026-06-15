import React, { useState, useEffect } from 'react'
import axiosInstance from "../../services/axiosConfig"

function AdminAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await axiosInstance.get('/admin/appointments')
      setAppointments(response.data)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/admin/appointments/${id}`, { status })
      fetchAppointments()
    } catch (error) {
      console.error('Error updating appointment:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    if (filter !== 'all' && apt.appointmentStatus !== filter) return false
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return apt.patientName?.toLowerCase().includes(searchLower) ||
             apt.doctorName?.toLowerCase().includes(searchLower)
    }
    return true
  })

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
        <h2 className="text-2xl font-bold text-gray-800">Appointment Management</h2>
        <p className="text-gray-500">View and manage all appointments across the platform</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>All</button>
            <button onClick={() => setFilter('pending')} className={`px-3 py-1 rounded-full text-sm ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}>Pending</button>
            <button onClick={() => setFilter('confirmed')} className={`px-3 py-1 rounded-full text-sm ${filter === 'confirmed' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>Confirmed</button>
            <button onClick={() => setFilter('completed')} className={`px-3 py-1 rounded-full text-sm ${filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Completed</button>
            <button onClick={() => setFilter('cancelled')} className={`px-3 py-1 rounded-full text-sm ${filter === 'cancelled' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>Cancelled</button>
          </div>
          <input
            type="text"
            placeholder="Search patient or doctor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4">Patient</th>
              <th className="text-left py-3 px-4">Doctor</th>
              <th className="text-left py-3 px-4">Date & Time</th>
              <th className="text-left py-3 px-4">Type</th>
              <th className="text-left py-3 px-4">Fee</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((apt) => (
              <tr key={apt._id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{apt.patientName}</td>
                <td className="py-3 px-4 text-gray-600">{apt.doctorName}</td>
                <td className="py-3 px-4 text-gray-600">
                  {new Date(apt.appointmentStartDateTime).toLocaleDateString()} <br />
                  <span className="text-xs">{new Date(apt.appointmentStartDateTime).toLocaleTimeString()}</span>
                </td>
                <td className="py-3 px-4 text-gray-600">{apt.consultationType}</td>
                <td className="py-3 px-4 text-gray-600">₹{apt.consultationFees}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.appointmentStatus)}`}>
                    {apt.appointmentStatus}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={apt.appointmentStatus}
                    onChange={(e) => updateStatus(apt._id, e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAppointments.length === 0 && (
          <div className="text-center py-8 text-gray-500">No appointments found</div>
        )}
      </div>
    </div>
  )
}

export default AdminAppointments