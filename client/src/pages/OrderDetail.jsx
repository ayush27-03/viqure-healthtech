import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'

function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

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
      setOrder(response.data)
    } catch (error) {
      console.error('Error fetching order:', error)
      navigate('/orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'confirmed': return 'bg-purple-100 text-purple-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/orders')} className="text-blue-600 hover:underline">
            ← Back to Orders
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Order Details</h1>
        </div>

        {/* Order Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-mono text-lg">{order._id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p>{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Order Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items?.map((item) => (
              <div key={item._id} className="flex gap-4 pb-4 border-b last:border-0">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-3xl">💊</span>
                </div>
                <div className="flex-1">
                  <Link to={`/product/${item.productID}`}>
                    <h3 className="font-semibold text-gray-800 hover:text-blue-600 transition">
                      {item.productSnapshot?.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500">{item.productSnapshot?.brand}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span>Quantity: {item.quantity}</span>
                    <span>Unit Price: {formatPrice(item.unitPrice)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{formatPrice(item.totalPrice)}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Status: <span className={getStatusColor(item.status)}>{item.status}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address & Payment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Shipping Address</h2>
            <div className="space-y-2">
              <p className="font-medium">{order.shippingAddress?.fullName}</p>
              <p className="text-gray-600">{order.shippingAddress?.phone}</p>
              <p className="text-gray-600">{order.shippingAddress?.addressLine}</p>
              <p className="text-gray-600">
                {order.shippingAddress?.city}, {order.shippingAddress?.state}
              </p>
              <p className="text-gray-600">Pincode: {order.shippingAddress?.pincode}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(order.pricing?.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Charge</span>
                <span>{order.pricing?.deliveryCharge === 0 ? 'Free' : formatPrice(order.pricing?.deliveryCharge)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="text-green-600">-{formatPrice(order.pricing?.discount)}</span>
              </div>
              <div className="border-t my-2 pt-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>CGST (2.5%)</span>
                  <span>{formatPrice(order.pricing?.taxBreakdown?.cgst?.amount)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>SGST (2.5%)</span>
                  <span>{formatPrice(order.pricing?.taxBreakdown?.sgst?.amount)}</span>
                </div>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-bold text-gray-800">Total Amount</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatPrice(order.pricing?.finalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail