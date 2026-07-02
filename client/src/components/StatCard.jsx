// components/StatCard.jsx
import React from 'react'
import { Card, Typography, Space } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'

const { Text, Title } = Typography

function StatCard({ 
  title, 
  value, 
  icon, 
  color = 'blue', 
  onClick, 
  trend, 
  trendValue,
  subtitle,
  loading = false,
  className = ''
}) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      iconBg: 'bg-green-100'
    },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      border: 'border-yellow-200',
      iconBg: 'bg-yellow-100'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
      iconBg: 'bg-purple-100'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200',
      iconBg: 'bg-red-100'
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      iconBg: 'bg-indigo-100'
    },
    pink: {
      bg: 'bg-pink-50',
      text: 'text-pink-600',
      border: 'border-pink-200',
      iconBg: 'bg-pink-100'
    }
  }

  const colors = colorClasses[color] || colorClasses.blue

  return (
    <Card 
      className={`stat-card ${colors.bg} border ${colors.border} ${onClick ? 'cursor-pointer hover:shadow-lg transition-all duration-300' : ''} ${className}`}
      onClick={onClick}
      loading={loading}
      bordered={false}
      bodyStyle={{ padding: '20px' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <Text type="secondary" className="text-sm font-medium block truncate">
            {title}
          </Text>
          <Title level={3} className={`mt-1 mb-0 ${colors.text}`}>
            {value}
          </Title>
          {subtitle && (
            <Text type="secondary" className="text-xs block mt-1">
              {subtitle}
            </Text>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              {trend === 'up' ? (
                <ArrowUpOutlined className="text-green-500 text-xs" />
              ) : (
                <ArrowDownOutlined className="text-red-500 text-xs" />
              )}
              <Text className={`text-xs ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trendValue}
              </Text>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 ml-3`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </Card>
  )
}

export default StatCard