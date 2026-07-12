/* eslint-disable react-hooks/exhaustive-deps */
// pages/DoctorDetails.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'
import StatCard from '../components/StatCard'
import {
  Row,
  Col,
  Card,
  Avatar,
  Typography,
  Button,
  Space,
  Divider,
  Rate,
  Tag,
  Descriptions,
  Spin,
  Empty,
  Tabs,
  List,
  Badge,
  Alert,
  Breadcrumb
} from 'antd'
import {
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  StarOutlined,
  StarFilled,
  CheckCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  HeartOutlined,
  ShareAltOutlined,
  FileTextOutlined,
  MessageOutlined,
  LeftOutlined
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs

function DoctorDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [doctor, setDoctor] = useState(null)
  const [reviews, setReviews] = useState([])
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, totalReviews: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('about')

  useEffect(() => {
    fetchDoctorDetails()
    fetchDoctorReviews()
  }, [id])

  const fetchDoctorDetails = async () => {
    try {
      const response = await axiosInstance.get(`/users/doctors/${id}`)
      const data = response.data.data || response.data
      
      const mappedDoctor = {
        _id: data._id,
        doctorName: data.profile ? `${data.profile.firstName || ''} ${data.profile.lastName || ''}`.trim() : 'Doctor',
        profileIcon: data.profileIcon || '👨‍⚕️',
        specializations: data.detailsOfHealthCareProfessional?.qualifications || [],
        yearsOfExperience: data.detailsOfHealthCareProfessional?.yearsOfExperience || 0,
        consultationFees: data.detailsOfHealthCareProfessional?.consultationFee || 0,
        clinicAddress: data.detailsOfHealthCareProfessional?.clinicAddress || '',
        city: data.addresses?.[0]?.city || '',
        description: data.detailsOfHealthCareProfessional?.bio || '',
        stats: data.detailsOfHealthCareProfessional?.stats || { rating: 0, totalRatings: 0, totalAppointments: 0 },
        phone: data.phone || '',
        email: data.email || '',
        availableSlots: data.actualAvailableSlots || [],
        availabilitySettings: data.availabilitySettings || {
          minAppointmentDuration: 10,
          maxAppointmentDuration: 180,
          advanceBookingDays: 14
        }
      }
      
      setDoctor(mappedDoctor)
    } catch (error) {
      console.error('Error fetching doctor:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDoctorReviews = async () => {
    try {
      const response = await axiosInstance.get(`/reviews?targetType=DOCTOR&targetId=${id}`)
      const data = response.data.data || []
      const summary = response.data.summary || { averageRating: 0, totalReviews: 0 }
      
      const mappedReviews = data.map(review => ({
        patientName: review.reviewerId?.profile ? 
          `${review.reviewerId.profile.firstName || ''} ${review.reviewerId.profile.lastName || ''}`.trim() : 'Anonymous',
        rating: review.rating || 0,
        comment: review.reviewText || '',
        createdAt: review.createdAt || ''
      }))
      
      setReviews(mappedReviews)
      setReviewSummary(summary)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviews([])
      setReviewSummary({ averageRating: 0, totalReviews: 0 })
    }
  }

  const handleBookClick = () => {
    if (!isAuthenticated) {
      navigate('/login')
    } else {
      navigate(`/doctor/${id}/book`)
    }
  }

  const stats = [
    {
      title: 'Years Experience',
      value: doctor?.yearsOfExperience || 0,
      icon: '📅',
      color: 'blue'
    },
    {
      title: 'Total Patients',
      value: doctor?.stats?.totalAppointments || 0,
      icon: '👨‍👩‍👧‍👦',
      color: 'green'
    },
    {
      title: 'Average Rating',
      value: reviewSummary.averageRating ? reviewSummary.averageRating.toFixed(1) : 'New',
      icon: '⭐',
      color: 'yellow'
    },
    {
      title: 'Total Reviews',
      value: reviewSummary.totalReviews || 0,
      icon: '📝',
      color: 'purple'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-500">Loading doctor details...</p>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <Alert
          message="Doctor Not Found"
          description="The doctor you're looking for doesn't exist or has been removed."
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item>
            <a onClick={() => navigate('/')}>Home</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <a onClick={() => navigate('/doctors')}>Doctors</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{doctor?.doctorName}</Breadcrumb.Item>
        </Breadcrumb>

        {/* Back Button */}
        <Button 
          type="text" 
          icon={<LeftOutlined />} 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          Back
        </Button>

        <Row gutter={[24, 24]}>
          {/* Doctor Profile Card */}
          <Col xs={24} lg={16}>
            <Card className="shadow-sm hover:shadow-md transition-shadow doctor-profile-card">
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8} className="text-center">
                  <Avatar 
                    size={120} 
                    className="bg-blue-100 text-blue-600"
                    icon={<span className="text-5xl">{doctor?.profileIcon || '👨‍⚕️'}</span>}
                  />
                  <div className="mt-4">
                    <Title level={3} className="mb-0">{doctor?.doctorName}</Title>
                    <Text type="secondary" className="block">
                      {doctor?.specializations?.join(', ') || 'General Physician'}
                    </Text>
                    <div className="mt-2">
                      <Rate disabled value={reviewSummary.averageRating} allowHalf />
                      <Text type="secondary" className="ml-2">
                        ({reviewSummary.totalReviews} reviews)
                      </Text>
                    </div>
                  </div>
                </Col>

                <Col xs={24} md={16}>
                  <Descriptions column={{ xs: 1, sm: 2 }} size="middle">
                    <Descriptions.Item label={<><DollarOutlined /> Fee</>}>
                      <Text strong className="text-blue-600 text-lg">
                        ₹{doctor?.consultationFees || 'N/A'}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={<><CalendarOutlined /> Experience</>}>
                      {doctor?.yearsOfExperience || 0} years
                    </Descriptions.Item>
                    <Descriptions.Item label={<><EnvironmentOutlined /> Location</>} span={2}>
                      {doctor?.clinicAddress || doctor?.city || 'Location not specified'}
                    </Descriptions.Item>
                    <Descriptions.Item label={<><PhoneOutlined /> Phone</>}>
                      {doctor?.phone || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label={<><MailOutlined /> Email</>}>
                      {doctor?.email || 'N/A'}
                    </Descriptions.Item>
                  </Descriptions>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {doctor?.specializations?.map((spec, i) => (
                      <Tag key={i} color="blue">{spec}</Tag>
                    ))}
                    <Tag color="green">
                      <CheckCircleOutlined /> Verified
                    </Tag>
                    <Tag color="gold">
                      <StarOutlined /> {doctor?.stats?.rating || 'New'}
                    </Tag>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Button 
                      type="primary" 
                      size="large" 
                      onClick={handleBookClick}
                      className="flex-1"
                    >
                      Book Appointment
                    </Button>
                    <Button 
                      type="default" 
                      size="large" 
                      icon={<HeartOutlined />}
                    />
                    <Button 
                      type="default" 
                      size="large" 
                      icon={<ShareAltOutlined />}
                    />
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Stats Cards - Using StatCard component */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {stats.map((stat, index) => (
                <StatCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                />
              ))}
            </div>

            {/* Tabs Section */}
            <Card className="shadow-sm mt-4 doctor-tabs">
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab="About" key="about">
                  <div className="py-2">
                    <Title level={5}>About Dr. {doctor?.doctorName}</Title>
                    <Paragraph>
                      {doctor?.description || 'No description provided. Please check back later.'}
                    </Paragraph>

                    <Divider />

                    <Title level={5}>Specializations</Title>
                    <div className="flex flex-wrap gap-2">
                      {doctor?.specializations?.map((spec, i) => (
                        <Tag key={i} color="blue" className="text-base py-1 px-3">
                          {spec}
                        </Tag>
                      ))}
                    </div>

                    {doctor?.availabilitySettings && (
                      <>
                        <Divider />
                        <Title level={5}>Availability Settings</Title>
                        <Space size="middle" wrap>
                          <Tag color="blue">
                            Min Duration: {doctor.availabilitySettings.minAppointmentDuration || 10} min
                          </Tag>
                          <Tag color="green">
                            Max Duration: {doctor.availabilitySettings.maxAppointmentDuration || 180} min
                          </Tag>
                          <Tag color="orange">
                            Book {doctor.availabilitySettings.advanceBookingDays || 14} days in advance
                          </Tag>
                        </Space>
                      </>
                    )}
                  </div>
                </TabPane>

                <TabPane tab={`Reviews (${reviewSummary.totalReviews})`} key="reviews">
                  {reviews.length === 0 ? (
                    <Empty 
                      description="No reviews yet"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ) : (
                    <List
                      itemLayout="vertical"
                      dataSource={reviews}
                      renderItem={(review) => (
                        <List.Item>
                          <div className="flex items-start gap-3">
                            <Avatar icon={<UserOutlined />} className="bg-blue-100" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Text strong>{review.patientName}</Text>
                                <Rate disabled value={review.rating} className="text-sm" />
                                <Text type="secondary" className="text-sm">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </Text>
                              </div>
                              <Paragraph className="mt-1 mb-0">{review.comment}</Paragraph>
                            </div>
                          </div>
                        </List.Item>
                      )}
                    />
                  )}
                </TabPane>

                <TabPane tab="Available Slots" key="slots">
                  {doctor?.availableSlots?.length > 0 ? (
                    <div className="py-2">
                      <Title level={5}>Available Time Slots</Title>
                      <Row gutter={[16, 16]}>
                        {doctor.availableSlots.map((slot, index) => (
                          <Col xs={24} sm={12} key={index}>
                            <Card size="small" className="slot-card bg-blue-50">
                              <div className="flex justify-between items-center">
                                <div>
                                  <Text strong>{new Date(slot.date).toLocaleDateString()}</Text>
                                  <div className="text-sm text-gray-600">
                                    {slot.ranges?.map((range, i) => (
                                      <div key={i}>{range.start} - {range.end}</div>
                                    ))}
                                  </div>
                                </div>
                                <Badge status="success" text="Available" />
                              </div>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  ) : (
                    <Empty description="No available slots at the moment" />
                  )}
                </TabPane>
              </Tabs>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            {/* Quick Actions */}
            <Card title="Quick Actions" className="shadow-sm quick-actions">
              <Space direction="vertical" className="w-full" size="middle">
                <Button 
                  type="primary" 
                  block 
                  size="large" 
                  onClick={handleBookClick}
                  icon={<CalendarOutlined />}
                >
                  Book Appointment
                </Button>
                <Button 
                  block 
                  size="large" 
                  icon={<PhoneOutlined />}
                  onClick={() => window.location.href = `tel:${doctor?.phone}`}
                >
                  Call Now
                </Button>
                <Button 
                  block 
                  size="large" 
                  icon={<MessageOutlined />}
                >
                  Send Message
                </Button>
                <Button 
                  block 
                  size="large" 
                  icon={<FileTextOutlined />}
                >
                  View Documents
                </Button>
              </Space>
            </Card>

            {/* Working Hours */}
            <Card title="Working Hours" className="shadow-sm mt-4 working-hours">
              <div className="space-y-2">
                <div className="hour-row">
                  <span className="day">Monday - Friday</span>
                  <span className="time">9:00 AM - 6:00 PM</span>
                </div>
                <div className="hour-row">
                  <span className="day">Saturday</span>
                  <span className="time">10:00 AM - 4:00 PM</span>
                </div>
                <div className="hour-row">
                  <span className="day">Sunday</span>
                  <Tag color="red">Closed</Tag>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default DoctorDetails
