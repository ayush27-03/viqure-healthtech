// pages/Shop.jsx - Fixed version
import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'
import Fuse from 'fuse.js'
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Spin,
  Empty,
  Badge,
  Pagination,
  Tag,
  Rate,
  Divider,
  Slider,
  Drawer,
  Grid,
  message
} from 'antd'
import {
  SearchOutlined,
  ShoppingCartOutlined,
  FilterOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'

const { Title, Text } = Typography
const { Option } = Select
const { useBreakpoint } = Grid

function Shop() {
  const { isAuthenticated } = useAuth()
  const [products, setProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [sortBy, setSortBy] = useState('')
  const [cartItemCount, setCartItemCount] = useState(0)
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 1 })
  const [currentPage, setCurrentPage] = useState(1)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const screens = useBreakpoint()
  const [addingToCart, setAddingToCart] = useState({})

  // ============ FUSE.JS INSTANCE ============
  const fuse = useMemo(() => {
    return new Fuse(allProducts, {
      keys: [
        { name: 'name', weight: 2 },
        { name: 'brand', weight: 1.5 },
        { name: 'category', weight: 1 },
        { name: 'description', weight: 0.5 }
      ],
      threshold: 0.35,
      includeScore: true,
      minMatchCharLength: 2,
      useExtendedSearch: true
    })
  }, [allProducts])

  // ============ FETCH DATA ON MOUNT ============
  useEffect(() => {
    fetchCategories()
    fetchProducts() // ← THIS WAS MISSING!
  }, [])

  // ============ APPLY FILTERS ON DEPENDENCY CHANGE ============
  useEffect(() => {
    // Only apply filters if products are loaded
    if (allProducts.length > 0) {
      applyFiltersAndSearch()
    }
  }, [searchTerm, selectedCategory, priceRange, sortBy])

  useEffect(() => {
    if (selectedCategory) setCurrentPage(1)
  }, [selectedCategory])

  useEffect(() => {
    if (sortBy) setCurrentPage(1)
  }, [sortBy])

  useEffect(() => {
    if (isAuthenticated) {
      fetchCartCount()
    }
  }, [isAuthenticated])

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

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/products')
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
      
      setAllProducts(mappedProducts)
      setProducts(mappedProducts)
      setPagination(paginationData)
      
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
      setAllProducts([])
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSearch = () => {
    let filtered = [...allProducts]

    // 1. Apply fuzzy search with Fuse.js
    if (searchTerm.trim()) {
      const results = fuse.search(searchTerm)
      filtered = results.map(result => result.item)
    }

    // 2. Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.categoryId === selectedCategory)
    }

    // 3. Filter by price range
    filtered = filtered.filter(product => 
      (product.finalPrice || 0) >= priceRange[0] && 
      (product.finalPrice || 0) <= priceRange[1]
    )

    // 4. Apply sorting
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => (a.finalPrice || 0) - (b.finalPrice || 0))
        break
      case 'price_desc':
        filtered.sort((a, b) => (b.finalPrice || 0) - (a.finalPrice || 0))
        break
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        break
    }

    setProducts(filtered)
    setPagination(prev => ({ 
      ...prev, 
      total: filtered.length, 
      pages: Math.ceil(filtered.length / (prev.limit || 20)) 
    }))
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
      message.warning('Please login to add items to cart')
      return
    }

    setAddingToCart(prev => ({ ...prev, [productId]: true }))
    try {
      await axiosInstance.post('/users/me/cart', { productId, quantity })
      await fetchCartCount()
      message.success('Item added to cart')
    } catch (error) {
      console.error('Error adding to cart:', error)
      message.error(error.response?.data?.message || 'Failed to add to cart')
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }))
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const renderProductCard = (product, index) => {
    const isInStock = product.stockCount > 0 && product.isActive
    const isAdding = addingToCart[product._id]

    return (
      <motion.div
        key={product._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -4 }}
      >
        <Card
          className="product-card h-full hover:shadow-xl transition-shadow duration-300"
          cover={
            <Link to={`/product/${product._id}`}>
              <div className="h-52 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name} 
                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-6xl text-gray-300">💊</span>
                )}
                {product.discountPercentage > 0 && (
                  <Tag color="red" className="absolute top-2 right-2">
                    {Math.round(product.discountPercentage)}% OFF
                  </Tag>
                )}
                {!isInStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Tag color="red" className="text-base font-bold px-4 py-2">
                      Out of Stock
                    </Tag>
                  </div>
                )}
              </div>
            </Link>
          }
          actions={[
            <Button
              type="primary"
              block
              onClick={() => addToCart(product._id)}
              loading={isAdding}
              disabled={!isInStock}
              icon={<ShoppingCartOutlined />}
              className="rounded-lg"
            >
              {isInStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          ]}
        >
          <Link to={`/product/${product._id}`}>
            <Title level={5} className="mb-0 hover:text-blue-600 transition-colors line-clamp-2">
              {product.name}
            </Title>
          </Link>
          
          <Text type="secondary" className="text-sm block">
            {product.brand || product.category}
          </Text>

          <div className="mt-2 flex items-center gap-2">
            <Rate disabled value={product.ratings?.average || 0} className="text-sm" />
            <Text type="secondary" className="text-xs">
              ({product.ratings?.totalReviews || 0})
            </Text>
          </div>

          <div className="mt-2 flex items-center gap-2">
            {product.discountPercentage > 0 ? (
              <>
                <Text strong className="text-lg text-blue-600">
                  {formatPrice(product.finalPrice)}
                </Text>
                <Text delete type="secondary" className="text-sm">
                  {formatPrice(product.mrp)}
                </Text>
              </>
            ) : (
              <Text strong className="text-lg text-blue-600">
                {formatPrice(product.finalPrice)}
              </Text>
            )}
          </div>

          {isInStock && (
            <div className="mt-1 flex items-center gap-1">
              <CheckCircleOutlined className="text-green-500 text-xs" />
              <Text type="secondary" className="text-xs">
                {product.stockCount} in stock
              </Text>
            </div>
          )}
        </Card>
      </motion.div>
    )
  }

  if (loading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading products..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div>
            <Title level={2} className="mb-0">Health Shop</Title>
            <Text type="secondary">Quality healthcare products at your fingertips</Text>
            {searchTerm && (
              <Tag color="blue" className="mt-2">
                Search: "{searchTerm}" → {products.length} results
              </Tag>
            )}
          </div>
          {isAuthenticated && (
            <Link to="/cart">
              <Badge count={cartItemCount} size="default">
                <Button type="primary" icon={<ShoppingCartOutlined />} size="large">
                  Cart
                </Button>
              </Badge>
            </Link>
          )}
        </div>

        {/* Filters Bar */}
        <Card className="shadow-sm mb-6">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Input
                placeholder="Search products..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="large"
                allowClear
                className="rounded-lg"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                placeholder="All Categories"
                size="large"
                className="w-full"
                allowClear
                loading={categoriesLoading}
              >
                <Option value="">All Categories</Option>
                {categories.map(cat => (
                  <Option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Select
                value={sortBy}
                onChange={setSortBy}
                placeholder="Sort By"
                size="large"
                className="w-full"
                allowClear
              >
                <Option value="">Sort By</Option>
                <Option value="price_asc">Price: Low to High</Option>
                <Option value="price_desc">Price: High to Low</Option>
                <Option value="name_asc">Name: A to Z</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Button 
                type="default" 
                size="large" 
                icon={<FilterOutlined />}
                onClick={() => setFilterDrawerOpen(true)}
                block
              >
                Filters
              </Button>
            </Col>
          </Row>

          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap justify-between items-center gap-2">
            <Text type="secondary" className="text-sm">
              Showing <Text strong>{products.length}</Text> of <Text strong>{allProducts.length}</Text> products
            </Text>
            {searchTerm && (
              <Tag closable onClose={() => setSearchTerm('')} color="blue">
                Search: {searchTerm}
              </Tag>
            )}
            {selectedCategory && (
              <Tag closable onClose={() => setSelectedCategory('')} color="green">
                {categories.find(c => c._id === selectedCategory)?.name}
              </Tag>
            )}
            {sortBy && (
              <Tag closable onClose={() => setSortBy('')} color="purple">
                {sortBy === 'price_asc' ? 'Low to High' : 
                 sortBy === 'price_desc' ? 'High to Low' : 
                 'A to Z'}
              </Tag>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 10000) && (
              <Tag closable onClose={() => setPriceRange([0, 10000])} color="orange">
                ₹{priceRange[0]} - ₹{priceRange[1]}
              </Tag>
            )}
          </div>
        </Card>

        {/* Filter Drawer */}
        <Drawer
          title="Filters"
          placement="right"
          onClose={() => setFilterDrawerOpen(false)}
          open={filterDrawerOpen}
          width={screens.xs ? '100%' : 360}
        >
          <div className="space-y-6">
            <div>
              <Text strong>Price Range</Text>
              <div className="mt-2">
                <Slider
                  range
                  min={0}
                  max={10000}
                  value={priceRange}
                  onChange={setPriceRange}
                  tooltip={{ formatter: value => `₹${value}` }}
                  step={100}
                />
                <div className="flex justify-between">
                  <Text type="secondary">₹{priceRange[0]}</Text>
                  <Text type="secondary">₹{priceRange[1]}</Text>
                </div>
              </div>
            </div>

            <Divider />

            <div>
              <Text strong>Categories</Text>
              <div className="mt-2 flex flex-wrap gap-2">
                <Tag
                  color={!selectedCategory ? 'blue' : 'default'}
                  className="cursor-pointer px-3 py-1"
                  onClick={() => setSelectedCategory('')}
                >
                  All
                </Tag>
                {categories.map(cat => (
                  <Tag
                    key={cat._id}
                    color={selectedCategory === cat._id ? 'blue' : 'default'}
                    className="cursor-pointer px-3 py-1"
                    onClick={() => {
                      setSelectedCategory(selectedCategory === cat._id ? '' : cat._id)
                    }}
                  >
                    {cat.icon} {cat.name}
                  </Tag>
                ))}
              </div>
            </div>

            <Divider />

            <div>
              <Text strong>Sort By</Text>
              <div className="mt-2 space-y-2">
                <Button
                  block
                  type={sortBy === '' ? 'primary' : 'default'}
                  onClick={() => setSortBy('')}
                >
                  Relevance
                </Button>
                <Button
                  block
                  type={sortBy === 'price_asc' ? 'primary' : 'default'}
                  onClick={() => setSortBy('price_asc')}
                >
                  Price: Low to High
                </Button>
                <Button
                  block
                  type={sortBy === 'price_desc' ? 'primary' : 'default'}
                  onClick={() => setSortBy('price_desc')}
                >
                  Price: High to Low
                </Button>
                <Button
                  block
                  type={sortBy === 'name_asc' ? 'primary' : 'default'}
                  onClick={() => setSortBy('name_asc')}
                >
                  Name: A to Z
                </Button>
              </div>
            </div>

            <Divider />

            <Button 
              type="primary" 
              block 
              size="large"
              onClick={() => setFilterDrawerOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </Drawer>

        {/* Products Grid */}
        {products.length === 0 ? (
          <Card className="shadow-sm py-8">
            <Empty
              description={
                <div>
                  <Title level={4}>No products found</Title>
                  <Text type="secondary">Try adjusting your search or filters</Text>
                  <div className="mt-4">
                    <Button 
                      type="primary"
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedCategory('')
                        setSortBy('')
                        setPriceRange([0, 10000])
                      }}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              }
            />
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map((product, index) => renderProductCard(product, index))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  current={currentPage}
                  total={pagination.total}
                  pageSize={pagination.limit || 20}
                  onChange={setCurrentPage}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total) => `Total ${total} products`}
                  size={screens.xs ? 'small' : 'default'}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Shop