// components/NotificationBell.jsx
import React, { useState, useEffect } from 'react'
import { Badge, Dropdown, Button, Typography, Space, Divider, Empty } from 'antd'
import { BellOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import axiosInstance from '../services/axiosConfig'

const { Text } = Typography

function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get('/admin/notifications')
      setNotifications(response.data || [])
      setUnreadCount((response.data || []).filter(n => !n.read).length)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = async (id) => {
    try {
      await axiosInstance.put(`/admin/notifications/${id}/read`)
      fetchNotifications()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await axiosInstance.put('/admin/notifications/read-all')
      fetchNotifications()
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'doctor_approval': return '👨‍⚕️'
      case 'new_order': return '📦'
      case 'new_appointment': return '📅'
      default: return '🔔'
    }
  }

  const menuItems = [
    {
      key: 'header',
      label: (
        <div className="flex justify-between items-center py-1 px-2">
          <Text strong>Notifications</Text>
          {unreadCount > 0 && (
            <Button 
              type="link" 
              size="small" 
              onClick={(e) => {
                e.stopPropagation()
                markAllAsRead()
              }}
              className="text-blue-500"
            >
              Mark all read
            </Button>
          )}
        </div>
      ),
      disabled: true
    },
    { type: 'divider' },
    ...(notifications.length === 0 ? [
      {
        key: 'empty',
        label: (
          <div className="py-8 text-center">
            <Text type="secondary">No notifications</Text>
          </div>
        ),
        disabled: true
      }
    ] : notifications.slice(0, 10).map(notif => ({
      key: notif._id,
      label: (
        <div 
          className={`flex gap-3 py-2 px-1 ${!notif.read ? 'bg-blue-50 rounded-lg' : ''}`}
          onClick={() => markAsRead(notif._id)}
        >
          <div className="text-2xl">{getNotificationIcon(notif.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Text strong className="text-sm">{notif.title}</Text>
              {!notif.read && (
                <Badge status="processing" className="flex-shrink-0" />
              )}
            </div>
            <Text type="secondary" className="text-xs block truncate">{notif.message}</Text>
            <Text type="secondary" className="text-xs block mt-1">
              {new Date(notif.createdAt).toLocaleDateString()}
            </Text>
          </div>
        </div>
      ),
      onClick: () => markAsRead(notif._id)
    }))),
    ...(notifications.length > 10 ? [
      { type: 'divider' },
      {
        key: 'view-all',
        label: (
          <div className="text-center">
            <Button type="link" size="small">View all ({notifications.length})</Button>
          </div>
        )
      }
    ] : [])
  ]

  return (
    <div className="inline-flex items-center">
      <Dropdown
        menu={{ items: menuItems }}
        placement="bottomRight"
        trigger={['click']}
        overlayStyle={{ maxWidth: 360, width: 340 }}
        // Note: You can keep state tracking here if you use it elsewhere, 
        // but let Antd trigger it natively by removing the manual onClick below!
      >
        <div 
          className="notification-btn cursor-pointer flex items-center justify-center"
          // REMOVED: onClick and e.stopPropagation() entirely!
          role="button"
          tabIndex={0}
        >
          <BellOutlined className="bell-icon text-gray-600 hover:text-blue-600 transition-colors" />
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </Dropdown>
    </div>
  )
}

export default NotificationBell