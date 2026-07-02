// pages/DoctorEarnings.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'
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
      generateMonthlyData()
    } catch (error) {
      console.error('Error fetching earnings:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMonthlyData = () => {
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
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading earnings..." />
      </div>
    )
  }

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
          </div>
        </div>

        {/* Summary Cards */}
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
      </div>
    </div>
  )
}

export default DoctorEarnings