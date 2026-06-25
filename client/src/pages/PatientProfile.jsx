import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'

function PatientProfile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    addresses: [],
    profileIcon: '👤', // YOUR extra field
    emergencyContact: {
      name: '',
      relation: '',
      phone: ''
    }
  })
  const [newAddress, setNewAddress] = useState({
    type: 'HOME',
    street: '',
    city: '',
    state: '',
    pincode: ''
  })
  const [showAddressForm, setShowAddressForm] = useState(false)

  useEffect(() => {
    fetchPatientData()
  }, [])

  const fetchPatientData = async () => {
    try {
      const response = await axiosInstance.get('/auth/me')
      const data = response.data.data?.user || {}
      
      setFormData({
        firstName: data.profile?.firstName || '',
        lastName: data.profile?.lastName || '',
        phone: data.phone || '',
        addresses: data.addresses || [],
        profileIcon: data.profileIcon || '👤', // YOUR extra field
        emergencyContact: data.emergencyContact || { name: '', relation: '', phone: '' }
      })
    } catch (error) {
      console.error('Error fetching patient data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('emergency.')) {
      const field = name.split('.')[1]
      setFormData({
        ...formData,
        emergencyContact: { ...formData.emergencyContact, [field]: value }
      })
    } else {
      setFormData({ ...formData, [name]: value })
    }
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
      setNewAddress({ type: 'HOME', street: '', city: '', state: '', pincode: '' })
      setShowAddressForm(false)
      fetchPatientData()
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
      fetchPatientData()
    } catch (error) {
      console.error('Error deleting address:', error)
      alert('Failed to delete address')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await axiosInstance.patch('/auth/me', {
        phone: formData.phone,
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName
        },
        profileIcon: formData.profileIcon // YOUR extra field
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
    fetchPatientData()
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
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">My Profile</h1>
            <p className="text-blue-100 mt-1">View and manage your personal information</p>
          </div>

          <div className="p-8">
            {!isEditing ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b">
                  <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    ✏️ Edit
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-gray-500">Profile Icon</label>
                      <div className="text-4xl">{formData.profileIcon || '👤'}</div>
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

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-gray-500">Name</label>
                        <p className="font-medium text-gray-800">{formData.emergencyContact?.name || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Relation</label>
                        <p className="font-medium text-gray-800">{formData.emergencyContact?.relation || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Phone</label>
                        <p className="font-medium text-gray-800">{formData.emergencyContact?.phone || 'Not provided'}</p>
                      </div>
                    </div>
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
                    <label className="block text-gray-700 font-medium mb-2">Profile Icon</label>
                    <input
                      type="text"
                      name="profileIcon"
                      value={formData.profileIcon}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 👤 or any emoji"
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

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-gray-700 mb-2">Name</label>
                        <input
                          type="text"
                          name="emergency.name"
                          value={formData.emergencyContact?.name || ''}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Relation</label>
                        <select
                          name="emergency.relation"
                          value={formData.emergencyContact?.relation || ''}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select</option>
                          <option value="SPOUSE">Spouse</option>
                          <option value="PARENT">Parent</option>
                          <option value="SIBLING">Sibling</option>
                          <option value="FRIEND">Friend</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          name="emergency.phone"
                          value={formData.emergencyContact?.phone || ''}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
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

export default PatientProfile
