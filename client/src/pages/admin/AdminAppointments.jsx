// pages/admin/AdminAppointments.jsx
import React, { useState, useEffect } from 'react'
import axiosInstance from "../../services/axiosConfig"
import {
  Card,
  Typography,
  Table,
  Tag,
  Input,
  Select,
  Space,
  Button,
  message,
  Spin,
  Badge,
  Avatar,
  Tooltip,
  DatePicker
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  UserOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select

function AdminAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await axiosInstance.get('/admin/appointments')
      setAppointments(response.data)
    } catch (error) {
      console.error('Error fetching appointments:', error)
      message.error('Failed to fetch appointments')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/admin/appointments/${id}`, { status })
      fetchAppointments()
      message.success('Appointment status updated')
    } catch (error) {
      console.error('Error updating appointment:', error)
      message.error('Failed to update appointment')
    }
  }

  const getStatusConfig = (status) => {
    const configs = {
      'confirmed': { color: 'success', icon: <CheckCircleOutlined />, label: 'Confirmed' },
      'pending': { color: 'warning', icon: <ClockCircleOutlined />, label: 'Pending' },
      'completed': { color: 'processing', icon: <CheckCircleOutlined />, label: 'Completed' },
      'cancelled': { color: 'error', icon: <CloseCircleOutlined />, label: 'Cancelled' }
    }
    return configs[status] || { color: 'default', icon: null, label: status }
  }

  const columns = [
    {
      title: 'Patient',
      key: 'patient',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
          <div>
            <Text strong>{record.patientName || 'N/A'}</Text>
            <div className="text-xs text-gray-400">Patient</div>
          </div>
        </Space>
      )
    },
    {
      title: 'Doctor',
      key: 'doctor',
      render: (_, record) => (
        <div>
          <Text>{record.doctorName || 'N/A'}</Text>
          <div className="text-xs text-gray-400">Doctor</div>
        </div>
      )
    },
    {
      title: 'Date & Time',
      key: 'datetime',
      render: (_, record) => (
        <div>
          <div>{new Date(record.appointmentStartDateTime).toLocaleDateString()}</div>
          <div className="text-xs text-gray-400">{new Date(record.appointmentStartDateTime).toLocaleTimeString()}</div>
        </div>
      )
    },
    {
      title: 'Type',
      dataIndex: 'consultationType',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'VIDEO' ? 'blue' : 'green'}>
          {type === 'VIDEO' ? '🎥 Video' : '🏥 In-Clinic'}
        </Tag>
      )
    },
    {
      title: 'Fee',
      dataIndex: 'consultationFees',
      key: 'fee',
      render: (fee) => <Text strong className="text-blue-600">₹{fee}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'appointmentStatus',
      key: 'status',
      render: (status) => {
        const config = getStatusConfig(status)
        return (
          <Badge status={config.color} text={config.label} />
        )
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Select
          value={record.appointmentStatus}
          onChange={(value) => updateStatus(record._id, value)}
          size="small"
          className="w-32"
        >
          <Option value="pending">Pending</Option>
          <Option value="confirmed">Confirmed</Option>
          <Option value="completed">Completed</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>
      )
    }
  ]

  const filteredAppointments = appointments.filter(apt => {
    if (filter !== 'all' && apt.appointmentStatus !== filter) return false
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return apt.patientName?.toLowerCase().includes(searchLower) ||
             apt.doctorName?.toLowerCase().includes(searchLower)
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Title level={2} className="mb-0">Appointment Management</Title>
        <Text type="secondary">View and manage all appointments across the platform</Text>
      </div>

      <Card className="shadow-sm mb-6">
        <Space wrap className="w-full" size="middle">
          <Text strong>Filter:</Text>
          <Select
            value={filter}
            onChange={setFilter}
            className="w-32"
          >
            <Option value="all">All</Option>
            <Option value="pending">Pending</Option>
            <Option value="confirmed">Confirmed</Option>
            <Option value="completed">Completed</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>

          <Input
            placeholder="Search patient or doctor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-64 rounded-xl"
            allowClear
          />

          <Button
            icon={<ReloadOutlined />}
            onClick={fetchAppointments}
          >
            Refresh
          </Button>
        </Space>
      </Card>

      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredAppointments}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} appointments`
          }}
          scroll={{ x: true }}
        />
      </Card>
    </div>
  )
}

export default AdminAppointments