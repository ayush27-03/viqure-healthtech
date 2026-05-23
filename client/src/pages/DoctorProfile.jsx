import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import axiosInstance from '../services/axiosConfig'

function DoctorProfile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    doctorName: '',
    mobileNumber: '',
    clinicAddress: '',
    city: '', 
    specializations: [],
    yearsOfExperience: '',
    consultationFees: '',
    description: ''
  })
  const [earnings, setEarnings] = useState({ total: 0, monthly: 0, pending: 0 })

  useEffect(() => {
    fetchDoctorData()
    fetchEarnings()
  }, [])

  const fetchDoctorData = async () => {
    try {
      const response = await axiosInstance.get(`/doctors/${user?.roleId}`)
      const data = response.data
      setFormData({
        doctorName: data.doctorName || '',
        mobileNumber: data.mobileNumber || '',
        clinicAddress: data.clinicAddress || '',
        city: data.city || '',
        specializations: data.specializations || [],
        yearsOfExperience: data.yearsOfExperience || '',
        consultationFees: data.consultationFees || '',
        description: data.description || ''
      })
    } catch (error) {
      console.error('Error fetching doctor data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEarnings = async () => {
    try {
      const response = await axiosInstance.get(`/doctors/${user?.roleId}/earnings`)
      setEarnings(response.data)
    } catch (error) {
      console.error('Error fetching earnings:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await axiosInstance.put(`/doctors/${user?.roleId}`, formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    fetchDoctorData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-800 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Doctor Profile</h1>
            <p className="text-green-100 mt-1">Manage your professional information</p>
          </div>

          {/* Earnings Summary */}
          <div className="bg-gray-50 px-8 py-4 border-b">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Total Earnings</p>
                <p className="text-xl font-bold text-green-600">₹{earnings.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-xl font-bold text-blue-600">₹{earnings.monthly}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-xl font-bold text-yellow-600">₹{earnings.pending}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {!isEditing ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b">
                  <h2 className="text-xl font-semibold text-gray-800">Professional Information</h2>
                  <div className="flex gap-3">
                    <Link
                      to="/doctor/settings"
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                    >
                      ⚙️ Availability Settings
                    </Link>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      ✏️ Edit Profile
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-500">Doctor Name</label>
                    <p className="text-lg font-medium text-gray-800">{formData.doctorName || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="text-lg font-medium text-gray-800">{user?.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Mobile Number</label>
                    <p className="text-lg font-medium text-gray-800">{formData.mobileNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Specializations</label>
                    <p className="text-lg font-medium text-gray-800">{formData.specializations?.join(', ') || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Years of Experience</label>
                    <p className="text-lg font-medium text-gray-800">{formData.yearsOfExperience || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Consultation Fee</label>
                    <p className="text-lg font-medium text-gray-800">₹{formData.consultationFees || 'Not provided'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-500">Clinic Address</label>
                    <p className="text-lg font-medium text-gray-800">{formData.clinicAddress || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">City</label>
                    <p className="text-lg font-medium text-gray-800">{formData.city || 'Not provided'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-500">Bio / Description</label>
                    <p className="text-gray-800">{formData.description || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b">
                  <h2 className="text-xl font-semibold text-gray-800">Edit Profile</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Doctor Name</label>
                    <input
                      type="text"
                      name="doctorName"
                      value={formData.doctorName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Mobile Number</label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Clinic Address</label>
                    <textarea
                      name="clinicAddress"
                      value={formData.clinicAddress}
                      onChange={handleChange}
                      rows="2"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Years of Experience</label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Consultation Fee (₹)</label>
                    <input
                      type="number"
                      name="consultationFees"
                      value={formData.consultationFees}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Bio / Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile