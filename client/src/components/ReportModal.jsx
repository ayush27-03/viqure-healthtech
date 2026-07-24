// components/ReportModal.jsx
import React, { useState } from 'react'
import { Modal, Form, Input, Select, Button, message, Divider } from 'antd'
import { AlertOutlined, FileTextOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../services/axiosConfig'

const { TextArea } = Input

const ReportModal = ({ visible, onClose }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const categories = [
    { value: 'TECHNICAL', label: 'Technical Issue' },
    { value: 'PAYMENT', label: 'Payment Issue' },
    { value: 'APPOINTMENT', label: 'Appointment Issue' },
    { value: 'ORDER', label: 'Order Issue' },
    { value: 'DOCTOR_RELATED', label: 'Doctor Related' },
    { value: 'PRODUCT_QUALITY', label: 'Product Quality' },
    { value: 'DELIVERY', label: 'Delivery Issue' },
    { value: 'ACCOUNT', label: 'Account Issue' },
    { value: 'BUG', label: 'Bug Report' },
    { value: 'FEATURE_REQUEST', label: 'Feature Request' },
    { value: 'OTHER', label: 'Other' }
  ]

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      const response = await axiosInstance.post('/report-issue', {
        category: values.category,
        description: values.description,
        subject: values.description.substring(0, 50)
      })
      
      if (response.data.success) {
        message.success('Issue reported successfully!')
        form.resetFields()
        onClose()
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to report issue')
    } finally {
      setLoading(false)
    }
  }

  const handleViewReports = () => {
    onClose()
    navigate('/my-reports')
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <AlertOutlined className="text-red-500 text-xl" />
          <span>Report an Issue</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={520}
      className="rounded-2xl"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: 'Please select a category' }]}
        >
          <Select 
            placeholder="What type of issue is this?"
            size="large"
            options={categories}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[
            { required: true, message: 'Please describe the issue' },
            { min: 10, message: 'Please provide at least 10 characters' }
          ]}
        >
          <TextArea 
            placeholder="Please describe the issue in detail..."
            rows={5}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <div className="flex justify-between items-center mt-4">
          <Button 
            type="link" 
            icon={<FileTextOutlined />}
            onClick={handleViewReports}
            className="text-blue-600"
          >
            View My Reports
          </Button>
          
          <div className="flex gap-2">
            <Button onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
              className="bg-red-500 hover:bg-red-600"
            >
              Submit Report
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  )
}

export default ReportModal