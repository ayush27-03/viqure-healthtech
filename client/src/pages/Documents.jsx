// pages/Documents.jsx - Fixed with correct endpoints
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
  Progress
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
  ClockCircleOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select

function Documents() {
  const { user, role } = useAuth()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [newDoc, setNewDoc] = useState({ name: '', documentType: 'PDF', documentURL: '' })
  const [uploadProgress, setUploadProgress] = useState(0)

  const userId = user?._id

  useEffect(() => {
    if (userId) {
      fetchDocuments()
    } else {
      console.error('User ID is undefined. User object:', user)
      setLoading(false)
    }
  }, [userId])

  const fetchDocuments = async () => {
    if (!userId) return
    
    try {
      let response
      if (role === 'patient') {
        // Correct endpoint for patient
        response = await axiosInstance.get(`/patients/${userId}`)
        setDocuments(response.data.documents || [])
      } else if (role === 'doctor') {
        // FIXED: Use /users/doctors/:id instead of /doctors/:id
        response = await axiosInstance.get(`/users/doctors/${userId}`)
        // The doctor data might have documents in a different field
        setDocuments(response.data.data?.documents || response.data.documents || [])
      } else if (role === 'admin') {
        setDocuments([])
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      message.error('Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!newDoc.name) {
      message.warning('Please provide document name')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    try {
      let endpoint
      if (role === 'patient') {
        endpoint = `/patients/${userId}/documents`
      } else if (role === 'doctor') {
        endpoint = `/doctors/${userId}/documents`
      } else {
        message.error('Upload not available for this role')
        return
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
      
      await axiosInstance.post(endpoint, {
        name: newDoc.name,
        documentType: newDoc.documentType,
        documentURL: newDoc.documentURL || `/uploads/${Date.now()}_${newDoc.name.replace(/\s/g, '_')}.pdf`,
        uploadedBy: role.toUpperCase(),
        doctorId: role === 'doctor' ? userId : null,
        appointmentId: null
      })
      
      setUploadProgress(100)
      setTimeout(() => {
        setShowUpload(false)
        setNewDoc({ name: '', documentType: 'PDF', documentURL: '' })
        setUploadProgress(0)
        fetchDocuments()
        message.success('Document uploaded successfully')
      }, 500)
      
    } catch (error) {
      console.error('Error uploading document:', error)
      message.error('Failed to upload document')
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (docId) => {
    try {
      let endpoint
      if (role === 'patient') {
        endpoint = `/patients/${userId}/documents/${docId}`
      } else if (role === 'doctor') {
        endpoint = `/doctors/${userId}/documents/${docId}`
      } else {
        return
      }
      
      await axiosInstance.delete(endpoint)
      fetchDocuments()
      message.success('Document deleted successfully')
    } catch (error) {
      console.error('Error deleting document:', error)
      message.error('Failed to delete document')
    }
  }

  const getFileIcon = (type) => {
    switch (type) {
      case 'PDF': return <FilePdfOutlined className="text-red-500 text-2xl" />
      case 'IMAGE': return <FileImageOutlined className="text-green-500 text-2xl" />
      case 'DOC': return <FileTextOutlined className="text-blue-500 text-2xl" />
      default: return <FileOutlined className="text-gray-500 text-2xl" />
    }
  }

  const columns = [
    {
      title: 'Document',
      key: 'document',
      render: (_, record) => (
        <Space>
          {getFileIcon(record.documentType)}
          <div>
            <Text strong>{record.name}</Text>
            <div className="text-xs text-gray-400">
              {record.documentType}
            </div>
          </div>
        </Space>
      )
    },
    {
      title: 'Uploaded By',
      key: 'uploadedBy',
      render: (_, record) => (
        <Tag color={record.uploadedBy === 'DOCTOR' ? 'blue' : 'green'}>
          {record.uploadedBy === 'DOCTOR' ? '👨‍⚕️ Doctor' : '👤 Patient'}
        </Tag>
      )
    },
    {
      title: 'Date',
      key: 'date',
      render: (_, record) => (
        <Space>
          <ClockCircleOutlined className="text-gray-400" />
          <Text>{new Date(record.uploadedAt).toLocaleDateString()}</Text>
        </Space>
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
              onClick={() => window.open(record.documentURL, '_blank')}
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => window.open(record.documentURL, '_blank')}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Document"
            description="Are you sure you want to delete this document?"
            onConfirm={() => handleDelete(record.docId)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading documents..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div>
            <Title level={2} className="mb-1">Documents</Title>
            <Text type="secondary">Manage your files and documents</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowUpload(!showUpload)}
            size="large"
            className="rounded-xl"
          >
            Upload Document
          </Button>
        </div>

        {/* Upload Form */}
        {showUpload && (
          <Card className="shadow-lg rounded-2xl border-0 mb-6">
            <Title level={4} className="mb-4">Upload New Document</Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Document Name</label>
                  <Input
                    size="large"
                    value={newDoc.name}
                    onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                    placeholder="e.g., Medical Report - 2024"
                    className="rounded-xl"
                  />
                </div>
              </Col>
              <Col xs={24} md={6}>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Document Type</label>
                  <Select
                    size="large"
                    value={newDoc.documentType}
                    onChange={(value) => setNewDoc({ ...newDoc, documentType: value })}
                    className="w-full rounded-xl"
                  >
                    <Option value="PDF">📄 PDF</Option>
                    <Option value="IMAGE">🖼️ Image</Option>
                    <Option value="DOC">📝 Document</Option>
                  </Select>
                </div>
              </Col>
              <Col xs={24} md={10}>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">File URL</label>
                  <Input
                    size="large"
                    value={newDoc.documentURL}
                    onChange={(e) => setNewDoc({ ...newDoc, documentURL: e.target.value })}
                    placeholder="/uploads/filename.pdf"
                    className="rounded-xl"
                  />
                  <Text type="secondary" className="text-xs">Enter the file path or URL where the document is stored</Text>
                </div>
              </Col>
            </Row>

            {uploading && (
              <div className="mt-4">
                <Progress percent={uploadProgress} status={uploadProgress === 100 ? 'success' : 'active'} />
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={handleUpload}
                loading={uploading}
                className="rounded-xl"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
              <Button
                onClick={() => {
                  setShowUpload(false)
                  setNewDoc({ name: '', documentType: 'PDF', documentURL: '' })
                  setUploadProgress(0)
                }}
                className="rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Documents Table */}
        <Card className="shadow-lg rounded-2xl border-0">
          {documents.length === 0 ? (
            <Empty
              description={
                <div>
                  <Text type="secondary">No documents yet</Text>
                  <br />
                  <Text type="secondary" className="text-sm">Click "Upload Document" to add your first file</Text>
                </div>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <Text type="secondary">
                  Total: <Text strong>{documents.length}</Text> document{documents.length > 1 ? 's' : ''}
                </Text>
                <Space>
                  <Tag color="blue">{documents.filter(d => d.uploadedBy === 'DOCTOR').length} Doctor</Tag>
                  <Tag color="green">{documents.filter(d => d.uploadedBy === 'PATIENT').length} Patient</Tag>
                </Space>
              </div>
              <Table
                columns={columns}
                dataSource={documents}
                rowKey="docId"
                pagination={{
                  pageSize: 10,
                  showTotal: (total) => `Total ${total} documents`
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