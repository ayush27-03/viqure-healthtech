// pages/Homepage.jsx
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
<<<<<<< HEAD
import { motion, AnimatePresence } from 'framer-motion'
=======
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'
import {
  Layout,
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
  Statistic,
  Rate,
  Divider,
  Segmented,
  Slider,
  Checkbox,
  Drawer,
  Grid,
  Pagination
} from 'antd'
import {
  SearchOutlined,
  HeartOutlined,
  HeartFilled,
  StarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  PlusOutlined,
  MinusOutlined
} from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'

const { Title, Text, Paragraph } = Typography
const { Search } = Input
const { Option } = Select
const { useBreakpoint } = Grid

function Homepage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
<<<<<<< HEAD
=======
  const screens = useBreakpoint()
  
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
  const [doctors, setDoctors] = useState([])
  const [filteredDoctors, setFilteredDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [specialties, setSpecialties] = useState([])
  const [sortBy, setSortBy] = useState('relevant')
  const [selectedCity, setSelectedCity] = useState('all')
  const [cities, setCities] = useState([])
<<<<<<< HEAD
=======
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [minRating, setMinRating] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450

  useEffect(() => {
    fetchDoctors()
  }, [])

  useEffect(() => {
    filterAndSortDoctors()
<<<<<<< HEAD
  }, [searchTerm, selectedSpecialty, doctors, sortBy, selectedCity])
=======
  }, [searchTerm, selectedSpecialty, doctors, sortBy, selectedCity, priceRange, minRating])
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450

  const fetchDoctors = async () => {
    try {
      const response = await axiosInstance.get('/users/doctors')
      const data = response.data.data || []
      
      const mappedDoctors = data.map(doc => ({
        _id: doc._id,
        firstName: doc.profile?.firstName || '',
        lastName: doc.profile?.lastName || '',
<<<<<<< HEAD
        profileIcon: doc.profileIcon || '👨‍⚕️', // YOUR extra field
=======
        profileIcon: doc.profileIcon || '👨‍⚕️',
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
        phone: doc.phone || '',
        addresses: doc.addresses || [],
        qualifications: doc.detailsOfHealthCareProfessional?.qualifications || [],
        yearsOfExperience: doc.detailsOfHealthCareProfessional?.yearsOfExperience || 0,
        consultationFee: doc.detailsOfHealthCareProfessional?.consultationFee || 0,
        bio: doc.detailsOfHealthCareProfessional?.bio || '',
<<<<<<< HEAD
        stats: doc.detailsOfHealthCareProfessional?.stats || { rating: 0, totalRatings: 0, totalAppointments: 0 }
=======
        stats: doc.detailsOfHealthCareProfessional?.stats || { 
          rating: 0, 
          totalRatings: 0, 
          totalAppointments: 0 
        },
        availabilitySettings: doc.availabilitySettings || {
          minAppointmentDuration: 10,
          maxAppointmentDuration: 180,
          advanceBookingDays: 14
        }
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
      }))
      
      setDoctors(mappedDoctors)
      setFilteredDoctors(mappedDoctors)

      const allSpecialties = mappedDoctors.flatMap(doc => doc.qualifications || [])
      const uniqueSpecialties = [...new Set(allSpecialties)]
      setSpecialties(uniqueSpecialties)

      const allCities = [...new Set(mappedDoctors.map(doc => doc.addresses?.[0]?.city).filter(Boolean))]
      setCities(allCities)

      // Set max price for range
      const maxPrice = Math.max(...mappedDoctors.map(d => d.consultationFee || 0), 500)
      setPriceRange([0, maxPrice])

    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortDoctors = () => {
    let filtered = [...doctors]
    
<<<<<<< HEAD
=======
    // Filter by specialty
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(doc => 
        doc.qualifications?.includes(selectedSpecialty)
      )
    }
    
<<<<<<< HEAD
=======
    // Filter by search term
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        `${doc.firstName} ${doc.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.qualifications?.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase())) ||
        doc.addresses?.[0]?.city?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Filter by city
    if (selectedCity !== 'all') {
      filtered = filtered.filter(doc => doc.addresses?.[0]?.city === selectedCity)
    }

<<<<<<< HEAD
=======
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
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
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

  const handleViewProfile = (doctorId) => {
    if (!isAuthenticated) {
      navigate('/login')
    } else {
      navigate(`/doctor/${doctorId}`)
    }
  }
<<<<<<< HEAD
=======

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
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450

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
<<<<<<< HEAD
            </p>
            
            <div className="max-w-2xl mx-auto relative">
              <div className="bg-white rounded-2xl shadow-2xl p-2 flex items-center">
                <div className="flex-1 relative">
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by doctor name, specialty, or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-gray-800 rounded-xl focus:outline-none"
                  />
                </div>
                <button 
                  onClick={() => filterAndSortDoctors()}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition shadow-lg"
                >
                  Search
                </button>
              </div>
=======
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
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
            </div>
          </motion.div>
        </div>
      </div>

<<<<<<< HEAD
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          <button
            onClick={() => setSelectedSpecialty('all')}
            className={`px-6 py-2 rounded-full font-medium transition-all transform hover:scale-105 ${
              selectedSpecialty === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
          >
            All Doctors
          </button>
          {specialties.map(specialty => (
            <button
              key={specialty}
              onClick={() => setSelectedSpecialty(specialty)}
              className={`px-6 py-2 rounded-full font-medium transition-all transform hover:scale-105 ${
                selectedSpecialty === specialty
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>
          
        <select 
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="px-4 py-2 rounded-full border"
        >
          <option value="all">All Cities</option>
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <p className="text-gray-600">
            Found <span className="font-semibold text-blue-600">{filteredDoctors.length}</span> doctors
          </p>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white text-gray-700"
          >
            <option value="relevant">Most Relevant</option>
            <option value="rating">Highest Rated</option>
            <option value="experience">Most Experienced</option>
            <option value="fee_low">Lowest Fee</option>
            <option value="fee_high">Highest Fee</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
=======
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
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
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
                filterAndSortDoctors()
              }}
            >
              Apply Filters
            </Button>
          </div>
        </Drawer>

        {/* Doctor Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Card key={i} loading className="h-80" />
            ))}
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDoctors.map((doctor, index) => renderDoctorCard(doctor, index))}
          </div>
        ) : (
<<<<<<< HEAD
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredDoctors.map((doctor, index) => (
                <motion.div
                  key={doctor._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <Link to={`/doctor/${doctor._id}`}>
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
                      <div className="relative">
                        <div className="h-32 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                        <div className="absolute -bottom-8 left-6">
                          <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-white">
                            <span className="text-3xl">{doctor.profileIcon || "👨‍⚕️"}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6 pt-10">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition">
                              {doctor.firstName} {doctor.lastName}
                            </h3>
                            <p className="text-blue-600 font-medium">
                              {doctor.qualifications?.join(", ") || "General Physician"}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
                            <span className="text-yellow-500">⭐</span>
                            <span className="font-semibold text-gray-700">
                              {doctor.stats?.rating || "N/A"}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({doctor.stats?.totalRatings || 0})
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mt-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>💼</span>
                            <span>{doctor.yearsOfExperience || 0} years experience</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>💰</span>
                            <span>₹{doctor.consultationFee || 0} consultation fee</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>📍</span>
                            <span>{doctor.addresses?.[0]?.city || "Location not specified"}</span>
                          </div>
                        </div>
                        
                        <button onClick={() => handleViewProfile(doctor._id)} className="mt-4 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition shadow-md transform group-hover:scale-105">
                          View Profile & Book
                        </button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
=======
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
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedSpecialty('all')
                        setSelectedCity('all')
                        setSortBy('relevant')
                        setPriceRange([0, 2000])
                        setMinRating(0)
                      }}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              }
            />
          </div>
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
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
