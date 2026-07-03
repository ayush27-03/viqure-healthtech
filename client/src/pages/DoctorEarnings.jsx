<<<<<<< HEAD
=======
// pages/DoctorEarnings.jsx
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'
<<<<<<< HEAD
=======
import {
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Button,
  Space,
  Table,
  Tag,
  Tabs,
  Spin,
  Select,
  Divider,
  Progress,
  Empty,
  Tooltip,
  Badge
} from 'antd'
import {
  DollarOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
  BarChartOutlined,
  WalletOutlined,
  UserOutlined,
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  ArrowUpOutlined  // ← Changed from TrendingUpOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select
const { TabPane } = Tabs
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450

function DoctorEarnings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    totalAppointments: 0,
    breakdownByStatus: []
  })
  const [monthlyData, setMonthlyData] = useState([])
  const [selectedFilter, setSelectedFilter] = useState('all')

  useEffect(() => {
    fetchEarnings()
  }, [])

  const fetchEarnings = async () => {
    try {
      const response = await axiosInstance.get('/doctors/me/earnings')
      const data = response.data.data || { totalEarnings: 0, totalAppointments: 0, breakdownByStatus: [] }
      setEarnings(data)
<<<<<<< HEAD
      
      // Generate monthly data from breakdown (mock for now, server would provide)
=======
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
      generateMonthlyData()
    } catch (error) {
      console.error('Error fetching earnings:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMonthlyData = () => {
<<<<<<< HEAD
    // Mock monthly data - in production this comes from server
=======
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()
    const data = []
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      data.push({
        month: months[monthIndex],
        earnings: Math.floor(Math.random() * 8000) + 2000,
        appointments: Math.floor(Math.random() * 20) + 5
      })
    }
    setMonthlyData(data)
  }

<<<<<<< HEAD
  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-50'
      case 'CONFIRMED': return 'text-blue-600 bg-blue-50'
      case 'PENDING': return 'text-yellow-600 bg-yellow-50'
      case 'CANCELLED': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return '✅'
      case 'CONFIRMED': return '📅'
      case 'PENDING': return '⏳'
      case 'CANCELLED': return '❌'
      default: return '📊'
    }
=======
  const getStatusConfig = (status) => {
    const configs = {
      'COMPLETED': { color: 'green', icon: <CheckCircleOutlined />, label: 'Completed' },
      'CONFIRMED': { color: 'blue', icon: <CalendarOutlined />, label: 'Confirmed' },
      'PENDING': { color: 'gold', icon: <ClockCircleOutlined />, label: 'Pending' },
      'CANCELLED': { color: 'red', icon: <CloseCircleOutlined />, label: 'Cancelled' }
    }
    return configs[status] || { color: 'default', icon: <FileTextOutlined />, label: status }
  }

  const columns = [
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const config = getStatusConfig(record._id)
        return (
          <Tag color={config.color} icon={config.icon} className="px-3 py-1 text-sm">
            {config.label}
          </Tag>
        )
      }
    },
    {
      title: 'Count',
      dataIndex: 'count',
      key: 'count',
      align: 'center',
      render: (count) => <Text strong>{count}</Text>
    },
    {
      title: 'Total Earnings',
      dataIndex: 'totalEarnings',
      key: 'totalEarnings',
      align: 'right',
      render: (value) => (
        <Text strong className="text-green-600">₹{value}</Text>
      )
    },
    {
      title: 'Total Tax',
      dataIndex: 'totalTax',
      key: 'totalTax',
      align: 'right',
      render: (value) => <Text>₹{value || 0}</Text>
    },
    {
      title: 'Avg per Appointment',
      key: 'avg',
      align: 'right',
      render: (_, record) => (
        <Text strong>₹{Math.round(record.totalEarnings / (record.count || 1))}</Text>
      )
    }
  ]

  const getFilteredData = () => {
    if (selectedFilter === 'all') return earnings.breakdownByStatus || []
    return (earnings.breakdownByStatus || []).filter(b => b._id === selectedFilter)
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
  }

  if (loading) {
    return (
<<<<<<< HEAD
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
=======
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading earnings..." />
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
      </div>
    )
  }

<<<<<<< HEAD
  const filteredBreakdown = selectedFilter === 'all' 
    ? earnings.breakdownByStatus 
    : earnings.breakdownByStatus.filter(b => b._id === selectedFilter)

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-600 to-green-800 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Earnings Dashboard</h1>
                <p className="text-green-100 mt-1">Your financial overview</p>
              </div>
              <button
                onClick={() => navigate('/doctor/profile')}
                className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                ← Back to Profile
              </button>
            </div>
=======
  const filteredData = getFilteredData()
  const totalCompleted = earnings.breakdownByStatus?.find(b => b._id === 'COMPLETED')?.count || 0
  const totalConfirmed = earnings.breakdownByStatus?.find(b => b._id === 'CONFIRMED')?.count || 0

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Space className="mb-2">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/doctor/profile')}
              className="text-green-600"
            >
              Back to Profile
            </Button>
          </Space>
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <Title level={2} className="mb-1">Earnings Dashboard</Title>
              <Text type="secondary">Your financial overview</Text>
            </div>
            <Space>
              <Button icon={<DownloadOutlined />}>Export Report</Button>
              <Button type="primary" icon={<EyeOutlined />}>View Details</Button>
            </Space>
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
          </div>
        </div>

        {/* Summary Cards */}
<<<<<<< HEAD
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-sm text-gray-500">Total Earnings</p>
            <p className="text-3xl font-bold text-green-600">₹{earnings.totalEarnings}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-sm text-gray-500">Total Appointments</p>
            <p className="text-3xl font-bold text-blue-600">{earnings.totalAppointments}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-3xl font-bold text-green-600">
              {earnings.breakdownByStatus?.find(b => b._id === 'COMPLETED')?.count || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-sm text-gray-500">Confirmed (Pending)</p>
            <p className="text-3xl font-bold text-yellow-600">
              {earnings.breakdownByStatus?.find(b => b._id === 'CONFIRMED')?.count || 0}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                selectedFilter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            {earnings.breakdownByStatus?.map(b => (
              <button
                key={b._id}
                onClick={() => setSelectedFilter(b._id)}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  selectedFilter === b._id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {b._id} ({b.count})
              </button>
            ))}
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Appointment Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Earnings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tax</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg per Appointment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No data available</td>
                  </tr>
                ) : (
                  filteredBreakdown.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item._id)}`}>
                          {getStatusIcon(item._id)} {item._id}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">{item.count}</td>
                      <td className="px-6 py-4 text-green-600 font-semibold">₹{item.totalEarnings}</td>
                      <td className="px-6 py-4 text-gray-600">₹{item.totalTax || 0}</td>
                      <td className="px-6 py-4 text-gray-900">₹{Math.round(item.totalEarnings / (item.count || 1))}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Last 6 Months Trend</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {monthlyData.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.month}</span>
                    <span className="font-semibold">₹{item.earnings} ({item.appointments} appointments)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((item.earnings / 10000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
=======
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm rounded-xl">
              <Statistic
                title="Total Earnings"
                value={earnings.totalEarnings || 0}
                prefix={<DollarOutlined className="text-green-500" />}
                valueStyle={{ color: '#22c55e', fontSize: 28 }}
                className="text-center"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm rounded-xl">
              <Statistic
                title="Total Appointments"
                value={earnings.totalAppointments || 0}
                prefix={<CalendarOutlined className="text-blue-500" />}
                valueStyle={{ color: '#1890ff', fontSize: 28 }}
                className="text-center"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm rounded-xl">
              <Statistic
                title="Completed"
                value={totalCompleted}
                prefix={<CheckCircleOutlined className="text-green-500" />}
                valueStyle={{ color: '#22c55e', fontSize: 28 }}
                className="text-center"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm rounded-xl">
              <Statistic
                title="Confirmed (Pending)"
                value={totalConfirmed}
                prefix={<ClockCircleOutlined className="text-yellow-500" />}
                valueStyle={{ color: '#faad14', fontSize: 28 }}
                className="text-center"
              />
            </Card>
          </Col>
        </Row>

        {/* Filter Section */}
        <Card className="shadow-sm rounded-xl mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <Text strong>Filter by Status:</Text>
            <Select
              value={selectedFilter}
              onChange={setSelectedFilter}
              className="w-48"
              size="middle"
            >
              <Option value="all">All Statuses</Option>
              {(earnings.breakdownByStatus || []).map(b => (
                <Option key={b._id} value={b._id}>
                  {b._id} ({b.count})
                </Option>
              ))}
            </Select>
            {selectedFilter !== 'all' && (
              <Tag closable onClose={() => setSelectedFilter('all')} color="blue">
                Filter: {selectedFilter}
              </Tag>
            )}
            <div className="ml-auto">
              <Text type="secondary" className="text-sm">
                Showing {filteredData.length} of {earnings.breakdownByStatus?.length || 0} entries
              </Text>
            </div>
          </div>
        </Card>

        {/* Breakdown Table */}
        <Card className="shadow-sm rounded-xl mb-6" title="Appointment Breakdown">
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="_id"
            pagination={false}
            locale={{ emptyText: <Empty description="No data available" /> }}
          />
        </Card>

        {/* Monthly Trend */}
        <Card 
          className="shadow-sm rounded-xl" 
          title={
            <Space>
              <BarChartOutlined />
              <span>Last 6 Months Trend</span>
            </Space>
          }
          extra={
            <Tag color="green" className="text-sm">
              <ArrowUpOutlined  /> Growth
            </Tag>
          }
        >
          <div className="space-y-4">
            {monthlyData.map((item, index) => {
              const percent = Math.min((item.earnings / 10000) * 100, 100)
              return (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <Space>
                      <Text strong>{item.month}</Text>
                      <Badge count={item.appointments} style={{ backgroundColor: '#1890ff' }} />
                    </Space>
                    <Text strong className="text-green-600">₹{item.earnings}</Text>
                  </div>
                  <Progress
                    percent={Math.round(percent)}
                    strokeColor={{
                      '0%': '#22c55e',
                      '100%': '#16a34a'
                    }}
                    strokeWidth={10}
                    showInfo={false}
                    className="mb-2"
                  />
                </div>
              )
            })}
          </div>
        </Card>

        {/* Quick Stats */}
        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24} sm={8}>
            <Card className="shadow-sm rounded-xl text-center">
              <Statistic
                title="Average per Appointment"
                value={Math.round(earnings.totalEarnings / (earnings.totalAppointments || 1))}
                prefix="₹"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm rounded-xl text-center">
              <Statistic
                title="Success Rate"
                value={Math.round((totalCompleted / (earnings.totalAppointments || 1)) * 100)}
                suffix="%"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm rounded-xl text-center">
              <Statistic
                title="Total Tax Paid"
                value={earnings.breakdownByStatus?.reduce((sum, b) => sum + (b.totalTax || 0), 0) || 0}
                prefix="₹"
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
      </div>
    </div>
  )
}

<<<<<<< HEAD
export default DoctorEarnings
=======
export default DoctorEarnings
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
