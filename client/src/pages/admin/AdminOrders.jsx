// pages/admin/AdminOrders.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from "../../services/axiosConfig"
import {
  Card,
  Typography,
  Table,
  Input,
  Select,
  Button,
  Space,
  Tag,
  message,
  Spin,
  Badge,
  Tooltip,
  Avatar
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get('/admin/orders')
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      message.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/admin/orders/${id}`, { status })
      fetchOrders()
      message.success('Order status updated')
    } catch (error) {
      console.error('Error updating order:', error)
      message.error('Failed to update order')
    }
  }

  const getStatusConfig = (status) => {
    const configs = {
      'delivered': { color: 'success', icon: <CheckCircleOutlined />, label: 'Delivered' },
      'shipped': { color: 'processing', icon: <CheckCircleOutlined />, label: 'Shipped' },
      'confirmed': { color: 'purple', icon: <CheckCircleOutlined />, label: 'Confirmed' },
      'pending': { color: 'warning', icon: <ClockCircleOutlined />, label: 'Pending' },
      'cancelled': { color: 'error', icon: <CloseCircleOutlined />, label: 'Cancelled' },
      'returned': { color: 'default', icon: <CloseCircleOutlined />, label: 'Returned' }
    }
    return configs[status] || { color: 'default', icon: null, label: status }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const columns = [
    {
      title: 'Order ID',
      key: 'orderId',
      render: (_, record) => (
        <Text className="font-mono text-sm">#{record._id.slice(-8).toUpperCase()}</Text>
      )
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} className="bg-blue-100 text-blue-600" size="small" />
          <div>
            <Text strong>{record.patientName}</Text>
            <div className="text-xs text-gray-400">{record.patientEmail}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'Date',
      key: 'date',
      render: (_, record) => (
        <Space>
          <CalendarOutlined className="text-gray-400" />
          <Text>{new Date(record.createdAt).toLocaleDateString()}</Text>
        </Space>
      )
    },
    {
      title: 'Amount',
      key: 'amount',
      render: (_, record) => (
        <Text strong className="text-green-600">
          {formatPrice(record.pricing?.finalAmount)}
        </Text>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const config = getStatusConfig(record.status)
        return <Badge status={config.color} text={config.label} />
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Select
          value={record.status}
          onChange={(value) => updateOrderStatus(record._id, value)}
          size="small"
          className="w-32"
        >
          <Option value="pending">Pending</Option>
          <Option value="confirmed">Confirmed</Option>
          <Option value="shipped">Shipped</Option>
          <Option value="delivered">Delivered</Option>
          <Option value="cancelled">Cancelled</Option>
          <Option value="returned">Returned</Option>
        </Select>
      )
    }
  ]

  const filteredOrders = orders.filter(order => {
    if (filter !== 'all' && order.status !== filter) return false
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return order.patientName?.toLowerCase().includes(searchLower) ||
             order._id.toLowerCase().includes(searchLower)
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
        <Title level={2} className="mb-0">Order Management</Title>
        <Text type="secondary">View and manage all customer orders</Text>
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
            <Option value="shipped">Shipped</Option>
            <Option value="delivered">Delivered</Option>
            <Option value="cancelled">Cancelled</Option>
            <Option value="returned">Returned</Option>
          </Select>

          <Input
            placeholder="Search by order ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-64 rounded-xl"
            allowClear
          />

          <Button icon={<ReloadOutlined />} onClick={fetchOrders}>
            Refresh
          </Button>
        </Space>
      </Card>

      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} orders`
          }}
          scroll={{ x: true }}
        />
      </Card>
    </div>
  )
}

export default AdminOrders