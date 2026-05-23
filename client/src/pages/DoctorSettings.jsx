import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'

function DoctorSettings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    minAppointmentDuration: 10,
    maxAppointmentDuration: 180,
    advanceBookingDays: 14,
    workingHours: [
      { dayOfWeek: 1, dayName: 'Monday', isWorking: true, slots: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
      { dayOfWeek: 2, dayName: 'Tuesday', isWorking: true, slots: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
      { dayOfWeek: 3, dayName: 'Wednesday', isWorking: true, slots: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
      { dayOfWeek: 4, dayName: 'Thursday', isWorking: true, slots: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
      { dayOfWeek: 5, dayName: 'Friday', isWorking: true, slots: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
      { dayOfWeek: 6, dayName: 'Saturday', isWorking: true, slots: [{ start: '09:00', end: '14:00' }] },
      { dayOfWeek: 0, dayName: 'Sunday', isWorking: false, slots: [] }
    ],
    leaveDates: []
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
  try {
    const response = await axiosInstance.get(`/doctors/${user?.roleId}`)
    const doctor = response.data
    if (doctor.availabilitySettings) {
      setSettings(doctor.availabilitySettings)
    }
    // If no settings, keep the default state that is already set
  } catch (error) {
    console.error('Error fetching settings:', error)
  } finally {
    setLoading(false)
  }
}

  const handleSave = async () => {
    setSaving(true)
    try {
      await axiosInstance.put(`/doctors/${user?.roleId}`, {
        availabilitySettings: settings
      })
      
      try {
        await axiosInstance.post(`/doctors/${user?.roleId}/generate-slots`)
        alert('Settings saved and slots generated successfully')
      } catch (slotError) {
        alert('Settings saved but slot generation failed. Please configure your working hours.')
      }
      
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const toggleWorkingDay = (index) => {
    const updated = [...settings.workingHours]
    updated[index].isWorking = !updated[index].isWorking
    if (!updated[index].isWorking) {
      updated[index].slots = []
    } else {
      if (updated[index].slots.length === 0) {
        updated[index].slots = [{ start: '09:00', end: '17:00' }]
      }
    }
    setSettings({ ...settings, workingHours: updated })
  }

  const addTimeSlot = (dayIndex) => {
    const updated = [...settings.workingHours]
    updated[dayIndex].slots.push({ start: '09:00', end: '17:00' })
    setSettings({ ...settings, workingHours: updated })
  }

  const updateTimeSlot = (dayIndex, slotIndex, field, value) => {
    const updated = [...settings.workingHours]
    updated[dayIndex].slots[slotIndex][field] = value
    setSettings({ ...settings, workingHours: updated })
  }

  const removeTimeSlot = (dayIndex, slotIndex) => {
    const updated = [...settings.workingHours]
    updated[dayIndex].slots.splice(slotIndex, 1)
    setSettings({ ...settings, workingHours: updated })
  }

  const addLeaveDate = () => {
    setSettings({
      ...settings,
      leaveDates: [...settings.leaveDates, { date: '', reason: '' }]
    })
  }

  const updateLeaveDate = (index, field, value) => {
    const updated = [...settings.leaveDates]
    updated[index][field] = value
    setSettings({ ...settings, leaveDates: updated })
  }

  const removeLeaveDate = (index) => {
    const updated = settings.leaveDates.filter((_, i) => i !== index)
    setSettings({ ...settings, leaveDates: updated })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Availability Settings</h1>
                <p className="text-blue-100 mt-1">Configure your working hours and appointment rules</p>
              </div>
              <button
                onClick={() => navigate('/doctor/profile')}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                Back to Profile
              </button>
            </div>
          </div>

          <div className="p-8 space-y-8">
            
            {/* General Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">General Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Min Appointment Duration (minutes)</label>
                  <input
                    type="number"
                    value={settings.minAppointmentDuration}
                    onChange={(e) => setSettings({...settings, minAppointmentDuration: parseInt(e.target.value)})}
                    min="10"
                    max="180"
                    step="5"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 10 minutes</p>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Max Appointment Duration (minutes)</label>
                  <input
                    type="number"
                    value={settings.maxAppointmentDuration}
                    onChange={(e) => setSettings({...settings, maxAppointmentDuration: parseInt(e.target.value)})}
                    min="10"
                    max="180"
                    step="5"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum 180 minutes (3 hours)</p>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Advance Booking (days)</label>
                  <input
                    type="number"
                    value={settings.advanceBookingDays}
                    onChange={(e) => setSettings({...settings, advanceBookingDays: parseInt(e.target.value)})}
                    min="1"
                    max="30"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">How many days patients can book in advance</p>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Working Hours</h3>
              <p className="text-sm text-gray-500 mb-4">Set your available time slots for each day. Leave a day unchecked if you are not working.</p>
              <div className="space-y-4">
                {settings.workingHours.map((day, dayIndex) => (
                  <div key={day.dayOfWeek} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={day.isWorking}
                          onChange={() => toggleWorkingDay(dayIndex)}
                          className="w-5 h-5 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="font-semibold text-gray-700">{day.dayName}</span>
                      </div>
                    </div>
                    
                    {day.isWorking && (
                      <div className="ml-8 space-y-3">
                        {day.slots.map((slot, slotIndex) => (
                          <div key={slotIndex} className="flex items-center gap-3">
                            <input
                              type="time"
                              value={slot.start}
                              onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'start', e.target.value)}
                              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                              type="time"
                              value={slot.end}
                              onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'end', e.target.value)}
                              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addTimeSlot(dayIndex)}
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                        >
                          + Add Time Slot
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Leave Dates */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Leave Dates</h3>
              <p className="text-sm text-gray-500 mb-4">Add dates when you will not be available for consultations.</p>
              {settings.leaveDates.map((leave, index) => (
                <div key={index} className="flex items-center gap-3 mb-3">
                  <input
                    type="date"
                    value={leave.date}
                    onChange={(e) => updateLeaveDate(index, 'date', e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={leave.reason}
                    onChange={(e) => updateLeaveDate(index, 'reason', e.target.value)}
                    placeholder="Reason (optional)"
                    className="px-3 py-2 border rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeLeaveDate(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={addLeaveDate}
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
              >
                + Add Leave Date
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">How this works</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Patients can book appointments only within your working hours</li>
                <li>• Appointment duration can be chosen by patients between min and max limits</li>
                <li>• A 10 minute buffer is automatically added between appointments</li>
                <li>• Leave dates make you completely unavailable on those days</li>
                <li>• Click Save to update your settings and regenerate available slots</li>
              </ul>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? 'Saving and Generating Slots...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorSettings