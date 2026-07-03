// hooks/usePendingRatings.js
import { useState, useEffect, useCallback } from 'react'
import axiosInstance from '../services/axiosConfig'

export const usePendingRatings = () => {
  const [pendingAppointments, setPendingAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPendingRatings = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setPendingAppointments([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axiosInstance.get('/appointments/pending-rating')
      const appointments = response.data.data || []
      setPendingAppointments(appointments)
      return appointments
    } catch (err) {
      setError(err.message)
      setPendingAppointments([])
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const clearPendingRatings = useCallback(() => {
    setPendingAppointments([])
  }, [])

  return {
    pendingAppointments,
    loading,
    error,
    fetchPendingRatings,
    clearPendingRatings,
    hasPendingRatings: pendingAppointments.length > 0
  }
}