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
    firstName: '',
    lastName: '',
    phone: '',
    addresses: [],
    profileIcon: '👨‍⚕️', // YOUR extra field
    qualifications: [],
    yearsOfExperience: '',
    consultationFee: '',
    bio: '',
    clinicAddress: ''
  })
  const [earnings, setEarnings] = useState({ totalEarnings: 0, totalAppointments: 0, breakdownByStatus: [] })
  const [newAddress, setNewAddress] = useState({
    type: 'CLINIC',
    street: '',
    city: '',
    state: '',
    pincode: ''
  })
  const [showAddressForm, setShowAddressForm] = useState(false)

  useEffect(() => {
    fetchDoctorData()
    fetchEarnings()
  }, [])

  const fetchDoctorData = async () => {
    try {
      const response = await axiosInstance.get('/auth/me')
      const data = response.data.data?.user || {}
      
      setFormData({
        firstName: data.profile?.firstName || '',
        lastName: data.profile?.lastName || '',
        phone: data.phone || '',
        addresses: data.addresses || [],
        profileIcon: data.profileIcon || '👨‍⚕️', // YOUR extra field
        qualifications: data.detailsOfHealthCareProfessional?.qualifications || [],
        yearsOfExperience: data.detailsOfHealthCareProfessional?.yearsOfExperience || '',
        consultationFee: data.detailsOfHealthCareProfessional?.consultationFee || '',
        bio: data.detailsOfHealthCareProfessional?.bio || '',
        clinicAddress: data.detailsOfHealthCareProfessional?.clinicAddress || ''
      })
    } catch (error) {
      console.error('Error fetching doctor data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEarnings = async () => {
    try {
      const response = await axiosInstance.get('/doctors/me/earnings')
      setEarnings(response.data.data || { totalEarnings: 0, totalAppointments: 0, breakdownByStatus: [] })
    } catch (error) {
      console.error('Error fetching earnings:', error)
      setEarnings({ totalEarnings: 0, totalAppointments: 0, breakdownByStatus: [] })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAddressChange = (e) => {
    const { name, value } = e.target
    setNewAddress({ ...newAddress, [name]: value })
  }

  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      alert('Please fill all address fields')
      return
    }
    
    try {
      await axiosInstance.post('/users/me/addresses', newAddress)
      setNewAddress({ type: 'CLINIC', street: '', city: '', state: '', pincode: '' })
      setShowAddressForm(false)
      fetchDoctorData()
    } catch (error) {
      console.error('Error adding address:', error)
      alert('Failed to add address')
    }
  }

  const handleDeleteAddress = async (index) => {
    if (!window.confirm('Remove this address?')) return
    
    try {
      const updatedAddresses = formData.addresses.filter((_, i) => i !== index)
      await axiosInstance.patch('/auth/me', { addresses: updatedAddresses })
      fetchDoctorData()
    } catch (error) {
      console.error('Error deleting address:', error)
      alert('Failed to delete address')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await axiosInstance.patch('/doctors/me/profile', {
        phone: formData.phone,
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName
        },
        profileIcon: formData.profileIcon, // YOUR extra field
        detailsOfHealthCareProfessional: {
          qualifications: formData.qualifications,
          yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
          consultationFee: parseFloat(formData.consultationFee) || 0,
          bio: formData.bio,
          clinicAddress: formData.clinicAddress
        }
      })
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

          <div className="bg-gray-50 px-8 py-4 border-b">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Total Earnings</p>
                <p className="text-xl font-bold text-green-600">₹{earnings.totalEarnings || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Appointments</p>
                <p className="text-xl font-bold text-blue-600">{earnings.totalAppointments || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-xl font-bold text-yellow-600">{user?.isActive ? 'Active' : 'Inactive'}</p>
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
                    <label className="text-sm text-gray-500">Profile Icon</label>
                    <div className="text-4xl">{formData.profileIcon || '👨‍⚕️'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">First Name</label>
                    <p className="text-lg font-medium text-gray-800">{formData.firstName || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Last Name</label>
                    <p className="text-lg font-medium text-gray-800">{formData.lastName || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="text-lg font-medium text-gray-800">{user?.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Phone</label>
                    <p className="text-lg font-medium text-gray-800">{formData.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Qualifications</label>
                    <p className="text-lg font-medium text-gray-800">{formData.qualifications?.join(', ') || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Years of Experience</label>
                    <p className="text-lg font-medium text-gray-800">{formData.yearsOfExperience || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Consultation Fee</label>
                    <p className="text-lg font-medium text-gray-800">₹{formData.consultationFee || 'Not provided'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-500">Clinic Address</label>
                    <p className="text-lg font-medium text-gray-800">{formData.clinicAddress || 'Not provided'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-500">Bio</label>
                    <p className="text-gray-800">{formData.bio || 'Not provided'}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Addresses</h3>
                    <button
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      + Add Address
                    </button>
                  </div>

                  {showAddressForm && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          name="type"
                          value={newAddress.type}
                          onChange={handleAddressChange}
                          className="px-3 py-2 border rounded-lg"
                        >
                          <option value="CLINIC">Clinic</option>
                          <option value="HOME">Home</option>
                          <option value="WORK">Work</option>
                          <option value="OTHER">Other</option>
                        </select>
                        <input
                          type="text"
                          name="street"
                          value={newAddress.street}
                          onChange={handleAddressChange}
                          placeholder="Street"
                          className="px-3 py-2 border rounded-lg"
                        />
                        <input
                          type="text"
                          name="city"
                          value={newAddress.city}
                          onChange={handleAddressChange}
                          placeholder="City"
                          className="px-3 py-2 border rounded-lg"
                        />
                        <input
                          type="text"
                          name="state"
                          value={newAddress.state}
                          onChange={handleAddressChange}
                          placeholder="State"
                          className="px-3 py-2 border rounded-lg"
                        />
                        <input
                          type="text"
                          name="pincode"
                          value={newAddress.pincode}
                          onChange={handleAddressChange}
                          placeholder="Pincode"
                          className="px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddAddress}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          Save Address
                        </button>
                        <button
                          onClick={() => setShowAddressForm(false)}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {formData.addresses.length === 0 ? (
                    <p className="text-gray-500 text-sm">No addresses saved</p>
                  ) : (
                    <div className="space-y-3">
                      {formData.addresses.map((addr, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg flex justify-between items-start">
                          <div>
                            <p className="font-medium">{addr.type}</p>
                            <p className="text-sm text-gray-600">{addr.street}</p>
                            <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteAddress(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
                    <label className="block text-gray-700 font-medium mb-2">Profile Icon</label>
                    <input
                      type="text"
                      name="profileIcon"
                      value={formData.profileIcon}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 👨‍⚕️ or any emoji"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Qualifications</label>
                    <input
                      type="text"
                      name="qualifications"
                      value={formData.qualifications?.join(', ')}
                      onChange={(e) => setFormData({ ...formData, qualifications: e.target.value.split(',').map(s => s.trim()) })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter qualifications separated by commas"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        name="consultationFee"
                        value={formData.consultationFee}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
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
                    <label className="block text-gray-700 font-medium mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
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
