import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)

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

      // Check if current user has a review for this product
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
    setReviewMessage('')
  }

  const handleSubmitReview = async () => {
    if (!reviewData.reviewText.trim()) {
      setReviewError('Please write a review')
      return
    }

    setSubmittingReview(true)
    setReviewError('')
    setReviewSuccess(false)
    setReviewMessage('')

    try {
      let response

      if (userReview) {
        // UPDATE existing review
        response = await axiosInstance.patch(`/reviews/${userReview._id}`, {
          rating: reviewData.rating,
          reviewText: reviewData.reviewText
        })
      } else {
        // CREATE new review
        response = await axiosInstance.post('/reviews', {
          targetType: 'PRODUCT',
          targetId: id,
          rating: reviewData.rating,
          reviewText: reviewData.reviewText
        })
      }

      setReviewSuccess(true)
      setReviewMessage(response.data.message || 'Review submitted successfully')
      setShowReviewForm(false)
      await fetchReviews()
      setReviewData({ rating: 5, reviewText: '' })

      setTimeout(() => setReviewSuccess(false), 3000)
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to submit review'
      setReviewError(errorMsg)
      setReviewSuccess(false)

      // If error is 409 (already reviewed), show the message
      if (error.response?.status === 409) {
        setReviewError(errorMsg)
      }
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleDeleteReview = async () => {
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
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
      </div>
    </div>
  )
}

export default ProductDetail
