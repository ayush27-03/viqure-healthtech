// pages/admin/AdminCategories.jsx
import React, { useState, useEffect } from 'react'
import axiosInstance from "../../services/axiosConfig"
import {
  Card,
  Typography,
  Button,
  Input,
  Form,
  Modal,
  Table,
  Space,
  Tag,
  message,
  Spin,
  Popconfirm,
  Row,
  Col,
  Avatar,
  Tooltip
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  PictureOutlined,
  FileTextOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', image: '' })
  const [form] = Form.useForm()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/admin/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      message.error('Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editing) {
        await axiosInstance.put(`/admin/categories/${editing._id}`, values)
        message.success('Category updated successfully')
      } else {
        await axiosInstance.post('/admin/categories', values)
        message.success('Category created successfully')
      }
      setShowForm(false)
      setEditing(null)
      form.resetFields()
      fetchCategories()
    } catch (error) {
      console.error('Error saving category:', error)
      message.error('Failed to save category')
    }
  }

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/admin/categories/${id}`)
      fetchCategories()
      message.success('Category deleted successfully')
    } catch (error) {
      console.error('Error deleting category:', error)
      message.error('Failed to delete category')
    }
  }

  const handleEdit = (category) => {
    setEditing(category)
    form.setFieldsValue({
      name: category.name,
      description: category.description || '',
      image: category.image || ''
    })
    setShowForm(true)
  }

  const columns = [
    {
      title: 'Category',
      key: 'category',
      render: (_, record) => (
        <Space>
          <Avatar icon={<FolderOutlined />} className="bg-purple-100 text-purple-600" />
          <div>
            <Text strong>{record.name}</Text>
            <div className="text-xs text-gray-400">{record.slug}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || <Text type="secondary">No description</Text>
    },
    {
      title: 'Products',
      dataIndex: 'productCount',
      key: 'productCount',
      render: (count) => <Tag color="blue">{count || 0} items</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="text-blue-600"
          />
          <Popconfirm
            title="Delete Category"
            description="Are you sure you want to delete this category?"
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
          <Title level={2} className="mb-0">Category Management</Title>
          <Text type="secondary">Manage product categories</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setShowForm(true)
            setEditing(null)
            form.resetFields()
          }}
          className="bg-purple-600"
        >
          Add Category
        </Button>
      </div>

      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} categories`
          }}
          locale={{ emptyText: 'No categories yet. Create your first category!' }}
        />
      </Card>

      <Modal
        title={editing ? 'Edit Category' : 'New Category'}
        open={showForm}
        onCancel={() => {
          setShowForm(false)
          setEditing(null)
          form.resetFields()
        }}
        footer={null}
        width={520}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input size="large" placeholder="Category name" className="rounded-xl" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea
              rows={3}
              placeholder="Category description"
              className="rounded-xl"
            />
          </Form.Item>

          <Form.Item
            name="image"
            label="Image URL"
          >
            <Input
              size="large"
              placeholder="/images/categories/example.jpg"
              className="rounded-xl"
            />
          </Form.Item>

          <div className="flex gap-3">
            <Button
              type="primary"
              htmlType="submit"
              className="bg-green-600"
            >
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

export default AdminCategories