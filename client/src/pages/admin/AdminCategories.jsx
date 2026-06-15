import React, { useState, useEffect } from 'react'
import axiosInstance from "../../services/axiosConfig"

function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', image: '' })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/admin/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await axiosInstance.put(`/admin/categories/${editing._id}`, formData)
      } else {
        await axiosInstance.post('/admin/categories', formData)
      }
      setShowForm(false)
      setEditing(null)
      setFormData({ name: '', description: '', image: '' })
      fetchCategories()
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this category?')) {
      try {
        await axiosInstance.delete(`/admin/categories/${id}`)
        fetchCategories()
      } catch (error) {
        console.error('Error deleting category:', error)
      }
    }
  }

  const handleEdit = (category) => {
    setEditing(category)
    setFormData({ name: category.name, description: category.description || '', image: category.image || '' })
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Category Management</h2>
          <p className="text-gray-500">Manage product categories</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setFormData({ name: '', description: '', image: '' }) }} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
          + Add Category
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{editing ? 'Edit Category' : 'New Category'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Image URL</label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="/images/categories/example.jpg"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                {editing ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat._id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📁</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{cat.name}</h3>
                <p className="text-sm text-gray-500">{cat.slug}</p>
                <p className="text-xs text-gray-400 mt-1">{cat.productCount || 0} products</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:text-blue-800">Edit</button>
                <button onClick={() => handleDelete(cat._id)} className="text-red-600 hover:text-red-800">Delete</button>
              </div>
            </div>
            {cat.description && <p className="text-sm text-gray-600 mt-2">{cat.description.substring(0, 80)}...</p>}
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">No categories yet. Create your first category!</div>
      )}
    </div>
  )
}

export default AdminCategories