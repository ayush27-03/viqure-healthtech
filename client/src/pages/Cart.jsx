// pages/Cart.jsx
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  Divider,
  Empty,
  Spin,
  InputNumber,
  Popconfirm,
  message,
  Image,
  Table,
  Tag,
  Statistic,
  Alert
} from 'antd'
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  ArrowLeftOutlined,
  ShoppingOutlined,
  TruckOutlined,
  PercentageOutlined,
  CloseCircleOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

function Cart() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState({})
  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, shipping: 0, total: 0 })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchCart()
  }, [isAuthenticated])

  const fetchCart = async () => {
    try {
      const response = await axiosInstance.get('/users/me/cart')
      const data = response.data.data || []
      
      let items = []
      let totalsData = { subtotal: 0, tax: 0, shipping: 0, total: 0 }
      
      if (Array.isArray(data)) {
        items = data.map(item => ({
          productId: item.productId?._id || item.productId,
          name: item.productId?.name || 'Product',
          price: item.productId?.pricing?.finalPrice || 0,
          image: item.productId?.images?.[0] || '',
          quantity: item.quantity || 0
        }))
        calculateTotals(items)
      } else if (data.items) {
        items = data.items || []
        setCartItems(items)
        if (data.subtotal !== undefined) {
          setTotals({
            subtotal: data.subtotal || 0,
            tax: data.taxAmount || 0,
            shipping: data.shippingAmount || 0,
            total: data.totalAmount || 0
          })
        } else {
          calculateTotals(items)
        }
      }
      
      setCartItems(items)
    } catch (error) {
      console.error('Error fetching cart:', error)
      setCartItems([])
      message.error('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0)
    const tax = subtotal * 0.05
    const shipping = subtotal > 500 ? 0 : 40
    const total = subtotal + tax + shipping
    setTotals({ subtotal, tax, shipping, total })
  }

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(productId)
      return
    }

    setUpdating({ ...updating, [productId]: true })
    try {
      await axiosInstance.patch(`/users/me/cart/${productId}`, { quantity: newQuantity })
      await fetchCart()
      message.success('Quantity updated')
    } catch (error) {
      console.error('Error updating quantity:', error)
      message.error(error.response?.data?.message || 'Failed to update quantity')
    } finally {
      setUpdating({ ...updating, [productId]: false })
    }
  }

  const removeItem = async (productId) => {
    setUpdating({ ...updating, [productId]: true })
    try {
      await axiosInstance.delete(`/users/me/cart/${productId}`)
      await fetchCart()
      message.success('Item removed from cart')
    } catch (error) {
      console.error('Error removing item:', error)
      message.error('Failed to remove item')
    } finally {
      setUpdating({ ...updating, [productId]: false })
    }
  }

  const clearCart = async () => {
    try {
      await axiosInstance.delete('/users/me/cart')
      await fetchCart()
      message.success('Cart cleared')
    } catch (error) {
      console.error('Error clearing cart:', error)
      message.error('Failed to clear cart')
    }
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
      title: 'Product',
      key: 'product',
      render: (_, record) => (
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            {record.image ? (
              <Image
                src={record.image}
                alt={record.name}
                width={64}
                height={64}
                className="object-cover"
                preview={false}
              />
            ) : (
              <span className="text-2xl">💊</span>
            )}
          </div>
          <div>
            <Link to={`/product/${record.productId}`}>
              <Text strong className="hover:text-blue-600 transition-colors">
                {record.name || 'Product'}
              </Text>
            </Link>
            <div className="text-sm text-gray-500">
              {formatPrice(record.price || 0)}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Quantity',
      key: 'quantity',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<MinusOutlined />}
            onClick={() => updateQuantity(record.productId, record.quantity - 1)}
            disabled={updating[record.productId] || record.quantity <= 1}
          />
          <span className="w-8 text-center font-medium">{record.quantity}</span>
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => updateQuantity(record.productId, record.quantity + 1)}
            disabled={updating[record.productId]}
          />
        </Space>
      ),
    },
    {
      title: 'Total',
      key: 'total',
      align: 'right',
      render: (_, record) => (
        <Text strong className="text-blue-600">
          {formatPrice((record.price || 0) * (record.quantity || 0))}
        </Text>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Popconfirm
          title="Remove item?"
          description="Are you sure you want to remove this item from your cart?"
          onConfirm={() => removeItem(record.productId)}
          okText="Yes"
          cancelText="No"
          placement="left"
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            loading={updating[record.productId]}
          />
        </Popconfirm>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading your cart..." />
      </div>
    )
  }

  const isEmpty = cartItems.length === 0

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div>
            <Title level={2} className="mb-0">
              <ShoppingCartOutlined className="mr-2" />
              Shopping Cart
            </Title>
            {!isEmpty && (
              <Text type="secondary">
                {cartItems.length} item{cartItems.length > 1 ? 's' : ''} in your cart
              </Text>
            )}
          </div>
          {!isEmpty && (
            <Popconfirm
              title="Clear Cart"
              description="Are you sure you want to remove all items from your cart?"
              onConfirm={clearCart}
              okText="Yes"
              cancelText="No"
            >
              <Button danger icon={<CloseCircleOutlined />}>
                Clear Cart
              </Button>
            </Popconfirm>
          )}
        </div>

        {isEmpty ? (
          <Card className="shadow-sm py-8">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Title level={4}>Your cart is empty</Title>
                  <Text type="secondary">Looks like you haven't added any items yet</Text>
                  <div className="mt-4">
                    <Button
                      type="primary"
                      size="large"
                      icon={<ShoppingOutlined />}
                      onClick={() => navigate('/shop')}
                    >
                      Start Shopping
                    </Button>
                  </div>
                </div>
              }
            />
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {/* Cart Items */}
            <Col xs={24} lg={16}>
              <Card className="shadow-sm">
                <Table
                  columns={columns}
                  dataSource={cartItems}
                  rowKey="productId"
                  pagination={false}
                  size="middle"
                  className="cart-table"
                />
              </Card>

              <div className="mt-4">
                <Button
                  type="link"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/shop')}
                  className="text-blue-600"
                >
                  Continue Shopping
                </Button>
              </div>
            </Col>

            {/* Order Summary */}
            <Col xs={24} lg={8}>
              <Card className="shadow-sm sticky top-4" title="Order Summary">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Text type="secondary">Subtotal</Text>
                    <Text strong>{formatPrice(totals.subtotal)}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text type="secondary">
                      <TruckOutlined className="mr-1" />
                      Shipping
                    </Text>
                    <Text strong>
                      {totals.shipping === 0 ? (
                        <Tag color="green">Free</Tag>
                      ) : (
                        formatPrice(totals.shipping)
                      )}
                    </Text>
                  </div>
                  <div className="flex justify-between">
                    <Text type="secondary">
                      <PercentageOutlined className="mr-1" />
                      Tax (5%)
                    </Text>
                    <Text strong>{formatPrice(totals.tax)}</Text>
                  </div>
                </div>

                <Divider />

                <div className="flex justify-between items-center">
                  <Title level={4} className="mb-0">Total</Title>
                  <Title level={3} className="mb-0 text-blue-600">
                    {formatPrice(totals.total)}
                  </Title>
                </div>

                {totals.shipping === 0 && totals.subtotal > 0 && (
                  <Alert
                    message="Free Shipping"
                    description="You've qualified for free shipping!"
                    type="success"
                    showIcon
                    className="mt-4"
                  />
                )}

                {totals.shipping > 0 && (
                  <Alert
                    message={`Add ₹${500 - totals.subtotal} more for free shipping`}
                    description="Spend ₹500 or more to get free shipping"
                    type="info"
                    showIcon
                    className="mt-4"
                  />
                )}

                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={() => navigate('/checkout')}
                  className="mt-4 h-12 text-base font-semibold"
                >
                  Proceed to Checkout
                </Button>

                <div className="mt-3 text-center">
                  <Text type="secondary" className="text-xs">
                    Secure checkout • SSL encrypted
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </div>
  )
}

export default Cart