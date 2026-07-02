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

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [currentPage, itemsPerPage, debouncedSearchTerm])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/admin/products', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearchTerm
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
    </div>
  )
}

export default AdminProducts