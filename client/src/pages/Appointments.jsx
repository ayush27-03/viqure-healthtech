import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'

function Appointments() {
  const { user, role } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('requests')
  const [requests, setRequests] = useState([])
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [pastAppointments, setPastAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedItemType, setSelectedItemType] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false)
  const [changeRequestData, setChangeRequestData] = useState({
    suggestedStartTime: '',
    suggestedEndTime: '',
    suggestedDuration: '',
    suggestedReason: ''
  })

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'requests') {
        await fetchRequests()
      } else if (activeTab === 'upcoming') {
        await fetchUpcomingAppointments()
      } else if (activeTab === 'past') {
        await fetchPastAppointments()
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRequests = async () => {
    try {
      let response
      if (role === 'patient') {
        response = await axiosInstance.get(`/appointment-requests/patient/${user?.roleId}`)
      } else {
        response = await axiosInstance.get(`/appointment-requests/doctor/${user?.roleId}`)
      }
      // Filter out cancelled requests - they exist for admin but hidden from users
      const activeRequests = response.data.filter(r => r.status !== 'CANCELLED')
      setRequests(activeRequests)
    } catch (error) {
      console.error('Error fetching requests:', error)
      setRequests([])
    }
  }

  const fetchUpcomingAppointments = async () => {
    try {
      let response
      if (role === 'patient') {
        response = await axiosInstance.get(`/appointments/patient/${user?.roleId}`)
      } else {
        response = await axiosInstance.get(`/appointments/doctor/${user?.roleId}`)
      }
      const now = new Date()
      const upcoming = response.data.filter(apt => 
        apt.appointmentStatus === 'CONFIRMED' && 
        new Date(apt.appointmentStartDateTime) > now
      )
      setUpcomingAppointments(upcoming)
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error)
      setUpcomingAppointments([])
    }
  }

  const fetchPastAppointments = async () => {
    try {
      let response
      if (role === 'patient') {
        response = await axiosInstance.get(`/appointments/patient/${user?.roleId}`)
      } else {
        response = await axiosInstance.get(`/appointments/doctor/${user?.roleId}`)
      }
      const now = new Date()
      const past = response.data.filter(apt => 
        new Date(apt.appointmentStartDateTime) < now ||
        apt.appointmentStatus === 'COMPLETED'
      )
      setPastAppointments(past)
    } catch (error) {
      console.error('Error fetching past appointments:', error)
      setPastAppointments([])
    }
  }

  const refreshAll = () => {
    fetchData()
  }

  const handleApprove = async (requestId) => {
    setActionLoading(true)
    try {
      await axiosInstance.put(`/appointment-requests/${requestId}/approve`)
      await refreshAll()
      setSelectedItem(null)
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve request')
    } finally {
      setActionLoading(false)
    }
  }


  const handleCancelRequest = async (requestId) => {
  if (!window.confirm('Are you sure you want to cancel this request?')) return
  setActionLoading(true)
  try {
    await axiosInstance.put(`/appointment-requests/${requestId}/cancel`, {
      reason: `Cancelled by ${role}`,
      cancelledBy: role === 'doctor' ? 'DOCTOR' : 'PATIENT'
    })
    await refreshAll()
    setSelectedItem(null)
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to cancel request')
  } finally {
    setActionLoading(false)
  }
}

  const handleRequestChange = async (requestId) => {
  if (!changeRequestData.suggestedStartTime || !changeRequestData.suggestedEndTime) {
    alert('Please fill in suggested time')
    return
  }
  setActionLoading(true)
  try {
    await axiosInstance.put(`/appointment-requests/${requestId}/request-change`, {
      suggestedStartTime: changeRequestData.suggestedStartTime,
      suggestedEndTime: changeRequestData.suggestedEndTime,
      suggestedDuration: changeRequestData.suggestedDuration,
      suggestedReason: changeRequestData.suggestedReason
    })
    setShowChangeRequestModal(false)
    setSelectedItem(null)  // Close detail modal too
    setChangeRequestData({
      suggestedStartTime: '',
      suggestedEndTime: '',
      suggestedDuration: '',
      suggestedReason: ''
    })
    await refreshAll()
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to request change')
  } finally {
    setActionLoading(false)
  }
}

  const handlePatientResponse = async (requestId, response) => {
    setActionLoading(true)
    try {
      await axiosInstance.put(`/appointment-requests/${requestId}/patient-response`, {
        response: response
      })
      await refreshAll()
      setSelectedItem(null)
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to respond to request')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return
    setActionLoading(true)
    try {
      await axiosInstance.put(`/appointments/${appointmentId}/cancel`, {
        reason: `Cancelled by ${role}`,
        cancelledBy: role === 'doctor' ? 'DOCTOR' : 'PATIENT'
      })
      await refreshAll()
      setSelectedItem(null)
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel appointment')
    } finally {
      setActionLoading(false)
    }
  }

  const openDetailModal = (item, type) => {
    setSelectedItem(item)
    setSelectedItemType(type)
  }

  const closeDetailModal = () => {
    setSelectedItem(null)
    setSelectedItemType(null)
  }

  const getFilteredItems = () => {
    let items = []
    if (activeTab === 'requests') {
      items = [...requests]
    } else if (activeTab === 'upcoming') {
      items = [...upcomingAppointments]
    } else {
      items = [...pastAppointments]
    }

    if (filterStatus === 'pending' && activeTab === 'requests') {
      items = items.filter(i => i.status === 'PENDING')
    } else if (filterStatus === 'change_requested' && activeTab === 'requests') {
      items = items.filter(i => i.status === 'CHANGE_REQUESTED')
    } else if (filterStatus === 'confirmed') {
      items = items.filter(i => i.appointmentStatus === 'CONFIRMED')
    } else if (filterStatus === 'completed') {
      items = items.filter(i => i.appointmentStatus === 'COMPLETED')
    }

    return items
  }

  const formatDate = (dateTimeStr) => {
    const date = new Date(dateTimeStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const filteredItems = getFilteredItems()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Appointments</h1>
            <p className="text-blue-100 mt-1">Manage your appointments and requests</p>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === 'requests'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Requests ({requests.length})
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === 'upcoming'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Upcoming ({upcomingAppointments.length})
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === 'past'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Past ({pastAppointments.length})
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-8 py-4 bg-gray-50 border-b">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Filter:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1 border rounded-lg text-sm"
              >
                <option value="all">All</option>
                {activeTab === 'requests' && (
                  <>
                    <option value="pending">Pending</option>
                    <option value="change_requested">Change Requested</option>
                  </>
                )}
                {activeTab !== 'requests' && (
                  <>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* List */}
          <div className="divide-y">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-gray-500">No {activeTab} found</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isRequest = activeTab === 'requests'
                const isChangeRequested = isRequest && item.status === 'CHANGE_REQUESTED'
                const hasTimeClash = item.hasTimeClash
                const isVirtual = item.consultationType === 'VIDEO' || item.type === 'VIDEO'
                const canJoin = isVirtual && 
                  item.appointmentStatus === 'CONFIRMED' &&
                  new Date(item.appointmentStartDateTime) <= new Date() &&
                  new Date(item.appointmentEndDateTime) >= new Date()

                const isClickable = true

                return (
                  <div
                    key={item._id}
                    onClick={() => openDetailModal(item, isRequest ? 'request' : 'appointment')}
                    className={`p-6 hover:bg-gray-50 cursor-pointer transition ${
                      isChangeRequested ? 'bg-yellow-50' : ''
                    } ${hasTimeClash ? 'border-l-4 border-l-red-500' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-800">
                            {role === 'patient' 
                              ? item.doctorName || 'Doctor'
                              : item.patientName || 'Patient'}
                          </h3>
                          {isChangeRequested && (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                              Change Requested
                            </span>
                          )}
                          {hasTimeClash && (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                              Time Clash
                            </span>
                          )}
                          {canJoin && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Join Now
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-500 space-y-1">
                          <div>📅 {formatDate(item.appointmentStartDateTime || `${item.date}T${item.startTime}`)}</div>
                          <div>⏰ {formatTime(item.appointmentStartDateTime || `${item.date}T${item.startTime}`)} - {formatTime(item.appointmentEndDateTime || `${item.date}T${item.endTime}`)}</div>
                          <div>{isVirtual ? '🎥 Video Consultation' : '🏥 In-Clinic Visit'}</div>
                          {isRequest && item.status === 'PENDING' && role === 'doctor' && (
                            <div className="text-xs text-orange-600 mt-1">
                              Respond within 10 minutes of start time
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold text-blue-600">₹{item.consultationFees || 0}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {isRequest ? item.status : item.appointmentStatus}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedItemType === 'request' ? 'Request Details' : 'Appointment Details'}
              </h2>
              <button onClick={closeDetailModal} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Doctor/Patient Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">
                  {role === 'patient' ? 'Doctor Information' : 'Patient Information'}
                </h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Name:</span> {role === 'patient' ? (selectedItem.doctorName || 'Doctor') : (selectedItem.patientName || 'Patient')}</p>
                  {role === 'doctor' && selectedItem.patientPhone && (
                    <p><span className="text-gray-500">Phone:</span> {selectedItem.patientPhone}</p>
                  )}
                  {role === 'patient' && (
                    <button
                      onClick={() => {
                        closeDetailModal()
                        navigate(`/doctor/${selectedItem.doctorId}`)
                      }}
                      className="text-blue-600 hover:underline text-sm mt-2"
                    >
                      View Full Doctor Profile →
                    </button>
                  )}
                </div>
              </div>

              {/* Appointment Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Appointment Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Date & Time:</span> {formatDate(selectedItem.appointmentStartDateTime || `${selectedItem.date}T${selectedItem.startTime}`)} at {formatTime(selectedItem.appointmentStartDateTime || `${selectedItem.date}T${selectedItem.startTime}`)}</p>
                  <p><span className="text-gray-500">Duration:</span> {selectedItem.duration || Math.round((new Date(selectedItem.appointmentEndDateTime) - new Date(selectedItem.appointmentStartDateTime)) / 60000)} minutes</p>
                  <p><span className="text-gray-500">Type:</span> {(selectedItem.consultationType === 'VIDEO' || selectedItem.type === 'VIDEO') ? 'Video Consultation' : 'In-Clinic Visit'}</p>
                  <p><span className="text-gray-500">Fee:</span> ₹{selectedItem.consultationFees || 0}</p>
                  <p><span className="text-gray-500">Status:</span> 
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      selectedItem.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      selectedItem.status === 'CHANGE_REQUESTED' ? 'bg-orange-100 text-orange-800' :
                      selectedItem.appointmentStatus === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedItemType === 'request' ? selectedItem.status : selectedItem.appointmentStatus}
                    </span>
                  </p>
                </div>
              </div>

              {/* Reason & Symptoms */}
              {(selectedItem.reason || selectedItem.symptoms) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Visit Details</h3>
                  <div className="space-y-2 text-sm">
                    {selectedItem.reason && <p><span className="text-gray-500">Reason:</span> {selectedItem.reason}</p>}
                    {selectedItem.symptoms && <p><span className="text-gray-500">Symptoms:</span> {selectedItem.symptoms}</p>}
                  </div>
                </div>
              )}

              {/* Suggested Changes */}
              {selectedItemType === 'request' && selectedItem.status === 'CHANGE_REQUESTED' && selectedItem.suggestedStartTime && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">Doctor Suggested Changes</h3>
                  <div className="space-y-2 text-sm text-yellow-700">
                    <p><span className="font-medium">Suggested Time:</span> {selectedItem.suggestedStartTime} - {selectedItem.suggestedEndTime}</p>
                    <p><span className="font-medium">Duration:</span> {selectedItem.suggestedDuration} minutes</p>
                    {selectedItem.suggestedReason && <p><span className="font-medium">Reason:</span> {selectedItem.suggestedReason}</p>}
                  </div>
                </div>
              )}

              {/* Time Clash Note */}
              {selectedItem.timeClashNote && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{selectedItem.timeClashNote}</p>
                </div>
              )}

              {/* Join Meeting Button */}
              {selectedItem.consultationType === 'VIDEO' && 
               selectedItem.appointmentStatus === 'CONFIRMED' &&
               new Date(selectedItem.appointmentStartDateTime) <= new Date() &&
               new Date(selectedItem.appointmentEndDateTime) >= new Date() && (
                <a
                  href={selectedItem.meetingLink || `https://meet.viqure.com/${selectedItem._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700 transition"
                >
                  🎥 Join Meeting
                </a>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t flex-wrap">
                
                {/* Doctor actions for PENDING requests */}
                {selectedItemType === 'request' && role === 'doctor' && selectedItem.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedItem._id)}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        closeDetailModal()
                        setShowChangeRequestModal(true)
                      }}
                      disabled={actionLoading}
                      className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                    >
                      Request Change
                    </button>
                  </>
                )}

                {/* Patient actions for CHANGE_REQUESTED requests */}
                {selectedItemType === 'request' && role === 'patient' && selectedItem.status === 'CHANGE_REQUESTED' && (
                  <>
                    <button
                      onClick={() => handlePatientResponse(selectedItem._id, 'ACCEPT')}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Accept Changes
                    </button>
                  </>
                )}

                {/* Cancel button for ALL requests (patient or doctor can cancel) */}
                {selectedItemType === 'request' && selectedItem.status !== 'CONFIRMED' && (
                  <button
                    onClick={() => handleCancelRequest(selectedItem._id)}
                    disabled={actionLoading}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    Cancel Request
                  </button>
                )}

                {/* Cancel button for CONFIRMED appointments */}
                {selectedItemType === 'appointment' && selectedItem.appointmentStatus === 'CONFIRMED' && (
                  <button
                    onClick={() => handleCancelAppointment(selectedItem._id)}
                    disabled={actionLoading}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Request Modal */}
      {showChangeRequestModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Request Time Change</h2>
              <button 
                onClick={() => {
                  setShowChangeRequestModal(false)
                  setChangeRequestData({
                    suggestedStartTime: '',
                    suggestedEndTime: '',
                    suggestedDuration: '',
                    suggestedReason: ''
                  })
                }} 
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Original Time</label>
                <p className="text-sm text-gray-500">{selectedItem.startTime} - {selectedItem.endTime}</p>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Suggested Start Time</label>
                <input
                  type="time"
                  value={changeRequestData.suggestedStartTime}
                  onChange={(e) => {
                    const start = e.target.value
                    setChangeRequestData({
                      ...changeRequestData,
                      suggestedStartTime: start,
                      suggestedEndTime: changeRequestData.suggestedDuration ? 
                        getEndTimeFromDuration(start, changeRequestData.suggestedDuration) : ''
                    })
                  }}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Suggested Duration (minutes)</label>
                <input
                  type="number"
                  min="10"
                  max="180"
                  step="10"
                  value={changeRequestData.suggestedDuration}
                  onChange={(e) => {
                    const duration = e.target.value
                    setChangeRequestData({
                      ...changeRequestData,
                      suggestedDuration: duration,
                      suggestedEndTime: changeRequestData.suggestedStartTime ? 
                        getEndTimeFromDuration(changeRequestData.suggestedStartTime, duration) : ''
                    })
                  }}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Reason for Change</label>
                <textarea
                  value={changeRequestData.suggestedReason}
                  onChange={(e) => setChangeRequestData({...changeRequestData, suggestedReason: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Explain why you want to reschedule..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleRequestChange(selectedItem._id)}
                  disabled={actionLoading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Submit Change Request
                </button>
                <button
                  onClick={() => {
                    setShowChangeRequestModal(false)
                    setChangeRequestData({
                      suggestedStartTime: '',
                      suggestedEndTime: '',
                      suggestedDuration: '',
                      suggestedReason: ''
                    })
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getEndTimeFromDuration(startTime, duration) {
  const [hours, minutes] = startTime.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + parseInt(duration)
  const endHours = Math.floor(totalMinutes / 60)
  const endMinutes = totalMinutes % 60
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
}

export default Appointments