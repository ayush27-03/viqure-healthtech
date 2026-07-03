// pages/Orders.jsx
// pages/Orders.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'
import {
  Layout,
  Row,
  Col,
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Empty,
  Spin,
  Select,
  Tabs,
  Table,
  Badge,
  Statistic,
  Divider,
  Tooltip,
  Pagination,
  Input,
  Alert
} from 'antd'
import {
  ShoppingOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  TruckOutlined,
  HomeOutlined,
  DollarOutlined,
  CalendarOutlined,
  ArrowRightOutlined,
  SyncOutlined  // ← ADD THIS
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select
const { TabPane } = Tabs

function Orders() {
  const { isAuthenticated } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 1 })
<<<<<<< HEAD
=======
  const [searchTerm, setSearchTerm] = useState('')
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }
    fetchOrders()
  }, [isAuthenticated])

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get('/orders')
      const data = response.data.data || response.data || []
      const paginationData = response.data.pagination || { total: data.length, page: 1, limit: 20, pages: 1 }
      setOrders(data)
      setPagination(paginationData)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

<<<<<<< HEAD
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-purple-100 text-purple-800',
      'processing': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-blue-100 text-blue-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'returned': 'bg-gray-100 text-gray-800',
      'failed': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
=======
  const getStatusConfig = (status) => {
    const configs = {
      'pending': { color: 'gold', icon: <ClockCircleOutlined />, label: 'Pending' },
      'confirmed': { color: 'purple', icon: <CheckCircleOutlined />, label: 'Confirmed' },
      'processing': { color: 'blue', icon: <SyncOutlined spin />, label: 'Processing' },
      'shipped': { color: 'cyan', icon: <TruckOutlined />, label: 'Shipped' },
      'delivered': { color: 'green', icon: <HomeOutlined />, label: 'Delivered' },
      'cancelled': { color: 'red', icon: <CloseCircleOutlined />, label: 'Cancelled' },
      'returned': { color: 'default', icon: <ExclamationCircleOutlined />, label: 'Returned' },
      'failed': { color: 'red', icon: <CloseCircleOutlined />, label: 'Failed' }
    }
    return configs[status] || { color: 'default', icon: <ExclamationCircleOutlined />, label: status }
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getFilteredOrders = () => {
    let filtered = [...orders]
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter)
    }
    
    if (searchTerm) {
      filtered = filtered.filter(o => 
        o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.status?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    } else if (sortBy === 'highest') {
<<<<<<< HEAD
      filtered.sort((a, b) => b.pricing?.finalAmount - a.pricing?.finalAmount)
    } else if (sortBy === 'lowest') {
      filtered.sort((a, b) => a.pricing?.finalAmount - b.pricing?.finalAmount)
=======
      filtered.sort((a, b) => (b.pricing?.finalAmount || 0) - (a.pricing?.finalAmount || 0))
    } else if (sortBy === 'lowest') {
      filtered.sort((a, b) => (a.pricing?.finalAmount || 0) - (b.pricing?.finalAmount || 0))
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
    }
    
    return filtered
  }

  const columns = [
    {
      title: 'Order ID',
      key: 'orderId',
      render: (_, record) => (
        <div>
          <Text strong className="text-sm">
            #{record._id.slice(-8).toUpperCase()}
          </Text>
          <div className="text-xs text-gray-400 mt-1">
            <CalendarOutlined className="mr-1" />
            {formatDate(record.createdAt)}
          </div>
        </div>
      ),
    },
    {
      title: 'Items',
      key: 'items',
      render: (_, record) => (
        <div>
          <Text>{record.items?.length || 0} items</Text>
          <div className="text-xs text-gray-400 mt-1">
            {record.items?.slice(0, 2).map((item, i) => (
              <span key={i}>
                {item.productSnapshot?.name || 'Product'}
                {i < Math.min(record.items.length - 1, 1) && ', '}
              </span>
            ))}
            {record.items?.length > 2 && `+ ${record.items.length - 2} more`}
          </div>
        </div>
      ),
    },
    {
      title: 'Total',
      key: 'total',
      align: 'center',
      render: (_, record) => (
        <Text strong className="text-blue-600">
          {formatPrice(record.pricing?.finalAmount || 0)}
        </Text>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      align: 'center',
      render: (_, record) => {
        const config = getStatusConfig(record.status)
        return (
          <Tag color={config.color} icon={config.icon} className="px-3 py-1">
            {config.label}
          </Tag>
        )
      },
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Link to={`/orders/${record._id}`}>
          <Button type="primary" size="small" icon={<EyeOutlined />}>
            View
          </Button>
        </Link>
      ),
    },
  ]

  const getStatusCounts = () => {
    const counts = { all: orders.length }
    orders.forEach(order => {
      counts[order.status] = (counts[order.status] || 0) + 1
    })
    return counts
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading orders..." />
      </div>
    )
  }

  const filteredOrders = getFilteredOrders()
  const statusCounts = getStatusCounts()

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div>
            <Title level={2} className="mb-0">My Orders</Title>
            <Text type="secondary">
              {orders.length} order{orders.length !== 1 ? 's' : ''} placed
            </Text>
          </div>
          <Link to="/shop">
            <Button type="primary" size="large" icon={<ShoppingOutlined />}>
              Continue Shopping
            </Button>
          </Link>
        </div>

<<<<<<< HEAD
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg transition ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-lg transition ${statusFilter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Pending
              </button>
              <button
                onClick={() => setStatusFilter('confirmed')}
                className={`px-4 py-2 rounded-lg transition ${statusFilter === 'confirmed' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Confirmed
              </button>
              <button
                onClick={() => setStatusFilter('shipped')}
                className={`px-4 py-2 rounded-lg transition ${statusFilter === 'shipped' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Shipped
              </button>
              <button
                onClick={() => setStatusFilter('delivered')}
                className={`px-4 py-2 rounded-lg transition ${statusFilter === 'delivered' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Delivered
              </button>
              <button
                onClick={() => setStatusFilter('cancelled')}
                className={`px-4 py-2 rounded-lg transition ${statusFilter === 'cancelled' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Cancelled
              </button>
              <button
                onClick={() => setStatusFilter('returned')}
                className={`px-4 py-2 rounded-lg transition ${statusFilter === 'returned' ? 'bg-gray-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Returned
              </button>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">
            Showing {filteredOrders.length} of {pagination.total} orders
          </p>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No orders found</h2>
            <p className="text-gray-500 mb-6">
              {statusFilter !== 'all' ? `No ${statusFilter} orders` : "You haven't placed any orders yet"}
            </p>
            <Link to="/shop" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Link to={`/orders/${order._id}`} key={order._id}>
                <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Order #{order._id.slice(-8)}</p>
                      <p className="text-sm text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                      <p className="text-lg font-bold text-blue-600 mt-2">
                        {formatPrice(order.pricing?.finalAmount || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t text-right">
                    <span className="text-blue-600 text-sm">View Details →</span>
=======
        {/* Stats Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={6}>
            <Card className="shadow-sm text-center">
              <Statistic
                title="Total Orders"
                value={orders.length}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="shadow-sm text-center">
              <Statistic
                title="Delivered"
                value={statusCounts.delivered || 0}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="shadow-sm text-center">
              <Statistic
                title="Pending"
                value={(statusCounts.pending || 0) + (statusCounts.confirmed || 0)}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="shadow-sm text-center">
              <Statistic
                title="Total Spent"
                value={orders.reduce((sum, o) => sum + (o.pricing?.finalAmount || 0), 0)}
                prefix="₹"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="shadow-sm mb-6">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8}>
              <Input
                placeholder="Search by order ID..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
                size="large"
                className="rounded-lg"
              />
            </Col>
            <Col xs={12} sm={8}>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                size="large"
                className="w-full"
                placeholder="Filter by status"
              >
                <Option value="all">All Status ({statusCounts.all})</Option>
                <Option value="pending">Pending ({statusCounts.pending || 0})</Option>
                <Option value="confirmed">Confirmed ({statusCounts.confirmed || 0})</Option>
                <Option value="processing">Processing ({statusCounts.processing || 0})</Option>
                <Option value="shipped">Shipped ({statusCounts.shipped || 0})</Option>
                <Option value="delivered">Delivered ({statusCounts.delivered || 0})</Option>
                <Option value="cancelled">Cancelled ({statusCounts.cancelled || 0})</Option>
                <Option value="returned">Returned ({statusCounts.returned || 0})</Option>
              </Select>
            </Col>
            <Col xs={12} sm={8}>
              <Select
                value={sortBy}
                onChange={setSortBy}
                size="large"
                className="w-full"
                placeholder="Sort by"
              >
                <Option value="newest">Newest First</Option>
                <Option value="oldest">Oldest First</Option>
                <Option value="highest">Highest Amount</Option>
                <Option value="lowest">Lowest Amount</Option>
              </Select>
            </Col>
          </Row>

          {/* Active Filters */}
          {(statusFilter !== 'all' || searchTerm) && (
            <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
              {statusFilter !== 'all' && (
                <Tag closable onClose={() => setStatusFilter('all')} color="blue">
                  Status: {statusFilter}
                </Tag>
              )}
              {searchTerm && (
                <Tag closable onClose={() => setSearchTerm('')} color="purple">
                  Search: {searchTerm}
                </Tag>
              )}
            </div>
          )}
        </Card>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <Card className="shadow-sm py-8">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Title level={4}>No orders found</Title>
                  <Text type="secondary">
                    {statusFilter !== 'all' 
                      ? `You don't have any ${statusFilter} orders` 
                      : "You haven't placed any orders yet"}
                  </Text>
                  <div className="mt-4">
                    <Link to="/shop">
                      <Button type="primary" size="large" icon={<ShoppingOutlined />}>
                        Start Shopping
                      </Button>
                    </Link>
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
                  </div>
                </div>
              }
            />
          </Card>
        ) : (
          <>
            <Card className="shadow-sm">
              <Table
                columns={columns}
                dataSource={filteredOrders}
                rowKey="_id"
                pagination={{
                  total: filteredOrders.length,
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} orders`,
                  size: 'default'
                }}
                className="orders-table"
                scroll={{ x: 700 }}
              />
            </Card>

            <div className="mt-4 text-center">
              <Text type="secondary" className="text-sm">
                Showing {filteredOrders.length} of {pagination.total} orders
              </Text>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Orders
