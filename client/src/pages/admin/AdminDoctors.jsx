import React, { useState, useEffect } from 'react'
import axiosInstance from "../../services/axiosConfig"

function AdminDoctors() {
  const [doctors, setDoctors] = useState([])
  const [pendingDoctors, setPendingDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('approved')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Pagination states for approved doctors
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalApproved, setTotalApproved] = useState(0)
  const [totalPending, setTotalPending] = useState(0)

  useEffect(() => {
    fetchData()
  }, [currentPage, itemsPerPage, activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      if (activeTab === 'approved') {
        const response = await axiosInstance.get('/admin/doctors', {
          params: {
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm
          }
        })
        setDoctors(response.data.doctors || response.data)
        setTotalApproved(response.data.total || response.data.length || 0)
      } else {
        const response = await axiosInstance.get('/admin/pending-doctors', {
          params: {
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm
          }
        })
        setPendingDoctors(response.data.doctors || response.data)
        setTotalPending(response.data.total || response.data.length || 0)
      }
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

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1)
      fetchData()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Get current data and totals
  const currentData = activeTab === 'approved' ? doctors : pendingDoctors
  const totalItems = activeTab === 'approved' ? totalApproved : totalPending
  
  // Calculate pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage + 1
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems)

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Reset pagination when changing tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setCurrentPage(1)
    setSearchTerm('')
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
          onClick={() => handleTabChange('approved')}
          className={`px-4 py-2 font-medium transition ${activeTab === 'approved' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
        >
          Approved Doctors ({totalApproved})
        </button>
        <button
          onClick={() => handleTabChange('pending')}
          className={`px-4 py-2 font-medium transition ${activeTab === 'pending' ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-500'}`}
        >
          Pending Approvals ({totalPending})
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder={`Search ${activeTab === 'approved' ? 'approved doctors' : 'pending doctors'} by name, specialization, email, or more...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(''); setCurrentPage(1) }}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-500">
            Found {totalItems} {activeTab === 'approved' ? 'doctor' : 'pending request'}
            {totalItems !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {activeTab === 'approved' ? (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
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
                  {currentData.map((doctor) => (
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
            </div>
            {currentData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No doctors match your search' : 'No doctors found'}
              </div>
            )}
          </div>
          
          {/* Pagination Controls */}
          {totalItems > 0 && (
            <div className="mt-4 px-4 py-3 bg-white rounded-lg shadow border-t flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-500">
                Showing {startIndex} to {endIndex} of {totalItems} doctors
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`px-3 py-1 rounded border ${currentPage === pageNum ? 'bg-purple-600 text-white' : 'bg-white hover:bg-gray-50'}`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-2 py-1">...</span>
                      <button
                        onClick={() => goToPage(totalPages)}
                        className="px-3 py-1 rounded border bg-white hover:bg-gray-50"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
                >
                  Next
                </button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500">Show:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="px-2 py-1 border rounded text-sm"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="space-y-4">
            {currentData.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                {searchTerm ? 'No pending requests match your search' : 'No pending approvals'}
              </div>
            ) : (
              currentData.map((doctor) => (
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
          
          {/* Pagination Controls for Pending */}
          {totalItems > 0 && (
            <div className="mt-4 px-4 py-3 bg-white rounded-lg shadow border-t flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-500">
                Showing {startIndex} to {endIndex} of {totalItems} pending requests
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`px-3 py-1 rounded border ${currentPage === pageNum ? 'bg-yellow-600 text-white' : 'bg-white hover:bg-gray-50'}`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-2 py-1">...</span>
                      <button
                        onClick={() => goToPage(totalPages)}
                        className="px-3 py-1 rounded border bg-white hover:bg-gray-50"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
                >
                  Next
                </button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500">Show:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="px-2 py-1 border rounded text-sm"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminDoctors
