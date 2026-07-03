// pages/admin/AdminPatients.jsx
import React, { useState, useEffect } from 'react'
import axiosInstance from "../../services/axiosConfig"
import {
  Card,
  Typography,
  Table,
  Input,
  Button,
  Space,
  Avatar,
  Tag,
  Modal,
  Descriptions,
  message,
  Spin,
  Tooltip,
  Badge
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

function AdminPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await axiosInstance.get('/admin/patients')
      setPatients(response.data)
    } catch (error) {
      console.error('Error fetching patients:', error)
      message.error('Failed to fetch patients')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const columns = [
    {
      title: 'Patient',
      key: 'patient',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} className="bg-purple-100 text-purple-600" />
          <div>
            <Text strong>{record.patientName || 'N/A'}</Text>
            <div className="text-xs text-gray-400">
              {record.gender || 'N/A'} • {record.dob ? new Date(record.dob).getFullYear() : 'N/A'}
            </div>
          </div>
        </Space>
      )
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div><PhoneOutlined className="mr-1" /> {record.mobileNumber || 'N/A'}</div>
          {record.emergencyContact?.name && (
            <div className="text-xs text-gray-400">Emergency: {record.emergencyContact.name}</div>
          )}
        </div>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => email || 'N/A'
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      render: (city) => city || 'N/A'
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'joined',
      render: (date) => formatDate(date)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedPatient(record)
            setShowDetailsModal(true)
          }}
          className="text-purple-600"
        >
          View Details
        </Button>
      )
    }
  ]

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase()
    return patient.patientName?.toLowerCase().includes(searchLower) ||
           patient.email?.toLowerCase().includes(searchLower) ||
           patient.mobileNumber?.includes(searchTerm)
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
        <Title level={2} className="mb-0">Patient Management</Title>
        <Text type="secondary">View and manage all registered patients</Text>
      </div>

      <Card className="shadow-sm mb-6">
        <Space wrap className="w-full" size="middle">
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-80 rounded-xl"
            allowClear
          />
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchPatients}
          >
            Refresh
          </Button>
          <Button
            icon={<PlusOutlined />}
            className="ml-auto"
          >
            Export Data
          </Button>
        </Space>
      </Card>

      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredPatients}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} patients`
          }}
          scroll={{ x: true }}
        />
      </Card>

      <Modal
        title="Patient Details"
        open={showDetailsModal}
        onCancel={() => {
          setShowDetailsModal(false)
          setSelectedPatient(null)
        }}
        footer={[
          <Button key="close" onClick={() => {
            setShowDetailsModal(false)
            setSelectedPatient(null)
          }}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedPatient && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar size={64} icon={<UserOutlined />} className="bg-purple-100 text-purple-600" />
              <div>
                <Title level={4} className="mb-0">{selectedPatient.patientName || 'N/A'}</Title>
                <Text type="secondary">{selectedPatient.email || 'N/A'}</Text>
              </div>
            </div>

            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Gender">{selectedPatient.gender || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Date of Birth">{formatDate(selectedPatient.dob)}</Descriptions.Item>
              <Descriptions.Item label="Mobile">{selectedPatient.mobileNumber || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="City">{selectedPatient.city || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>{selectedPatient.patientAddress || 'N/A'}</Descriptions.Item>
            </Descriptions>

            {selectedPatient.emergencyContact && (
              <>
                <Title level={5}>Emergency Contact</Title>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Name">{selectedPatient.emergencyContact.name || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Relation">{selectedPatient.emergencyContact.relation || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Phone" span={2}>{selectedPatient.emergencyContact.phone || 'N/A'}</Descriptions.Item>
                </Descriptions>
              </>
            )}

            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Registered On">{formatDate(selectedPatient.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Last Login">{formatDate(selectedPatient.lastLoginTime)}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminPatients