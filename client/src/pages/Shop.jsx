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
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [debouncedMinPrice, setDebouncedMinPrice] = useState('')
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [cartItemCount, setCartItemCount] = useState(0)
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 1 })
  const [currentPage, setCurrentPage] = useState(1)
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  // Fetch categories on mount - ONLY ONCE
  useEffect(() => {
    fetchCategories()
  }, [])

  // Fetch categories from server
  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/categories')
      const data = response.data.data || response.data || []
      const mappedCategories = data.map(cat => ({
        _id: cat._id,
        name: cat.name,
        icon: cat.icon || '',
        description: cat.description || ''
      }))
      setCategories(mappedCategories)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    } finally {
      setCategoriesLoading(false)
    }
  }

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Debounce min price
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinPrice(minPrice)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [minPrice])

  // Debounce max price
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMaxPrice(maxPrice)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [maxPrice])

  // Reset page when category or sort changes
  useEffect(() => {
    if (selectedCategory) setCurrentPage(1)
  }, [selectedCategory])

  useEffect(() => {
    if (sortBy) setCurrentPage(1)
  }, [sortBy])

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts()
  }, [debouncedSearch, selectedCategory, debouncedMinPrice, debouncedMaxPrice, sortBy, currentPage])

  // Fetch cart count when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartCount()
    }
  }, [isAuthenticated])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (debouncedSearch) params.append('q', debouncedSearch)
      if (selectedCategory) params.append('categoryId', selectedCategory)
      if (debouncedMinPrice) params.append('minPrice', debouncedMinPrice)
      if (debouncedMaxPrice) params.append('maxPrice', debouncedMaxPrice)
      if (sortBy) params.append('sort', sortBy)
      if (currentPage) params.append('page', currentPage)
      params.append('limit', 20)

      const response = await axiosInstance.get(`/products?${params.toString()}`)
      const responseData = response.data.data || response.data
      const data = Array.isArray(responseData) ? responseData : []
      const paginationData = response.data.pagination || { total: data.length, page: 1, limit: 20, pages: 1 }
      
      const mappedProducts = data.map(item => ({
        _id: item._id,
        name: item.name,
        brand: item.inventory?.supplier || item.brand || '',
        category: item.categoryId?.name || '',
        categoryId: item.categoryId?._id || '',
        categoryIdObj: item.categoryId || null,
        description: item.description || '',
        images: item.images || [],
        finalPrice: item.pricing?.finalPrice || item.basecost || 0,
        mrp: item.pricing?.mrp || item.basecost || 0,
        discountPercentage: item.pricing?.discountPercentage || (item.discountfactor ? item.discountfactor * 100 : 0),
        stockCount: item.inventory?.stockCount || item.inventory?.stockQty || 0,
        isActive: item.isActive !== false,
        estimatedDeliveryDays: item.estimatedDeliveryDays || 3,
        ratings: item.ratings || { average: 0, totalReviews: 0 },
        specifications: item.specifications || {}
      }))
      
      setProducts(mappedProducts)
      setPagination(paginationData)
      
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCartCount = async () => {
    try {
      const response = await axiosInstance.get('/users/me/cart')
      const cartData = response.data.data || { items: [] }
      const items = cartData.items || []
      const count = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
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
      await axiosInstance.post('/users/me/cart', { productId, quantity })
      await fetchCartCount()
      alert('Item added to cart')
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert(error.response?.data?.message || 'Failed to add to cart')
    }
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.pages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (loading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
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
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sort By</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">
            Showing {products.length} of {pagination.total} products
          </p>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => {
                const isInStock = product.stockCount > 0 && product.isActive

                return (
                  <div key={product._id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden">
                    <Link to={`/product/${product._id}`}>
                      <div className="h-48 bg-gray-200 flex items-center justify-center">
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-4xl">💊</span>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link to={`/product/${product._id}`}>
                        <h3 className="font-semibold text-gray-800 hover:text-blue-600 transition">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500">{product.brand || product.category}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm font-medium">{product.ratings?.average || 'N/A'}</span>
                        <span className="text-xs text-gray-400">({product.ratings?.totalReviews || 0})</span>
                      </div>
                      <div className="mt-2">
                        {product.discountPercentage > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-blue-600">
                              {formatPrice(product.finalPrice)}
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              {formatPrice(product.mrp)}
                            </span>
                            <span className="text-xs text-green-600">
                              {Math.round(product.discountPercentage)}% off
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-blue-600">
                            {formatPrice(product.finalPrice)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => addToCart(product._id)}
                        disabled={!isInStock}
                        className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        {isInStock ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(pagination.pages).keys()].map((_, index) => {
                  const pageNum = index + 1
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.pages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`px-4 py-2 border rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return (
                      <span key={pageNum} className="px-2 text-gray-400">...</span>
                    )
                  }
                  return null
                })}
                
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Shop
