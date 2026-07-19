// pages/Documents.jsx - Production Aligned
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'
import {
  Card,
  Typography,
  Button,
  Input,
  Select,
  Table,
  Space,
  message,
  Spin,
  Empty,
  Tag,
  Row,
  Col,
  Tooltip,
  Popconfirm,
  Progress,
  Modal,
  Form
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileTextOutlined,
  EyeOutlined,
  DownloadOutlined,
  FileOutlined,
  ClockCircleOutlined,
  EditOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select

function Documents() {
  const { user, role } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20 })
  const [filters, setFilters] = useState({ documentType: '' })

  const [form] = Form.useForm()

  const userId = user?._id
  const userRole = role?.toUpperCase()

  useEffect(() => {
    if (userId) {
      fetchRecords()
    }
  }, [userId, pagination.page, filters.documentType])

  const fetchRecords = async () => {
    if (!userId) return
    
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', pagination.page)
      params.append('limit', pagination.limit)
      if (filters.documentType) params.append('documentType', filters.documentType)

      const response = await axiosInstance.get(`/medical-records?${params.toString()}`)
      
      setRecords(response.data.data || [])
      setPagination({
        ...pagination,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.pages || 1
      })
    } catch (error) {
      console.error('Error fetching medical records:', error)
      message.error('Failed to fetch medical records')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (values) => {
    setUploading(true)
    setUploadProgress(0)

    try {
      const payload = {
        patientId: userId,
        documentType: values.documentType,
        fileUrl: values.fileUrl,
        notes: values.notes || '',
        isConfidential: values.isConfidential || false
      }

      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      await axiosInstance.post('/medical-records', payload)

      setUploadProgress(100)
      setTimeout(() => {
        setShowUpload(false)
        form.resetFields()
        setUploadProgress(0)
        fetchRecords()
        message.success('Medical record uploaded successfully')
      }, 500)

    } catch (error) {
      console.error('Error uploading medical record:', error)
      message.error(error.response?.data?.message || 'Failed to upload medical record')
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = async (values) => {
    if (!editingRecord) return

    try {
      await axiosInstance.patch(`/medical-records/${editingRecord._id}`, {
        notes: values.notes,
        isConfidential: values.isConfidential,
        documentType: values.documentType
      })

      message.success('Medical record updated successfully')
      setEditingRecord(null)
      fetchRecords()
    } catch (error) {
      console.error('Error updating medical record:', error)
      message.error(error.response?.data?.message || 'Failed to update medical record')
    }
  }

  const handleDelete = async (recordId) => {
    try {
      await axiosInstance.delete(`/medical-records/${recordId}`)
      fetchRecords()
      message.success('Medical record deleted successfully')
    } catch (error) {
      console.error('Error deleting medical record:', error)
      message.error(error.response?.data?.message || 'Failed to delete medical record')
    }
  }

  const getFileIcon = (type) => {
    switch (type) {
      case 'PRESCRIPTION': return <FilePdfOutlined className="text-red-500 text-2xl" />
      case 'LAB_REPORT': return <FileTextOutlined className="text-blue-500 text-2xl" />
      case 'REPORT': return <FileImageOutlined className="text-green-500 text-2xl" />
      default: return <FileOutlined className="text-gray-500 text-2xl" />
    }
  }

  const getDocumentTypeTag = (type) => {
    const colors = {
      PRESCRIPTION: 'red',
      LAB_REPORT: 'blue',
      REPORT: 'green',
      OTHER: 'gray'
    }
    return <Tag color={colors[type] || 'gray'}>{type?.replace('_', ' ')}</Tag>
  }

  const canEdit = (record) => {
    return userRole === 'ADMIN' || (userRole === 'DOCTOR' && record.doctorId?._id === userId)
  }

  const canDelete = (record) => {
    return userRole === 'ADMIN' || 
           (userRole === 'CUSTOMER' && record.patientId?._id === userId) ||
           (userRole === 'DOCTOR' && record.doctorId?._id === userId)
  }

  const columns = [
    {
      title: 'Document',
      key: 'document',
      render: (_, record) => (
        <Space>
          {getFileIcon(record.documentType)}
          <div>
            <Text strong>{record.documentType?.replace('_', ' ')}</Text>
            {record.notes && (
              <div className="text-xs text-gray-500 max-w-xs truncate">{record.notes}</div>
            )}
          </div>
        </Space>
      )
    },
    {
      title: 'Patient',
      key: 'patient',
      render: (_, record) => {
        const name = record.patientId?.profile 
          ? `${record.patientId.profile.firstName} ${record.patientId.profile.lastName}`
          : 'N/A'
        return <Text>{name}</Text>
      }
    },
    {
      title: 'Type',
      key: 'documentType',
      render: (_, record) => getDocumentTypeTag(record.documentType)
    },
    {
      title: 'Date',
      key: 'date',
      render: (_, record) => (
        <Space>
          <ClockCircleOutlined className="text-gray-400" />
          <Text>{new Date(record.uploadedAt || record.createdAt).toLocaleDateString()}</Text>
        </Space>
      )
    },
    {
      title: 'Confidential',
      key: 'confidential',
      render: (_, record) => (
        <Tag color={record.isConfidential ? 'orange' : 'green'}>
          {record.isConfidential ? '🔒 Confidential' : 'Public'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Document">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => window.open(record.fileUrl, '_blank')}
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => window.open(record.fileUrl, '_blank')}
            />
          </Tooltip>
          {canEdit(record) && (
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => {
                  setEditingRecord(record)
                  form.setFieldsValue({
                    notes: record.notes,
                    isConfidential: record.isConfidential,
                    documentType: record.documentType
                  })
                }}
              />
            </Tooltip>
          )}
          {canDelete(record) && (
            <Popconfirm
              title="Delete Record"
              description="Are you sure you want to delete this medical record?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      )
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading medical records..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div>
            <Title level={2} className="mb-1">Medical Records</Title>
            <Text type="secondary">Manage your medical documents and records</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowUpload(!showUpload)}
            size="large"
            className="rounded-xl"
          >
            Upload Record
          </Button>
        </div>

        {showUpload && (
          <Card className="shadow-lg rounded-2xl border-0 mb-6">
            <Title level={4} className="mb-4">Upload New Medical Record</Title>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpload}
              size="large"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="documentType"
                    label="Document Type"
                    rules={[{ required: true, message: 'Please select document type' }]}
                  >
                    <Select className="rounded-xl" placeholder="Select type">
                      <Option value="PRESCRIPTION">📄 Prescription</Option>
                      <Option value="LAB_REPORT">🔬 Lab Report</Option>
                      <Option value="REPORT">📋 Report</Option>
                      <Option value="OTHER">📎 Other</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="fileUrl"
                    label="File URL"
                    rules={[{ required: true, message: 'Please enter file URL' }]}
                  >
                    <Input
                      placeholder="https://cdn.viqure.in/records/..."
                      className="rounded-xl"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="isConfidential"
                    label="Confidentiality"
                  >
                    <Select className="rounded-xl" placeholder="Select confidentiality">
                      <Option value={false}>Public</Option>
                      <Option value={true}>🔒 Confidential</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="notes"
                    label="Notes"
                  >
                    <Input.TextArea
                      rows={2}
                      placeholder="Add notes about this record..."
                      className="rounded-xl"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {uploading && (
                <div className="mt-4">
                  <Progress percent={uploadProgress} status={uploadProgress === 100 ? 'success' : 'active'} />
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<UploadOutlined />}
                  loading={uploading}
                  className="rounded-xl"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
                <Button
                  onClick={() => {
                    setShowUpload(false)
                    form.resetFields()
                    setUploadProgress(0)
                  }}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Card>
        )}

        <Modal
          title="Edit Medical Record"
          open={!!editingRecord}
          onCancel={() => setEditingRecord(null)}
          footer={null}
          className="rounded-xl"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleEdit}
            size="large"
          >
            <Form.Item
              name="documentType"
              label="Document Type"
              rules={[{ required: true, message: 'Please select document type' }]}
            >
              <Select className="rounded-xl">
                <Option value="PRESCRIPTION">📄 Prescription</Option>
                <Option value="LAB_REPORT">🔬 Lab Report</Option>
                <Option value="REPORT">📋 Report</Option>
                <Option value="OTHER">📎 Other</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="notes"
              label="Notes"
            >
              <Input.TextArea rows={3} placeholder="Update notes..." className="rounded-xl" />
            </Form.Item>
            <Form.Item
              name="isConfidential"
              label="Confidentiality"
            >
              <Select className="rounded-xl">
                <Option value={false}>Public</Option>
                <Option value={true}>🔒 Confidential</Option>
              </Select>
            </Form.Item>
            <div className="flex gap-3">
              <Button type="primary" htmlType="submit" className="rounded-xl">
                Save Changes
              </Button>
              <Button onClick={() => setEditingRecord(null)} className="rounded-xl">
                Cancel
              </Button>
            </div>
          </Form>
        </Modal>

        <Card className="shadow-lg rounded-2xl border-0">
          {records.length === 0 ? (
            <Empty
              description={
                <div>
                  <Text type="secondary">No medical records yet</Text>
                  <br />
                  <Text type="secondary" className="text-sm">Click "Upload Record" to add your first document</Text>
                </div>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <>
              <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
                <Text type="secondary">
                  Total: <Text strong>{pagination.total}</Text> record{pagination.total > 1 ? 's' : ''}
                </Text>
                <Select
                  placeholder="Filter by type"
                  allowClear
                  onChange={(value) => setFilters({ ...filters, documentType: value })}
                  className="w-40"
                  size="small"
                >
                  <Option value="PRESCRIPTION">Prescription</Option>
                  <Option value="LAB_REPORT">Lab Report</Option>
                  <Option value="REPORT">Report</Option>
                  <Option value="OTHER">Other</Option>
                </Select>
              </div>
              <Table
                columns={columns}
                dataSource={records}
                rowKey="_id"
                pagination={{
                  current: pagination.page,
                  total: pagination.total,
                  pageSize: pagination.limit,
                  showTotal: (total) => `Total ${total} records`,
                  onChange: (page) => setPagination({ ...pagination, page })
                }}
              />
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

export default Documents