import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'

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
      
      // Production returns array of { productId: {...}, quantity }
      // Your test server returns { items: [...], subtotal... }
      let items = []
      let totalsData = { subtotal: 0, tax: 0, shipping: 0, total: 0 }
      
      if (Array.isArray(data)) {
        // Production format: array of { productId: {...}, quantity }
        items = data.map(item => ({
          productId: item.productId?._id || item.productId,
          name: item.productId?.name || 'Product',
          price: item.productId?.pricing?.finalPrice || 0,
          image: item.productId?.images?.[0] || '',
          quantity: item.quantity || 0
        }))
        calculateTotals(items)
      } else if (data.items) {
        // Test server format: { items: [...], subtotal... }
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
    } catch (error) {
      console.error('Error updating quantity:', error)
      alert(error.response?.data?.message || 'Failed to update quantity')
    } finally {
      setUpdating({ ...updating, [productId]: false })
    }
  }

  const removeItem = async (productId) => {
    if (!window.confirm('Remove this item from cart?')) return

    setUpdating({ ...updating, [productId]: true })
    try {
      await axiosInstance.delete(`/users/me/cart/${productId}`)
      await fetchCart()
    } catch (error) {
      console.error('Error removing item:', error)
      alert('Failed to remove item')
    } finally {
      setUpdating({ ...updating, [productId]: false })
    }
  }

  const clearCart = async () => {
    if (!window.confirm('Clear entire cart?')) return

    try {
      await axiosInstance.delete('/users/me/cart')
      await fetchCart()
    } catch (error) {
      console.error('Error clearing cart:', error)
      alert('Failed to clear cart')
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

  const isEmpty = cartItems.length === 0

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
          {!isEmpty && (
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 transition"
            >
              Clear Cart
            </button>
          )}
        </div>

        {isEmpty ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added any items yet</p>
            <Link
              to="/shop"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.productId} className="bg-white rounded-lg shadow-lg p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">💊</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <Link to={`/product/${item.productId}`}>
                        <h3 className="font-semibold text-gray-800 hover:text-blue-600 transition">
                          {item.name || 'Product'}
                        </h3>
                      </Link>
                      <p className="text-blue-600 font-medium mt-1">
                        {formatPrice(item.price || 0)}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={updating[item.productId]}
                          className="w-8 h-8 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={updating[item.productId]}
                          className="w-8 h-8 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.productId)}
                          disabled={updating[item.productId]}
                          className="ml-4 text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        {formatPrice((item.price || 0) * (item.quantity || 0))}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
                
                <div className="space-y-3 border-b pb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (5%)</span>
                    <span className="font-medium">{formatPrice(totals.tax)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between mt-4 pt-2">
                  <span className="text-lg font-bold text-gray-800">Total</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatPrice(totals.total)}
                  </span>
                </div>

                <div className="mt-6 text-sm text-gray-500">
                  * Free shipping on orders above ₹500
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition text-center block font-medium"
                >
                  Proceed to Checkout
                </button>

                <Link
                  to="/shop"
                  className="w-full mt-3 text-center text-blue-600 hover:underline block"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
