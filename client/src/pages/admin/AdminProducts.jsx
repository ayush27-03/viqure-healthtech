import React, { useState, useEffect } from 'react'
import axiosInstance from "../../services/axiosConfig"

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    description: '',
    basecost: '',
    discountfactor: '',
    stockQty: '',
    estimatedDeliveryDays: '3',
    images: []
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [currentPage, itemsPerPage])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/admin/products', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm
        }
      })
      setProducts(response.data.products || response.data)
      setTotalItems(response.data.total || response.data.length || 0)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/admin/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await axiosInstance.put(`/admin/products/${editing._id}`, formData)
      } else {
        await axiosInstance.post('/admin/products', {
          ...formData,
          basecost: parseFloat(formData.basecost),
          discountfactor: parseFloat(formData.discountfactor) || 0,
          inventory: { stockQty: parseInt(formData.stockQty) }
        })
      }
      setShowForm(false)
      setEditing(null)
      setFormData({
        name: '', brand: '', category: '', description: '',
        basecost: '', discountfactor: '', stockQty: '', estimatedDeliveryDays: '3', images: []
      })
      fetchProducts()
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        await axiosInstance.delete(`/admin/products/${id}`)
        fetchProducts()
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  const toggleAvailability = async (product) => {
    try {
      await axiosInstance.put(`/admin/products/${product._id}`, {
        isAvailable: !product.isAvailable
      })
      fetchProducts()
    } catch (error) {
      console.error('Error toggling availability:', error)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price)
  }

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        setCurrentPage(1) // Reset to first page on search
        fetchProducts()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Calculate pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage + 1
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems)

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
          <p className="text-gray-500">Manage your product catalog</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setFormData({ name: '', brand: '', category: '', description: '', basecost: '', discountfactor: '', stockQty: '', estimatedDeliveryDays: '3', images: [] }) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Product
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products by name, brand, category, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(''); setCurrentPage(1); fetchProducts() }}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-500">
            Found {totalItems} product{totalItems !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{editing ? 'Edit Product' : 'New Product'}</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Base Price (₹)</label>
                    <input
                      type="number"
                      value={formData.basecost}
                      onChange={(e) => setFormData({ ...formData, basecost: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Discount (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discountfactor}
                      onChange={(e) => setFormData({ ...formData, discountfactor: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Stock Quantity</label>
                    <input
                      type="number"
                      value={formData.stockQty}
                      onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Delivery Days</label>
                    <input
                      type="number"
                      value={formData.estimatedDeliveryDays}
                      onChange={(e) => setFormData({ ...formData, estimatedDeliveryDays: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    {editing ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4">Product</th>
                <th className="text-left py-3 px-4">Brand</th>
                <th className="text-left py-3 px-4">Price</th>
                <th className="text-left py-3 px-4">Stock</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.category?.name}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{product.brand || '-'}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{formatPrice(product.basecost)}</div>
                    {product.discountfactor > 0 && (
                      <div className="text-xs text-green-600">{Math.round(product.discountfactor * 100)}% off</div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={product.inventory?.stockQty < (product.inventory?.lowStockThreshold || 10) ? 'text-red-600' : 'text-gray-600'}>
                      {product.inventory?.stockQty || 0}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleAvailability(product)}
                      className={`px-2 py-1 rounded-full text-xs ${product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {product.isAvailable ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => { setEditing(product); setFormData({ ...product, stockQty: product.inventory?.stockQty }); setShowForm(true) }} className="text-blue-600 hover:text-blue-800 mr-3">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-800">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No products match your search' : 'No products found'}
          </div>
        )}
        
        {/* Pagination Controls */}
        {totalItems > 0 && (
          <div className="px-4 py-3 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              Showing {startIndex} to {endIndex} of {totalItems} products
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
              >
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 rounded border ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-2 py-1">...</span>
                    <button
                      onClick={() => goToPage(totalPages)}
                      className="px-3 py-1 rounded border bg-white hover:bg-gray-50"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
              >
                Next
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminProducts
