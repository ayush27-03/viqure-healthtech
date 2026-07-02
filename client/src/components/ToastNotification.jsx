// components/ToastNotification.jsx
import React, { useEffect } from 'react'
import { notification } from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'

const ToastNotification = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const typeConfigs = {
    success: {
      icon: <CheckCircleOutlined className="text-green-500" />,
      className: 'bg-green-50 border-green-200'
    },
    error: {
      icon: <CloseCircleOutlined className="text-red-500" />,
      className: 'bg-red-50 border-red-200'
    },
    warning: {
      icon: <WarningOutlined className="text-yellow-500" />,
      className: 'bg-yellow-50 border-yellow-200'
    },
    info: {
      icon: <InfoCircleOutlined className="text-blue-500" />,
      className: 'bg-blue-50 border-blue-200'
    }
  }

  const config = typeConfigs[type] || typeConfigs.info

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] border ${config.className}`}>
        <span className="text-lg">{config.icon}</span>
        <span className="flex-1 text-gray-800">{message}</span>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-600 transition"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default ToastNotification