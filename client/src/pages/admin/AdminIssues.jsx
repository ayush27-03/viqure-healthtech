// pages/admin/AdminIssues.jsx
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
  Modal,
  Descriptions,
  Select,
  Badge,
  Tooltip,
  Row,
  Col,
  Statistic,
  Empty
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  AlertOutlined,
  FileTextOutlined,
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  CheckOutlined
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs
const { Option } = Select

function AdminIssues() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [updating, setUpdating] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [summary, setSummary] = useState({
    total: 0,
    byStatus: {},
    byCategory: {},
    bySeverity: {}
  })

  useEffect(() => {
    fetchIssues()
  }, [activeTab, currentPage, itemsPerPage])

  const fetchIssues = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: itemsPerPage
      }
      
      if (activeTab !== 'all') {
        params.status = activeTab.toUpperCase()
      }
      
      if (searchTerm) {
        params.search = searchTerm
      }
      
      const response = await axiosInstance.get('/admin/report-issue', { params })
      
      setIssues(response.data.data || [])
      setSummary(response.data.summary || {
        total: 0,
        byStatus: {},
        byCategory: {},
        bySeverity: {}
      })
    } catch (error) {
      console.error('Error fetching issues:', error)
      message.error('Failed to fetch issues')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      message.warning('Please select a status')
      return
    }

    setUpdating(true)
    try {
      await axiosInstance.patch(`/admin/report-issue/${selectedIssue._id}/status`, {
        status: newStatus,
        notes: adminNote || undefined
      })
      
      message.success(`Issue status updated to ${newStatus}`)
      setShowStatusModal(false)
      setNewStatus('')
      setAdminNote('')
      setSelectedIssue(null)
      fetchIssues()
    } catch (error) {
      console.error('Error updating status:', error)
      message.error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'orange',
      IN_PROGRESS: 'blue',
      RESOLVED: 'green',
      REJECTED: 'red',
      CLOSED: 'gray'
    }
    return colors[status] || 'default'
  }

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: 'Pending',
      IN_PROGRESS: 'In Progress',
      RESOLVED: 'Resolved',
      REJECTED: 'Rejected',
      CLOSED: 'Closed'
    }
    return labels[status] || status
  }

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: <ClockCircleOutlined className="text-orange-500" />,
      IN_PROGRESS: <ExclamationCircleOutlined className="text-blue-500" />,
      RESOLVED: <CheckCircleOutlined className="text-green-500" />,
      REJECTED: <CloseCircleOutlined className="text-red-500" />,
      CLOSED: <CheckCircleOutlined className="text-gray-500" />
    }
    return icons[status] || <AlertOutlined />
  }

  const getSeverityColor = (severity) => {
    const colors = {
      LOW: 'green',
      MEDIUM: 'orange',
      HIGH: 'red',
      URGENT: 'darkred'
    }
    return colors[severity] || 'default'
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const columns = [
    {
      title: 'Issue',
      key: 'issue',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.description.substring(0, 60)}...</div>
          <div className="text-xs text-gray-400">
            #{record._id.substring(0, 10)}
          </div>
        </div>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <Tag>{text.replace('_', ' ')}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text) => (
        <Tag color={getStatusColor(text)}>
          {getStatusLabel(text)}
        </Tag>
      )
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (text) => (
        <Tag color={getSeverityColor(text)}>{text}</Tag>
      )
    },
    {
      title: 'Reported By',
      key: 'reporter',
      render: (_, record) => (
        <div>
          <div>{record.reporterName}</div>
          <div className="text-xs text-gray-400">{record.reporterRole}</div>
        </div>
      )
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date)
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
                setSelectedIssue(record)
                setShowDetailsModal(true)
              }}
              className="text-blue-600"
            />
          </Tooltip>
          <Tooltip title="Update Status">
            <Button
              type="text"
              icon={<CheckOutlined />}
              onClick={() => {
                setSelectedIssue(record)
                setNewStatus(record.status)
                setShowStatusModal(true)
              }}
              className="text-green-600"
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  // Summary statistics cards
  const renderSummaryCards = () => {
    const statusCounts = summary.byStatus || {}
    const total = summary.total || 0

    return (
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Total Reports"
              value={total}
              prefix={<AlertOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Pending"
              value={statusCounts.PENDING || 0}
              prefix={<ClockCircleOutlined className="text-orange-500" />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="In Progress"
              value={statusCounts.IN_PROGRESS || 0}
              prefix={<ExclamationCircleOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Resolved"
              value={(statusCounts.RESOLVED || 0) + (statusCounts.CLOSED || 0)}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#22c55e' }}
            />
          </Card>
        </Col>
      </Row>
    )
  }

  if (loading && issues.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Title level={2} className="mb-0">Issue Reports</Title>
        <Text type="secondary">View and manage all user-reported issues</Text>
      </div>

      {renderSummaryCards()}

      <Card className="shadow-sm mb-6">
        <Space wrap className="w-full" size="middle">
          <Input
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-80 rounded-xl"
            allowClear
            onPressEnter={fetchIssues}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchIssues}>
            Refresh
          </Button>
          {searchTerm && (
            <Text type="secondary">
              Found {summary.total || 0} result{summary.total !== 1 ? 's' : ''}
            </Text>
          )}
        </Space>
      </Card>

      <Card className="shadow-sm">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={`All (${summary.total || 0})`} key="all" />
          <TabPane tab={`Pending (${summary.byStatus?.PENDING || 0})`} key="pending" />
          <TabPane tab={`In Progress (${summary.byStatus?.IN_PROGRESS || 0})`} key="in_progress" />
          <TabPane tab={`Resolved (${(summary.byStatus?.RESOLVED || 0) + (summary.byStatus?.CLOSED || 0)})`} key="resolved" />
          <TabPane tab={`Rejected (${summary.byStatus?.REJECTED || 0})`} key="rejected" />
        </Tabs>

        {issues.length === 0 ? (
          <Empty description="No issues found" />
        ) : (
          <Table
            columns={columns}
            dataSource={issues}
            rowKey="_id"
            pagination={{
              current: currentPage,
              pageSize: itemsPerPage,
              total: summary.total || 0,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} issues`,
              onChange: (page, size) => {
                setCurrentPage(page)
                setItemsPerPage(size)
              },
              pageSizeOptions: ['5', '10', '20', '50']
            }}
            scroll={{ x: true }}
          />
        )}
      </Card>

      {/* Details Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <AlertOutlined className="text-red-500" />
            <span>Issue Details</span>
          </div>
        }
        open={showDetailsModal}
        onCancel={() => {
          setShowDetailsModal(false)
          setSelectedIssue(null)
        }}
        footer={[
          <Button 
            key="close" 
            onClick={() => {
              setShowDetailsModal(false)
              setSelectedIssue(null)
            }}
          >
            Close
          </Button>,
          selectedIssue && (
            <Button
              key="update"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => {
                setShowDetailsModal(false)
                setNewStatus(selectedIssue.status)
                setShowStatusModal(true)
              }}
            >
              Update Status
            </Button>
          )
        ]}
        width={700}
        className="rounded-2xl"
      >
        {selectedIssue && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Tag color={getStatusColor(selectedIssue.status)}>
                    {getStatusLabel(selectedIssue.status)}
                  </Tag>
                  <Tag color={getSeverityColor(selectedIssue.severity)}>
                    {selectedIssue.severity}
                  </Tag>
                  <Tag>{selectedIssue.category.replace('_', ' ')}</Tag>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                ID: {selectedIssue._id}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <Text strong>Description:</Text>
              <Paragraph className="mt-1 whitespace-pre-wrap">
                {selectedIssue.description}
              </Paragraph>
            </div>

            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Reported By">
                <div>
                  <div><UserOutlined className="mr-1" /> {selectedIssue.reporterName}</div>
                  <div className="text-xs text-gray-400">
                    <MailOutlined className="mr-1" /> {selectedIssue.reporterEmail}
                  </div>
                  <div className="text-xs text-gray-400">
                    Role: {selectedIssue.reporterRole}
                  </div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Reported On">
                {formatDate(selectedIssue.createdAt)}
              </Descriptions.Item>
              {selectedIssue.resolvedAt && (
                <Descriptions.Item label="Resolved On">
                  {formatDate(selectedIssue.resolvedAt)}
                </Descriptions.Item>
              )}
              {selectedIssue.resolvedByName && (
                <Descriptions.Item label="Resolved By">
                  {selectedIssue.resolvedByName}
                </Descriptions.Item>
              )}
              {selectedIssue.adminNote && (
                <Descriptions.Item label="Admin Response" span={2}>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    {selectedIssue.adminNote}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedIssue.orderId && (
              <div>
                <Text strong>Order ID:</Text> <Tag>{selectedIssue.orderId}</Tag>
              </div>
            )}
            {selectedIssue.appointmentId && (
              <div>
                <Text strong>Appointment ID:</Text> <Tag>{selectedIssue.appointmentId}</Tag>
              </div>
            )}
            {selectedIssue.productId && (
              <div>
                <Text strong>Product ID:</Text> <Tag>{selectedIssue.productId}</Tag>
              </div>
            )}
            {selectedIssue.doctorId && (
              <div>
                <Text strong>Doctor ID:</Text> <Tag>{selectedIssue.doctorId}</Tag>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        title="Update Issue Status"
        open={showStatusModal}
        onCancel={() => {
          setShowStatusModal(false)
          setSelectedIssue(null)
          setNewStatus('')
          setAdminNote('')
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setShowStatusModal(false)
              setSelectedIssue(null)
              setNewStatus('')
              setAdminNote('')
            }}
          >
            Cancel
          </Button>,
          <Button
            key="update"
            type="primary"
            loading={updating}
            onClick={handleStatusUpdate}
          >
            Update Status
          </Button>
        ]}
        width={500}
      >
        {selectedIssue && (
          <div className="space-y-4">
            <div>
              <Text strong>Current Status:</Text>{' '}
              <Tag color={getStatusColor(selectedIssue.status)}>
                {getStatusLabel(selectedIssue.status)}
              </Tag>
            </div>

            <div>
              <Text strong>Issue:</Text>
              <div className="bg-gray-50 p-3 rounded-lg mt-1">
                {selectedIssue.description.substring(0, 100)}...
              </div>
            </div>

            <div>
              <Text strong>New Status:</Text>
              <Select
                className="w-full mt-1"
                value={newStatus}
                onChange={setNewStatus}
                placeholder="Select new status"
              >
                <Option value="PENDING">Pending</Option>
                <Option value="IN_PROGRESS">In Progress</Option>
                <Option value="RESOLVED">Resolved</Option>
                <Option value="REJECTED">Rejected</Option>
                <Option value="CLOSED">Closed</Option>
              </Select>
            </div>

            <div>
              <Text strong>Admin Note (Optional):</Text>
              <Input.TextArea
                className="mt-1"
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add a note about this status update..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminIssues