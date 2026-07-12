/* eslint-disable react-hooks/exhaustive-deps */
// pages/DoctorSettings.jsx - Fixed with proper defaults for new doctors
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'
import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Space,
  Switch,
  InputNumber,
  Input,
  Divider,
  Spin,
  message,
  Alert,
  Tag,
  Collapse,
  Empty
} from 'antd'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  SettingOutlined,
  PlusCircleOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Panel } = Collapse

// Default working hours for new doctors
const DEFAULT_WORKING_HOURS = [
  { dayOfWeek: 1, dayName: 'Monday', isWorking: true, slots: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  { dayOfWeek: 2, dayName: 'Tuesday', isWorking: true, slots: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  { dayOfWeek: 3, dayName: 'Wednesday', isWorking: true, slots: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  { dayOfWeek: 4, dayName: 'Thursday', isWorking: true, slots: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  { dayOfWeek: 5, dayName: 'Friday', isWorking: true, slots: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  { dayOfWeek: 6, dayName: 'Saturday', isWorking: true, slots: [{ start: '09:00', end: '14:00' }] },
  { dayOfWeek: 0, dayName: 'Sunday', isWorking: false, slots: [] }
]

const DEFAULT_SETTINGS = {
  minAppointmentDuration: 10,
  maxAppointmentDuration: 180,
  advanceBookingDays: 14,
  workingHours: DEFAULT_WORKING_HOURS,
  leaveDates: []
}

function DoctorSettings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [originalSettings, setOriginalSettings] = useState(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await axiosInstance.get(`/users/doctors/${user?._id}`)
      const doctor = response.data.data || response.data
      
      if (doctor.availabilitySettings) {
        // Merge with defaults to ensure all fields exist
        const mergedSettings = {
          ...DEFAULT_SETTINGS,
          ...doctor.availabilitySettings,
          workingHours: doctor.availabilitySettings.workingHours || DEFAULT_WORKING_HOURS,
          leaveDates: doctor.availabilitySettings.leaveDates || []
        }
        setSettings(mergedSettings)
        setOriginalSettings(JSON.parse(JSON.stringify(mergedSettings)))
      } else {
        // New doctor - use defaults
        setSettings(DEFAULT_SETTINGS)
        setOriginalSettings(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)))
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      // Use defaults on error
      setSettings(DEFAULT_SETTINGS)
      setOriginalSettings(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)))
    } finally {
      setLoading(false)
    }
  }

  const hasSettingsChanged = () => {
    if (!originalSettings) return true
    return JSON.stringify(settings) !== JSON.stringify(originalSettings)
  }

  const handleSave = async () => {
    if (!hasSettingsChanged()) {
      message.info('No changes to save')
      return
    }

    setSaving(true)
    try {
      await axiosInstance.patch('/doctors/me/availability', {
        availabilitySettings: settings
      })
      
      message.success('Settings saved  successfully')
      setOriginalSettings(JSON.parse(JSON.stringify(settings)))
      
    } catch (error) {
      console.error('Error saving settings:', error)
      message.error(error.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const toggleWorkingDay = (index) => {
    const updated = [...settings.workingHours]
    updated[index].isWorking = !updated[index].isWorking
    if (!updated[index].isWorking) {
      updated[index].slots = []
    } else {
      if (updated[index].slots.length === 0) {
        updated[index].slots = [{ start: '09:00', end: '17:00' }]
      }
    }
    setSettings({ ...settings, workingHours: updated })
  }

  const addTimeSlot = (dayIndex) => {
    const updated = [...settings.workingHours]
    updated[dayIndex].slots.push({ start: '09:00', end: '17:00' })
    setSettings({ ...settings, workingHours: updated })
  }

  const updateTimeSlot = (dayIndex, slotIndex, field, value) => {
    const updated = [...settings.workingHours]
    updated[dayIndex].slots[slotIndex][field] = value
    setSettings({ ...settings, workingHours: updated })
  }

  const removeTimeSlot = (dayIndex, slotIndex) => {
    const updated = [...settings.workingHours]
    updated[dayIndex].slots.splice(slotIndex, 1)
    setSettings({ ...settings, workingHours: updated })
  }

  const addLeaveDate = () => {
    setSettings({
      ...settings,
      leaveDates: [...settings.leaveDates, { date: '', reason: '' }]
    })
  }

  const updateLeaveDate = (index, field, value) => {
    const updated = [...settings.leaveDates]
    updated[index][field] = value
    setSettings({ ...settings, leaveDates: updated })
  }

  const removeLeaveDate = (index) => {
    const updated = settings.leaveDates.filter((_, i) => i !== index)
    setSettings({ ...settings, leaveDates: updated })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading settings..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Space className="mb-2">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/doctor/profile')}
              className="text-blue-600"
            >
              Back to Profile
            </Button>
          </Space>
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <Title level={2} className="mb-1">Availability Settings</Title>
              <Text type="secondary">Configure your working hours and appointment rules</Text>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saving}
              disabled={!hasSettingsChanged()}
              className="rounded-xl"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>

        <Card className="shadow-lg rounded-2xl border-0">
          {/* General Settings */}
          <div className="mb-8">
            <Title level={4} className="mb-4">
              <SettingOutlined className="mr-2" />
              General Settings
            </Title>
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={8}>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Min Duration (minutes)
                  </label>
                  <InputNumber
                    size="large"
                    min={10}
                    max={180}
                    step={5}
                    value={settings.minAppointmentDuration}
                    onChange={(value) => setSettings({...settings, minAppointmentDuration: value})}
                    className="w-full rounded-xl"
                    prefix={<ClockCircleOutlined className="text-gray-400" />}
                  />
                  <Text type="secondary" className="text-xs">Minimum 10 minutes</Text>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Max Duration (minutes)
                  </label>
                  <InputNumber
                    size="large"
                    min={10}
                    max={180}
                    step={5}
                    value={settings.maxAppointmentDuration}
                    onChange={(value) => setSettings({...settings, maxAppointmentDuration: value})}
                    className="w-full rounded-xl"
                    prefix={<ClockCircleOutlined className="text-gray-400" />}
                  />
                  <Text type="secondary" className="text-xs">Maximum 180 minutes (3 hours)</Text>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Advance Booking (days)
                  </label>
                  <InputNumber
                    size="large"
                    min={1}
                    max={30}
                    value={settings.advanceBookingDays}
                    onChange={(value) => setSettings({...settings, advanceBookingDays: value})}
                    className="w-full rounded-xl"
                    prefix={<CalendarOutlined className="text-gray-400" />}
                  />
                  <Text type="secondary" className="text-xs">How many days patients can book in advance</Text>
                </div>
              </Col>
            </Row>
          </div>

          <Divider />

          {/* Working Hours */}
          <div className="mb-8">
            <Title level={4} className="mb-2">
              <ClockCircleOutlined className="mr-2" />
              Working Hours
            </Title>
            <Text type="secondary" className="block mb-4">
              Set your available time slots for each day. Toggle off if you're not working.
            </Text>

            <Collapse accordion className="rounded-xl">
              {settings.workingHours.map((day, dayIndex) => (
                <Panel
                  key={day.dayOfWeek}
                  header={
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={day.isWorking}
                        onChange={() => toggleWorkingDay(dayIndex)}
                      />
                      <Text strong className={!day.isWorking ? 'text-gray-400' : ''}>
                        {day.dayName}
                      </Text>
                      {day.isWorking && day.slots.length > 0 && (
                        <Tag color="green" className="text-xs">
                          {day.slots.length} slot{day.slots.length > 1 ? 's' : ''}
                        </Tag>
                      )}
                      {!day.isWorking && (
                        <Tag color="red" className="text-xs">Off</Tag>
                      )}
                    </div>
                  }
                >
                  {day.isWorking ? (
                    <div className="space-y-3">
                      {day.slots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="flex items-center gap-3 flex-wrap">
                          <Input
                            type="time"
                            size="large"
                            value={slot.start}
                            onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'start', e.target.value)}
                            className="w-32 rounded-xl"
                          />
                          <Text type="secondary">to</Text>
                          <Input
                            type="time"
                            size="large"
                            value={slot.end}
                            onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'end', e.target.value)}
                            className="w-32 rounded-xl"
                          />
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                          />
                        </div>
                      ))}
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={() => addTimeSlot(dayIndex)}
                        className="rounded-xl"
                      >
                        Add Time Slot
                      </Button>
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <Text type="secondary">Day is off - no appointments available</Text>
                    </div>
                  )}
                </Panel>
              ))}
            </Collapse>
          </div>

          <Divider />

          {/* Leave Dates */}
          <div className="mb-8">
            <Title level={4} className="mb-2">
              <CalendarOutlined className="mr-2" />
              Leave Dates
            </Title>
            <Text type="secondary" className="block mb-4">
              Add dates when you will not be available for consultations.
            </Text>

            {settings.leaveDates.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <CalendarOutlined className="text-2xl text-gray-300" />
                <Text type="secondary" className="block mt-2">No leave dates added</Text>
              </div>
            ) : (
              <div className="space-y-3">
                {settings.leaveDates.map((leave, index) => (
                  <div key={index} className="flex items-center gap-3 flex-wrap bg-gray-50 p-3 rounded-xl">
                    <Input
                      type="date"
                      size="large"
                      value={leave.date}
                      onChange={(e) => updateLeaveDate(index, 'date', e.target.value)}
                      className="w-48 rounded-xl"
                    />
                    <Input
                      size="large"
                      placeholder="Reason (optional)"
                      value={leave.reason}
                      onChange={(e) => updateLeaveDate(index, 'reason', e.target.value)}
                      className="flex-1 rounded-xl"
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeLeaveDate(index)}
                    />
                  </div>
                ))}
              </div>
            )}

            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={addLeaveDate}
              className="mt-4 rounded-xl"
            >
              Add Leave Date
            </Button>
          </div>

          <Divider />

          {/* Info Box */}
          <Alert
            message="How this works"
            description={
              <ul className="list-disc pl-4 mt-2 space-y-1 text-sm">
                <li>Patients can book appointments only within your working hours</li>
                <li>Appointment duration can be chosen by patients between min and max limits</li>
                <li>A 10 minute buffer is automatically added between appointments</li>
                <li>Leave dates make you completely unavailable on those days</li>
                <li>Click Save to update your settings and regenerate available slots</li>
              </ul>
            }
            type="info"
            showIcon
            className="rounded-xl"
          />

          <div className="mt-6">
            <Button
              type="primary"
              size="large"
              block
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saving}
              disabled={!hasSettingsChanged()}
              className="h-12 rounded-xl font-semibold"
            >
              {saving ? 'Saving and Generating Slots...' : 'Save Settings'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DoctorSettings
