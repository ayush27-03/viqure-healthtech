// pages/MyReports.jsx
import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Typography, message, Spin, Empty, Space, Modal, Descriptions } from 'antd'
import { EyeOutlined, AlertOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../services/axiosConfig'

const { Title } = Typography

const MyReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await axiosInstance.get('/report-issue/my-issues')
      setReports(response.data.data || [])
    } catch (error) {
      message.error('Failed to fetch reports')
    } finally {
      setLoading(false)
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
      PENDING: 'Pending Review',
      IN_PROGRESS: 'In Progress',
      RESOLVED: 'Resolved',
      REJECTED: 'Rejected',
      CLOSED: 'Closed'
    }
    return labels[status] || status
  }

  const handleViewDetail = (record) => {
    setSelectedReport(record)
    setDetailModalVisible(true)
  }

  const columns = [
    {
      title: 'Issue',
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <div className="max-w-xs">
          <div className="font-medium truncate">{text.substring(0, 60)}...</div>
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
      render: (text) => <Tag color={getStatusColor(text)}>{getStatusLabel(text)}</Tag>
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          icon={<EyeOutlined />} 
          onClick={() => handleViewDetail(record)}
          size="small"
        >
          View
        </Button>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <>
      <div className="max-w-6xl mx-auto py-6 px-4">
        <Card className="shadow-lg rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(-1)}
                type="text"
              />
              <Title level={3} className="mb-0">My Reports</Title>
            </div>
          </div>

          {reports.length === 0 ? (
            <Empty 
              description="You haven't reported any issues yet"
              className="py-12"
            >
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={reports}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
            />
          )}
        </Card>
      </div>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <AlertOutlined className="text-blue-500" />
            <span>Issue Details</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false)
          setSelectedReport(null)
        }}
        footer={[
          <Button 
            key="close" 
            onClick={() => {
              setDetailModalVisible(false)
              setSelectedReport(null)
            }}
          >
            Close
          </Button>
        ]}
        width={600}
        className="rounded-2xl"
      >
        {selectedReport && (
          <div className="py-2">
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-3">
                <Tag color={getStatusColor(selectedReport.status)}>
                  {getStatusLabel(selectedReport.status)}
                </Tag>
                <Tag>{selectedReport.category.replace('_', ' ')}</Tag>
              </div>
            </div>

            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="Category">
                {selectedReport.category.replace('_', ' ')}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedReport.status)}>
                  {getStatusLabel(selectedReport.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                <div className="whitespace-pre-wrap">
                  {selectedReport.description}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Reported On">
                {new Date(selectedReport.createdAt).toLocaleString()}
              </Descriptions.Item>
              {selectedReport.resolvedAt && (
                <Descriptions.Item label="Resolved On">
                  {new Date(selectedReport.resolvedAt).toLocaleString()}
                </Descriptions.Item>
              )}
              {selectedReport.adminNote && (
                <Descriptions.Item label="Admin Response">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    {selectedReport.adminNote}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </>
  )
}

export default MyReports