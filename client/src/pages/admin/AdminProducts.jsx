// pages/admin/AdminProducts.jsx - Fixed with debounce
import React, { useState, useEffect, useCallback } from 'react'
import axiosInstance from "../../services/axiosConfig"
import {
  Card,
  Typography,
  Table,
  Input,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  InputNumber,
  message,
  Spin,
  Popconfirm,
  Switch,
  Avatar,
  Row,
  Col,
  Badge
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  DollarOutlined,
  TagOutlined,
  BoxPlotOutlined,
  CalendarOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
<<<<<<< HEAD
  
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
=======
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [form] = Form.useForm()

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1) // Reset to first page on search
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450

  useEffect(() => {
    fetchProducts()
    fetchCategories()
<<<<<<< HEAD
  }, [currentPage, itemsPerPage])
=======
  }, [currentPage, itemsPerPage, debouncedSearchTerm])
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/admin/products', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
<<<<<<< HEAD
          search: searchTerm
=======
          search: debouncedSearchTerm
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
        }
      })
      setProducts(response.data.products || response.data)
      setTotalItems(response.data.total || response.data.length || 0)
    } catch (error) {
      console.error('Error fetching products:', error)
      message.error('Failed to fetch products')
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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editing) {
        await axiosInstance.put(`/admin/products/${editing._id}`, {
          ...values,
          basecost: parseFloat(values.basecost),
          discountfactor: parseFloat(values.discountfactor) || 0,
          inventory: { stockQty: parseInt(values.stockQty) }
        })
        message.success('Product updated successfully')
      } else {
        await axiosInstance.post('/admin/products', {
          ...values,
          basecost: parseFloat(values.basecost),
          discountfactor: parseFloat(values.discountfactor) || 0,
          inventory: { stockQty: parseInt(values.stockQty) }
        })
        message.success('Product created successfully')
      }
      setShowForm(false)
      setEditing(null)
      form.resetFields()
      fetchProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      message.error('Failed to save product')
    }
  }

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/admin/products/${id}`)
      fetchProducts()
      message.success('Product deleted successfully')
    } catch (error) {
      console.error('Error deleting product:', error)
      message.error('Failed to delete product')
    }
  }

  const toggleAvailability = async (product) => {
    try {
      await axiosInstance.put(`/admin/products/${product._id}`, {
        isAvailable: !product.isAvailable
      })
      fetchProducts()
      message.success(`Product ${product.isAvailable ? 'deactivated' : 'activated'}`)
    } catch (error) {
      console.error('Error toggling availability:', error)
      message.error('Failed to update availability')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const columns = [
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => (
        <Space>
          <Avatar icon={<BoxPlotOutlined />} className="bg-blue-100 text-blue-600" />
          <div>
            <Text strong>{record.name}</Text>
            <div className="text-xs text-gray-400">{record.category?.name || 'No category'}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
      render: (brand) => brand || '-'
    },
    {
      title: 'Price',
      key: 'price',
      render: (_, record) => (
        <div>
          <Text strong className="text-blue-600">{formatPrice(record.basecost)}</Text>
          {record.discountfactor > 0 && (
            <Tag color="green" className="ml-1">{Math.round(record.discountfactor * 100)}% off</Tag>
          )}
        </div>
      )
    },
    {
      title: 'Stock',
      dataIndex: ['inventory', 'stockQty'],
      key: 'stock',
      render: (stock, record) => (
        <Badge
          count={stock || 0}
          style={{
            backgroundColor: stock < (record.inventory?.lowStockThreshold || 10) ? '#ff4d4f' : '#52c41a'
          }}
        />
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Switch
          checked={record.isAvailable}
          onChange={() => toggleAvailability(record)}
          checkedChildren={<CheckCircleOutlined />}
          unCheckedChildren={<CloseCircleOutlined />}
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(record)
              form.setFieldsValue({
                ...record,
                stockQty: record.inventory?.stockQty
              })
              setShowForm(true)
            }}
            className="text-blue-600"
          />
          <Popconfirm
            title="Delete Product"
            description="Are you sure you want to delete this product?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ]

  // Clear search handler
  const handleClearSearch = () => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
    setCurrentPage(1)
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
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} className="mb-0">Product Management</Title>
          <Text type="secondary">Manage your product catalog</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null)
            form.resetFields()
            setShowForm(true)
          }}
        >
          Add Product
        </Button>
      </div>

<<<<<<< HEAD
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
=======
      <Card className="shadow-sm mb-6">
        <Space wrap className="w-full" size="middle">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-80 rounded-xl"
            allowClear
            onClear={handleClearSearch}
          />
          <Button icon={<ReloadOutlined />} onClick={() => {
            handleClearSearch()
            fetchProducts()
          }}>
            Refresh
          </Button>
          {searchTerm && (
            <Text type="secondary">
              Found {totalItems} product{totalItems !== 1 ? 's' : ''}
              <Button type="link" size="small" onClick={handleClearSearch}>
                Clear
              </Button>
            </Text>
          )}
        </Space>
      </Card>
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450

      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={products}
          rowKey="_id"
          pagination={{
            current: currentPage,
            pageSize: itemsPerPage,
            total: totalItems,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} products`,
            onChange: (page, size) => {
              setCurrentPage(page)
              setItemsPerPage(size)
            },
            pageSizeOptions: ['5', '10', '20', '50']
          }}
          scroll={{ x: true }}
        />
      </Card>

      <Modal
        title={editing ? 'Edit Product' : 'New Product'}
        open={showForm}
        onCancel={() => {
          setShowForm(false)
          setEditing(null)
          form.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input size="large" placeholder="Product name" className="rounded-xl" />
          </Form.Item>

          <Form.Item name="brand" label="Brand">
            <Input size="large" placeholder="Brand name" className="rounded-xl" />
          </Form.Item>

          <Form.Item name="category" label="Category">
            <Select size="large" placeholder="Select category" className="rounded-xl">
              <Option value="">No Category</Option>
              {categories.map(cat => (
                <Option key={cat._id} value={cat._id}>{cat.name}</Option>
              ))}
<<<<<<< HEAD
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
=======
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Product description" className="rounded-xl" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="basecost"
                label="Base Price (₹)"
                rules={[{ required: true, message: 'Please enter price' }]}
              >
                <InputNumber
                  size="large"
                  min={0}
                  step={10}
                  prefix={<DollarOutlined className="text-gray-400" />}
                  className="w-full rounded-xl"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="discountfactor"
                label="Discount (%)"
              >
                <InputNumber
                  size="large"
                  min={0}
                  max={100}
                  step={1}
                  prefix={<TagOutlined className="text-gray-400" />}
                  className="w-full rounded-xl"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="stockQty"
                label="Stock Quantity"
                rules={[{ required: true, message: 'Please enter stock quantity' }]}
              >
                <InputNumber
                  size="large"
                  min={0}
                  step={1}
                  prefix={<BoxPlotOutlined className="text-gray-400" />}
                  className="w-full rounded-xl"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="estimatedDeliveryDays"
                label="Delivery Days"
              >
                <InputNumber
                  size="large"
                  min={1}
                  max={30}
                  step={1}
                  prefix={<CalendarOutlined className="text-gray-400" />}
                  className="w-full rounded-xl"
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex gap-3">
            <Button type="primary" htmlType="submit" className="bg-green-600">
              {editing ? 'Update' : 'Create'}
            </Button>
            <Button
              onClick={() => {
                setShowForm(false)
                setEditing(null)
                form.resetFields()
              }}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </Modal>
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
    </div>
  )
}

export default AdminProducts
