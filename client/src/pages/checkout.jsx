import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'

function Checkout() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [cartTotals, setCartTotals] = useState({ subtotal: 0, tax: 0, shipping: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('COD')

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
        // Production format: array of { productId: {...}, quantity }
        items = data.map(item => ({
          productId: item.productId?._id || item.productId,
          name: item.productId?.name || 'Product',
          price: item.productId?.pricing?.finalPrice || 0,
          quantity: item.quantity || 0
        }))
        
        if (items.length === 0) {
          navigate('/cart')
          return
        }
        
        const subtotal = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0)
        const tax = subtotal * 0.05
        const shipping = subtotal > 500 ? 0 : 40
        const total = subtotal + tax + shipping
        setCartTotals({ subtotal, tax, shipping, total })
        
      } else if (data.items) {
        // Test server format
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
    } catch (error) {
      console.error('Error fetching cart:', error)
      navigate('/cart')
    } finally {
      setLoading(false)
    }
  }

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
  }

  const placeOrder = async () => {
    if (!validateForm()) return

    setPlacingOrder(true)
    try {
      const response = await axiosInstance.post('/orders/checkout', {
        deliveryAddress,
        paymentMethod
      })
      
      if (response.data.success) {
        alert('Order placed successfully!')
        navigate('/orders')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert(error.response?.data?.message || 'Failed to place order')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/cart')} className="text-blue-600 hover:underline">
            ← Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
        </div>

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

              <button
                onClick={placeOrder}
                disabled={placingOrder}
                className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {placingOrder ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
