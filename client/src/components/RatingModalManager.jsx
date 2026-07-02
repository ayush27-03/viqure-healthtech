// components/RatingModalManager.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { usePendingRatings } from '../hooks/usePendingRatings'
import DoctorRatingModal from './DoctorRatingModal'

const RatingModalManager = () => {
  const { isAuthenticated, role } = useAuth()
  const { pendingAppointments, fetchPendingRatings, clearPendingRatings } = usePendingRatings()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isClosing, setIsClosing] = useState(false)

  // Fetch on authentication change
  useEffect(() => {
    if (isAuthenticated && role === 'patient') {
      fetchPendingRatings()
    } else {
      clearPendingRatings()
      setCurrentIndex(0)
      setIsClosing(false)
    }
  }, [isAuthenticated, role, fetchPendingRatings, clearPendingRatings])

  // Reset index when pendingAppointments changes
  useEffect(() => {
    setCurrentIndex(0)
  }, [pendingAppointments])

  const handleNext = () => {
    setIsClosing(true)
    setTimeout(() => {
      if (currentIndex < pendingAppointments.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        setCurrentIndex(pendingAppointments.length)
      }
      setIsClosing(false)
    }, 300) // Animation duration
  }

  const currentAppointment = pendingAppointments[currentIndex]

  if (!currentAppointment || isClosing) {
    return null
  }

  return (
    <DoctorRatingModal
      appointment={currentAppointment}
      onClose={handleNext}
      onSuccess={handleNext}
      totalCount={pendingAppointments.length}
      currentIndex={currentIndex}
    />
  )
}

export default RatingModalManager