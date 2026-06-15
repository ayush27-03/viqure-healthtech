import React, { useState, useEffect } from 'react'
import axiosInstance from "../../services/axiosConfig"

function AdminPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await axiosInstance.get('/admin/patients')
      setPatients(response.data)
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase()
    return patient.patientName?.toLowerCase().includes(searchLower) ||
           patient.email?.toLowerCase().includes(searchLower) ||
           patient.mobileNumber?.includes(searchTerm)
  })

  const formatDate = (date) => {
    if (!date) return 'N/A'
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
        <h2 className="text-2xl font-bold text-gray-800">Patient Management</h2>
        <p className="text-gray-500">View and manage all registered patients</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={fetchPatients}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4">Patient</th>
                <th className="text-left py-3 px-4">Contact</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">City</th>
                <th className="text-left py-3 px-4">Joined</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient._id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">👤</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{patient.patientName || 'N/A'}</div>
                        <div className="text-xs text-gray-500">
                          {patient.gender || 'N/A'} • {patient.dob ? new Date(patient.dob).getFullYear() : 'N/A'}
                        </div>
                      </div>
                    </div>
                   </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-600">{patient.mobileNumber || 'N/A'}</div>
                    {patient.emergencyContact?.name && (
                      <div className="text-xs text-gray-400">Emergency: {patient.emergencyContact.name}</div>
                    )}
                   </td>
                  <td className="py-3 px-4 text-gray-600">{patient.email || 'N/A'} </td>
                  <td className="py-3 px-4 text-gray-600">{patient.city || 'N/A'} </td>
                  <td className="py-3 px-4 text-gray-600">{formatDate(patient.createdAt)}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        setSelectedPatient(patient)
                        setShowDetailsModal(true)
                      }}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      View Details
                    </button>
                   </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPatients.length === 0 && (
          <div className="text-center py-8 text-gray-500">No patients found</div>
        )}
      </div>

      {/* Patient Details Modal */}
      {showDetailsModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Patient Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Basic Info */}
                <div className="border-b pb-3">
                  <h4 className="font-semibold text-gray-700 mb-2">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{selectedPatient.patientName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium">{selectedPatient.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="font-medium">{formatDate(selectedPatient.dob)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">City</p>
                      <p className="font-medium">{selectedPatient.city || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="border-b pb-3">
                  <h4 className="font-semibold text-gray-700 mb-2">Contact Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Mobile Number</p>
                      <p className="font-medium">{selectedPatient.mobileNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedPatient.email || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{selectedPatient.patientAddress || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                {selectedPatient.emergencyContact && (
                  <div className="border-b pb-3">
                    <h4 className="font-semibold text-gray-700 mb-2">Emergency Contact</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{selectedPatient.emergencyContact.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Relation</p>
                        <p className="font-medium">{selectedPatient.emergencyContact.relation || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{selectedPatient.emergencyContact.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Info */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Account Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Registered On</p>
                      <p className="font-medium">{formatDate(selectedPatient.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Login</p>
                      <p className="font-medium">{formatDate(selectedPatient.lastLoginTime)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPatients