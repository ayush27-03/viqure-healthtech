import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from "../../services/axiosConfig"

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get('/admin/orders')
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/admin/orders/${id}`, { status })
      fetchOrders()
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'confirmed': return 'bg-purple-100 text-purple-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price)
  }

  const filteredOrders = orders.filter(order => {
    if (filter !== 'all' && order.status !== filter) return false
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return order.patientName?.toLowerCase().includes(searchLower) ||
             order._id.toLowerCase().includes(searchLower)
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
        <p className="text-gray-500">View and manage all customer orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>All</button>
            <button onClick={() => setFilter('pending')} className={`px-3 py-1 rounded-full text-sm ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}>Pending</button>
            <button onClick={() => setFilter('confirmed')} className={`px-3 py-1 rounded-full text-sm ${filter === 'confirmed' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}>Confirmed</button>
            <button onClick={() => setFilter('shipped')} className={`px-3 py-1 rounded-full text-sm ${filter === 'shipped' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Shipped</button>
            <button onClick={() => setFilter('delivered')} className={`px-3 py-1 rounded-full text-sm ${filter === 'delivered' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>Delivered</button>
            <button onClick={() => setFilter('cancelled')} className={`px-3 py-1 rounded-full text-sm ${filter === 'cancelled' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>Cancelled</button>
          </div>
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4">Order ID</th>
              <th className="text-left py-3 px-4">Customer</th>
              <th className="text-left py-3 px-4">Date</th>
              <th className="text-left py-3 px-4">Amount</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4 font-mono text-sm">{order._id.slice(-8)}</td>
                <td className="py-3 px-4">
                  <div className="font-medium">{order.patientName}</div>
                  <div className="text-xs text-gray-500">{order.patientEmail}</div>
                </td>
                <td className="py-3 px-4 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="py-3 px-4 font-medium">{formatPrice(order.pricing?.finalAmount)}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">No orders found</div>
        )}
      </div>
    </div>
  )
}

export default AdminOrders