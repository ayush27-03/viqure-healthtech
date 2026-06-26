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
      setProduct(response.data.data || response.data)
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

    const stock = product.inventory?.stockCount || product.inventory?.stockQty || 0
    if (quantity > stock) {
      alert(`Only ${stock} items in stock`)
      return
    }

    setAddingToCart(true)
    try {
      await axiosInstance.post('/users/me/cart', { productId: product._id, quantity })
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

  const getFinalPrice = () => {
    return product.pricing?.finalPrice || product.basecost || 0
  }

  const getMrp = () => {
    return product.pricing?.mrp || product.basecost || 0
  }

  const getDiscountPercentage = () => {
    return product.pricing?.discountPercentage || product.discountfactor * 100 || 0
  }

  const getStock = () => {
    return product.inventory?.stockCount || product.inventory?.stockQty || 0
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

  const finalPrice = getFinalPrice()
  const mrp = getMrp()
  const discount = getDiscountPercentage()
  const stock = getStock()
  const isInStock = stock > 0 && product.isActive !== false

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/shop')} className="mb-4 text-blue-600 hover:underline">
          ← Back to Shop
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 p-8">
              <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <span className="text-6xl">💊</span>
                )}
              </div>
              {product.images?.length > 1 && (
                <div className="flex gap-2 mt-4">
                  {product.images.map((img, idx) => (
                    <div key={idx} className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-blue-500 overflow-hidden">
                      <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="md:w-1/2 p-8">
              <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
              <p className="text-gray-500 mt-1">{product.categoryId?.name || product.brand || ''}</p>

              <div className="flex items-center gap-2 mt-2">
                <span className="text-yellow-500">⭐</span>
                <span className="font-medium">{product.ratings?.average || 'N/A'}</span>
                <span className="text-gray-400">({product.ratings?.totalReviews || 0} reviews)</span>
              </div>

              <div className="mt-4">
                {discount > 0 ? (
                  <div>
                    <span className="text-3xl font-bold text-blue-600">
                      {formatPrice(finalPrice)}
                    </span>
                    <span className="text-lg text-gray-400 line-through ml-2">
                      {formatPrice(mrp)}
                    </span>
                    <span className="ml-2 text-green-600">
                      {Math.round(discount)}% off
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-blue-600">
                    {formatPrice(finalPrice)}
                  </span>
                )}
              </div>

              <div className="mt-4">
                <p className="text-gray-600">{product.description}</p>
              </div>

              {product.specifications && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Specifications</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <React.Fragment key={key}>
                        <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="text-gray-800">{value}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Delivery:</div>
                <div className="text-gray-800">{product.estimatedDeliveryDays || '3-5'} days</div>
                <div className="text-gray-500">Availability:</div>
                <div className={isInStock ? 'text-green-600' : 'text-red-600'}>
                  {isInStock ? `In Stock (${stock})` : 'Out of Stock'}
                </div>
              </div>

              {isInStock && (
                <div className="mt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 border-r hover:bg-gray-100"
                      >-</button>
                      <span className="w-12 text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(stock, quantity + 1))}
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
