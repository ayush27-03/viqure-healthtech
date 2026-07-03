// pages/ProductDetail.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'
import {
  Layout,
  Row,
  Col,
  Card,
  Image,
  Typography,
  Button,
  Space,
  Rate,
  Tag,
  Divider,
  Spin,
  InputNumber,
  Alert,
  Breadcrumb,
  Tabs,
  List,
  Avatar,
  Empty,
  Modal,
  Form,
  Input,
  message,
  Badge,
  Statistic,
  Descriptions,
  Skeleton,
  Tooltip
} from 'antd'
import {
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
  StarOutlined,
  StarFilled,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  SafetyCertificateOutlined,
  LeftOutlined,
  RightOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs
const { TextArea } = Input

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  // Reviews state
  const [reviews, setReviews] = useState([])
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, totalReviews: 0 })
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewData, setReviewData] = useState({ rating: 5, reviewText: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState(false)
  const [userReview, setUserReview] = useState(null)

  // Reviews state
  const [reviews, setReviews] = useState([])
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, totalReviews: 0 })
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewData, setReviewData] = useState({ rating: 5, reviewText: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')
  const [userReview, setUserReview] = useState(null)

  useEffect(() => {
    fetchProduct()
    fetchReviews()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await axiosInstance.get(`/products/${id}`)
      setProduct(response.data.data || response.data)
    } catch (error) {
      console.error('Error fetching product:', error)
      message.error('Product not found')
      navigate('/shop')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    setLoadingReviews(true)
    try {
      const response = await axiosInstance.get(`/reviews?targetType=PRODUCT&targetId=${id}`)
      const data = response.data.data || []
      const summary = response.data.summary || { averageRating: 0, totalReviews: 0 }

      const mappedReviews = data.map(review => ({
        _id: review._id,
        reviewerId: review.reviewerId?._id,
        reviewerName: review.reviewerId?.profile ?
          `${review.reviewerId.profile.firstName || ''} ${review.reviewerId.profile.lastName || ''}`.trim() : 'Anonymous',
        rating: review.rating || 0,
        comment: review.reviewText || '',
        createdAt: review.createdAt || ''
      }))

      setReviews(mappedReviews)
      setReviewSummary(summary)

<<<<<<< HEAD
      // Check if current user has a review for this product
=======
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
      if (isAuthenticated && user?._id) {
        const existingUserReview = mappedReviews.find(r => r.reviewerId === user._id)
        setUserReview(existingUserReview)
        if (existingUserReview) {
          setReviewData({
            rating: existingUserReview.rating,
            reviewText: existingUserReview.comment
          })
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviews([])
      setReviewSummary({ averageRating: 0, totalReviews: 0 })
    } finally {
      setLoadingReviews(false)
    }
  }

  const handleOpenReviewForm = () => {
    if (userReview) {
      setReviewData({
        rating: userReview.rating,
        reviewText: userReview.comment
      })
    } else {
      setReviewData({ rating: 5, reviewText: '' })
    }
    setShowReviewForm(true)
    setReviewError('')
    setReviewSuccess(false)
<<<<<<< HEAD
    setReviewMessage('')
=======
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
  }

  const handleSubmitReview = async () => {
    if (!reviewData.reviewText.trim()) {
      setReviewError('Please write a review')
      return
    }

    setSubmittingReview(true)
    setReviewError('')
    setReviewSuccess(false)
<<<<<<< HEAD
    setReviewMessage('')
=======
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450

    try {
      let response

      if (userReview) {
<<<<<<< HEAD
        // UPDATE existing review
=======
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
        response = await axiosInstance.patch(`/reviews/${userReview._id}`, {
          rating: reviewData.rating,
          reviewText: reviewData.reviewText
        })
      } else {
<<<<<<< HEAD
        // CREATE new review
=======
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
        response = await axiosInstance.post('/reviews', {
          targetType: 'PRODUCT',
          targetId: id,
          rating: reviewData.rating,
          reviewText: reviewData.reviewText
        })
      }

      setReviewSuccess(true)
<<<<<<< HEAD
      setReviewMessage(response.data.message || 'Review submitted successfully')
=======
      message.success(response.data.message || 'Review submitted successfully')
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
      setShowReviewForm(false)
      await fetchReviews()
      setReviewData({ rating: 5, reviewText: '' })

      setTimeout(() => setReviewSuccess(false), 3000)
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to submit review'
      setReviewError(errorMsg)
<<<<<<< HEAD
      setReviewSuccess(false)

      // If error is 409 (already reviewed), show the message
      if (error.response?.status === 409) {
        setReviewError(errorMsg)
      }
=======
      message.error(errorMsg)
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleDeleteReview = async () => {
<<<<<<< HEAD
    if (!window.confirm('Are you sure you want to delete your review?')) return

    try {
      await axiosInstance.delete(`/reviews/${userReview._id}`)
      setUserReview(null)
      setReviewData({ rating: 5, reviewText: '' })
      await fetchReviews()
      alert('Review deleted successfully')
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete review')
    }
=======
    Modal.confirm({
      title: 'Delete Review',
      content: 'Are you sure you want to delete your review?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        try {
          await axiosInstance.delete(`/reviews/${userReview._id}`)
          setUserReview(null)
          setReviewData({ rating: 5, reviewText: '' })
          await fetchReviews()
          message.success('Review deleted successfully')
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to delete review')
        }
      }
    })
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
  }

  const addToCart = async () => {
    if (!isAuthenticated) {
      message.warning('Please login to add items to cart')
      navigate('/login')
      return
    }

    const stock = product.inventory?.stockCount || product.inventory?.stockQty || 0
    if (quantity > stock) {
<<<<<<< HEAD
      alert(`Only ${stock} items in stock`)
=======
      message.error(`Only ${stock} items in stock`)
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
      return
    }

    setAddingToCart(true)
    try {
      await axiosInstance.post('/users/me/cart', { productId: product._id, quantity })
<<<<<<< HEAD
      if (window.confirm('Item added to cart! Go to cart?')) {
        navigate('/cart')
      }
=======
      message.success('Item added to cart!')
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
    } catch (error) {
      console.error('Error adding to cart:', error)
      message.error(error.response?.data?.message || 'Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

<<<<<<< HEAD
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
=======
  const getFinalPrice = () => product?.pricing?.finalPrice || product?.basecost || 0
  const getMrp = () => product?.pricing?.mrp || product?.basecost || 0
  const getDiscountPercentage = () => product?.pricing?.discountPercentage || product?.discountfactor * 100 || 0
  const getStock = () => product?.inventory?.stockCount || product?.inventory?.stockQty || 0
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450

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
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading product..." />
      </div>
    )
  }

  if (!product) return null

  const finalPrice = getFinalPrice()
  const mrp = getMrp()
  const discount = getDiscountPercentage()
  const stock = getStock()
  const isInStock = stock > 0 && product.isActive !== false
<<<<<<< HEAD

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
=======
  const images = product.images || []

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item>
            <a onClick={() => navigate('/')}>Home</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <a onClick={() => navigate('/shop')}>Shop</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
        </Breadcrumb>

        <Row gutter={[24, 24]}>
          {/* Product Images */}
          <Col xs={24} md={10}>
            <Card className="shadow-sm">
              <div className="relative">
                <Image
                  src={images[activeImage] || 'https://via.placeholder.com/400x400?text=No+Image'}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-lg"
                  fallback="https://via.placeholder.com/400x400?text=No+Image"
                />
                {discount > 0 && (
                  <Tag color="red" className="absolute top-2 right-2 text-base font-bold px-3 py-1">
                    {Math.round(discount)}% OFF
                  </Tag>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer border-2 transition-all flex-shrink-0 overflow-hidden ${
                        activeImage === idx ? 'border-blue-600' : 'border-transparent hover:border-blue-300'
                      }`}
                      onClick={() => setActiveImage(idx)}
                    >
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
                      <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>

<<<<<<< HEAD
            <div className="md:w-1/2 p-8">
              <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
              <p className="text-gray-500 mt-1">{product.categoryId?.name || product.brand || ''}</p>

              <div className="flex items-center gap-2 mt-2">
                <span className="text-yellow-500">⭐</span>
                <span className="font-medium">{reviewSummary.averageRating || product.ratings?.average || 'N/A'}</span>
                <span className="text-gray-400">({reviewSummary.totalReviews || product.ratings?.totalReviews || 0} reviews)</span>
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
=======
          {/* Product Info */}
          <Col xs={24} md={14}>
            <Card className="shadow-sm">
              <Title level={3} className="mb-0">{product.name}</Title>
              <Text type="secondary" className="block">
                {product.categoryId?.name || product.brand || ''}
              </Text>

              <div className="mt-2 flex items-center gap-2">
                <Rate disabled value={reviewSummary.averageRating || product.ratings?.average || 0} allowHalf />
                <Text type="secondary">
                  ({reviewSummary.totalReviews || product.ratings?.totalReviews || 0} reviews)
                </Text>
              </div>

              <Divider />

              <div className="flex items-center gap-3">
                <Title level={2} className="text-blue-600 mb-0">
                  {formatPrice(finalPrice)}
                </Title>
                {discount > 0 && (
                  <>
                    <Text delete type="secondary" className="text-lg">
                      {formatPrice(mrp)}
                    </Text>
                    <Tag color="green" className="text-sm font-bold">
                      {Math.round(discount)}% off
                    </Tag>
                  </>
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
                )}
              </div>

              <Divider />

<<<<<<< HEAD
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
=======
              <Paragraph>{product.description}</Paragraph>

              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <>
                  <Divider />
                  <Title level={5}>Specifications</Title>
                  <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <Descriptions.Item key={key} label={key.replace(/([A-Z])/g, ' $1').trim()}>
                        {value}
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                </>
              )}

              <Divider />

              <Row gutter={[16, 16]}>
                <Col xs={12}>
                  <div className="flex items-center gap-2">
                    <TruckOutlined className="text-gray-400" />
                    <div>
                      <Text strong>Delivery</Text>
                      <div className="text-sm text-gray-500">
                        {product.estimatedDeliveryDays || '3-5'} days
                      </div>
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
                    </div>
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="flex items-center gap-2">
                    <CheckCircleOutlined className={isInStock ? 'text-green-500' : 'text-red-500'} />
                    <div>
                      <Text strong>Availability</Text>
                      <div className={`text-sm ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
                        {isInStock ? `In Stock (${stock})` : 'Out of Stock'}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              <Divider />

              {isInStock && (
                <Space size="middle" className="w-full">
                  <Space size="small">
                    <Button
                      icon={<MinusOutlined />}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    />
                    <InputNumber
                      min={1}
                      max={stock}
                      value={quantity}
                      onChange={(value) => setQuantity(value || 1)}
                      className="w-16 text-center"
                    />
                    <Button
                      icon={<PlusOutlined />}
                      onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                      disabled={quantity >= stock}
                    />
                  </Space>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={addToCart}
                    loading={addingToCart}
                    className="flex-1"
                  >
                    Add to Cart
                  </Button>
                </Space>
              )}

              {!isAuthenticated && (
                <Alert
                  message="Please login to add items to cart"
                  type="info"
                  showIcon
                  className="mt-4"
                  action={
                    <Button size="small" type="primary" onClick={() => navigate('/login')}>
                      Login
                    </Button>
                  }
                />
              )}
<<<<<<< HEAD
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Customer Reviews</h3>
            <div className="text-sm text-gray-600">
              ⭐ {reviewSummary.averageRating.toFixed(1)} ({reviewSummary.totalReviews} reviews)
            </div>
          </div>

          {isAuthenticated && (
            <div className="mb-4">
              {userReview ? (
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleOpenReviewForm}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    Edit Your Review
                  </button>
                  <button
                    onClick={handleDeleteReview}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    Delete Your Review
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleOpenReviewForm}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Write a Review
                </button>
              )}
            </div>
          )}

          {reviewSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-green-600 text-sm">{reviewMessage}</p>
            </div>
          )}

          {showReviewForm && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border">
              <h4 className="font-semibold text-gray-800 mb-3">
                {userReview ? 'Edit Your Review' : 'Write Your Review'}
              </h4>

              <div className="mb-3">
                <label className="block text-gray-700 text-sm font-medium mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className={`text-2xl transition ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-gray-700 text-sm font-medium mb-1">Review</label>
                <textarea
                  value={reviewData.reviewText}
                  onChange={(e) => setReviewData({ ...reviewData, reviewText: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your experience with this product..."
                />
              </div>

              {reviewError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                  <p className="text-red-600 text-sm">{reviewError}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : (userReview ? 'Update Review' : 'Submit Review')}
                </button>
                <button
                  onClick={() => {
                    setShowReviewForm(false)
                    setReviewError('')
                    if (userReview) {
                      setReviewData({
                        rating: userReview.rating,
                        reviewText: userReview.comment
                      })
                    } else {
                      setReviewData({ rating: 5, reviewText: '' })
                    }
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {loadingReviews ? (
            <div className="text-center py-8 text-gray-500">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="border-b pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800">{review.reviewerName}</span>
                    <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                    {review.reviewerId === user?._id && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">You</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-600 mt-1">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
=======
            </Card>
          </Col>
        </Row>

        {/* Reviews Section */}
        <Card className="shadow-sm mt-6">
          <Tabs defaultActiveKey="reviews">
            <TabPane tab={`Reviews (${reviewSummary.totalReviews})`} key="reviews">
              <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                <div>
                  <Title level={4} className="mb-1">Customer Reviews</Title>
                  <Space align="center">
                    <Rate disabled value={reviewSummary.averageRating} allowHalf />
                    <Text strong className="text-lg">{reviewSummary.averageRating.toFixed(1)}</Text>
                    <Text type="secondary">({reviewSummary.totalReviews} reviews)</Text>
                  </Space>
                </div>
                {isAuthenticated && (
                  <div className="flex gap-2">
                    {userReview ? (
                      <>
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          onClick={handleOpenReviewForm}
                        >
                          Edit Review
                        </Button>
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={handleDeleteReview}
                        >
                          Delete
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="primary"
                        onClick={handleOpenReviewForm}
                      >
                        Write a Review
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {showReviewForm && (
                <Card className="bg-gray-50 mb-4">
                  <Title level={5}>{userReview ? 'Edit Your Review' : 'Write Your Review'}</Title>
                  <Form layout="vertical">
                    <Form.Item label="Rating">
                      <Rate
                        value={reviewData.rating}
                        onChange={(value) => setReviewData({ ...reviewData, rating: value })}
                      />
                    </Form.Item>
                    <Form.Item label="Review">
                      <TextArea
                        rows={4}
                        value={reviewData.reviewText}
                        onChange={(e) => setReviewData({ ...reviewData, reviewText: e.target.value })}
                        placeholder="Share your experience with this product..."
                        maxLength={500}
                        showCount
                      />
                    </Form.Item>
                    {reviewError && (
                      <Alert message={reviewError} type="error" showIcon className="mb-3" />
                    )}
                    <Space>
                      <Button
                        type="primary"
                        onClick={handleSubmitReview}
                        loading={submittingReview}
                      >
                        {userReview ? 'Update Review' : 'Submit Review'}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowReviewForm(false)
                          setReviewError('')
                          if (userReview) {
                            setReviewData({
                              rating: userReview.rating,
                              reviewText: userReview.comment
                            })
                          } else {
                            setReviewData({ rating: 5, reviewText: '' })
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </Space>
                  </Form>
                </Card>
              )}

              {loadingReviews ? (
                <div className="py-8">
                  <Skeleton active avatar paragraph={{ rows: 3 }} />
                  <Skeleton active avatar paragraph={{ rows: 3 }} />
                </div>
              ) : reviews.length === 0 ? (
                <Empty
                  description="No reviews yet. Be the first to review this product!"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <List
                  itemLayout="vertical"
                  dataSource={reviews}
                  renderItem={(review) => (
                    <List.Item>
                      <div className="flex items-start gap-3">
                        <Avatar className="bg-blue-100 text-blue-600">
                          {review.reviewerName.charAt(0).toUpperCase()}
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Text strong>{review.reviewerName}</Text>
                            {review.reviewerId === user?._id && (
                              <Tag color="blue" className="text-xs">You</Tag>
                            )}
                            <Text type="secondary" className="text-sm">
                              {formatDate(review.createdAt)}
                            </Text>
                          </div>
                          <Rate disabled value={review.rating} className="text-sm" />
                          <Paragraph className="mt-1 mb-0">{review.comment}</Paragraph>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </TabPane>

            <TabPane tab="Details" key="details">
              <Descriptions column={{ xs: 1, sm: 2 }} bordered>
                <Descriptions.Item label="Name">{product.name}</Descriptions.Item>
                <Descriptions.Item label="Category">{product.categoryId?.name || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Brand">{product.brand || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Price">{formatPrice(finalPrice)}</Descriptions.Item>
                {discount > 0 && (
                  <Descriptions.Item label="MRP">{formatPrice(mrp)}</Descriptions.Item>
                )}
                <Descriptions.Item label="Stock">{stock} units</Descriptions.Item>
                <Descriptions.Item label="Delivery">{product.estimatedDeliveryDays || '3-5'} days</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={isInStock ? 'green' : 'red'}>
                    {isInStock ? 'In Stock' : 'Out of Stock'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
          </Tabs>
        </Card>
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
      </div>
    </div>
  )
}

export default ProductDetail
