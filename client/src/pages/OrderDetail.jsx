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
      navigate('/orders')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    
    setActionLoading(true)
    try {
      await axiosInstance.patch(`/orders/${id}/cancel`, {})
      alert('Order cancelled successfully')
      await fetchOrder()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel order')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReturnOrder = async () => {
    if (!window.confirm('Are you sure you want to return this order?')) return
    
    setActionLoading(true)
    try {
      await axiosInstance.patch(`/orders/${id}/return`, {})
      alert('Return request submitted successfully')
      await fetchOrder()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to return order')
    } finally {
      setActionLoading(false)
    }
  }

  const handleTrackOrder = async () => {
    setShowTrackModal(true)
    setTrackingLoading(true)
    try {
      const response = await axiosInstance.get(`/orders/${id}/track`)
      setTrackingData(response.data.data || response.data)
    } catch (error) {
      console.error('Error fetching tracking:', error)
      alert('Failed to fetch tracking information')
      setShowTrackModal(false)
    } finally {
      setTrackingLoading(false)
    }
  }

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
  }

  const getShipmentStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-gray-100 text-gray-800',
      'DISPATCHED': 'bg-blue-100 text-blue-800',
      'IN_TRANSIT': 'bg-purple-100 text-purple-800',
      'OUT_FOR_DELIVERY': 'bg-orange-100 text-orange-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'FAILED': 'bg-red-100 text-red-800',
      'RETURNED': 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!order) return null

  const deliveryAddress = order.shipmentDetails?.deliveryAddress || order.shippingAddress || {}
  const status = order?.status
  const isCancellable = status === 'pending' || status === 'confirmed'
  const isReturnable = status === 'delivered'
  const isTrackable = true

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/orders')} className="text-blue-600 hover:underline">
            ← Back to Orders
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Order Details</h1>
        </div>

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

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items?.map((item) => (
              <div key={item._id || item.productId} className="flex gap-4 pb-4 border-b last:border-0">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  {item.productSnapshot?.image ? (
                    <img src={item.productSnapshot.image} alt={item.productSnapshot.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-3xl">💊</span>
                  )}
                </div>
                <div className="flex-1">
                  <Link to={`/product/${item.productId}`}>
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
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Shipping Address</h2>
            <div className="space-y-2">
              <p className="font-medium">{deliveryAddress.fullName}</p>
              <p className="text-gray-600">{deliveryAddress.phone}</p>
              <p className="text-gray-600">{deliveryAddress.addressLine}</p>
              <p className="text-gray-600">
                {deliveryAddress.city}, {deliveryAddress.state}
              </p>
              <p className="text-gray-600">Pincode: {deliveryAddress.pincode}</p>
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

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          {isCancellable && (
            <button
              onClick={handleCancelOrder}
              disabled={actionLoading}
              className="px-6 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50"
            >
              {actionLoading ? 'Processing...' : 'Cancel Order'}
            </button>
          )}
          
          {isReturnable && (
            <button
              onClick={handleReturnOrder}
              disabled={actionLoading}
              className="px-6 py-2 rounded-lg text-white bg-orange-600 hover:bg-orange-700 transition disabled:opacity-50"
            >
              {actionLoading ? 'Processing...' : 'Return Order'}
            </button>
          )}
          
          {isTrackable && (
            <button
              onClick={handleTrackOrder}
              className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition"
            >
              Track Order
            </button>
          )}
        </div>
      </div>

      {/* Track Order Modal */}
      {showTrackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Track Order</h2>
              <button
                onClick={() => setShowTrackModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6">
              {trackingLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading tracking info...</p>
                </div>
              ) : trackingData ? (
                <div className="space-y-4">
                  {/* Order Status */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Order Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trackingData.status)}`}>
                        {trackingData.status?.toUpperCase() || 'N/A'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Placed on: {formatDate(trackingData.placedAt)}
                    </p>
                  </div>

                  {/* Shipment Status */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Shipment Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getShipmentStatusColor(trackingData.shipment?.status)}`}>
                          {trackingData.shipment?.status || 'N/A'}
                        </span>
                      </div>
                      {trackingData.shipment?.courier?.name && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Courier:</span>
                          <span className="font-medium">{trackingData.shipment.courier.name}</span>
                        </div>
                      )}
                      {trackingData.shipment?.courier?.trackingNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Tracking #:</span>
                          <span className="font-mono">{trackingData.shipment.courier.trackingNumber}</span>
                        </div>
                      )}
                      {trackingData.shipment?.courier?.contact && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Courier Contact:</span>
                          <span>{trackingData.shipment.courier.contact}</span>
                        </div>
                      )}
                      {trackingData.shipment?.estimatedDeliveryDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Estimated Delivery:</span>
                          <span className="font-medium">{formatDate(trackingData.shipment.estimatedDeliveryDate)}</span>
                        </div>
                      )}
                      {trackingData.shipment?.actualDeliveryDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Delivered On:</span>
                          <span className="font-medium text-green-600">{formatDate(trackingData.shipment.actualDeliveryDate)}</span>
                        </div>
                      )}
                      {trackingData.shipment?.otp && (
                        <div className="flex justify-between border-t pt-2 mt-2">
                          <span className="text-gray-500">Delivery OTP:</span>
                          <span className="font-mono font-bold text-blue-600">{trackingData.shipment.otp}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {trackingData.shipment?.deliveryAddress && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-700 mb-2">Delivery Address</h3>
                      <div className="text-sm space-y-1">
                        <p className="font-medium">{trackingData.shipment.deliveryAddress.fullName}</p>
                        <p className="text-gray-600">{trackingData.shipment.deliveryAddress.phone}</p>
                        <p className="text-gray-600">{trackingData.shipment.deliveryAddress.addressLine}</p>
                        <p className="text-gray-600">
                          {trackingData.shipment.deliveryAddress.city}, {trackingData.shipment.deliveryAddress.state} - {trackingData.shipment.deliveryAddress.pincode}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No tracking information available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetail
