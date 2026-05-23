import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'

function DoctorBooking() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedDuration, setSelectedDuration] = useState(null)
  const [selectedStartTime, setSelectedStartTime] = useState('')
  const [availableStartTimes, setAvailableStartTimes] = useState([])
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [availableRanges, setAvailableRanges] = useState([])
  const [costData, setCostData] = useState(null)
  const [fetchingCost, setFetchingCost] = useState(false)
  const [bookingDetails, setBookingDetails] = useState({
    reason: '',
    symptoms: '',
    type: 'VIDEO'
  })
  const [durationOptions, setDurationOptions] = useState([])
  const [availableDates, setAvailableDates] = useState([])
  const [fetchingSlots, setFetchingSlots] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchDoctorDetails()
  }, [id, isAuthenticated])

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots()
    }
  }, [selectedDate])

  useEffect(() => {
    if (selectedDuration && availableRanges.length > 0) {
      calculateAvailableStartTimes()
    }
  }, [selectedDuration, availableRanges])

  const fetchDoctorDetails = async () => {
    try {
      const response = await axiosInstance.get(`/doctors/${id}`)
      setDoctor(response.data)
      
      const settings = response.data.availabilitySettings
      if (settings) {
        const min = settings.minAppointmentDuration || 10
        const max = settings.maxAppointmentDuration || 180
        const options = []
        for (let duration = min; duration <= max; duration += 10) {
          options.push(duration)
        }
        setDurationOptions(options)
        
        const dates = []
        const maxDays = settings.advanceBookingDays || 14
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        for (let i = 0; i <= maxDays; i++) {
          const date = new Date(today)
          date.setDate(today.getDate() + i)
          
          const dayOfWeek = date.getDay()
          const daySchedule = settings.workingHours?.find(s => s.dayOfWeek === dayOfWeek)
          const isWorking = daySchedule?.isWorking || false
          
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const dateStr = `${year}-${month}-${day}`
          
          const isLeave = settings.leaveDates?.some(ld => ld.date === dateStr) || false
          const isAvailable = isWorking && !isLeave && date >= today
          
          dates.push({
            date: date,
            dateStr: dateStr,
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
            dayNum: date.getDate(),
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            isAvailable: isAvailable
          })
        }
        setAvailableDates(dates)
      }
    } catch (error) {
      console.error('Error fetching doctor:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableSlots = useCallback(async () => {
    if (!selectedDate) return
    setFetchingSlots(true)
    setAvailableRanges([])
    setAvailableStartTimes([])
    setSelectedDuration(null)
    setSelectedStartTime('')
    
    try {
      const response = await axiosInstance.get(`/doctors/${id}/available-slots`, {
        params: { date: selectedDate }
      })
      
      const data = response.data
      const ranges = data.ranges || []
      const minDuration = data.minDuration || 10
      const maxDuration = data.maxDuration || 180
      
      const options = []
      for (let duration = minDuration; duration <= maxDuration; duration += 10) {
        options.push(duration)
      }
      setDurationOptions(options)
      setAvailableRanges(ranges)
      
    } catch (error) {
      console.error('Error fetching slots:', error)
      setAvailableRanges([])
    } finally {
      setFetchingSlots(false)
    }
  }, [id, selectedDate])

  const calculateAvailableStartTimes = () => {
    const startTimes = []
    const now = new Date()
    const selectedDateObj = new Date(selectedDate)
    const isToday = selectedDateObj.toDateString() === now.toDateString()
    
    for (const range of availableRanges) {
      let current = range.start
      
      while (true) {
        const currentMinutes = timeToMinutes(current)
        const endMinutes = currentMinutes + selectedDuration
        const endTime = minutesToTime(endMinutes)
        
        if (endTime > range.end) break
        
        if (isToday) {
          const slotDateTime = new Date(selectedDateObj)
          const [slotHours, slotMins] = current.split(':').map(Number)
          slotDateTime.setHours(slotHours, slotMins, 0, 0)
          const minutesFromNow = (slotDateTime - now) / 1000 / 60
          
          if (minutesFromNow < 10) {
            current = addMinutes(current, 10)
            continue
          }
        }
        
        startTimes.push(current)
        current = addMinutes(current, 10)
      }
    }
    
    setAvailableStartTimes(startTimes)
  }

  function timeToMinutes(timeStr) {
    const [hours, mins] = timeStr.split(':').map(Number)
    return hours * 60 + mins
  }

  function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
  }

  function addMinutes(timeStr, minutes) {
    const [hours, mins] = timeStr.split(':').map(Number)
    const total = hours * 60 + mins + minutes
    const newHours = Math.floor(total / 60)
    const newMins = total % 60
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`
  }

  const handleDateSelect = (dateStr, isAvailable) => {
    if (!isAvailable) return
    setSelectedDate(dateStr)
    setAvailableRanges([])
    setAvailableStartTimes([])
    setSelectedDuration(null)
    setSelectedStartTime('')
  }

  const handleDurationSelect = (duration) => {
    setSelectedDuration(duration)
  }

  const handleStartTimeSelect = (startTime) => {
    setSelectedStartTime(startTime)
  }

  const getEndTime = (startTime, duration) => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + duration
    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
  }

  const handleProceedToBook = async () => {
  if (!selectedStartTime) {
    setBookingError('Please select a start time')
    return
  }
  
  setFetchingCost(true)
  try {
    const response = await axiosInstance.post('/booking/calculate-cost', {
      doctorId: id,
      date: selectedDate,
      startTime: selectedStartTime,
      endTime: getEndTime(selectedStartTime, selectedDuration),
      duration: selectedDuration,
      type: bookingDetails.type
    })
    
    setCostData(response.data)
    setShowConfirmModal(true)
    setBookingError('')
    setBookingSuccess(false)
  } catch (error) {
    setBookingError(error.response?.data?.message || 'Failed to calculate cost')
  } finally {
    setFetchingCost(false)
  }
}

  const handleConfirmBooking = async () => {
    const endTime = getEndTime(selectedStartTime, selectedDuration)
    
    try {
      await axiosInstance.post('/appointment-requests', {
        doctorId: id,
        patientId: user?.roleId,
        date: selectedDate,
        startTime: selectedStartTime,
        endTime: endTime,
        duration: selectedDuration,
        reason: bookingDetails.reason,
        symptoms: bookingDetails.symptoms,
        type: bookingDetails.type
      })
      
      setBookingSuccess(true)
      
    } catch (error) {
      setBookingError(error.response?.data?.message || 'Booking request failed')
    }
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

  const settings = doctor.availabilitySettings || {}
  const minDuration = settings.minAppointmentDuration || 10
  const maxDuration = settings.maxAppointmentDuration || 180

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/doctor/${id}`)}
              className="text-blue-600 hover:text-blue-700"
            >
              ← Back to Doctor Profile
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-gray-800">Book Appointment</h1>
              <p className="text-gray-500">with {doctor.doctorName}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          
          <div className="mb-8">
            <h3 className="font-semibold text-gray-700 mb-3">Step 1 - Select Date</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2">
              {availableDates.map((dateInfo, index) => (
                <button
                  key={index}
                  onClick={() => handleDateSelect(dateInfo.dateStr, dateInfo.isAvailable)}
                  disabled={!dateInfo.isAvailable}
                  className={`p-3 rounded-lg text-center transition ${
                    !dateInfo.isAvailable
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                      : selectedDate === dateInfo.dateStr
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-xs">{dateInfo.month}</div>
                  <div className="text-xl font-bold">{dateInfo.dayNum}</div>
                  <div className="text-xs">{dateInfo.dayName}</div>
                </button>
              ))}
            </div>
          </div>
          
          {selectedDate && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-700 mb-3">Step 2 - Select Duration</h3>
              <div className="text-sm text-gray-500 mb-3">
                Doctor allows {minDuration} to {maxDuration} minutes per appointment
              </div>
              <div className="flex flex-wrap gap-2">
                {durationOptions.map((duration) => (
                  <button
                    key={duration}
                    onClick={() => handleDurationSelect(duration)}
                    className={`px-4 py-2 rounded-lg transition ${
                      selectedDuration === duration
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {duration} min
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {selectedDate && selectedDuration && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-700 mb-3">Step 3 - Select Start Time</h3>
              {fetchingSlots ? (
                <div className="text-center py-8 text-gray-500">Loading available times...</div>
              ) : availableStartTimes.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-64 overflow-y-auto">
                  {availableStartTimes.map((startTime, index) => (
                    <button
                      key={index}
                      onClick={() => handleStartTimeSelect(startTime)}
                      className={`p-2 rounded-lg text-center transition ${
                        selectedStartTime === startTime
                          ? 'bg-blue-600 text-white'
                          : 'bg-green-100 text-gray-700 hover:bg-green-200'
                      }`}
                    >
                      <div className="font-medium">{startTime}</div>
                      <div className="text-xs">
                        to {getEndTime(startTime, selectedDuration)}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-500">No available start times for {selectedDuration} minutes on this date</p>
                  <p className="text-sm text-gray-400 mt-1">Try a different duration or date</p>
                </div>
              )}
            </div>
          )}
          
          {selectedStartTime && (
            <div className="mt-6">
              <button
                onClick={handleProceedToBook}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-lg"
              >
                Proceed to Booking Details
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            
            {bookingError && (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-red-600">!</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Booking Failed</h2>
                <p className="text-red-600">{bookingError}</p>
                <button
                  onClick={() => {
                    setBookingError('')
                    setShowConfirmModal(false)
                  }}
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  OK
                </button>
              </div>
            )}
            
            {bookingSuccess && (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-green-600">✓</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Sent!</h2>
                <p className="text-gray-600">Your booking request has been submitted successfully.</p>
                <p className="text-gray-500 text-sm mt-2">Doctor will review and respond.</p>
                <button
                  onClick={() => {
                    setBookingSuccess(false)
                    setShowConfirmModal(false)
                    navigate(`/doctor/${id}`)
                  }}
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  OK
                </button>
              </div>
            )}
            
            {!bookingError && !bookingSuccess && (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Details</h2>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Reason for Visit</label>
                    <textarea
                      value={bookingDetails.reason}
                      onChange={(e) => setBookingDetails({...bookingDetails, reason: e.target.value})}
                      rows="3"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Please describe your symptoms or reason for visiting"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Symptoms (Optional)</label>
                    <textarea
                      value={bookingDetails.symptoms}
                      onChange={(e) => setBookingDetails({...bookingDetails, symptoms: e.target.value})}
                      rows="2"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe any specific symptoms"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Consultation Type</label>
                    <select
                      value={bookingDetails.type}
                      onChange={(e) => setBookingDetails({...bookingDetails, type: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="VIDEO">Video Consultation</option>
                      <option value="CHAT">Chat Consultation</option>
                      <option value="CLINIC">In-Clinic Visit</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Doctor:</span>
                      <span className="font-semibold">{doctor.doctorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-semibold">{new Date(selectedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-semibold">{selectedStartTime} to {getEndTime(selectedStartTime, selectedDuration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold">{selectedDuration} minutes</span>
                    </div>
                    {costData && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Consultation Fee:</span>
                            <span className="font-semibold">₹{costData.subtotal}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">GST (18%):</span>
                            <span className="font-semibold">₹{costData.tax}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-blue-200">
                            <span className="font-semibold text-gray-800">Total Amount:</span>
                            <span className="font-bold text-blue-600 text-lg">₹{costData.total}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-yellow-700 text-sm">
                    This is a booking request. The doctor will review and confirm your appointment.
                  </p>
                </div>

                <button
                  onClick={handleConfirmBooking}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 mb-2"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorBooking