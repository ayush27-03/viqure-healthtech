// pages/Homepage.jsx - Fixed import
import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'
import Fuse from 'fuse.js'
import {
  Row,
  Col,
  Card,
  Input,
  Button,
  Select,
  Tag,
  Typography,
  Space,
  Spin,
  Empty,
  Avatar,
  Badge,
  Rate,
  Divider,
  Slider,
  Drawer,
  Pagination
} from 'antd'
import {
  SearchOutlined,
  UserOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  FilterOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'

// FIX: Import both Title, Text, AND Paragraph
const { Title, Text, Paragraph } = Typography
const { Search } = Input
const { Option } = Select

function Homepage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  
  const [doctors, setDoctors] = useState([])
  const [filteredDoctors, setFilteredDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [specialties, setSpecialties] = useState([])
  const [sortBy, setSortBy] = useState('relevant')
  const [selectedCity, setSelectedCity] = useState('all')
  const [cities, setCities] = useState([])
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [minRating, setMinRating] = useState(0)

  // ============ FUSE.JS INSTANCE ============
  const fuse = useMemo(() => {
    return new Fuse(doctors, {
      keys: [
        { name: 'firstName', weight: 1.5 },
        { name: 'lastName', weight: 1.5 },
        { name: 'qualifications', weight: 1 },
        { name: 'addresses.city', weight: 0.8 },
        { name: 'bio', weight: 0.3 }
      ],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 2,
      useExtendedSearch: true
    })
  }, [doctors])

  // ============ FETCH DOCTORS ============
  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const response = await axiosInstance.get('/users/doctors')
      const data = response.data.data || []
      
      const mappedDoctors = data.map(doc => ({
        _id: doc._id,
        firstName: doc.profile?.firstName || '',
        lastName: doc.profile?.lastName || '',
        profileIcon: doc.profileIcon || '👨‍⚕️',
        phone: doc.phone || '',
        addresses: doc.addresses || [],
        qualifications: doc.detailsOfHealthCareProfessional?.qualifications || [],
        yearsOfExperience: doc.detailsOfHealthCareProfessional?.yearsOfExperience || 0,
        consultationFee: doc.detailsOfHealthCareProfessional?.consultationFee || 0,
        bio: doc.detailsOfHealthCareProfessional?.bio || '',
        stats: doc.detailsOfHealthCareProfessional?.stats || { 
          rating: 0, 
          totalRatings: 0, 
          totalAppointments: 0 
        }
      }))
      
      setDoctors(mappedDoctors)
      setFilteredDoctors(mappedDoctors)

      // Extract specialties
      const allSpecialties = mappedDoctors.flatMap(doc => doc.qualifications || [])
      setSpecialties([...new Set(allSpecialties)])

      // Extract cities
      const allCities = [...new Set(mappedDoctors.map(doc => doc.addresses?.[0]?.city).filter(Boolean))]
      setCities(allCities)

      // Set max price
      const maxPrice = Math.max(...mappedDoctors.map(d => d.consultationFee || 0), 500)
      setPriceRange([0, maxPrice])

    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  // ============ APPLY FILTERS + FUSE SEARCH ============
  useEffect(() => {
    if (!searchTerm.trim()) {
      applyFilters(doctors)
      return
    }

    const results = fuse.search(searchTerm)
    const matchedDoctors = results.map(result => result.item)
    applyFilters(matchedDoctors)
  }, [searchTerm, selectedSpecialty, selectedCity, priceRange, minRating, sortBy, doctors])

  const applyFilters = (doctorsList) => {
    let filtered = [...doctorsList]
    
    // Filter by specialty
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(doc => 
        doc.qualifications?.includes(selectedSpecialty)
      )
    }
    
    // Filter by city
    if (selectedCity !== 'all') {
      filtered = filtered.filter(doc => doc.addresses?.[0]?.city === selectedCity)
    }

    // Filter by price range
    filtered = filtered.filter(doc => 
      (doc.consultationFee || 0) >= priceRange[0] && 
      (doc.consultationFee || 0) <= priceRange[1]
    )

    // Filter by rating
    if (minRating > 0) {
      filtered = filtered.filter(doc => (doc.stats?.rating || 0) >= minRating)
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.stats?.rating || 0) - (a.stats?.rating || 0))
        break
      case 'experience':
        filtered.sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0))
        break
      case 'fee_low':
        filtered.sort((a, b) => (a.consultationFee || 0) - (b.consultationFee || 0))
        break
      case 'fee_high':
        filtered.sort((a, b) => (b.consultationFee || 0) - (a.consultationFee || 0))
        break
      default:
        filtered.sort((a, b) => {
          const scoreA = (a.stats?.rating || 0) * (a.stats?.totalAppointments || 1)
          const scoreB = (b.stats?.rating || 0) * (b.stats?.totalAppointments || 1)
          return scoreB - scoreA
        })
    }
    
    setFilteredDoctors(filtered)
  }

  // ============ HANDLERS ============
  const handleViewProfile = (doctorId) => {
    if (!isAuthenticated) {
      navigate('/login')
    } else {
      navigate(`/doctor/${doctorId}`)
    }
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedSpecialty('all')
    setSelectedCity('all')
    setSortBy('relevant')
    setPriceRange([0, 2000])
    setMinRating(0)
  }

  // ============ RENDER DOCTOR CARD ============
  const renderDoctorCard = (doctor, index) => (
    <motion.div
      key={doctor._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Card
        className="h-full hover:shadow-xl transition-shadow duration-300"
        cover={
          <div className="relative h-40 bg-gradient-to-r from-blue-400 to-blue-600">
            <div className="absolute bottom-0 left-6 transform translate-y-1/2">
              <Avatar 
                size={72} 
                className="border-4 border-white shadow-lg bg-white"
                icon={<span className="text-3xl">{doctor.profileIcon || '👨‍⚕️'}</span>}
              />
            </div>
          </div>
        }
        actions={[
          <Button 
            type="primary" 
            block 
            size="large"
            onClick={() => handleViewProfile(doctor._id)}
            className="rounded-lg"
          >
            View Profile & Book
          </Button>
        ]}
      >
        <div className="mt-4">
          <div className="flex justify-between items-start">
            <div>
              <Title level={4} className="mb-0">
                {doctor.firstName} {doctor.lastName}
              </Title>
              <Text type="secondary" className="text-sm">
                {doctor.qualifications?.join(", ") || "General Physician"}
              </Text>
            </div>
            <Badge 
              count={doctor.stats?.rating || 0} 
              style={{ backgroundColor: '#52c41a' }}
              title={`${doctor.stats?.totalRatings || 0} reviews`}
            />
          </div>

          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <ClockCircleOutlined className="text-gray-400" />
              <Text type="secondary">{doctor.yearsOfExperience || 0} years experience</Text>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarOutlined className="text-gray-400" />
              <Text type="secondary">₹{doctor.consultationFee || 0} consultation fee</Text>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <EnvironmentOutlined className="text-gray-400" />
              <Text type="secondary">{doctor.addresses?.[0]?.city || "Location not specified"}</Text>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1">
            {doctor.qualifications?.slice(0, 2).map((spec, i) => (
              <Tag key={i} color="blue" className="text-xs">
                {spec}
              </Tag>
            ))}
            {doctor.qualifications?.length > 2 && (
              <Tag color="default" className="text-xs">
                +{doctor.qualifications.length - 2}
              </Tag>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )

  // ============ LOADING STATE ============
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Loading doctors..." />
      </div>
    )
  }

  // ============ MAIN RENDER ============
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Title level={1} className="text-white text-center mb-4">
              Find the Right Doctor
              <span className="block text-blue-200 text-2xl md:text-3xl">
                For Your Health
              </span>
            </Title>
            <Paragraph className="text-center text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Book appointments with trusted healthcare professionals. 
              Quality care at your fingertips.
            </Paragraph>

            <div className="max-w-3xl mx-auto">
              <Search
                placeholder="Search by doctor name, specialty, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="large"
                enterButton={
                  <Button type="primary" size="large" icon={<SearchOutlined />}>
                    Search
                  </Button>
                }
                className="shadow-2xl rounded-lg overflow-hidden"
              />
              {searchTerm && (
                <div className="text-center text-blue-200 text-sm mt-2">
                  Found {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={6}>
              <Select
                value={selectedSpecialty}
                onChange={setSelectedSpecialty}
                style={{ width: '100%' }}
                size="large"
                placeholder="Select Specialty"
              >
                <Option value="all">All Specialties</Option>
                {specialties.map(spec => (
                  <Option key={spec} value={spec}>{spec}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} md={6}>
              <Select
                value={selectedCity}
                onChange={setSelectedCity}
                style={{ width: '100%' }}
                size="large"
                placeholder="Select City"
              >
                <Option value="all">All Cities</Option>
                {cities.map(city => (
                  <Option key={city} value={city}>{city}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} md={6}>
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: '100%' }}
                size="large"
                placeholder="Sort By"
              >
                <Option value="relevant">Most Relevant</Option>
                <Option value="rating">Highest Rated</Option>
                <Option value="experience">Most Experienced</Option>
                <Option value="fee_low">Lowest Fee</Option>
                <Option value="fee_high">Highest Fee</Option>
              </Select>
            </Col>
            <Col xs={24} md={6}>
              <Button 
                type="default" 
                size="large" 
                icon={<FilterOutlined />}
                onClick={() => setFilterDrawerOpen(true)}
                block
              >
                More Filters
              </Button>
            </Col>
          </Row>

          {/* Quick Stats */}
          <div className="mt-4 pt-4 border-t">
            <Space size="large" wrap>
              <Text type="secondary">
                Found <Text strong className="text-blue-600">{filteredDoctors.length}</Text> doctors
              </Text>
              <Text type="secondary">
                Average Rating: <Text strong>{(doctors.reduce((acc, d) => acc + (d.stats?.rating || 0), 0) / (doctors.length || 1)).toFixed(1)}</Text> ★
              </Text>
              <Text type="secondary">
                Average Fee: <Text strong>₹{(doctors.reduce((acc, d) => acc + (d.consultationFee || 0), 0) / (doctors.length || 1)).toFixed(0)}</Text>
              </Text>
            </Space>
          </div>
        </div>

        {/* Filter Drawer */}
        <Drawer
          title="Advanced Filters"
          placement="right"
          onClose={() => setFilterDrawerOpen(false)}
          open={filterDrawerOpen}
          width={360}
        >
          <div className="space-y-6">
            <div>
              <Text strong>Price Range (₹)</Text>
              <div className="mt-2">
                <Slider
                  range
                  min={0}
                  max={Math.max(...doctors.map(d => d.consultationFee || 0), 500)}
                  value={priceRange}
                  onChange={setPriceRange}
                  tooltip={{ formatter: value => `₹${value}` }}
                />
                <div className="flex justify-between">
                  <Text type="secondary">₹{priceRange[0]}</Text>
                  <Text type="secondary">₹{priceRange[1]}</Text>
                </div>
              </div>
            </div>

            <Divider />

            <div>
              <Text strong>Minimum Rating</Text>
              <div className="mt-2">
                <Rate
                  value={minRating}
                  onChange={setMinRating}
                  allowHalf
                />
                {minRating > 0 && (
                  <Button 
                    size="small" 
                    type="link" 
                    onClick={() => setMinRating(0)}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <Divider />

            <div>
              <Text strong>Specialties</Text>
              <div className="mt-2 flex flex-wrap gap-2">
                {specialties.map(spec => (
                  <Tag
                    key={spec}
                    color={selectedSpecialty === spec ? 'blue' : 'default'}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedSpecialty(selectedSpecialty === spec ? 'all' : spec)
                    }}
                  >
                    {spec}
                  </Tag>
                ))}
              </div>
            </div>

            <Divider />

            <Button 
              type="primary" 
              block 
              size="large"
              onClick={() => {
                setFilterDrawerOpen(false)
              }}
            >
              Apply Filters
            </Button>
          </div>
        </Drawer>

        {/* Doctor Cards */}
        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDoctors.map((doctor, index) => renderDoctorCard(doctor, index))}
          </div>
        ) : (
          <div className="py-16">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Title level={4}>No doctors found</Title>
                  <Text type="secondary">Try adjusting your search or filters</Text>
                  <div className="mt-4">
                    <Button 
                      type="primary"
                      onClick={clearAllFilters}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              }
            />
          </div>
        )}

        {/* Pagination */}
        {filteredDoctors.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Pagination 
              defaultCurrent={1} 
              total={filteredDoctors.length} 
              pageSize={8}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `Total ${total} doctors`}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Homepage
