/* eslint-disable react-hooks/exhaustive-deps */
// pages/OrderDetail.jsx - Fixed imports
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
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
  Spin,
  Descriptions,
  Table,
  Divider,
  Modal,
  Alert,
  Timeline,
  Statistic,
  Steps,
  Badge,
  message,
  Tooltip,
  Empty
} from 'antd'
import {
  ArrowLeftOutlined,
  ShoppingOutlined,
  TruckOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  CalendarOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  MailOutlined,
  PrinterOutlined,
  DownloadOutlined,
  SyncOutlined,
  InfoCircleOutlined,
  ShopOutlined  // Replacing PackageOutlined with ShopOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Step } = Steps

function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showTrackModal, setShowTrackModal] = useState(false)
  const [trackingData, setTrackingData] = useState(null)
  const [trackingLoading, setTrackingLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchOrder()
  }, [isAuthenticated, id])

  const fetchOrder = async () => {
    try {
      const response = await axiosInstance.get(`/orders/${id}`)
      const data = response.data.data || response.data
      setOrder(data)
    } catch (error) {
      console.error('Error fetching order:', error)
      message.error('Failed to fetch order details')
      navigate('/orders')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    Modal.confirm({
      title: 'Cancel Order',
      content: 'Are you sure you want to cancel this order?',
      okText: 'Yes, Cancel',
      cancelText: 'No',
      okType: 'danger',
      onOk: async () => {
        setActionLoading(true)
        try {
          await axiosInstance.patch(`/orders/${id}/cancel`, {})
          message.success('Order cancelled successfully')
          await fetchOrder()
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to cancel order')
        } finally {
          setActionLoading(false)
        }
      }
    })
  }

  const handleReturnOrder = async () => {
    Modal.confirm({
      title: 'Return Order',
      content: 'Are you sure you want to return this order?',
      okText: 'Yes, Return',
      cancelText: 'No',
      onOk: async () => {
        setActionLoading(true)
        try {
          await axiosInstance.patch(`/orders/${id}/return`, {})
          message.success('Return request submitted successfully')
          await fetchOrder()
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to return order')
        } finally {
          setActionLoading(false)
        }
      }
    })
  }

  const handleTrackOrder = async () => {
    setShowTrackModal(true)
    setTrackingLoading(true)
    try {
      const response = await axiosInstance.get(`/orders/${id}/track`)
      setTrackingData(response.data.data || response.data)
    } catch (error) {
      console.error('Error fetching tracking:', error)
      message.error('Failed to fetch tracking information')
      setShowTrackModal(false)
    } finally {
      setTrackingLoading(false)
    }
  }

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
  }

  const getShipmentStatusConfig = (status) => {
    const configs = {
      'PENDING': { color: 'default', label: 'Pending' },
      'DISPATCHED': { color: 'blue', label: 'Dispatched' },
      'IN_TRANSIT': { color: 'purple', label: 'In Transit' },
      'OUT_FOR_DELIVERY': { color: 'orange', label: 'Out for Delivery' },
      'DELIVERED': { color: 'green', label: 'Delivered' },
      'FAILED': { color: 'red', label: 'Failed' },
      'RETURNED': { color: 'default', label: 'Returned' }
    }
    return configs[status] || { color: 'default', label: status || 'N/A' }
  }

  const getOrderSteps = () => {
    const status = order?.status
    const steps = [
      { title: 'Order Placed', status: 'finish' },
      { title: 'Confirmed', status: status === 'pending' ? 'wait' : 'finish' },
      { title: 'Shipped', status: ['pending', 'confirmed'].includes(status) ? 'wait' : 'finish' },
      { title: 'Delivered', status: status === 'delivered' ? 'finish' : status === 'cancelled' || status === 'returned' ? 'error' : 'wait' }
    ]
    return steps
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading order details..." />
      </div>
    )
  }

  if (!order) return null

  const deliveryAddress = order.shipmentDetails?.deliveryAddress || order.shippingAddress || {}
  const status = order?.status
  const isCancellable = status === 'pending' || status === 'confirmed'
  const isReturnable = status === 'delivered'
  const statusConfig = getStatusConfig(status)

  const columns = [
    {
      title: 'Product',
      key: 'product',
      render: (_, item) => (
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            {item.productSnapshot?.image ? (
              <img src={item.productSnapshot.image} alt={item.productSnapshot.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">💊</span>
            )}
          </div>
          <div>
            <Link to={`/product/${item.productId}`}>
              <Text strong className="hover:text-blue-600 transition-colors">
                {item.productSnapshot?.name || 'Product'}
              </Text>
            </Link>
            <div className="text-sm text-gray-500">{item.productSnapshot?.brand}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Quantity',
      key: 'quantity',
      align: 'center',
      render: (_, item) => <Text>{item.quantity}</Text>,
    },
    {
      title: 'Unit Price',
      key: 'unitPrice',
      align: 'right',
      render: (_, item) => <Text>{formatPrice(item.unitPrice)}</Text>,
    },
    {
      title: 'Total',
      key: 'total',
      align: 'right',
      render: (_, item) => <Text strong className="text-blue-600">{formatPrice(item.totalPrice)}</Text>,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/orders')}
              className="text-blue-600"
            >
              Back to Orders
            </Button>
            <Title level={2} className="mb-0">Order Details</Title>
          </div>
          <Space>
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
              Print
            </Button>
            <Button icon={<DownloadOutlined />}>
              Download
            </Button>
          </Space>
        </div>

        {/* Order Status Card */}
        <Card className="shadow-sm mb-6">
          <Row gutter={[24, 16]} align="middle">
            <Col xs={24} md={6}>
              <div>
                <Text type="secondary" className="text-sm">Order ID</Text>
                <div className="font-mono text-base font-medium">{order._id}</div>
              </div>
            </Col>
            <Col xs={24} md={6}>
              <div>
                <Text type="secondary" className="text-sm">Order Date</Text>
                <div>{formatDate(order.createdAt)}</div>
              </div>
            </Col>
            <Col xs={24} md={6}>
              <div>
                <Text type="secondary" className="text-sm">Order Status</Text>
                <Tag color={statusConfig.color} icon={statusConfig.icon} className="mt-1 px-3 py-1 text-base">
                  {statusConfig.label}
                </Tag>
              </div>
            </Col>
            <Col xs={24} md={6}>
              <div className="text-right">
                <Text type="secondary" className="text-sm">Total Amount</Text>
                <Title level={3} className="text-blue-600 mb-0">
                  {formatPrice(order.pricing?.finalAmount)}
                </Title>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Order Timeline */}
        <Card className="shadow-sm mb-6">
          <Steps
            current={getOrderSteps().filter(s => s.status === 'finish').length}
            status={status === 'cancelled' || status === 'returned' ? 'error' : 'process'}
          >
            {getOrderSteps().map((step, index) => (
              <Step key={index} title={step.title} />
            ))}
          </Steps>
        </Card>

        <Row gutter={[24, 24]}>
          {/* Order Items */}
          <Col xs={24} lg={16}>
            <Card className="shadow-sm" title={<Title level={4}>Order Items</Title>}>
              <Table
                columns={columns}
                dataSource={order.items}
                rowKey={(item) => item._id || item.productId}
                pagination={false}
                size="middle"
              />
            </Card>

            {/* Action Buttons */}
            {(isCancellable || isReturnable || true) && (
              <Card className="shadow-sm mt-6">
                <Space size="middle" wrap>
                  {isCancellable && (
                    <Button
                      danger
                      size="large"
                      onClick={handleCancelOrder}
                      loading={actionLoading}
                      icon={<CloseCircleOutlined />}
                    >
                      Cancel Order
                    </Button>
                  )}
                  {isReturnable && (
                    <Button
                      size="large"
                      onClick={handleReturnOrder}
                      loading={actionLoading}
                      icon={<ExclamationCircleOutlined />}
                      style={{ background: '#faad14', color: 'white' }}
                    >
                      Return Order
                    </Button>
                  )}
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleTrackOrder}
                    icon={<TruckOutlined />}
                  >
                    Track Order
                  </Button>
                </Space>
              </Card>
            )}
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            {/* Shipping Address */}
            <Card className="shadow-sm mb-6" title={<Title level={4}>Shipping Address</Title>}>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <UserOutlined className="text-gray-400 mt-1" />
                  <div>
                    <Text strong>{deliveryAddress.fullName}</Text>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <PhoneOutlined className="text-gray-400 mt-1" />
                  <Text>{deliveryAddress.phone}</Text>
                </div>
                <div className="flex items-start gap-2">
                  <EnvironmentOutlined className="text-gray-400 mt-1" />
                  <div>
                    <Text>{deliveryAddress.addressLine}</Text>
                    <br />
                    <Text>{deliveryAddress.city}, {deliveryAddress.state}</Text>
                    <br />
                    <Text>Pincode: {deliveryAddress.pincode}</Text>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Summary */}
            <Card className="shadow-sm" title={<Title level={4}>Payment Summary</Title>}>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Text type="secondary">Subtotal</Text>
                  <Text>{formatPrice(order.pricing?.subtotal)}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Delivery Charge</Text>
                  <Text>
                    {order.pricing?.deliveryCharge === 0 ? (
                      <Tag color="green">Free</Tag>
                    ) : (
                      formatPrice(order.pricing?.deliveryCharge)
                    )}
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Discount</Text>
                  <Text className="text-green-600">-{formatPrice(order.pricing?.discount)}</Text>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between text-sm text-gray-500">
                  <Text type="secondary">CGST (2.5%)</Text>
                  <Text>{formatPrice(order.pricing?.taxBreakdown?.cgst?.amount)}</Text>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <Text type="secondary">SGST (2.5%)</Text>
                  <Text>{formatPrice(order.pricing?.taxBreakdown?.sgst?.amount)}</Text>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between items-center">
                  <Text strong className="text-lg">Total Amount</Text>
                  <Title level={3} className="text-blue-600 mb-0">
                    {formatPrice(order.pricing?.finalAmount)}
                  </Title>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Track Order Modal */}
      <Modal
        title={<Title level={4}>Track Order</Title>}
        open={showTrackModal}
        onCancel={() => setShowTrackModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowTrackModal(false)}>
            Close
          </Button>
        ]}
        width={520}
        centered
      >
        {trackingLoading ? (
          <div className="py-8 text-center">
            <Spin tip="Loading tracking info..." />
          </div>
        ) : trackingData ? (
          <div className="space-y-4">
            {/* Order Status */}
            <Card size="small" className="bg-gray-50">
              <div className="flex items-center gap-2">
                <Text type="secondary">Order Status:</Text>
                <Tag color={getStatusConfig(trackingData.status)?.color}>
                  {trackingData.status?.toUpperCase() || 'N/A'}
                </Tag>
              </div>
              <div className="mt-1">
                <Text type="secondary" className="text-sm">
                  Placed on: {formatDate(trackingData.placedAt)}
                </Text>
              </div>
            </Card>

            {/* Shipment Details */}
            <Card size="small" className="bg-gray-50">
              <Title level={5}>Shipment Details</Title>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text type="secondary">Status:</Text>
                  <Tag color={getShipmentStatusConfig(trackingData.shipment?.status)?.color}>
                    {getShipmentStatusConfig(trackingData.shipment?.status)?.label}
                  </Tag>
                </div>
                {trackingData.shipment?.courier?.name && (
                  <div className="flex justify-between">
                    <Text type="secondary">Courier:</Text>
                    <Text strong>{trackingData.shipment.courier.name}</Text>
                  </div>
                )}
                {trackingData.shipment?.courier?.trackingNumber && (
                  <div className="flex justify-between">
                    <Text type="secondary">Tracking #:</Text>
                    <Text className="font-mono">{trackingData.shipment.courier.trackingNumber}</Text>
                  </div>
                )}
                {trackingData.shipment?.courier?.contact && (
                  <div className="flex justify-between">
                    <Text type="secondary">Courier Contact:</Text>
                    <Text>{trackingData.shipment.courier.contact}</Text>
                  </div>
                )}
                {trackingData.shipment?.estimatedDeliveryDate && (
                  <div className="flex justify-between">
                    <Text type="secondary">Estimated Delivery:</Text>
                    <Text strong>{formatDate(trackingData.shipment.estimatedDeliveryDate)}</Text>
                  </div>
                )}
                {trackingData.shipment?.actualDeliveryDate && (
                  <div className="flex justify-between">
                    <Text type="secondary">Delivered On:</Text>
                    <Text strong className="text-green-600">{formatDate(trackingData.shipment.actualDeliveryDate)}</Text>
                  </div>
                )}
                {trackingData.shipment?.otp && (
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <Text type="secondary">Delivery OTP:</Text>
                    <Text className="font-mono font-bold text-blue-600">{trackingData.shipment.otp}</Text>
                  </div>
                )}
              </div>
            </Card>

            {/* Delivery Address */}
            {trackingData.shipment?.deliveryAddress && (
              <Card size="small" className="bg-gray-50">
                <Title level={5}>Delivery Address</Title>
                <div className="space-y-1">
                  <Text strong>{trackingData.shipment.deliveryAddress.fullName}</Text>
                  <br />
                  <Text>{trackingData.shipment.deliveryAddress.phone}</Text>
                  <br />
                  <Text>{trackingData.shipment.deliveryAddress.addressLine}</Text>
                  <br />
                  <Text>
                    {trackingData.shipment.deliveryAddress.city}, {trackingData.shipment.deliveryAddress.state} - {trackingData.shipment.deliveryAddress.pincode}
                  </Text>
                </div>
              </Card>
            )}
          </div>
        ) : (
          <Empty description="No tracking information available" />
        )}
      </Modal>
    </div>
  )
}

export default OrderDetail
