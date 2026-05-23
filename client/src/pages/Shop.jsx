import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'

function Shop() {
  const { isAuthenticated } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [sortBy, setSortBy] = useState('')
  const [cartItemCount, setCartItemCount] = useState(0)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [searchTerm, selectedCategory, priceRange, sortBy])

  // Fetch cart count when authenticated and on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartCount()
    }
  }, [isAuthenticated])

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (priceRange.min) params.append('minPrice', priceRange.min)
      if (priceRange.max) params.append('maxPrice', priceRange.max)
      if (sortBy) params.append('sort', sortBy)

      const response = await axiosInstance.get(`/products?${params.toString()}`)
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchCartCount = async () => {
    try {
      const response = await axiosInstance.get('/cart')
      const count = response.data?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
      setCartItemCount(count)
    } catch (error) {
      console.error('Error fetching cart count:', error)
      setCartItemCount(0)
    }
  }

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart')
      return
    }

    try {
      await axiosInstance.post('/cart/items', { productId, quantity })
      await fetchCartCount()  // Refresh cart count after adding
      alert('Item added to cart')
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert(error.response?.data?.message || 'Failed to add to cart')
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
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Cart Icon */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Health Shop</h1>
          {isAuthenticated && (
            <Link to="/cart" className="relative">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                🛒 Cart
                {cartItemCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </Link>
          )}
        </div>

        {/* Rest of your component remains the same */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min Price"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sort By</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => {
              const discountedPrice = product.discountfactor 
                ? product.basecost - (product.basecost * product.discountfactor)
                : product.basecost

              return (
                <div key={product._id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden">
                  <Link to={`/product/${product.slug || product._id}`}>
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-4xl">💊</span>
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link to={`/product/${product.slug || product._id}`}>
                      <h3 className="font-semibold text-gray-800 hover:text-blue-600 transition">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500">{product.brand}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm font-medium">{product.ratings?.average || 'N/A'}</span>
                      <span className="text-xs text-gray-400">({product.ratings?.totalReviews || 0})</span>
                    </div>
                    <div className="mt-2">
                      {product.discountfactor > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-blue-600">
                            {formatPrice(discountedPrice)}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(product.basecost)}
                          </span>
                          <span className="text-xs text-green-600">
                            {Math.round(product.discountfactor * 100)}% off
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-blue-600">
                          {formatPrice(product.basecost)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(product._id)}
                      disabled={!product.isAvailable}
                      className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {product.isAvailable ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Shop