import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add JWT token and log requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log all POST/PUT/PATCH requests
    if (config.method === 'post' || config.method === 'put' || config.method === 'patch') {
      console.group(`📤 ${config.method.toUpperCase()} ${config.url}`)
      console.log('📦 Data:', config.data)
      console.log('📋 Headers:', config.headers)
      console.groupEnd()
    }

    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor - Handle 401 and log responses
axiosInstance.interceptors.response.use(
  (response) => {
    // Log POST responses
    if (response.config.method === 'post' || response.config.method === 'put' || response.config.method === 'patch') {
      console.group(`📥 ${response.config.method.toUpperCase()} ${response.config.url} - Response`)
      console.log('📦 Response Data:', response.data)
      console.log('✅ Status:', response.status)
      console.groupEnd()
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
      window.location.href = '/login'
    }

    // Log error responses for POST requests
    if (error.config && (error.config.method === 'post' || error.config.method === 'put' || error.config.method === 'patch')) {
      console.group(`❌ ${error.config.method.toUpperCase()} ${error.config.url} - Error`)
      console.log('📦 Request Data:', error.config.data)
      console.log('📥 Response:', error.response?.data)
      console.log('🔴 Status:', error.response?.status)
      console.groupEnd()
    }

    return Promise.reject(error)
  }
)

export default axiosInstance