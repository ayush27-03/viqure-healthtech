import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'

function DoctorProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingStep, setBookingStep] = useState('details')
  const [bookingDetails, setBookingDetails] = useState({
    reason: '',
    symptoms: '',
    type: 'clinic'
  })
  const [bookingError, setBookingError] = useState('')
  

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])


  useEffect(() => {
    fetchDoctorDetails()
  }, [id])

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots()
    }
  }, [selectedDate])

  const fetchDoctorDetails = async () => {
    try {
      const response = await axiosInstance.get(`/doctors/${id}`)
      setDoctor(response.data)
    } catch (error) {
      console.error('Error fetching doctor:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableSlots = async () => {
    try {
      const response = await axiosInstance.get(`/doctors/${id}/slots?date=${selectedDate}`)
      setAvailableSlots(response.data)
    } catch (error) {
      console.error('Error fetching slots:', error)
    }
  }

  const handleBookAppointment = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!selectedSlot) {
      setBookingError('Please select a time slot')
      return
    }
    setBookingStep('confirmation')
  }

  const confirmBooking = async () => {
    try {
      await axiosInstance.post('/appointments', {
        doctorId: id,
        date: selectedDate,
        slot: selectedSlot,
        reason: bookingDetails.reason,
        symptoms: bookingDetails.symptoms,
        type: bookingDetails.type
      })
      setBookingStep('success')
      setTimeout(() => {
        navigate('/appointments')
      }, 3000)
    } catch (error) {
      setBookingError(error.response?.data?.message || 'Booking failed')
    }
  }

  const getDatesForWeek = () => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Doctor not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Doctor Info */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-1/3 bg-blue-600 p-8 flex flex-col items-center justify-center">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-4">
                <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white text-center">{doctor.name}</h2>
              <p className="text-blue-100 text-center">{doctor.specialization}</p>
            </div>
            
            <div className="md:w-2/3 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Experience</h3>
                  <p className="text-gray-600">{doctor.experience || 'N/A'} years</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Consultation Fee</h3>
                  <p className="text-2xl font-bold text-blue-600">${doctor.consultationFee}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Clinic</h3>
                  <p className="text-gray-600">{doctor.clinicName || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Location</h3>
                  <p className="text-gray-600">{doctor.clinicAddress || 'N/A'}</p>
                </div>
              </div>
              
              {doctor.bio && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-700 mb-2">About</h3>
                  <p className="text-gray-600">{doctor.bio}</p>
                </div>
              )}
              
              <div className="mt-6 flex gap-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-600">Verified License</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-600">Available Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Book an Appointment</h2>
          
          {bookingError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{bookingError}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Date Selection */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Select Date</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {getDatesForWeek().map((date, index) => {
                  const dateStr = date.toISOString().split('T')[0]
                  const isSelected = selectedDate === dateStr
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
                  const dayNum = date.getDate()
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`p-3 rounded-lg text-center transition ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="text-sm font-medium">{dayName}</div>
                      <div className="text-lg font-bold">{dayNum}</div>
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* Time Slots */}
            {selectedDate && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Select Time</h3>
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSlot(slot.time)}
                        className={`p-2 rounded-lg text-center transition ${
                          selectedSlot === slot.time
                            ? 'bg-blue-600 text-white'
                            : slot.available
                            ? 'bg-green-100 text-gray-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!slot.available}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No available slots for this date</p>
                )}
              </div>
            )}
          </div>
          
          {selectedSlot && (
            <div className="mt-6">
              <button
                onClick={handleBookAppointment}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Proceed to Book
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            {bookingStep === 'details' && (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Reason for Visit</label>
                    <textarea
                      value={bookingDetails.reason}
                      onChange={(e) => setBookingDetails({...bookingDetails, reason: e.target.value})}
                      rows="3"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Please describe your symptoms or reason for visiting"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Appointment Type</label>
                    <select
                      value={bookingDetails.type}
                      onChange={(e) => setBookingDetails({...bookingDetails, type: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="clinic">In-Clinic Visit</option>
                      <option value="video">Video Consultation</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setBookingStep('confirmation')}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    Continue
                  </button>
                </div>
              </>
            )}
            
            {bookingStep === 'confirmation' && (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Booking</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Doctor:</span>
                    <span className="font-semibold">{doctor.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold">{new Date(selectedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-semibold">{selectedSlot}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Fee:</span>
                    <span className="font-semibold text-blue-600">${doctor.consultationFee}</span>
                  </div>
                </div>
                <button
                  onClick={confirmBooking}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 mb-2"
                >
                  Confirm & Pay
                </button>
                <button
                  onClick={() => setBookingStep('details')}
                  className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Back
                </button>
              </>
            )}
            
            {bookingStep === 'success' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
                <p className="text-gray-600">Your appointment has been booked successfully.</p>
                <p className="text-gray-500 text-sm mt-2">Redirecting to appointments...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorProfile