import React from 'react'

function LoadingSpinner({ size = 'md', color = 'purple' }) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }
  
  const colorClasses = {
    purple: 'border-purple-600',
    blue: 'border-blue-600',
    green: 'border-green-600',
    white: 'border-white'
  }

  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]}`}></div>
    </div>
  )
}

export default LoadingSpinner