import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await axiosInstance.get(`/products/${id}`)
      setProduct(response.data)
    } catch (error) {
      console.error('Error fetching product:', error)
      navigate('/shop')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart')
      navigate('/login')
      return
    }

    if (quantity > product.inventory?.stockQty) {
      alert(`Only ${product.inventory?.stockQty} items in stock`)
      return
    }

    setAddingToCart(true)
    try {
      await axiosInstance.post('/cart/items', { productId: product._id, quantity })
      if (window.confirm('Item added to cart! Go to cart?')) {
        navigate('/cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert(error.response?.data?.message || 'Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  const getDiscountedPrice = () => {
    if (product?.discountfactor) {
      return product.basecost - (product.basecost * product.discountfactor)
    }
    return product?.basecost || 0
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

  if (!product) return null

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/shop')} className="mb-4 text-blue-600 hover:underline">
          ← Back to Shop
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Product Images */}
            <div className="md:w-1/2 p-8">
              <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-6xl">💊</span>
              </div>
              {product.images?.length > 1 && (
                <div className="flex gap-2 mt-4">
                  {product.images.map((_, idx) => (
                    <div key={idx} className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-blue-500">
                      <span className="text-2xl">🖼️</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="md:w-1/2 p-8">
              <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
              <p className="text-gray-500 mt-1">{product.brand}</p>

              <div className="flex items-center gap-2 mt-2">
                <span className="text-yellow-500">⭐</span>
                <span className="font-medium">{product.ratings?.average || 'N/A'}</span>
                <span className="text-gray-400">({product.ratings?.totalReviews || 0} reviews)</span>
              </div>

              <div className="mt-4">
                {product.discountfactor > 0 ? (
                  <div>
                    <span className="text-3xl font-bold text-blue-600">
                      {formatPrice(getDiscountedPrice())}
                    </span>
                    <span className="text-lg text-gray-400 line-through ml-2">
                      {formatPrice(product.basecost)}
                    </span>
                    <span className="ml-2 text-green-600">
                      {Math.round(product.discountfactor * 100)}% off
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-blue-600">
                    {formatPrice(product.basecost)}
                  </span>
                )}
              </div>

              <div className="mt-4">
                <p className="text-gray-600">{product.description}</p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Delivery:</div>
                <div className="text-gray-800">{product.estimatedDeliveryDays} days</div>
                <div className="text-gray-500">Availability:</div>
                <div className={product.isAvailable && product.inventory?.stockQty > 0 ? 'text-green-600' : 'text-red-600'}>
                  {product.isAvailable && product.inventory?.stockQty > 0 ? `In Stock (${product.inventory?.stockQty})` : 'Out of Stock'}
                </div>
              </div>

              {product.isAvailable && product.inventory?.stockQty > 0 && (
                <div className="mt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 border-r hover:bg-gray-100"
                      >-</button>
                      <span className="w-12 text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.inventory?.stockQty, quantity + 1))}
                        className="px-3 py-2 border-l hover:bg-gray-100"
                      >+</button>
                    </div>
                    <button
                      onClick={addToCart}
                      disabled={addingToCart}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {addingToCart ? 'Adding...' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              )}

              {!isAuthenticated && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
                  Please <button onClick={() => navigate('/login')} className="text-blue-600 underline">login</button> to add items to cart
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail