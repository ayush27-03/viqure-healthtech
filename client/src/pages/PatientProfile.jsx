// pages/PatientProfile.jsx - Fixed with emergency contacts as array
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'
import {
  Card,
  Typography,
  Input,
  Button,
  Select,
  Row,
  Col,
  Divider,
  Spin,
  Space,
  Modal,
  message,
  Avatar,
  Tag,
  Empty,
  Form
} from 'antd'
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  HeartOutlined,
  EnvironmentOutlined,
  PlusCircleOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select

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
<<<<<<< HEAD
    profileIcon: '👤', // YOUR extra field
    emergencyContact: {
      name: '',
      relation: '',
      phone: ''
    }
=======
    profileIcon: '👤',
    emergencyContacts: [] // Changed to array
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
  })
  const [newAddress, setNewAddress] = useState({
    type: 'HOME',
    street: '',
    city: '',
    state: '',
    pincode: ''
  })
<<<<<<< HEAD
  const [showAddressForm, setShowAddressForm] = useState(false)
=======
  const [newEmergencyContact, setNewEmergencyContact] = useState({
    name: '',
    relation: '',
    phone: ''
  })
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [showEmergencyForm, setShowEmergencyForm] = useState(false)
  const [editingEmergencyIndex, setEditingEmergencyIndex] = useState(null)
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450

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
<<<<<<< HEAD
        profileIcon: data.profileIcon || '👤', // YOUR extra field
        emergencyContact: data.emergencyContact || { name: '', relation: '', phone: '' }
=======
        profileIcon: data.profileIcon || '👤',
        emergencyContacts: data.emergencyContacts || []
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
      })
    } catch (error) {
      console.error('Error fetching patient data:', error)
      message.error('Failed to load profile')
    } finally {
      setLoading(false)
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

  const handleEmergencyChange = (e) => {
    const { name, value } = e.target
    setNewEmergencyContact({ ...newEmergencyContact, [name]: value })
  }

  // ===== ADDRESS FUNCTIONS =====
  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      message.warning('Please fill all address fields')
      return
    }
    
    try {
      await axiosInstance.post('/users/me/addresses', newAddress)
      setNewAddress({ type: 'HOME', street: '', city: '', state: '', pincode: '' })
      setShowAddressForm(false)
      fetchPatientData()
      message.success('Address added successfully')
    } catch (error) {
      console.error('Error adding address:', error)
      message.error('Failed to add address')
    }
  }

<<<<<<< HEAD
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

=======
  const handleDeleteAddress = async (index) => {
    Modal.confirm({
      title: 'Remove Address',
      content: 'Are you sure you want to remove this address?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        try {
          const updatedAddresses = formData.addresses.filter((_, i) => i !== index)
          await axiosInstance.patch('/auth/me', { addresses: updatedAddresses })
          fetchPatientData()
          message.success('Address removed')
        } catch (error) {
          console.error('Error deleting address:', error)
          message.error('Failed to delete address')
        }
      }
    })
  }

  // ===== EMERGENCY CONTACT FUNCTIONS =====
  const handleAddEmergencyContact = async () => {
    if (!newEmergencyContact.name || !newEmergencyContact.phone) {
      message.warning('Please fill at least name and phone')
      return
    }

    try {
      const updatedContacts = [...formData.emergencyContacts, newEmergencyContact]
      await axiosInstance.patch('/auth/me', { emergencyContacts: updatedContacts })
      setNewEmergencyContact({ name: '', relation: '', phone: '' })
      setShowEmergencyForm(false)
      fetchPatientData()
      message.success('Emergency contact added')
    } catch (error) {
      console.error('Error adding emergency contact:', error)
      message.error('Failed to add emergency contact')
    }
  }

  const handleDeleteEmergencyContact = async (index) => {
    Modal.confirm({
      title: 'Remove Emergency Contact',
      content: 'Are you sure you want to remove this emergency contact?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        try {
          const updatedContacts = formData.emergencyContacts.filter((_, i) => i !== index)
          await axiosInstance.patch('/auth/me', { emergencyContacts: updatedContacts })
          fetchPatientData()
          message.success('Emergency contact removed')
        } catch (error) {
          console.error('Error deleting emergency contact:', error)
          message.error('Failed to delete emergency contact')
        }
      }
    })
  }

  // ===== PROFILE FUNCTIONS =====
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
  const handleSave = async () => {
    setSaving(true)
    try {
      await axiosInstance.patch('/auth/me', {
        phone: formData.phone,
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName
        },
<<<<<<< HEAD
        profileIcon: formData.profileIcon // YOUR extra field
=======
        profileIcon: formData.profileIcon,
        emergencyContacts: formData.emergencyContacts // ← ADD THIS
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
      })
      setIsEditing(false)
      message.success('Profile updated successfully')
      fetchPatientData()
    } catch (error) {
      console.error('Error saving profile:', error)
      message.error('Failed to save profile')
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading profile..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Title level={2} className="mb-1">My Profile</Title>
          <Text type="secondary">View and manage your personal information</Text>
        </div>

        <Card className="shadow-lg rounded-2xl border-0 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 -mx-6 -mt-6 px-8 py-6 rounded-t-2xl">
            <Row align="middle" gutter={[16, 16]}>
              <Col>
                <Avatar size={64} className="bg-white/20 text-3xl">
                  {formData.profileIcon || '👤'}
                </Avatar>
              </Col>
              <Col flex="auto">
                <Title level={3} className="text-white mb-0">
                  {formData.firstName} {formData.lastName}
                </Title>
                <Text className="text-blue-100">
                  {user?.email}
                </Text>
              </Col>
              <Col>
                {!isEditing && (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => setIsEditing(true)}
                    className="bg-white/20 border-white/30 hover:bg-white/30"
                  >
                    Edit Profile
                  </Button>
                )}
              </Col>
            </Row>
          </div>

          <div className="pt-6 px-6 pb-6">
            {!isEditing ? (
              // ===== VIEW MODE =====
              <Row gutter={[40, 24]}>
                {/* Left Column - Personal Info */}
                <Col xs={24} md={12}>
                  <Title level={5} className="text-gray-500 mb-4">Personal Information</Title>
                  <div className="space-y-4">
                    <div>
<<<<<<< HEAD
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
=======
                      <Text type="secondary" className="text-sm">First Name</Text>
                      <div className="text-lg font-medium">{formData.firstName || 'Not provided'}</div>
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
                    </div>
                    <div>
                      <Text type="secondary" className="text-sm">Last Name</Text>
                      <div className="text-lg font-medium">{formData.lastName || 'Not provided'}</div>
                    </div>
                    <div>
<<<<<<< HEAD
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
=======
                      <Text type="secondary" className="text-sm">Email</Text>
                      <div className="text-lg font-medium">{user?.email || 'Not provided'}</div>
                    </div>
                    <div>
                      <Text type="secondary" className="text-sm">Phone</Text>
                      <div className="text-lg font-medium">{formData.phone || 'Not provided'}</div>
                    </div>
                    <div>
                      <Text type="secondary" className="text-sm">Profile Icon</Text>
                      <div className="text-4xl mt-1">{formData.profileIcon || '👤'}</div>
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
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
                </Col>






                {/* Right Column - Emergency Contacts */}
              <Col xs={24} md={12}>
                <div className="flex justify-between items-center mb-4">
                  <Title level={5} className="text-gray-500 mb-0">
                    <HeartOutlined className="text-red-500 mr-2" />
                    Emergency Contacts
                  </Title>
                  {!isEditing && (
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => setShowEmergencyForm(true)}
                    >
                      Add
                    </Button>
                  )}
                </div>

                {showEmergencyForm && !isEditing && (
                  <div className="bg-red-50 p-4 rounded-xl mb-4 border border-red-100">
                    {(
                                  <div className="bg-red-50 p-4 rounded-xl mb-4 border border-red-100">
                                    <div className="space-y-3">
                                      <Input
                                        size="large"
                                        name="name"
                                        value={newEmergencyContact.name}
                                        onChange={handleEmergencyChange}
                                        placeholder="Contact name"
                                        prefix={<UserOutlined className="text-gray-400" />}
                                        className="rounded-xl"
                                      />
                                      <Input
                                        size="large"
                                        name="relation"
                                        value={newEmergencyContact.relation}
                                        onChange={handleEmergencyChange}
                                        placeholder="Relation (e.g., Spouse, Parent)"
                                        className="rounded-xl"
                                      />
                                      <Input
                                        size="large"
                                        name="phone"
                                        value={newEmergencyContact.phone}
                                        onChange={handleEmergencyChange}
                                        placeholder="Phone number"
                                        prefix={<PhoneOutlined className="text-gray-400" />}
                                        className="rounded-xl"
                                      />
                                      <Space>
                                        <Button
                                          type="primary"
                                          onClick={handleAddEmergencyContact}
                                          className="rounded-xl"
                                        >
                                          Save Contact
                                        </Button>
                                        <Button
                                          onClick={() => {
                                            setShowEmergencyForm(false)
                                            setNewEmergencyContact({ name: '', relation: '', phone: '' })
                                          }}
                                          className="rounded-xl"
                                        >
                                          Cancel
                                        </Button>
                                      </Space>
                                    </div>
                                  </div>
                                )}
                  </div>
                )}

                {formData.emergencyContacts && formData.emergencyContacts.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-6 text-center border border-dashed border-gray-300">
                    <HeartOutlined className="text-2xl text-gray-300 mb-2" />
                    <Text type="secondary" className="block">No emergency contacts added</Text>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(formData.emergencyContacts || []).map((contact, index) => (
                      <div key={index} className="bg-red-50 rounded-xl p-4 border border-red-100">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <UserOutlined className="text-red-500" />
                              <Text strong>{contact.name}</Text>
                              {contact.relation && (
                                <Tag color="red" className="text-xs">{contact.relation}</Tag>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <PhoneOutlined className="text-red-400" />
                              <Text>{contact.phone}</Text>
                            </div>
                          </div>
                          {!isEditing && (
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDeleteEmergencyContact(index)}
                              size="small"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Col>


                
              </Row>
            ) : (
<<<<<<< HEAD
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
=======
              // ===== EDIT MODE =====
              <div className="space-y-4">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">First Name</label>
                      <Input
                        size="large"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter first name"
                        className="rounded-xl"
                      />
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Last Name</label>
                      <Input
                        size="large"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter last name"
                        className="rounded-xl"
                      />
                    </div>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Phone</label>
                      <Input
                        size="large"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        prefix={<PhoneOutlined className="text-gray-400" />}
                        className="rounded-xl"
                      />
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Profile Icon</label>
                      <Input
                        size="large"
                        name="profileIcon"
                        value={formData.profileIcon}
                        onChange={handleChange}
                        placeholder="e.g., 👤 or any emoji"
                        className="rounded-xl"
                      />
                    </div>
                  </Col>
                </Row>

                <Divider />

                {/* Action Buttons */}
                <Space>
                  <Button
                    type="primary"
                    size="large"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={saving}
                    className="rounded-xl"
                  >
                    Save Changes
                  </Button>
                  <Button
                    size="large"
                    icon={<CloseOutlined />}
                    onClick={handleCancel}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                </Space>
              </div>
            )}
          </div>
        </Card>

        {/* Addresses Section */}
        <Card
          className="shadow-lg rounded-2xl border-0 mt-6"
          title={
            <div className="flex justify-between items-center">
              <span>
                <HomeOutlined className="mr-2" /> Addresses
              </span>
              {!isEditing && (
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => setShowAddressForm(!showAddressForm)}
                >
                  Add Address
                </Button>
              )}
            </div>
          }
        >
          {showAddressForm && !isEditing && (
            <div className="bg-gray-50 p-4 rounded-xl mb-4">
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={12}>
                  <Select
                    size="large"
                    className="w-full"
                    value={newAddress.type}
                    onChange={(value) => setNewAddress({ ...newAddress, type: value })}
                  >
                    <Option value="HOME">Home</Option>
                    <Option value="WORK">Work</Option>
                    <Option value="OTHER">Other</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12}>
                  <Input
                    size="large"
                    name="street"
                    value={newAddress.street}
                    onChange={handleAddressChange}
                    placeholder="Street"
                    className="rounded-xl"
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Input
                    size="large"
                    name="city"
                    value={newAddress.city}
                    onChange={handleAddressChange}
                    placeholder="City"
                    className="rounded-xl"
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Input
                    size="large"
                    name="state"
                    value={newAddress.state}
                    onChange={handleAddressChange}
                    placeholder="State"
                    className="rounded-xl"
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Input
                    size="large"
                    name="pincode"
                    value={newAddress.pincode}
                    onChange={handleAddressChange}
                    placeholder="Pincode"
                    className="rounded-xl"
                  />
                </Col>
                <Col xs={24}>
                  <Space>
                    <Button
                      type="primary"
                      onClick={handleAddAddress}
                      className="rounded-xl"
                    >
                      Save Address
                    </Button>
                    <Button
                      onClick={() => setShowAddressForm(false)}
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>
          )}

          {formData.addresses.length === 0 ? (
            <Empty description="No addresses saved" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <Row gutter={[16, 16]}>
              {formData.addresses.map((addr, index) => (
                <Col xs={24} sm={12} key={index}>
                  <Card
                    size="small"
                    className="bg-gray-50 border-0 rounded-xl"
                    actions={[
                      !isEditing && (
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteAddress(index)}
                        >
                          Remove
                        </Button>
                      )
                    ]}
                  >
                    <div>
                      <Tag color="blue">{addr.type}</Tag>
                      <div className="mt-2">
                        <Text>{addr.street}</Text>
                        <br />
                        <Text>{addr.city}, {addr.state} - {addr.pincode}</Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card>
      </div>
    </div>
  )
}

export default PatientProfile
