// pages/Checkout.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'
import {
  Layout,
  Row,
  Col,
  Card,
  Typography,
  Button,
  Form,
  Input,
  Select,
  Space,
  Divider,
  Spin,
  Steps,
  Alert,
  Radio,
  Table,
  Tag,
  Statistic,
  message,
  Modal,
  Result
} from 'antd'
import {
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  TruckOutlined,
  CreditCardOutlined,
  WalletOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  LockOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Step } = Steps
const { Option } = Select
const { TextArea } = Input

function Checkout() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
<<<<<<< HEAD:client/src/pages/Checkout.jsx
=======
  const [form] = Form.useForm()
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450:client/src/pages/checkout.jsx
  const [cartItems, setCartItems] = useState([])
  const [cartTotals, setCartTotals] = useState({ subtotal: 0, tax: 0, shipping: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [placingOrder, setPlacingOrder] = useState(false)
<<<<<<< HEAD:client/src/pages/Checkout.jsx
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('COD')
=======
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [currentStep, setCurrentStep] = useState(0)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState('')
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450:client/src/pages/checkout.jsx

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
      
      if (Array.isArray(data)) {
<<<<<<< HEAD:client/src/pages/Checkout.jsx
        // Production format: array of { productId: {...}, quantity }
=======
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450:client/src/pages/checkout.jsx
        items = data.map(item => ({
          productId: item.productId?._id || item.productId,
          name: item.productId?.name || 'Product',
          price: item.productId?.pricing?.finalPrice || 0,
<<<<<<< HEAD:client/src/pages/Checkout.jsx
          quantity: item.quantity || 0
        }))
        
        if (items.length === 0) {
=======
          quantity: item.quantity || 0,
          image: item.productId?.images?.[0] || ''
        }))
        
        if (items.length === 0) {
          message.warning('Your cart is empty')
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450:client/src/pages/checkout.jsx
          navigate('/cart')
          return
        }
        
        const subtotal = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0)
        const tax = subtotal * 0.05
        const shipping = subtotal > 500 ? 0 : 40
        const total = subtotal + tax + shipping
        setCartTotals({ subtotal, tax, shipping, total })
        
      } else if (data.items) {
<<<<<<< HEAD:client/src/pages/Checkout.jsx
        // Test server format
=======
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450:client/src/pages/checkout.jsx
        items = data.items || []
        if (items.length === 0) {
          navigate('/cart')
          return
        }
        setCartTotals({
          subtotal: data.subtotal || 0,
          tax: data.taxAmount || 0,
          shipping: data.shippingAmount || 0,
          total: data.totalAmount || 0
        })
      }
      
      setCartItems(items)
<<<<<<< HEAD:client/src/pages/Checkout.jsx
=======
      setCurrentStep(0)
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450:client/src/pages/checkout.jsx
    } catch (error) {
      console.error('Error fetching cart:', error)
      message.error('Failed to load cart')
      navigate('/cart')
    } finally {
      setLoading(false)
    }
  }

<<<<<<< HEAD:client/src/pages/Checkout.jsx
  const handleAddressChange = (e) => {
    setDeliveryAddress({
      ...deliveryAddress,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
    const required = ['fullName', 'phone', 'addressLine', 'city', 'state', 'pincode']
    for (const field of required) {
      if (!deliveryAddress[field]) {
        alert(`Please enter ${field}`)
        return false
      }
    }
    if (deliveryAddress.phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number')
      return false
    }
    if (deliveryAddress.pincode.length !== 6) {
      alert('Please enter a valid 6-digit pincode')
      return false
    }
    return true
=======
  const validateForm = async () => {
    try {
      await form.validateFields()
      return true
    } catch (error) {
      message.error('Please fill in all required fields')
      return false
    }
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450:client/src/pages/checkout.jsx
  }

  const placeOrder = async () => {
    if (!await validateForm()) return

    setPlacingOrder(true)
    try {
<<<<<<< HEAD:client/src/pages/Checkout.jsx
      const response = await axiosInstance.post('/orders/checkout', {
        deliveryAddress,
=======
      const values = form.getFieldsValue()
      const response = await axiosInstance.post('/orders/checkout', {
        deliveryAddress: {
          fullName: values.fullName,
          phone: values.phone,
          addressLine: values.addressLine,
          city: values.city,
          state: values.state,
          pincode: values.pincode
        },
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450:client/src/pages/checkout.jsx
        paymentMethod
      })
      
      if (response.data.success) {
        setOrderId(response.data.data?._id || 'ORD-' + Date.now())
        setOrderPlaced(true)
        setCurrentStep(2)
        message.success('Order placed successfully!')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      message.error(error.response?.data?.message || 'Failed to place order')
    } finally {
      setPlacingOrder(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const goToNextStep = async () => {
    if (currentStep === 0) {
      const valid = await validateForm()
      if (valid) {
        setCurrentStep(1)
      }
    }
  }

  const columns = [
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            {record.image ? (
              <img src={record.image} alt={record.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl">💊</span>
            )}
          </div>
          <div>
            <Text strong>{record.name || 'Product'}</Text>
            <div className="text-sm text-gray-500">
              {formatPrice(record.price || 0)} × {record.quantity}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Total',
      key: 'total',
      align: 'right',
      render: (_, record) => (
        <Text strong>{formatPrice((record.price || 0) * (record.quantity || 0))}</Text>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading checkout..." />
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-sm">
            <Result
              status="success"
              icon={<CheckCircleOutlined className="text-green-500" />}
              title="Order Placed Successfully!"
              subTitle={
                <div>
                  <Text>Your order has been confirmed and will be delivered soon.</Text>
                  <div className="mt-2">
                    <Tag color="blue" className="text-base px-4 py-1">
                      Order ID: {orderId}
                    </Tag>
                  </div>
                </div>
              }
              extra={[
                <Button 
                  type="primary" 
                  key="orders"
                  onClick={() => navigate('/orders')}
                >
                  View My Orders
                </Button>,
                <Button 
                  key="shop"
                  onClick={() => navigate('/shop')}
                >
                  Continue Shopping
                </Button>
              ]}
            />
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/cart')}
            className="text-blue-600"
          >
            Back to Cart
          </Button>
          <Title level={2} className="mb-0">Checkout</Title>
        </div>

<<<<<<< HEAD:client/src/pages/Checkout.jsx
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={deliveryAddress.fullName}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ayush Sharma"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={deliveryAddress.phone}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="9999999999"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Address Line *</label>
                  <input
                    type="text"
                    name="addressLine"
                    value={deliveryAddress.addressLine}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="B-42, Sector 62"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={deliveryAddress.city}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Noida"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={deliveryAddress.state}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Uttar Pradesh"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={deliveryAddress.pincode}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="201301"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Method</h2>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="COD">Cash on Delivery</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Credit/Debit Card</option>
              </select>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Items</h2>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex gap-3 pb-3 border-b">
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-xl">💊</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name || 'Product'}</p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.price || 0)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice((item.price || 0) * (item.quantity || 0))}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-3 border-b pb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatPrice(cartTotals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{cartTotals.shipping === 0 ? 'Free' : formatPrice(cartTotals.shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (5%)</span>
                  <span>{formatPrice(cartTotals.tax)}</span>
                </div>
              </div>
              
              <div className="flex justify-between mt-4 pt-2 border-t">
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatPrice(cartTotals.total)}
                </span>
              </div>
=======
        {/* Steps */}
        <Card className="mb-6 shadow-sm">
          <Steps current={currentStep}>
            <Step title="Address" icon={<HomeOutlined />} />
            <Step title="Payment" icon={<CreditCardOutlined />} />
            <Step title="Confirm" icon={<CheckCircleOutlined />} />
          </Steps>
        </Card>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            {/* Step 1: Address */}
            {currentStep === 0 && (
              <Card className="shadow-sm" title={<Title level={4}>Shipping Address</Title>}>
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    fullName: '',
                    phone: '',
                    addressLine: '',
                    city: '',
                    state: '',
                    pincode: ''
                  }}
                >
                  <Form.Item
                    name="fullName"
                    label="Full Name"
                    rules={[{ required: true, message: 'Please enter your full name' }]}
                  >
                    <Input placeholder="Ayush Sharma" size="large" />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[
                      { required: true, message: 'Please enter your phone number' },
                      { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }
                    ]}
                  >
                    <Input placeholder="9999999999" size="large" maxLength={10} />
                  </Form.Item>

                  <Form.Item
                    name="addressLine"
                    label="Address Line"
                    rules={[{ required: true, message: 'Please enter your address' }]}
                  >
                    <Input placeholder="B-42, Sector 62" size="large" />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col xs={24} sm={8}>
                      <Form.Item
                        name="city"
                        label="City"
                        rules={[{ required: true, message: 'Please enter your city' }]}
                      >
                        <Input placeholder="Noida" size="large" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Form.Item
                        name="state"
                        label="State"
                        rules={[{ required: true, message: 'Please enter your state' }]}
                      >
                        <Input placeholder="Uttar Pradesh" size="large" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Form.Item
                        name="pincode"
                        label="Pincode"
                        rules={[
                          { required: true, message: 'Please enter your pincode' },
                          { pattern: /^[0-9]{6}$/, message: 'Please enter a valid 6-digit pincode' }
                        ]}
                      >
                        <Input placeholder="201301" size="large" maxLength={6} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <div className="mt-4">
                    <Button
                      type="primary"
                      size="large"
                      onClick={goToNextStep}
                      block
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </Form>
              </Card>
            )}

            {/* Step 2: Payment */}
            {currentStep === 1 && (
              <Card className="shadow-sm" title={<Title level={4}>Payment Method</Title>}>
                <div className="space-y-4">
                  <Radio.Group
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full"
                  >
                    <div className="space-y-3">
                      <Radio value="COD" className="w-full p-3 border rounded-lg hover:border-blue-500 transition">
                        <div className="flex items-center gap-3">
                          <WalletOutlined className="text-xl text-green-600" />
                          <div>
                            <div className="font-medium">Cash on Delivery</div>
                            <div className="text-sm text-gray-500">Pay when you receive the order</div>
                          </div>
                        </div>
                      </Radio>
                      <Radio value="UPI" className="w-full p-3 border rounded-lg hover:border-blue-500 transition">
                        <div className="flex items-center gap-3">
                          <CreditCardOutlined className="text-xl text-purple-600" />
                          <div>
                            <div className="font-medium">UPI</div>
                            <div className="text-sm text-gray-500">Google Pay, PhonePe, Paytm</div>
                          </div>
                        </div>
                      </Radio>
                      <Radio value="CARD" className="w-full p-3 border rounded-lg hover:border-blue-500 transition">
                        <div className="flex items-center gap-3">
                          <CreditCardOutlined className="text-xl text-blue-600" />
                          <div>
                            <div className="font-medium">Credit/Debit Card</div>
                            <div className="text-sm text-gray-500">Visa, Mastercard, RuPay</div>
                          </div>
                        </div>
                      </Radio>
                    </div>
                  </Radio.Group>

                  <Divider />

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(0)}
                    >
                      Back
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      onClick={placeOrder}
                      loading={placingOrder}
                    >
                      Place Order
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </Col>

          {/* Order Summary Sidebar */}
          <Col xs={24} lg={8}>
            <Card className="shadow-sm sticky top-4" title="Order Summary">
              <Table
                columns={columns}
                dataSource={cartItems}
                rowKey="productId"
                pagination={false}
                size="small"
              />

              <Divider />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text type="secondary">Subtotal</Text>
                  <Text>{formatPrice(cartTotals.subtotal)}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">
                    <TruckOutlined className="mr-1" />
                    Shipping
                  </Text>
                  <Text>
                    {cartTotals.shipping === 0 ? (
                      <Tag color="green">Free</Tag>
                    ) : (
                      formatPrice(cartTotals.shipping)
                    )}
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Tax (5%)</Text>
                  <Text>{formatPrice(cartTotals.tax)}</Text>
                </div>
              </div>
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450:client/src/pages/checkout.jsx

              <Divider />

              <div className="flex justify-between items-center">
                <Text strong className="text-lg">Total</Text>
                <Text strong className="text-xl text-blue-600">
                  {formatPrice(cartTotals.total)}
                </Text>
              </div>

              {cartTotals.shipping === 0 && cartTotals.subtotal > 0 && (
                <Alert
                  message="Free Shipping"
                  description="You've qualified for free shipping!"
                  type="success"
                  showIcon
                  className="mt-4"
                />
              )}

              <div className="mt-4 flex items-center gap-2 text-center justify-center">
                <LockOutlined className="text-gray-400" />
                <Text type="secondary" className="text-xs">
                  Secure checkout • SSL encrypted
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default Checkout
