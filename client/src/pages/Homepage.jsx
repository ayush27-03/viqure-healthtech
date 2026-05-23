import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axiosInstance from '../services/axiosConfig'

function Homepage() {
  const [doctors, setDoctors] = useState([])
  const [filteredDoctors, setFilteredDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [specialties, setSpecialties] = useState([])
  const [sortBy, setSortBy] = useState('relevant')
  const [selectedCity, setSelectedCity] = useState('all')
  const [cities, setCities] = useState([])


  useEffect(() => {
    fetchDoctors()
  }, [])

  useEffect(() => {
  filterAndSortDoctors()
}, [searchTerm, selectedSpecialty, doctors, sortBy, selectedCity])

  const fetchDoctors = async () => {
    try {
      const response = await axiosInstance.get('/doctors')
      setDoctors(response.data)
      setFilteredDoctors(response.data)

      const allSpecialties = response.data.flatMap(doc => doc.specializations || [])
      const uniqueSpecialties = [...new Set(allSpecialties)]
      setSpecialties(uniqueSpecialties)

    
      const allCities = [...new Set(response.data.map(doc => doc.city).filter(Boolean))]
      setCities(allCities)

    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortDoctors = () => {
    let filtered = [...doctors]
    
    // Apply specialty filter
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(doc => 
        doc.specializations?.includes(selectedSpecialty)
      )
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specializations?.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase())) ||
        doc.city?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (selectedCity !== 'all') {
      filtered = filtered.filter(doc => doc.city === selectedCity)
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.stats?.rating || 0) - (a.stats?.rating || 0))
        break
      case 'experience':
        filtered.sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0))
        break
      case 'fee_low':
        filtered.sort((a, b) => (a.consultationFees || 0) - (b.consultationFees || 0))
        break
      case 'fee_high':
        filtered.sort((a, b) => (b.consultationFees || 0) - (a.consultationFees || 0))
        break
      default:
        // Most relevant - keep original order or sort by rating + appointments
        filtered.sort((a, b) => {
          const scoreA = (a.stats?.rating || 0) * (a.stats?.totalAppointments || 0)
          const scoreB = (b.stats?.rating || 0) * (b.stats?.totalAppointments || 0)
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Find the Right Doctor
              <span className="block text-blue-200">For Your Health</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Book appointments with trusted healthcare professionals. 
              Quality care at your fingertips.
            </p>
            
            {/* Search Bar */}
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
            </div>
          </motion.div>
        </div>
      </div>

      {/* Specialty Filters */}
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

        {/* Results Header */}
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

        {/* Doctor Grid */}
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
                </div>
                <div className="mt-4 h-10 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
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
                              {doctor.doctorName}
                            </h3>
                            <p className="text-blue-600 font-medium">
                              {doctor.specializations?.join(", ") || "General Physician"}
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
                            <span>₹{doctor.consultationFees || 0} consultation fee</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>📍</span>
                            <span>{doctor.city || "Location not specified"}</span>
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
        )}

        {!loading && filteredDoctors.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No doctors found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Homepage