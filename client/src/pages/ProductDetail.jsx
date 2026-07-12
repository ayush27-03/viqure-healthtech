/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
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
  }

  const handleSubmitReview = async () => {
    if (!reviewData.reviewText.trim()) {
      setReviewError('Please write a review')
      return
    }

    setSubmittingReview(true)
    setReviewError('')
    setReviewSuccess(false)

    try {
      let response

      if (userReview) {
        response = await axiosInstance.patch(`/reviews/${userReview._id}`, {
          rating: reviewData.rating,
          reviewText: reviewData.reviewText
        })
      } else {
        response = await axiosInstance.post('/reviews', {
          targetType: 'PRODUCT',
          targetId: id,
          rating: reviewData.rating,
          reviewText: reviewData.reviewText
        })
      }

      setReviewSuccess(true)
      message.success(response.data.message || 'Review submitted successfully')
      setShowReviewForm(false)
      await fetchReviews()
      setReviewData({ rating: 5, reviewText: '' })

      setTimeout(() => setReviewSuccess(false), 3000)
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to submit review'
      setReviewError(errorMsg)
      message.error(errorMsg)
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleDeleteReview = async () => {
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
  }

  const addToCart = async () => {
    if (!isAuthenticated) {
      message.warning('Please login to add items to cart')
      navigate('/login')
      return
    }

    const stock = product.inventory?.stockCount || product.inventory?.stockQty || 0
    if (quantity > stock) {
      message.error(`Only ${stock} items in stock`)
      return
    }

    setAddingToCart(true)
    try {
      await axiosInstance.post('/users/me/cart', { productId: product._id, quantity })
      message.success('Item added to cart!')
    } catch (error) {
      console.error('Error adding to cart:', error)
      message.error(error.response?.data?.message || 'Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  const getFinalPrice = () => product?.pricing?.finalPrice || product?.basecost || 0
  const getMrp = () => product?.pricing?.mrp || product?.basecost || 0
  const getDiscountPercentage = () => product?.pricing?.discountPercentage || product?.discountfactor * 100 || 0
  const getStock = () => product?.inventory?.stockCount || product?.inventory?.stockQty || 0

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
                      <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>

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
                )}
              </div>

              <Divider />

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
      </div>
    </div>
  )
}

export default ProductDetail
