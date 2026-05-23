import { doctors, appointments, users } from './mockData'

const mockResponse = (data) => {
  return Promise.resolve({ data })
}

const mockError = (message) => {
  return Promise.reject({ response: { data: { message } } })
}

const axiosInstance = {
  get: (url) => {
    
    if (url === '/doctors') return mockResponse(doctors)
    
    if (url.match(/\/doctors\/\w+$/)) {
      const doctorId = url.split('/')[2]
      const doctor = doctors.find(d => d._id === doctorId)
      return mockResponse(doctor || doctors[0])
    }
    
    if (url === '/appointments/patient') return mockResponse(appointments)
    if (url === '/appointments/doctor') return mockResponse(appointments)
    
    // Admin
    if (url === '/admin/stats') return mockResponse({ 
      totalUsers: 1250, 
      totalDoctors: 45, 
      totalPatients: 1205, 
      totalAppointments: 3420, 
      totalRevenue: 2850000, 
      pendingApprovals: 3 
    })
    
    if (url === '/admin/pending-doctors') return mockResponse([])
    if (url === '/admin/patients') return mockResponse([])
    
    if (url === '/doctors/earnings') return mockResponse({ 
      total: 45000, 
      monthly: 12500, 
      pending: 3000 
    })
    
    return mockResponse({})
  },
  
  post: (url, data) => {
    console.log('POST request to:', url, data)
    
    if (url.includes('/register')) {
      // Check if user already exists
      const existingUser = users.find(u => u.email === data.email)
      if (existingUser) {
        return mockError('User already exists with this email')
      }
      
      const newUser = {
        _id: `user_${Date.now()}`,
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.isDoctorRequest ? 'doctor' : 'patient',
        phone: data.phone || '',
        city: data.city || '',
        createdAt: new Date().toISOString()
      }
      
      // Add to users array (for mock purposes)
      users.push(newUser)
      
      return mockResponse({ 
        user: { 
          _id: newUser._id,
          name: newUser.name, 
          email: newUser.email,
          role: newUser.role
        }, 
        token: 'mock-jwt-token-' + Date.now(), 
        role: newUser.role
      })
    }
    
    if (url === '/auth/login') {
      // Find user by email and password
      const foundUser = users.find(u => u.email === data.email && u.password === data.password)
      
      if (!foundUser) {
        return mockError('Invalid email or password')
      }
      
      let userData = {
        _id: foundUser._id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role
      }
      
      // If doctor, attach doctorId (find matching doctor)
      if (foundUser.role === 'doctor') {
        const matchingDoctor = doctors.find(d => d.doctorName === foundUser.name)
        if (matchingDoctor) {
          userData.doctorId = matchingDoctor._id
        }
      }
      
      return mockResponse({
        user: userData,
        token: 'mock-jwt-token-' + Date.now(),
        role: foundUser.role
      })
    }
    
    if (url === '/appointments') {
      return mockResponse({ 
        _id: `apt_${Date.now()}`,
        ...data,
        paymentStatus: "PENDING",
        appointmentStatus: "PENDING",
        createdAt: new Date().toISOString()
      })
    }
    
    return mockResponse({ success: true })
  },
  
  put: (url, data) => {
    console.log('PUT request to:', url, data)
    
    if (url.includes('/status')) return mockResponse({ success: true })
    if (url.includes('/cancel')) return mockResponse({ success: true })
    if (url.includes('/approve')) return mockResponse({ success: true })
    if (url.includes('/reject')) return mockResponse({ success: true })
    
    return mockResponse({ success: true })
  },
  
  delete: (url) => {
    console.log('DELETE request to:', url)
    return mockResponse({ success: true })
  }
}

export default axiosInstance