/* eslint-disable react-hooks/exhaustive-deps */
// pages/Consultation.jsx — in-app video consultation (Jitsi Meet embed)
import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axiosInstance from '../services/axiosConfig'
import { useAuth } from '../contexts/AuthContext'
import { Spin, Result, Button } from 'antd'
import { VideoCameraOutlined } from '@ant-design/icons'

const JITSI_DOMAIN = 'meet.jit.si'

/**
 * Decides whether the current time falls inside the joinable window for an
 * appointment. Returns { ok: true } or { ok: false, reason: '...' }.
 *
 * ── This is a product decision worth owning ──
 * Too tight a window frustrates people who click a minute early or run late;
 * too loose and a stale link stays "live" for hours. The defaults below open
 * the room 15 minutes before the start and keep it open until 2 hours after.
 * Tune EARLY_MINUTES / LATE_MINUTES to match how ViQure wants consultations to
 * feel (e.g. a strict clinic might use 5/30; a relaxed telehealth flow 30/180).
 */
const EARLY_MINUTES = 15
const LATE_MINUTES = 120

function canJoinConsultation(appointment) {
  const start = new Date(appointment.schedule?.startDateTime)
  if (isNaN(start.getTime())) return { ok: true } // no reliable start time → don't block
  const now = new Date()
  const opensAt = new Date(start.getTime() - EARLY_MINUTES * 60000)
  const closesAt = new Date(start.getTime() + LATE_MINUTES * 60000)

  if (now < opensAt) {
    return { ok: false, reason: `This consultation opens ${EARLY_MINUTES} minutes before the scheduled time.` }
  }
  if (now > closesAt) {
    return { ok: false, reason: 'This consultation window has ended.' }
  }
  return { ok: true }
}

function Consultation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const containerRef = useRef(null)
  const apiRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function start() {
      try {
        const res = await axiosInstance.get(`/appointments/${id}`)
        const appt = res.data.data

        // Gate 1: must be confirmed and have a generated room.
        if (appt.appointmentStatus !== 'CONFIRMED') {
          return setError('This appointment is not confirmed yet. The doctor must accept it before the video call can start.')
        }
        if (!appt.meeting?.meetingId) {
          return setError('No meeting has been generated for this appointment.')
        }
        if (appt.meeting.consultationType && appt.meeting.consultationType !== 'VIDEO') {
          return setError('This appointment is not a video consultation.')
        }

        // Gate 2: are we inside the join window?
        const joinWindow = canJoinConsultation(appt)
        if (!joinWindow.ok) return setError(joinWindow.reason)

        // Load the Jitsi IFrame API once, then mount the room.
        if (!window.JitsiMeetExternalAPI && !window.__jitsiLoading) {
          window.__jitsiLoading = true
          await new Promise((resolve, reject) => {
            const s = document.createElement('script')
            s.src = `https://${JITSI_DOMAIN}/external_api.js`
            s.async = true
            s.onload = resolve
            s.onerror = () => reject(new Error('Failed to load the video library.'))
            document.body.appendChild(s)
          })
        }
        if (cancelled) return
        if (!window.JitsiMeetExternalAPI) {
          return setError('The video library could not be loaded. Please retry.')
        }

        const displayName =
          `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`.trim() ||
          user?.email ||
          'ViQure User'

        apiRef.current = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName: appt.meeting.meetingId,
          parentNode: containerRef.current,
          userInfo: { displayName },
          configOverwrite: { prejoinPageEnabled: true },
        })
        apiRef.current.addListener('readyToClose', () => navigate('/appointments'))
        setLoading(false)
      } catch (e) {
        setError(e.response?.data?.message || e.message || 'Could not join the consultation.')
      }
    }

    start()
    return () => {
      cancelled = true
      try { apiRef.current?.dispose() } catch { /* noop */ }
    }
  }, [id])

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <Result
          icon={<VideoCameraOutlined className="text-blue-400" />}
          status="warning"
          title="Can't join this consultation"
          subTitle={error}
          extra={
            <Button type="primary" onClick={() => navigate('/appointments')}>
              Back to Appointments
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
          <Spin size="large" tip="Connecting to your consultation..." />
        </div>
      )}
      <div ref={containerRef} className="w-full" style={{ height: 'calc(100vh - 64px)' }} />
    </div>
  )
}

export default Consultation
