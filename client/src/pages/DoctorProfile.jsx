// pages/DoctorProfile.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
<<<<<<< HEAD
import { Link, useNavigate } from 'react-router-dom' // Added useNavigate to prevent crash
=======
import { Link, useNavigate } from 'react-router-dom'
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
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
  Tabs,
  Descriptions,
  Statistic,
  Badge
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
  PlusCircleOutlined,
  MedicineBoxOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  SettingOutlined,
  StarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select
const { TabPane } = Tabs

function DoctorProfile() {
  const { user } = useAuth()
<<<<<<< HEAD
  const navigate = useNavigate() // Initialized navigate hook
=======
  const navigate = useNavigate()
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    addresses: [],
    profileIcon: '👨‍⚕️',
    qualifications: [],
    yearsOfExperience: '',
    consultationFee: '',
    bio: '',
    clinicAddress: ''
  })
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
        profileIcon: data.profileIcon || '👨‍⚕️',
        qualifications: data.detailsOfHealthCareProfessional?.qualifications || [],
        yearsOfExperience: data.detailsOfHealthCareProfessional?.yearsOfExperience || '',
        consultationFee: data.detailsOfHealthCareProfessional?.consultationFee || '',
        bio: data.detailsOfHealthCareProfessional?.bio || '',
        clinicAddress: data.detailsOfHealthCareProfessional?.clinicAddress || ''
      })
    } catch (error) {
      console.error('Error fetching doctor data:', error)
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

  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) {
<<<<<<< HEAD
      alert('Please fill all address fields')
=======
      message.warning('Please fill all address fields')
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
      return
    }
    
    try {
      await axiosInstance.post('/users/me/addresses', newAddress)
      setNewAddress({ type: 'CLINIC', street: '', city: '', state: '', pincode: '' })
      setShowAddressForm(false)
      fetchDoctorData()
<<<<<<< HEAD
    } catch (error) {
      console.error('Error adding address:', error)
      alert('Failed to add address')
=======
      message.success('Address added successfully')
    } catch (error) {
      console.error('Error adding address:', error)
      message.error('Failed to add address')
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
    }
  }

  const handleDeleteAddress = async (index) => {
<<<<<<< HEAD
    if (!window.confirm('Remove this address?')) return
    
    try {
      const updatedAddresses = formData.addresses.filter((_, i) => i !== index)
      await axiosInstance.patch('/auth/me', { addresses: updatedAddresses })
      fetchDoctorData()
    } catch (error) {
      console.error('Error deleting address:', error)
      alert('Failed to delete address')
    }
=======
    Modal.confirm({
      title: 'Remove Address',
      content: 'Are you sure you want to remove this address?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        try {
          const updatedAddresses = formData.addresses.filter((_, i) => i !== index)
          await axiosInstance.patch('/auth/me', { addresses: updatedAddresses })
          fetchDoctorData()
          message.success('Address removed')
        } catch (error) {
          console.error('Error deleting address:', error)
          message.error('Failed to delete address')
        }
      }
    })
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
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
        profileIcon: formData.profileIcon,
        detailsOfHealthCareProfessional: {
          qualifications: formData.qualifications,
          yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
          consultationFee: parseFloat(formData.consultationFee) || 0,
          bio: formData.bio,
          clinicAddress: formData.clinicAddress
        }
      })
      setIsEditing(false)
      message.success('Profile updated successfully')
      fetchDoctorData()
    } catch (error) {
      console.error('Error saving profile:', error)
      message.error('Failed to save profile')
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading profile..." />
      </div>
    )
  }

  const doctorStats = {
    patients: user?.detailsOfHealthCareProfessional?.stats?.totalAppointments || 0,
    rating: user?.detailsOfHealthCareProfessional?.stats?.rating || 0,
    totalReviews: user?.detailsOfHealthCareProfessional?.stats?.totalRatings || 0
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Title level={2} className="mb-1">Doctor Profile</Title>
          <Text type="secondary">Manage your professional information</Text>
        </div>

<<<<<<< HEAD
          {/* RE-ALIGNED BANNER SECTION */}
          <div className="bg-gray-50 px-8 py-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500">Status:</span>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                user?.isActive ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <button
                onClick={() => navigate('/doctor/earnings')}
                className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm"
              >
                View Full Earnings Report →
              </button>
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
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2 text-sm"
                    >
                      ⚙️ Availability Settings
                    </Link>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
=======
        <Card className="shadow-lg rounded-2xl border-0 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-800 -mx-6 -mt-6 px-8 py-6 rounded-t-2xl">
            <Row align="middle" gutter={[16, 16]}>
              <Col>
                <Avatar size={64} className="bg-white/20 text-3xl">
                  {formData.profileIcon || '👨‍⚕️'}
                </Avatar>
              </Col>
              <Col flex="auto">
                <Title level={3} className="text-white mb-0">
                  Dr. {formData.firstName} {formData.lastName}
                </Title>
                <Text className="text-green-100">
                  {user?.email}
                </Text>
              </Col>
              <Col>
                {!isEditing && (
                  <Space>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => setIsEditing(true)}
                      className="bg-white/20 border-white/30 hover:bg-white/30"
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
                    >
                      Edit Profile
                    </Button>
                    <Button
                      icon={<SettingOutlined />}
                      onClick={() => navigate('/doctor/settings')}
                      className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                    >
                      Settings
                    </Button>
                  </Space>
                )}
              </Col>
            </Row>
          </div>

<<<<<<< HEAD
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
=======
          {/* Status Bar */}
          <div className="bg-gray-50 px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <Badge
                status={user?.isActive ? 'success' : 'warning'}
                text={user?.isActive ? 'Active' : 'Inactive'}
              />
              {user?.detailsOfHealthCareProfessional?.approvalStatus && (
                <Tag color={user.detailsOfHealthCareProfessional.approvalStatus === 'APPROVED' ? 'green' : 'gold'}>
                  {user.detailsOfHealthCareProfessional.approvalStatus}
                </Tag>
              )}
            </div>
            <Button
              type="primary"
              onClick={() => navigate('/doctor/earnings')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              View Earnings Report →
            </Button>
          </div>

          <div className="pt-6 px-6 pb-6">
            {!isEditing ? (
              // ===== VIEW MODE =====
              <>
                {/* Stats Row */}
                <Row gutter={[16, 16]} className="mb-6">
                  <Col xs={8}>
                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                      <Statistic
                        title="Patients"
                        value={doctorStats.patients}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </div>
                  </Col>
                  <Col xs={8}>
                    <div className="text-center p-3 bg-yellow-50 rounded-xl">
                      <Statistic
                        title="Rating"
                        value={doctorStats.rating || 0}
                        prefix={<StarOutlined />}
                        valueStyle={{ color: '#faad14' }}
                        precision={1}
                      />
                    </div>
                  </Col>
                  <Col xs={8}>
                    <div className="text-center p-3 bg-purple-50 rounded-xl">
                      <Statistic
                        title="Reviews"
                        value={doctorStats.totalReviews || 0}
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </div>
                  </Col>
                </Row>

                <Tabs defaultActiveKey="profile">
                  <TabPane tab="Profile Info" key="profile">
                    <Row gutter={[24, 16]}>
                      <Col xs={24} sm={12}>
                        <div>
                          <Text type="secondary" className="text-sm">First Name</Text>
                          <div className="text-lg font-medium">{formData.firstName || 'Not provided'}</div>
                        </div>
                      </Col>
                      <Col xs={24} sm={12}>
                        <div>
                          <Text type="secondary" className="text-sm">Last Name</Text>
                          <div className="text-lg font-medium">{formData.lastName || 'Not provided'}</div>
                        </div>
                      </Col>
                      <Col xs={24} sm={12}>
                        <div>
                          <Text type="secondary" className="text-sm">Email</Text>
                          <div className="text-lg font-medium">{user?.email || 'Not provided'}</div>
                        </div>
                      </Col>
                      <Col xs={24} sm={12}>
                        <div>
                          <Text type="secondary" className="text-sm">Phone</Text>
                          <div className="text-lg font-medium">{formData.phone || 'Not provided'}</div>
                        </div>
                      </Col>
                      <Col xs={24} sm={12}>
                        <div>
                          <Text type="secondary" className="text-sm">Profile Icon</Text>
                          <div className="text-4xl mt-1">{formData.profileIcon || '👨‍⚕️'}</div>
                        </div>
                      </Col>
                      <Col xs={24} sm={12}>
                        <div>
                          <Text type="secondary" className="text-sm">Years of Experience</Text>
                          <div className="text-lg font-medium">{formData.yearsOfExperience || 'Not provided'} years</div>
                        </div>
                      </Col>
                      <Col xs={24}>
                        <div>
                          <Text type="secondary" className="text-sm">Qualifications</Text>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {formData.qualifications?.length > 0 ? (
                              formData.qualifications.map((qual, i) => (
                                <Tag key={i} color="blue">{qual}</Tag>
                              ))
                            ) : (
                              <Text>Not provided</Text>
                            )}
                          </div>
                        </div>
                      </Col>
                      <Col xs={24}>
                        <div>
                          <Text type="secondary" className="text-sm">Consultation Fee</Text>
                          <div className="text-lg font-medium">₹{formData.consultationFee || 'Not provided'}</div>
                        </div>
                      </Col>
                      <Col xs={24}>
                        <div>
                          <Text type="secondary" className="text-sm">Clinic Address</Text>
                          <div className="text-lg font-medium">{formData.clinicAddress || 'Not provided'}</div>
                        </div>
                      </Col>
                      <Col xs={24}>
                        <div>
                          <Text type="secondary" className="text-sm">Bio</Text>
                          <div className="text-gray-800 mt-1">{formData.bio || 'Not provided'}</div>
                        </div>
                      </Col>
                    </Row>
                  </TabPane>

                  <TabPane tab="Addresses" key="addresses">
                    <div className="flex justify-between items-center mb-4">
                      <Text>Manage your addresses</Text>
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => setShowAddressForm(!showAddressForm)}
                      >
                        Add Address
                      </Button>
                    </div>

                    {showAddressForm && (
                      <div className="bg-gray-50 p-4 rounded-xl mb-4">
                        <Row gutter={[12, 12]}>
                          <Col xs={24} sm={12}>
                            <Select
                              size="large"
                              className="w-full"
                              value={newAddress.type}
                              onChange={(value) => setNewAddress({ ...newAddress, type: value })}
                            >
                              <Option value="CLINIC">Clinic</Option>
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
                                <Tag color="green">{addr.type}</Tag>
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
                  </TabPane>
                </Tabs>
              </>
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
            ) : (
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
                        placeholder="e.g., 👨‍⚕️ or any emoji"
                        className="rounded-xl"
                      />
                    </div>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Years of Experience</label>
                      <Input
                        size="large"
                        name="yearsOfExperience"
                        type="number"
                        value={formData.yearsOfExperience}
                        onChange={handleChange}
                        placeholder="Years"
                        prefix={<ClockCircleOutlined className="text-gray-400" />}
                        className="rounded-xl"
                      />
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Consultation Fee (₹)</label>
                      <Input
                        size="large"
                        name="consultationFee"
                        type="number"
                        value={formData.consultationFee}
                        onChange={handleChange}
                        placeholder="Fee"
                        prefix={<DollarOutlined className="text-gray-400" />}
                        className="rounded-xl"
                      />
                    </div>
                  </Col>
                </Row>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Qualifications</label>
                  <Input
                    size="large"
                    name="qualifications"
                    value={formData.qualifications?.join(', ')}
                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value.split(',').map(s => s.trim()) })}
                    placeholder="Enter qualifications separated by commas"
                    className="rounded-xl"
                  />
                </div>

<<<<<<< HEAD
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
=======
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Clinic Address</label>
                  <Input
                    size="large"
                    name="clinicAddress"
                    value={formData.clinicAddress}
                    onChange={handleChange}
                    placeholder="Clinic address"
                    prefix={<EnvironmentOutlined className="text-gray-400" />}
                    className="rounded-xl"
                  />
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Bio</label>
                  <Input.TextArea
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell patients about your experience and expertise..."
                    className="rounded-xl"
                    maxLength={500}
                    showCount
                  />
                </div>

                <Divider />

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
      </div>
    </div>
  )
}

export default DoctorProfile
