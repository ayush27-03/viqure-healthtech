// components/LoadingSpinner.jsx
import React from 'react'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

function LoadingSpinner({ size = 'md', color = 'blue', tip = '' }) {
  const sizeMap = {
    sm: 24,
    md: 40,
    lg: 56,
    xl: 72
  }

  const colorMap = {
    blue: '#1890ff',
    purple: '#722ed1',
    green: '#52c41a',
    white: '#ffffff',
    gray: '#8c8c8c'
  }

  const antIcon = (
    <LoadingOutlined 
      style={{ 
        fontSize: sizeMap[size], 
        color: colorMap[color] || colorMap.blue 
      }} 
      spin 
    />
  )

  return (
    <div className="flex flex-col items-center justify-center">
      <Spin 
        indicator={antIcon} 
        tip={tip}
        size={size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'default'}
      />
      {tip && (
        <p className="mt-3 text-gray-500 text-sm font-medium">{tip}</p>
      )}
    </div>
  )
}

export default LoadingSpinner