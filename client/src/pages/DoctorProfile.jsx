// pages/DoctorProfile.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
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
      message.warning('Please fill all address fields')
      return
    }
    
    try {
      await axiosInstance.post('/users/me/addresses', newAddress)
      setNewAddress({ type: 'CLINIC', street: '', city: '', state: '', pincode: '' })
      setShowAddressForm(false)
      fetchDoctorData()
      message.success('Address added successfully')
    } catch (error) {
      console.error('Error adding address:', error)
      message.error('Failed to add address')
    }
  }

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
          fetchDoctorData()
          message.success('Address removed')
        } catch (error) {
          console.error('Error deleting address:', error)
          message.error('Failed to delete address')
        }
      }
    })
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
