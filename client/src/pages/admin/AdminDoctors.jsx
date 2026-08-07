// pages/admin/AdminDoctors.jsx
import React, { useState, useEffect } from 'react'
import axiosInstance from "../../services/axiosConfig"
import {
  Card,
  Typography,
  Table,
  Input,
  Button,
  Space,
  Tag,
  Tabs,
  Spin,
  message,
  Popconfirm,
  Avatar,
  Badge,
  Row,
  Col,
  Statistic,
  Tooltip,
  Modal,
  Descriptions
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  DeleteOutlined,
  DollarOutlined,
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
  MedicineBoxOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { TabPane } = Tabs

function AdminDoctors() {
  const [doctors, setDoctors] = useState([])
  const [pendingDoctors, setPendingDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('approved')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalApproved, setTotalApproved] = useState(0)
  const [totalPending, setTotalPending] = useState(0)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchData()
  }, [currentPage, itemsPerPage, activeTab, searchTerm])

  const fetchData = async () => {
    try {
      setLoading(true)

      if (activeTab === 'approved') {
        const response = await axiosInstance.get('/admin/doctors', {
          params: {
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm
          }
        })
        setDoctors(response.data.doctors || response.data)
        setTotalApproved(response.data.total || response.data.length || 0)
      } else {
        const response = await axiosInstance.get('/admin/pending-doctors', {
          params: {
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm
          }
        })
        setPendingDoctors(response.data.doctors || response.data)
        setTotalPending(response.data.total || response.data.length || 0)
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
      message.error('Failed to fetch doctors')
    } finally {
      setLoading(false)
    }
  }

  const approveDoctor = async (doctorId) => {
    try {
      await axiosInstance.put(`/admin/doctors/${doctorId}/approve`)
      fetchData()
      message.success('Doctor approved successfully')
    } catch (error) {
      console.error('Error approving doctor:', error)
      message.error('Failed to approve doctor')
    }
  }

  const rejectDoctor = async (doctorId) => {
    try {
      await axiosInstance.put(`/admin/doctors/${doctorId}/reject`)
      fetchData()
      message.success('Doctor rejected')
    } catch (error) {
      console.error('Error rejecting doctor:', error)
      message.error('Failed to reject doctor')
    }
  }

  const deleteDoctor = async (doctorId) => {
    try {
      await axiosInstance.delete(`/admin/doctors/${doctorId}`)
      fetchData()
      message.success('Doctor deleted successfully')
    } catch (error) {
      console.error('Error deleting doctor:', error)
      message.error('Failed to delete doctor')
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const approvedColumns = [
    {
      title: 'Doctor',
      key: 'doctor',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} className="bg-green-100 text-green-600" />
          <div>
            <Text strong>{record.doctorName}</Text>
            <div className="text-xs text-gray-400">{record.city || 'N/A'}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'Specialization',
      key: 'specialization',
      render: (_, record) => (
        <Space wrap>
          {record.specializations?.slice(0, 2).map((spec, i) => (
            <Tag key={i} color="blue">{spec}</Tag>
          ))}
          {record.specializations?.length > 2 && (
            <Tag>+{record.specializations.length - 2}</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => <Text className="text-sm">{email}</Text>
    },
    {
      title: 'Fee',
      key: 'fee',
      render: (_, record) => (
        <Text strong className="text-blue-600">₹{record.consultationFees}</Text>
      )
    },
    {
      title: 'Joined',
      key: 'joined',
      render: (_, record) => formatDate(record.createdAt)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedDoctor(record)
                setShowDetailsModal(true)
              }}
              className="text-blue-600"
            />
          </Tooltip>
          <Popconfirm
            title="Delete Doctor"
            description="Are you sure you want to delete this doctor?"
            onConfirm={() => deleteDoctor(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ]

  const pendingColumns = [
    {
      title: 'Doctor',
      key: 'doctor',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} className="bg-yellow-100 text-yellow-600" />
          <div>
            <Text strong>{record.doctorName}</Text>
            <div className="text-xs text-gray-400">{record.specialization}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'License',
      dataIndex: 'licenseNumber',
      key: 'license',
      render: (license) => <Tag color="orange">{license}</Tag>
    },
    {
      title: 'Experience',
      dataIndex: 'experience',
      key: 'experience',
      render: (exp) => `${exp} years`
    },
    {
      title: 'Fee',
      dataIndex: 'consultationFee',
      key: 'fee',
      render: (fee) => <Text strong className="text-blue-600">₹{fee}</Text>
    },
    {
      title: 'Submitted',
      key: 'submitted',
      render: (_, record) => formatDate(record.submittedAt)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedDoctor(record)
                setShowDetailsModal(true)
              }}
              className="text-blue-600"
            />
          </Tooltip>
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => approveDoctor(record._id)}
            className="bg-green-600"
          >
            Approve
          </Button>
          <Button
            type="primary"
            size="small"
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => rejectDoctor(record._id)}
          >
            Reject
          </Button>
        </Space>
      )
    }
  ]

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
        <Title level={2} className="mb-0">Doctor Management</Title>
        <Text type="secondary">Manage approved and pending doctor registrations</Text>
      </div>

      <Card className="shadow-sm mb-6">
        <Space wrap className="w-full" size="middle">
          <Input
            placeholder={`Search ${activeTab === 'approved' ? 'approved doctors' : 'pending requests'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-80 rounded-xl"
            allowClear
          />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            Refresh
          </Button>
          {searchTerm && (
            <Text type="secondary">
              Found {activeTab === 'approved' ? totalApproved : totalPending} result{activeTab === 'approved' ? (totalApproved !== 1 ? 's' : '') : (totalPending !== 1 ? 's' : '')}
            </Text>
          )}
        </Space>
      </Card>

      <Card className="shadow-sm">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={`Approved Doctors (${totalApproved})`} key="approved">
            <Table
              columns={approvedColumns}
              dataSource={doctors}
              rowKey="_id"
              pagination={{
                current: currentPage,
                pageSize: itemsPerPage,
                total: totalApproved,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} doctors`,
                onChange: (page, size) => {
                  setCurrentPage(page)
                  setItemsPerPage(size)
                },
                pageSizeOptions: ['5', '10', '20', '50']
              }}
              scroll={{ x: true }}
            />
          </TabPane>
          <TabPane tab={`Pending Approvals (${totalPending})`} key="pending">
            {pendingDoctors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No pending requests match your search' : 'No pending approvals'}
              </div>
            ) : (
              <Table
                columns={pendingColumns}
                dataSource={pendingDoctors}
                rowKey="_id"
                pagination={{
                  current: currentPage,
                  pageSize: itemsPerPage,
                  total: totalPending,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} pending requests`,
                  onChange: (page, size) => {
                    setCurrentPage(page)
                    setItemsPerPage(size)
                  },
                  pageSizeOptions: ['5', '10', '20', '50']
                }}
                scroll={{ x: true }}
              />
            )}
          </TabPane>
        </Tabs>
      </Card>

      {/* Doctor Details Modal */}
      <Modal
        title="Doctor Details"
        open={showDetailsModal}
        onCancel={() => {
          setShowDetailsModal(false)
          setSelectedDoctor(null)
        }}
        footer={[
          <Button key="close" onClick={() => {
            setShowDetailsModal(false)
            setSelectedDoctor(null)
          }}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedDoctor && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar size={64} icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
              <div>
                <Title level={4} className="mb-0">{selectedDoctor.doctorName}</Title>
                <Text type="secondary">{selectedDoctor.email}</Text>
              </div>
            </div>

            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Specialization">
                {selectedDoctor.specialization || selectedDoctor.specializations?.join(', ') || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Experience">
                {selectedDoctor.experience || selectedDoctor.yearsOfExperience || 0} years
              </Descriptions.Item>
              <Descriptions.Item label="License">
                {selectedDoctor.licenseNumber || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Fee">
                ₹{selectedDoctor.consultationFee || selectedDoctor.consultationFees || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Phone" span={2}>
                {selectedDoctor.phone || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Bio" span={2}>
                {selectedDoctor.bio || 'No bio provided'}
              </Descriptions.Item>
              <Descriptions.Item label="Submitted On" span={2}>
                {formatDate(selectedDoctor.submittedAt || selectedDoctor.createdAt)}
              </Descriptions.Item>
            </Descriptions>

            {selectedDoctor.specializations && selectedDoctor.specializations.length > 0 && (
              <div>
                <Text strong>Specializations:</Text>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedDoctor.specializations.map((spec, i) => (
                    <Tag key={i} color="blue">{spec}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminDoctors
