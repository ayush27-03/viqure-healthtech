// DoctorRatingModal.jsx - Premium Version
import React, { useState } from 'react'
import { Modal, Rate, Input, Button, Space, Typography, message, Avatar, Divider } from 'antd'
import { StarFilled, CloseOutlined, UserOutlined, CheckCircleFilled } from '@ant-design/icons'
import axiosInstance from '../services/axiosConfig'

const { TextArea } = Input
const { Title, Text } = Typography

function DoctorRatingModal({ appointment, onClose, onSuccess, totalCount, currentIndex }) {
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const doctorName = appointment?.doctorName || 'Doctor'
  const doctorSpecialization = appointment?.doctorSpecialization || 'Healthcare Professional'
  const appointmentId = appointment?._id
  const doctorId = appointment?.doctorId

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await axiosInstance.post('/reviews', {
        targetType: 'DOCTOR',
        targetId: doctorId,
        rating: rating,
        reviewText: reviewText,
        appointmentId: appointmentId
      })

      message.success('Thank you for your feedback!')
      onSuccess()
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSkip = async () => {
    try {
      await axiosInstance.patch(`/appointments/${appointmentId}/mark-rated`, {
        hasRated: true
      })
      onClose()
    } catch (err) {
      console.error('Error marking appointment as rated:', err)
      onClose()
    }
  }

  const ratingLabels = {
    1: 'Very Poor',
    2: 'Poor',
    3: 'Average',
    4: 'Good',
    5: 'Excellent!'
  }

  const ratingEmojis = {
    1: '😞',
    2: '😕',
    3: '😐',
    4: '😊',
    5: '🤩'
  }

  return (
    <Modal
      open={true}
      onCancel={handleSkip}
      footer={null}
      centered
      width={520}
      closable={false}
      maskClosable={false}
      className="rating-modal"
    >
      <div className="relative">
        {/* Close button */}
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={handleSkip}
          className="absolute right-0 top-0 text-gray-400 hover:text-gray-600 z-10"
        />
        
        {/* Progress indicator */}
        {totalCount > 1 && (
          <div className="text-center mb-4">
            <Text type="secondary" className="text-sm">
              {currentIndex + 1} of {totalCount} consultations
            </Text>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / totalCount) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Doctor Info */}
        <div className="text-center mb-6">
          <Avatar 
            size={80} 
            icon={<UserOutlined />} 
            className="bg-blue-100 text-blue-600 mb-3"
            style={{ fontSize: 36 }}
          />
          <Title level={4} className="mb-0">
            Dr. {doctorName}
          </Title>
          <Text type="secondary">{doctorSpecialization}</Text>
        </div>

        <Divider className="my-4" />

        {/* Rating Section */}
        <div className="text-center">
          <Title level={5} className="mb-1">
            How was your consultation?
          </Title>
          <Text type="secondary" className="block mb-4 text-sm">
            Your feedback helps other patients make better decisions
          </Text>

          <div className="mb-4">
            <Rate
              value={rating}
              onChange={setRating}
              character={<StarFilled />}
              style={{ fontSize: 36 }}
            />
            <div className="mt-2 flex items-center justify-center gap-2">
              <Text className="text-2xl">{ratingEmojis[rating]}</Text>
              <Text strong className="text-lg">
                {ratingLabels[rating]}
              </Text>
            </div>
          </div>

          {/* Feedback Text */}
          <div className="mb-4">
            <TextArea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={3}
              placeholder="Share your experience... (Optional)"
              maxLength={500}
              showCount
              className="rounded-lg"
            />
          </div>

          {/* Action Buttons */}
          <Space className="w-full" direction="vertical" size="middle">
            <Button
              type="primary"
              block
              size="large"
              onClick={handleSubmit}
              loading={submitting}
              icon={!submitting && <CheckCircleFilled />}
              className="h-12 text-base font-medium"
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
            
            <Button type="link" block onClick={handleSkip} className="text-gray-400">
              Skip for now
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  )
}

export default DoctorRatingModal