import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'

function DoctorDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [doctor, setDoctor] = useState(null)
  const [reviews, setReviews] = useState([])
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, totalReviews: 0 })
  const [loading, setLoading] = useState(true)

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
        stats: data.detailsOfHealthCareProfessional?.stats || { rating: 0, totalRatings: 0 }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Doctor not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="md:flex">
            <div className="md:w-1/3 bg-gradient-to-r from-blue-600 to-blue-800 p-8 flex flex-col items-center justify-center">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-4">
                <span className="text-5xl">{doctor.profileIcon || '👨‍⚕️'}</span>
              </div>
              <h2 className="text-2xl font-bold text-white text-center">{doctor.doctorName}</h2>
              <p className="text-blue-100 text-center">{doctor.specializations?.join(', ') || 'General Physician'}</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-yellow-400">★</span>
                <span className="text-white">{doctor.stats?.rating || 'New'}</span>
                <span className="text-blue-100 text-sm">({doctor.stats?.totalRatings || 0} reviews)</span>
              </div>
            </div>
            
            <div className="md:w-2/3 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Experience</h3>
                  <p className="text-gray-600">{doctor.yearsOfExperience || 'N/A'} years</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Consultation Fee</h3>
                  <p className="text-2xl font-bold text-blue-600">₹{doctor.consultationFees || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-gray-700 mb-2">Clinic Address</h3>
                  <p className="text-gray-600">{doctor.clinicAddress || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-gray-700 mb-2">About</h3>
                  <p className="text-gray-600">{doctor.description || 'No description provided'}</p>
                </div>
              </div>
              
              <div className="mt-6 flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-sm text-gray-600">Verified License</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-sm text-gray-600">{doctor.yearsOfExperience}+ years experience</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleBookClick}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-lg"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Patient Reviews</h3>
            {reviewSummary.totalReviews > 0 && (
              <div className="text-sm text-gray-600">
                ⭐ {reviewSummary.averageRating.toFixed(1)} ({reviewSummary.totalReviews} reviews)
              </div>
            )}
          </div>
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div key={index} className="border-b pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{review.patientName}</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorDetails
