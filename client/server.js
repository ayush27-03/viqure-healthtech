const express = require('express')
const fs = require('fs')
const path = require('path')
<<<<<<< HEAD

=======
const jwt = require('jsonwebtoken')
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450

require('dotenv').config();

const PORT = process.env.PORT;
<<<<<<< HEAD
=======
const JWT_SECRET = process.env.JWT_SECRET || 'test-server-not-secret';
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450

if (!PORT) {
  console.error('❌ PORT not found in .env file');
  process.exit(1);
}

const app = express()
app.use(express.json())

<<<<<<< HEAD
const dbPath = path.join(__dirname, 'db.json')

const readDB = () => {
  const data = fs.readFileSync(dbPath, 'utf8')
  return JSON.parse(data)
}

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

// Initialize DB structure
const initDB = () => {
  const db = readDB()
  if (!db.users) db.users = []
  if (!db.patients) db.patients = []
  if (!db.doctors) db.doctors = []
  if (!db.pendingDoctors) db.pendingDoctors = []
  if (!db.admins) db.admins = []
  if (!db.appointments) db.appointments = []
  writeDB(db)
}

initDB()

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
=======
// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

<<<<<<< HEAD
// ============ AUTH ROUTES ============

// Login - ONLY checks users table, returns role from there
app.post('/auth/login', (req, res) => {
  const {email} = req.body
  const db = readDB()
  
  const user = db.users.findOne(u=>u.email==='rahul@example.com')
  // const user = db.users.find(u => u.email === email && u.password === password)
  
  if (!user) {
    res.status(401).json({ message: 'Invalid email or password' })
    return
  }
  
  // Role comes from users table (this is what frontend uses for UI)
  // Server uses roleId to fetch actual data from respective table
  let userData = {
    _id: user._id,
    email: user.email,
    role: user.role,
    roleId: user.roleId
  }
  
  // Fetch additional display info based on role
  if (user.role === 'patient') {
    const patient = db.patients.find(p => p._id === user.roleId)
    if (patient) userData.name = patient.patientName
  } else if (user.role === 'doctor') {
    const doctor = db.doctors.find(d => d._id === user.roleId)
    if (doctor) userData.name = doctor.doctorName
  } else if (user.role === 'admin') {
    const admin = db.admins.find(a => a._id === user.roleId)
    if (admin) userData.name = admin.name
  }
  
  res.json({
    user: userData,
    token: 'mock-jwt-token-' + Date.now(),
    role: user.role
  })
})

// ============ TOKEN VERIFICATION ============

// Verify token and return user info
app.get('/auth/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    res.status(401).json({ valid: false, message: 'No token provided' })
    return
  }
  
  // For mock JWT, just extract user info from token
  // In production, you would verify the JWT signature
  try {
    // Mock verification - extract user from localStorage style
    // Since it's mock, we can just check if token exists in our records
    const db = readDB()
    
    // Mock token format: "mock-jwt-token-{timestamp}"
    // In real implementation, decode JWT and verify signature
    const userId = req.headers['x-user-id'] // You'd get this from token
    
    // For now, accept any mock token that isn't empty
    if (token && token.startsWith('mock-jwt-token')) {
      // Try to find user from the token - you'd decode this properly
      res.json({ valid: true, user: { role: 'authenticated' } })
    } else {
      res.status(401).json({ valid: false, message: 'Invalid token' })
    }
  } catch (error) {
    res.status(401).json({ valid: false, message: 'Token verification failed' })
  }
})

// Patient Registration - creates entry in BOTH users AND patients
app.post('/auth/patient/register', (req, res) => {
  const { name, email, password, phone, dateOfBirth, gender } = req.body
  const db = readDB()
  
  // Check if user exists
  if (db.users.find(u => u.email === email)) {
    res.status(400).json({ message: 'User already exists' })
    return
  }
  
  // Create patient record (detailed info)
  const newPatient = {
    _id: `pat_${Date.now()}`,
    patientName: name,
    mobileNumber: phone || '',
    patientAddress: '',
    dateOfBirth: dateOfBirth || '',
    gender: gender || '',
    emergencyContact: { name: '', relation: '', phone: '' },
    createdAt: new Date().toISOString()
  }
  
  db.patients.push(newPatient)
  
  // Create user record (authentication only)
  const newUser = {
    _id: `usr_${Date.now()}`,
    email,
    password,
    role: 'patient',
    roleId: newPatient._id,
    createdAt: new Date().toISOString()
  }
  
  db.users.push(newUser)
  writeDB(db)
  
  res.status(201).json({
    success: true,
    message: 'Registration successful! Please login to continue.'
  })
})
app.get('/patients/:id', (req, res) => {
  const db = readDB()
  const patient = db.patients.find(p => p._id === req.params.id)
  if (patient) {
    res.json(patient)
  } else {
    res.status(404).json({ message: 'Patient not found' })
  }
})

// Update patient
app.put('/patients/:id', (req, res) => {
  const db = readDB()
  const patientIndex = db.patients.findIndex(p => p._id === req.params.id)
  if (patientIndex !== -1) {
    db.patients[patientIndex] = { 
      ...db.patients[patientIndex], 
      ...req.body, 
      updatedAt: new Date().toISOString() 
    }
    writeDB(db)
    res.json(db.patients[patientIndex])
  } else {
    res.status(404).json({ message: 'Patient not found' })
  }
})

app.post('/patients/:id/documents', (req, res) => {
  const db = readDB()
  const patientIndex = db.patients.findIndex(p => p._id === req.params.id)
  
  if (patientIndex === -1) {
    res.status(404).json({ message: 'Patient not found' })
    return
  }
  
  const newDocument = {
    docId: `doc_${Date.now()}`,
    ...req.body,
    uploadedAt: new Date().toISOString()
  }
  
  if (!db.patients[patientIndex].documents) {
    db.patients[patientIndex].documents = []
  }
  
  db.patients[patientIndex].documents.push(newDocument)
  writeDB(db)
  
  res.status(201).json(newDocument)
})

// Delete document from patient
app.delete('/patients/:patientId/documents/:docId', (req, res) => {
  const db = readDB()
  const patientIndex = db.patients.findIndex(p => p._id === req.params.patientId)
  
  if (patientIndex === -1) {
    res.status(404).json({ message: 'Patient not found' })
    return
  }
  
  const docIndex = db.patients[patientIndex].documents.findIndex(d => d.docId === req.params.docId)
  
  if (docIndex === -1) {
    res.status(404).json({ message: 'Document not found' })
    return
  }
  
  db.patients[patientIndex].documents.splice(docIndex, 1)
  writeDB(db)
  
  res.json({ success: true, message: 'Document deleted' })
})

// Doctor Registration - ONLY creates pendingDoctors, NOT in users/doctors yet
app.post('/auth/doctor/register', (req, res) => {
  const { 
    name, email, password, phone, specialization, licenseNumber, 
    experience, clinicName, clinicAddress, consultationFee, bio 
  } = req.body
  
  const db = readDB()
  
  // Check if email already in users or pendingDoctors
  if (db.users.find(u => u.email === email) || 
      db.pendingDoctors.find(p => p.email === email)) {
    res.status(400).json({ message: 'User already exists with this email' })
    return
  }
  
  // Create pending doctor entry (NOT in users yet)
  const newPending = {
    _id: `pending_${Date.now()}`,
    doctorName: name,
    email,
    password,
    phone: phone || '',
    specialization,
    licenseNumber,
    experience: experience || 0,
    clinicName: clinicName || '',
    clinicAddress: clinicAddress || '',
    consultationFee: consultationFee || 0,
    bio: bio || '',
    status: 'pending',
    submittedAt: new Date().toISOString()
  }
  
  db.pendingDoctors.push(newPending)
  writeDB(db)
  
  res.status(201).json({
    success: true,
    message: 'Registration submitted for admin approval! You will be notified once approved.'
  })
})


// ============ DOCTOR ROUTES (Public) ============
// Get doctor by ID
app.get('/doctors/:id', (req, res) => {
  const db = readDB()
  const doctor = db.doctors.find(d => d._id === req.params.id)
  if (doctor) {
    res.json(doctor)
  } else {
    res.status(404).json({ message: 'Doctor not found' })
  }
})

// Update doctor
app.put('/doctors/:id', (req, res) => {
  const db = readDB()
  const doctorIndex = db.doctors.findIndex(d => d._id === req.params.id)
  if (doctorIndex !== -1) {
    db.doctors[doctorIndex] = { 
      ...db.doctors[doctorIndex], 
      ...req.body, 
      updatedAt: new Date().toISOString() 
    }
    writeDB(db)
    res.json(db.doctors[doctorIndex])
  } else {
    res.status(404).json({ message: 'Doctor not found' })
  }
})

// Add document to doctor
app.post('/doctors/:id/documents', (req, res) => {
  const db = readDB()
  const doctorIndex = db.doctors.findIndex(d => d._id === req.params.id)
  
  if (doctorIndex === -1) {
    res.status(404).json({ message: 'Doctor not found' })
    return
  }
  
  const newDocument = {
    docId: `doc_${Date.now()}`,
    ...req.body,
    uploadedAt: new Date().toISOString()
  }
  
  if (!db.doctors[doctorIndex].documents) {
    db.doctors[doctorIndex].documents = []
  }
  
  db.doctors[doctorIndex].documents.push(newDocument)
  writeDB(db)
  
  res.status(201).json(newDocument)
})

// Delete document from doctor
app.delete('/doctors/:doctorId/documents/:docId', (req, res) => {
  const db = readDB()
  const doctorIndex = db.doctors.findIndex(d => d._id === req.params.doctorId)
  
  if (doctorIndex === -1) {
    res.status(404).json({ message: 'Doctor not found' })
    return
  }
  
  const docIndex = db.doctors[doctorIndex].documents.findIndex(d => d.docId === req.params.docId)
  
  if (docIndex === -1) {
    res.status(404).json({ message: 'Document not found' })
    return
  }
  
  db.doctors[doctorIndex].documents.splice(docIndex, 1)
  writeDB(db)
  
  res.json({ success: true, message: 'Document deleted' })
})

// Get all approved doctors (public)
app.get('/doctors', (req, res) => {
  const db = readDB()
  const approvedDoctors = db.doctors.filter(d => d.approvalStatus === 'approved')
  // Remove documents from public view
  const doctorsWithoutDocs = approvedDoctors.map(({ documents, ...doctor }) => doctor)
  res.json(doctorsWithoutDocs)
})

app.get('/doctors/:id/earnings', (req, res) => {
  const doctorId = req.params.id

  // Example dummy data
  res.json({
    doctorId,
    total: 45000,
    monthly: 12000,
    pending: 3000
  })
})


// ============ ADMIN ROUTES ============

// Get all pending doctors
app.get('/admin/pending-doctors', (req, res) => {
  const db = readDB()
  res.json(db.pendingDoctors || [])
})

// Approve doctor - MOVES from pendingDoctors to doctors AND users
app.put('/admin/doctors/:id/approve', (req, res) => {
  const db = readDB()
  const pendingIndex = db.pendingDoctors.findIndex(p => p._id === req.params.id)
  
  if (pendingIndex === -1) {
    res.status(404).json({ message: 'Pending doctor not found' })
    return
  }
  
  const pending = db.pendingDoctors[pendingIndex]
  
  // Create doctor record (detailed info)
  const newDoctor = {
    _id: `doc_${Date.now()}`,
    doctorName: pending.doctorName,
    profileIcon: "👨‍⚕️",
    phone: pending.phone,
    city: pending.clinicAddress?.split(',').pop()?.trim() || '',
    description: pending.bio,
    licenseNo: pending.licenseNumber,
    yearsOfExperience: pending.experience,
    consultationFees: pending.consultationFee,
    specializations: [pending.specialization],
    clinicName: pending.clinicName,
    clinicAddress: pending.clinicAddress,
    status: 'active',
    approvalStatus: 'approved',
    stats: { rating: 0, totalRatings: 0, totalAppointments: 0 },
    documents: [],
    profileCreatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  db.doctors.push(newDoctor)
  
  // Create user record (authentication only)
  const newUser = {
    _id: `usr_${Date.now()}`,
    email: pending.email,
    password: pending.password,
    role: 'doctor',
    roleId: newDoctor._id,
    createdAt: new Date().toISOString()
  }
  
  db.users.push(newUser)
  
  // Remove from pendingDoctors
  db.pendingDoctors.splice(pendingIndex, 1)
  writeDB(db)
  
  res.json({ success: true, message: 'Doctor approved successfully' })
})

// Reject doctor - just remove from pendingDoctors
app.put('/admin/doctors/:id/reject', (req, res) => {
  const db = readDB()
  const pendingIndex = db.pendingDoctors.findIndex(p => p._id === req.params.id)
  
  if (pendingIndex === -1) {
    res.status(404).json({ message: 'Pending doctor not found' })
    return
  }
  
  db.pendingDoctors.splice(pendingIndex, 1)
  writeDB(db)
  
  res.json({ success: true, message: 'Doctor registration rejected' })
})

// Admin stats
app.get('/admin/stats', (req, res) => {
  const db = readDB()
  res.json({
    totalUsers: db.users.length,
    totalDoctors: db.doctors.length,
    totalPatients: db.patients.length,
    totalAppointments: db.appointments.length,
    totalRevenue: db.appointments.reduce((sum, apt) => sum + (apt.consultationFees || 0), 0),
    pendingApprovals: db.pendingDoctors.length
  })
})

// Get all patients list (for admin)
app.get('/admin/patients', (req, res) => {
  const db = readDB()
  const patientsWithUsers = db.patients.map(patient => {
    const user = db.users.find(u => u.roleId === patient._id)
    return {
      ...patient,
      email: user?.email || '',
      createdAt: user?.createdAt || patient.createdAt
    }
  })
  res.json(patientsWithUsers)
})

// ============ ADMIN - DOCTOR MANAGEMENT ============

// Get all doctors (approved)
app.get('/admin/doctors', (req, res) => {
  const db = readDB()
  const doctorsWithUsers = db.doctors.map(doctor => {
    const user = db.users.find(u => u.roleId === doctor._id)
    return {
      ...doctor,
      email: user?.email || '',
      createdAt: doctor.profileCreatedAt || doctor.createdAt
    }
  })
  res.json(doctorsWithUsers)
})

// Delete doctor
app.delete('/admin/doctors/:id', (req, res) => {
  const db = readDB()
  const doctorIndex = db.doctors.findIndex(d => d._id === req.params.id)
  if (doctorIndex !== -1) {
    const doctor = db.doctors[doctorIndex]
    // Remove associated user
    const userIndex = db.users.findIndex(u => u.roleId === req.params.id)
    if (userIndex !== -1) db.users.splice(userIndex, 1)
    db.doctors.splice(doctorIndex, 1)
    writeDB(db)
    res.json({ success: true })
  } else {
    res.status(404).json({ message: 'Doctor not found' })
  }
})

// ============ ADMIN - APPOINTMENT MANAGEMENT ============

// Get all appointments (admin view)
app.get('/admin/appointments', (req, res) => {
  const db = readDB()
  const appointmentsWithDetails = (db.appointments || []).map(apt => {
    const patient = db.patients.find(p => p._id === apt.patientId)
    const doctor = db.doctors.find(d => d._id === apt.doctorId)
    return {
      ...apt,
      patientName: patient?.patientName || 'Unknown',
      doctorName: doctor?.doctorName || 'Unknown'
    }
  })
  res.json(appointmentsWithDetails)
})

// Update appointment status (admin)
app.put('/admin/appointments/:id', (req, res) => {
  const { status } = req.body
  const db = readDB()
  const appointment = db.appointments.find(a => a._id === req.params.id)
  if (appointment) {
    appointment.appointmentStatus = status
    appointment.updatedAt = new Date().toISOString()
    writeDB(db)
    res.json({ success: true })
  } else {
    res.status(404).json({ message: 'Appointment not found' })
  }
})

// ============ ADMIN - ORDER MANAGEMENT ============

// Get all orders (admin view)
app.get('/admin/orders', (req, res) => {
  const db = readDB()
  const ordersWithDetails = (db.orders || []).map(order => {
    const user = db.users.find(u => u._id === order.userID)
    const patient = db.patients.find(p => p._id === user?.roleId)
    return {
      ...order,
      patientName: patient?.patientName || 'Unknown',
      patientEmail: user?.email || 'Unknown'
    }
  })
  res.json(ordersWithDetails)
})

// Update order status (admin)
app.put('/admin/orders/:id', (req, res) => {
  const { status } = req.body
  const db = readDB()
  const order = db.orders.find(o => o._id === req.params.id)
  if (order) {
    order.status = status
    order.updatedAt = new Date().toISOString()
    writeDB(db)
    res.json({ success: true })
  } else {
    res.status(404).json({ message: 'Order not found' })
  }
})

// ============ ADMIN - CATEGORY MANAGEMENT ============

// Get all categories
app.get('/admin/categories', (req, res) => {
  const db = readDB()
  res.json(db.categories || [])
})

// Create category
app.post('/admin/categories', (req, res) => {
  const { name, slug, description, image } = req.body
  const db = readDB()
  const newCategory = {
    _id: `cat_${Date.now()}`,
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
    description: description || '',
    image: image || '',
    bannerImage: '',
    productCount: 0,
    createdBy: req.headers['x-admin-id'] || 'adm_001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  if (!db.categories) db.categories = []
  db.categories.push(newCategory)
  writeDB(db)
  res.status(201).json(newCategory)
})

// Update category
app.put('/admin/categories/:id', (req, res) => {
  const { name, slug, description, image } = req.body
  const db = readDB()
  const categoryIndex = db.categories.findIndex(c => c._id === req.params.id)
  if (categoryIndex !== -1) {
    db.categories[categoryIndex] = {
      ...db.categories[categoryIndex],
      name: name || db.categories[categoryIndex].name,
      slug: slug || db.categories[categoryIndex].slug,
      description: description || db.categories[categoryIndex].description,
      image: image || db.categories[categoryIndex].image,
      updatedAt: new Date().toISOString()
    }
    writeDB(db)
    res.json(db.categories[categoryIndex])
  } else {
    res.status(404).json({ message: 'Category not found' })
  }
})

// Delete category
app.delete('/admin/categories/:id', (req, res) => {
  const db = readDB()
  const categoryIndex = db.categories.findIndex(c => c._id === req.params.id)
  if (categoryIndex !== -1) {
    db.categories.splice(categoryIndex, 1)
    writeDB(db)
    res.json({ success: true })
  } else {
    res.status(404).json({ message: 'Category not found' })
  }
})

// ============ ADMIN - PRODUCT MANAGEMENT ============

// Create product (admin)
app.post('/admin/products', (req, res) => {
  const { name, brand, category, description, basecost, discountfactor, inventory, images, estimatedDeliveryDays } = req.body
  const db = readDB()
  
  const newProduct = {
    _id: `prod_${Date.now()}`,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
    description,
    brand,
    category: {
      categoryID: category._id || category,
      name: category.name || db.categories.find(c => c._id === category)?.name
    },
    images: images || ['/images/products/placeholder.jpg'],
    basecost,
    discountfactor: discountfactor || 0,
    inventory: {
      stockQty: inventory?.stockQty || 0,
      sku: inventory?.sku || `SKU_${Date.now()}`,
      lowStockThreshold: inventory?.lowStockThreshold || 10
    },
    ratings: { average: 0, totalReviews: 0 },
    isAvailable: true,
    estimatedDeliveryDays: estimatedDeliveryDays || 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  if (!db.products) db.products = []
  db.products.push(newProduct)
  writeDB(db)
  res.status(201).json(newProduct)
})

// Update product (admin)
app.put('/admin/products/:id', (req, res) => {
  const db = readDB()
  const productIndex = db.products.findIndex(p => p._id === req.params.id)
  if (productIndex !== -1) {
    db.products[productIndex] = {
      ...db.products[productIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    }
    writeDB(db)
    res.json(db.products[productIndex])
  } else {
    res.status(404).json({ message: 'Product not found' })
  }
})

// Delete product (admin)
app.delete('/admin/products/:id', (req, res) => {
  const db = readDB()
  const productIndex = db.products.findIndex(p => p._id === req.params.id)
  if (productIndex !== -1) {
    db.products.splice(productIndex, 1)
    writeDB(db)
    res.json({ success: true })
  } else {
    res.status(404).json({ message: 'Product not found' })
  }
})

// ============ NOTIFICATIONS ============

// Get notifications for admin
app.get('/admin/notifications', (req, res) => {
  const db = readDB()
  const notifications = db.notifications || []
  res.json(notifications)
})

// Mark notification as read
app.put('/admin/notifications/:id/read', (req, res) => {
  const db = readDB()
  const notification = db.notifications?.find(n => n._id === req.params.id)
  if (notification) {
    notification.read = true
    writeDB(db)
    res.json({ success: true })
  } else {
    res.status(404).json({ message: 'Notification not found' })
  }
})

// Mark all as read
app.put('/admin/notifications/read-all', (req, res) => {
  const db = readDB()
  if (db.notifications) {
    db.notifications.forEach(n => { n.read = true })
    writeDB(db)
  }
  res.json({ success: true })
})


// Get settings
app.get('/admin/settings', (req, res) => {
  const db = readDB()
  const settings = db.settings || {
    siteName: 'HealthApp',
    contactEmail: 'admin@healthapp.com',
    contactPhone: '+91 98765 43210',
    address: '',
    deliveryCharge: 40,
    freeDeliveryMin: 500,
    taxRate: 5
  }
  res.json(settings)
})

// Update settings
app.put('/admin/settings', (req, res) => {
  const db = readDB()
  db.settings = { ...db.settings, ...req.body, updatedAt: new Date().toISOString() }
  writeDB(db)
  res.json({ success: true })
})


// Get all products (admin view) - ADD THIS
app.get('/admin/products', (req, res) => {
  const db = readDB()
  const products = db.products || []
  res.json(products)
})

// Create product (admin)
app.post('/admin/products', (req, res) => {
  const { name, brand, category, description, basecost, discountfactor, inventory, images, estimatedDeliveryDays } = req.body
  const db = readDB()
  
  const newProduct = {
    _id: `prod_${Date.now()}`,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
    description,
    brand,
    category: {
      categoryID: category._id || category,
      name: category.name || db.categories?.find(c => c._id === category)?.name
    },
    images: images || ['/images/products/placeholder.jpg'],
    basecost,
    discountfactor: discountfactor || 0,
    inventory: {
      stockQty: inventory?.stockQty || 0,
      sku: inventory?.sku || `SKU_${Date.now()}`,
      lowStockThreshold: inventory?.lowStockThreshold || 10
    },
    ratings: { average: 0, totalReviews: 0 },
    isAvailable: true,
    estimatedDeliveryDays: estimatedDeliveryDays || 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  if (!db.products) db.products = []
  db.products.push(newProduct)
  writeDB(db)
  res.status(201).json(newProduct)
})

// Update product (admin)
app.put('/admin/products/:id', (req, res) => {
  const db = readDB()
  const productIndex = db.products.findIndex(p => p._id === req.params.id)
  if (productIndex !== -1) {
    db.products[productIndex] = {
      ...db.products[productIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    }
    writeDB(db)
    res.json(db.products[productIndex])
  } else {
    res.status(404).json({ message: 'Product not found' })
  }
})

// Delete product (admin)
app.delete('/admin/products/:id', (req, res) => {
  const db = readDB()
  const productIndex = db.products.findIndex(p => p._id === req.params.id)
  if (productIndex !== -1) {
    db.products.splice(productIndex, 1)
    writeDB(db)
    res.json({ success: true })
  } else {
    res.status(404).json({ message: 'Product not found' })
  }
})

// ============ SLOT GENERATION ============

function generateSlotsForDoctor(doctorId, endDate) {
  const db = readDB()
  const doctor = db.doctors.find(d => d._id === doctorId)
  
  if (!doctor || !doctor.availabilitySettings) {
    return []
  }
  
  const settings = doctor.availabilitySettings
  const newSlots = []
  
  // Start from TODAY, not from any passed startDate
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)
  
  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const dayOfWeek = currentDate.getDay()
    const isLeave = settings.leaveDates?.some(ld => ld.date === dateStr)
    
    if (!isLeave) {
      const daySchedule = settings.workingHours?.find(s => s.dayOfWeek === dayOfWeek)
      
      if (daySchedule && daySchedule.isWorking && daySchedule.slots) {
        const ranges = daySchedule.slots.map(slot => ({
          start: slot.start,
          end: slot.end
        }))
        
        if (ranges.length > 0) {
          newSlots.push({
            date: dateStr,
            ranges: ranges
          })
        }
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return newSlots
}

function addMinutes(timeStr, minutes) {
  const [hours, mins] = timeStr.split(':').map(Number)
  const total = hours * 60 + mins + minutes
  const newHours = Math.floor(total / 60)
  const newMins = total % 60
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`
}

app.post('/doctors/:id/generate-slots', (req, res) => {
  try {
    const doctorId = req.params.id
    const db = readDB()
    
    const doctor = db.doctors.find(d => d._id === doctorId)
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' })
    }
    
    let settings = doctor.availabilitySettings
    
    // Create default settings if none exist - THIS IS WHAT YOU HAD
    if (!settings) {
      settings = {
        minAppointmentDuration: 10,
        maxAppointmentDuration: 180,
        advanceBookingDays: 14,
        workingHours: [
          { dayOfWeek: 1, dayName: 'Monday', isWorking: true, slots: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
          { dayOfWeek: 2, dayName: 'Tuesday', isWorking: true, slots: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
          { dayOfWeek: 3, dayName: 'Wednesday', isWorking: true, slots: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
          { dayOfWeek: 4, dayName: 'Thursday', isWorking: true, slots: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
          { dayOfWeek: 5, dayName: 'Friday', isWorking: true, slots: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
          { dayOfWeek: 6, dayName: 'Saturday', isWorking: true, slots: [{ start: '09:00', end: '14:00' }] },
          { dayOfWeek: 0, dayName: 'Sunday', isWorking: false, slots: [] }
        ],
        leaveDates: []
      }
      
      doctor.availabilitySettings = settings
      writeDB(db)
    }
    
    const maxDays = settings.advanceBookingDays || 14
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + maxDays)
    // Generate new time ranges
    const newSlots = generateSlotsForDoctor(doctorId, endDate.toISOString().split('T')[0])
    
    // Store actualAvailableSlots INSIDE doctor object
    doctor.actualAvailableSlots = newSlots
    writeDB(db)
    
    res.json({ 
      message: 'Slots generated successfully', 
      slotsGenerated: newSlots.length 
    })
    
  } catch (error) {
    console.error('Error generating slots:', error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
})
// Replace your existing generate-slots endpoint with this


// ============ AVAILABLE SLOTS LOOKUP ============

app.get('/doctors/:id/available-slots', (req, res) => {
  const { date } = req.query
  const doctorId = req.params.id
  const db = readDB()
  
  const doctor = db.doctors.find(d => d._id === doctorId)
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' })
  }
  
  const daySlots = doctor.actualAvailableSlots?.find(s => s.date === date)
  const settings = doctor.availabilitySettings || {}
  
  res.json({
    ranges: daySlots?.ranges || [],
    minDuration: settings.minAppointmentDuration || 10,
    maxDuration: settings.maxAppointmentDuration || 180
  })
})

app.get('/doctors/:id/reviews', (req, res) => {
  const doctorId = req.params.id
  const db = readDB()
  
  // Check if reviews collection exists, if not create empty array
  const reviews = (db.doctorReviews || []).filter(r => r.doctorId === doctorId)
  
  res.json(reviews)
})

function calculateConsultationCost(baseFee, duration, type) {
  // Base fee per minute
  const perMinuteRate = baseFee / 30  // Assuming base fee is for 30 min
  
  let multiplier = 1.0
  
  // Duration multiplier
  if (duration <= 15) multiplier = 0.6
  else if (duration <= 30) multiplier = 1.0
  else if (duration <= 45) multiplier = 1.3
  else if (duration <= 60) multiplier = 1.5
  else multiplier = 1.5 + (duration - 60) / 60 * 0.3
  
  // Type multiplier
  if (type === 'VIDEO') multiplier *= 1.0
  else if (type === 'CHAT') multiplier *= 0.8
  else if (type === 'CLINIC') multiplier *= 1.2
  
  const subtotal = perMinuteRate * duration * multiplier
  const tax = subtotal * 0.18
  const total = subtotal + tax
  
  return {
    subtotal: Math.round(subtotal),
    tax: Math.round(tax),
    total: Math.round(total),
    currency: 'INR'
  }
}


// ============ APPOINTMENT REQUESTS ============
app.post('/appointment-requests', (req, res) => {
  const { doctorId, patientId, date, startTime, endTime, duration, reason, type } = req.body
  const db = readDB()
  
  if (!db.appointmentRequests) db.appointmentRequests = []
  
  const doctor = db.doctors.find(d => d._id === doctorId)
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' })

  const baseFee = doctor?.consultationFees || 500
  const cost = calculateConsultationCost(baseFee, duration, type)
  
  
  const daySlots = doctor.actualAvailableSlots?.find(s => s.date === date)
  if (!daySlots) return res.status(400).json({ message: 'No availability on this date' })
  
  const isWithinRange = daySlots.ranges.some(range => startTime >= range.start && endTime <= range.end)
  if (!isWithinRange) return res.status(400).json({ message: 'Selected time outside available hours' })
  
  const patient = db.patients.find(p => p._id === patientId)
  
  const newRequest = {
    _id: `req_${Date.now()}`,
    doctorId,
    patientId,
    patientName: patient?.patientName || 'Unknown',
=======
// ============ MOCK USER DATABASE (for login only) ============
// These are the ONLY hardcoded users for authentication
// ============ HARDCODED USERS ============ // changed_ to match the new system
const USERS = [
  {
    _id: 'usr_patient_001',
    email: 'patient@example.com',
    password: 'patient123',
    role: 'CUSTOMER',
    profile: { firstName: 'Rahul', lastName: 'Sharma' },
    phone: '+919876543210',
    isActive: true,
    isVerified: true,
    gender: 'MALE',
    dob: '1990-01-15',
    addresses: [],
    cart: []
  },
  {
    _id: 'usr_doctor_001',
    email: 'doctor@example.com',
    password: 'doctor123',
    role: 'DOCTOR',
    profile: { firstName: 'Priya', lastName: 'Sharma' },
    phone: '+919876543211',
    isActive: true,
    isVerified: false,
    gender: 'FEMALE',
    dob: '1985-05-20',
    addresses: [{ type: 'CLINIC', street: '456 Clinic Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400002' }],
    detailsOfHealthCareProfessional: {
      medicalLicense: 'LIC-1234-5678',
      approvalStatus: 'APPROVED',
      consultationFee: 500,
      qualifications: ['MBBS', 'MD - Cardiology'],
      yearsOfExperience: 10,
      bio: 'Experienced cardiologist with 10+ years of practice',
      averageRating: 4.5,
      actualAvailableSlots: [],
      isAvailable: true,
      stats: { rating: 4.5, totalRatings: 120, totalAppointments: 450 }
    },
    cart: []
  },
  {
    _id: 'usr_admin_001',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'ADMIN',
    profile: { firstName: 'Admin', lastName: 'User' },
    phone: '+919876543212',
    isActive: true,
    isVerified: true,
    addresses: [],
    cart: []
  }
]

// ============ HELPER FUNCTIONS ============

// Generate random ID
const generateId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`

// Random number between min and max
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

// Random item from array
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]

// Random date between start and end
const randomDate = (start, end) => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return date.toISOString()
}

// ============ MOCK DATA POOLS ============

const FIRST_NAMES = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Raj', 'Neha', 'Arjun', 'Meera']
const LAST_NAMES = ['Sharma', 'Verma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Joshi', 'Gupta', 'Nair', 'Menon']
const SPECIALIZATIONS = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Ophthalmology', 'ENT', 'Gynecology', 'Oncology', 'Psychiatry']
const PRODUCT_NAMES = ['MediCare Plus', 'HealthShield', 'VitaBoost', 'WellnessPro', 'CareMax', 'NutriHealth', 'ImmunoGuard', 'HeartSafe', 'BoneStrength', 'VisionCare']
const BRANDS = ['PharmaCare', 'HealthPlus', 'MediLife', 'VitaHealth', 'CareWell']
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Surat', 'Jaipur']
const CONSULTATION_TYPES = ['VIDEO', 'CHAT', 'CLINIC']
const APPOINTMENT_STATUSES = ['CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED']
const ORDER_STATUSES = ['pending', 'confirmed','processing', 'shipped', 'delivered', 'cancelled','returned','failed']
const ORDERS = []
const APPOINTMENTS = [
  {
    _id: 'apt_001',
    patientId: 'usr_patient_001', // This matches patient@example.com
    doctorId: 'usr_doctor_001',
    doctorName: 'Dr. Priya Sharma',
    consultationFees: 500,
    appointmentStartDateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    appointmentEndDateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 1800000).toISOString(),
    duration: 30,
    consultationType: 'VIDEO',
    appointmentStatus: 'COMPLETED',
    hasRated: false,
    isVirtual: true,
    meetingId: 'meet_001',
    meetingLink: 'https://meet.viqure.com/meet_001',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'apt_002',
    patientId: 'usr_patient_001', // Same patient
    doctorId: 'usr_doctor_401',
    doctorName: 'Dr. Rachit Sharma',
    consultationFees: 500,
    appointmentStartDateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    appointmentEndDateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 1800000).toISOString(),
    duration: 30,
    consultationType: 'VIDEO',
    appointmentStatus: 'COMPLETED',
    isVirtual: true,
    meetingId: 'meet_002',
    meetingLink: 'https://meet.viqure.com/meet_002',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'apt_003',
    patientId: 'usr_patient_001',
    doctorId: 'usr_doctor_001',
    doctorName: 'Dr. Priya Sharma',
    consultationFees: 500,
    appointmentStartDateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    appointmentEndDateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 1800000).toISOString(),
    duration: 30,
    consultationType: 'VIDEO',
    appointmentStatus: 'COMPLETED',
    hasRated: true, // ALREADY RATED - will NOT trigger modal
    isVirtual: true,
    meetingId: 'meet_003',
    meetingLink: 'https://meet.viqure.com/meet_003',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'apt_004',
    patientId: 'usr_patient_001',
    doctorId: 'usr_doctor_001',
    doctorName: 'Dr. Priya Sharma',
    consultationFees: 500,
    appointmentStartDateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days in future
    appointmentEndDateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 1800000).toISOString(),
    duration: 30,
    consultationType: 'VIDEO',
    appointmentStatus: 'CONFIRMED', // NOT COMPLETED - won't trigger
    hasRated: false,
    isVirtual: true,
    meetingId: 'meet_004',
    meetingLink: 'https://meet.viqure.com/meet_004',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'apt_005',
    patientId: 'usr_patient_001',
    doctorId: 'usr_doctor_001',
    doctorName: 'Dr. Priya Sharma',
    consultationFees: 500,
    appointmentStartDateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    appointmentEndDateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 1800000).toISOString(),
    duration: 30,
    consultationType: 'CHAT',
    appointmentStatus: 'CANCELLED', // CANCELLED - won't trigger
    hasRated: false,
    isVirtual: true,
    meetingId: null,
    meetingLink: null,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
]






// ============ AUTH ROUTES ============ //changed_ these routes for compatibility with the new system
/**
 * POST /auth/login
 * Input: { email, password }
 * Output: { success: true, data: { user, token } }
 */
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body
  
  console.log('📝 LOGIN REQUEST:', { email })
  
  const user = USERS.find(u => u.email === email && u.password === password)
  
  if (!user) {
    console.log('❌ LOGIN FAILED: User not found')
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid email or password' 
    })
  }
  
  console.log('✅ LOGIN SUCCESS:', { userId: user._id, role: user.role })
  
  if (!user.isActive) {
    console.log('❌ LOGIN FAILED: Account deactivated')
    return res.status(403).json({ 
      success: false, 
      message: 'This account has been deactivated' 
    })
  }
  
  if (user.role === 'DOCTOR' && user.detailsOfHealthCareProfessional?.approvalStatus !== 'APPROVED') {
    console.log('❌ LOGIN FAILED: Doctor not approved')
    return res.status(403).json({ 
      success: false, 
      message: `Your doctor account is ${user.detailsOfHealthCareProfessional?.approvalStatus}. You cannot log in until approved.` 
    })
  }
  
  const token = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
  
  const { password: _, ...userWithoutPassword } = user
  
  console.log('📤 LOGIN RESPONSE SENT')
  
  res.json({
    success: true,
    data: { user: userWithoutPassword, token }
  })
})

/**
 * POST /auth/register
 * Input: { email, phone, password, role, gender, dob, profile: { firstName, lastName }, detailsOfHealthCareProfessional }
 * Output: { success: true, message: string, data: { user, token } }
 */
app.post('/auth/register', (req, res) => {
  const { email, phone, password, role, gender, dob, profile, detailsOfHealthCareProfessional } = req.body
  
  console.log('📝 REGISTER REQUEST:', { email, role })
  
  if (!email || !password || !role) {
    console.log('❌ REGISTER FAILED: Missing required fields')
    return res.status(400).json({ 
      success: false, 
      message: 'email, password and role are required' 
    })
  }
  
  if (!['CUSTOMER', 'DOCTOR'].includes(role)) {
    console.log('❌ REGISTER FAILED: Invalid role')
    return res.status(400).json({ 
      success: false, 
      message: 'role must be CUSTOMER or DOCTOR' 
    })
  }
  
  if (USERS.find(u => u.email === email)) {
    console.log('❌ REGISTER FAILED: Email already exists')
    return res.status(409).json({ 
      success: false, 
      message: 'A user with this email already exists' 
    })
  }
  
  const newUser = {
    _id: `usr_${Date.now()}`,
    email,
    phone: phone || '',
    password,
    role,
    profile: profile || { firstName: '', lastName: '' },
    isActive: true,
    isVerified: role === 'DOCTOR' ? false : true,
    gender: gender || '',
    dob: dob || '',
    addresses: [],
    cart: [],
    detailsOfHealthCareProfessional: role === 'DOCTOR' ? {
      medicalLicense: detailsOfHealthCareProfessional?.medicalLicense || '',
      approvalStatus: 'PENDING',
      consultationFee: detailsOfHealthCareProfessional?.consultationFee || 0,
      qualifications: detailsOfHealthCareProfessional?.qualifications || [],
      yearsOfExperience: detailsOfHealthCareProfessional?.yearsOfExperience || 0,
      bio: detailsOfHealthCareProfessional?.bio || '',
      averageRating: 0,
      actualAvailableSlots: [],
      isAvailable: false,
      stats: { rating: 0, totalRatings: 0, totalAppointments: 0 }
    } : undefined,
    createdAt: new Date().toISOString()
  }
  
  USERS.push(newUser)
  console.log('✅ REGISTER SUCCESS:', { userId: newUser._id })
  
  const token = jwt.sign(
    { userId: newUser._id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
  
  const { password: _, ...userWithoutPassword } = newUser
  
  console.log('📤 REGISTER RESPONSE SENT')
  
  res.status(201).json({
    success: true,
    message: role === 'DOCTOR' 
      ? 'Registration submitted. Awaiting admin approval.' 
      : 'Registration successful.',
    data: { user: userWithoutPassword, token }
  })
})

/**
 * GET /auth/me
 * Input: Authorization header
 * Output: { success: true, data: { user } }
 */
app.get('/auth/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  console.log('📝 ME REQUEST:', { token: token ? 'present' : 'missing' })
  
  if (!token) {
    console.log('❌ ME FAILED: No token')
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    console.log('🔑 TOKEN DECODED:', { userId: decoded.userId })
    
    const user = USERS.find(u => u._id === decoded.userId)
    
    if (!user) {
      console.log('❌ ME FAILED: User not found')
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      })
    }
    
    const { password: _, ...userWithoutPassword } = user
    
    console.log('✅ ME SUCCESS:', { userId: userWithoutPassword._id })
    console.log('📤 ME RESPONSE SENT')
    
    res.json({
      success: true,
      data: { user: userWithoutPassword }
    })
  } catch (error) {
    console.log('❌ ME FAILED: Invalid token')
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    })
  }
})

/**
 * PATCH /auth/me
 * Updates profile fields: phone, profile, addresses, gender, dob, avatar, fcmToken
 * Input: { phone, profile, addresses, gender, dob }
 * Output: { success: true, data: { user } }
 */
app.patch('/auth/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const userIndex = USERS.findIndex(u => u._id === decoded.userId)
    
    if (userIndex === -1) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      })
    }
    
    const { phone, profile, addresses, gender, dob, avatar, fcmToken, emergencyContacts } = req.body
    
    if (phone !== undefined) USERS[userIndex].phone = phone
    if (profile) USERS[userIndex].profile = { ...USERS[userIndex].profile, ...profile }
    if (addresses !== undefined) USERS[userIndex].addresses = addresses
    if (gender !== undefined) USERS[userIndex].gender = gender
    if (dob !== undefined) USERS[userIndex].dob = dob
    if (avatar !== undefined) USERS[userIndex].avatar = avatar
    if (fcmToken !== undefined) USERS[userIndex].fcmToken = fcmToken
    if (emergencyContacts !== undefined) USERS[userIndex].emergencyContacts = emergencyContacts
    
    USERS[userIndex].updatedAt = new Date().toISOString()
    
    const { password: _, ...userWithoutPassword } = USERS[userIndex]
    
    res.json({
      success: true,
      data: { user: userWithoutPassword }
    })
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    })
  }
})

/**
 * PATCH /doctors/me/profile
 * Updates doctor profile fields
 * Input: { phone, profile, detailsOfHealthCareProfessional }
 * Output: { success: true, data: { user } }
 */
app.patch('/doctors/me/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const userIndex = USERS.findIndex(u => u._id === decoded.userId)
    
    if (userIndex === -1) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      })
    }
    
    if (USERS[userIndex].role !== 'DOCTOR') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not a doctor' 
      })
    }
    
    const { phone, profile, detailsOfHealthCareProfessional } = req.body
    
    if (phone !== undefined) USERS[userIndex].phone = phone
    if (profile) USERS[userIndex].profile = { ...USERS[userIndex].profile, ...profile }
    if (detailsOfHealthCareProfessional) {
      USERS[userIndex].detailsOfHealthCareProfessional = {
        ...USERS[userIndex].detailsOfHealthCareProfessional,
        ...detailsOfHealthCareProfessional
      }
    }
    
    USERS[userIndex].updatedAt = new Date().toISOString()
    
    const { password: _, ...userWithoutPassword } = USERS[userIndex]
    
    res.json({
      success: true,
      data: { user: userWithoutPassword }
    })
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    })
  }
})

/**
 * PATCH /auth/change-password
 * Input: { currentPassword, newPassword }
 * Output: { success: true, message: string }
 */
app.patch('/auth/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body
  
  console.log('📝 CHANGE PASSWORD REQUEST')
  
  if (!currentPassword || !newPassword) {
    console.log('❌ CHANGE PASSWORD FAILED: Missing fields')
    return res.status(400).json({ 
      success: false, 
      message: 'currentPassword and newPassword are required' 
    })
  }
  
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    console.log('❌ CHANGE PASSWORD FAILED: No token')
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    console.log('🔑 TOKEN DECODED:', { userId: decoded.userId })
    
    const user = USERS.find(u => u._id === decoded.userId)
    
    if (!user) {
      console.log('❌ CHANGE PASSWORD FAILED: User not found')
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      })
    }
    
    if (user.password !== currentPassword) {
      console.log('❌ CHANGE PASSWORD FAILED: Current password incorrect')
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      })
    }
    
    user.password = newPassword
    console.log('✅ CHANGE PASSWORD SUCCESS')
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    })
  } catch (error) {
    console.log('❌ CHANGE PASSWORD FAILED: Invalid token')
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    })
  }
})

// ============ ADDRESS ROUTES ============

/**
 * POST /users/me/addresses
 * Add a new address
 */
app.post('/users/me/addresses', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const userIndex = USERS.findIndex(u => u._id === decoded.userId)
    
    if (userIndex === -1) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      })
    }
    
    const { type, street, city, state, pincode } = req.body
    
    if (!street || !city || !state || !pincode) {
      return res.status(400).json({ 
        success: false, 
        message: 'street, city, state and pincode are required' 
      })
    }
    
    const newAddress = {
      _id: `addr_${Date.now()}`,
      type: type || 'HOME',
      street,
      city,
      state,
      pincode
    }
    
    if (!USERS[userIndex].addresses) {
      USERS[userIndex].addresses = []
    }
    
    USERS[userIndex].addresses.push(newAddress)
    USERS[userIndex].updatedAt = new Date().toISOString()
    
    const { password: _, ...userWithoutPassword } = USERS[userIndex]
    
    res.json({
      success: true,
      data: { user: userWithoutPassword }
    })
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    })
  }
})

/**
 * PATCH /users/me/addresses/:addressId
 * Update an address
 */
app.patch('/users/me/addresses/:addressId', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const userIndex = USERS.findIndex(u => u._id === decoded.userId)
    
    if (userIndex === -1) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      })
    }
    
    const addressIndex = USERS[userIndex].addresses.findIndex(
      a => a._id === req.params.addressId
    )
    
    if (addressIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Address not found' 
      })
    }
    
    const { type, street, city, state, pincode } = req.body
    
    if (type !== undefined) USERS[userIndex].addresses[addressIndex].type = type
    if (street !== undefined) USERS[userIndex].addresses[addressIndex].street = street
    if (city !== undefined) USERS[userIndex].addresses[addressIndex].city = city
    if (state !== undefined) USERS[userIndex].addresses[addressIndex].state = state
    if (pincode !== undefined) USERS[userIndex].addresses[addressIndex].pincode = pincode
    
    USERS[userIndex].updatedAt = new Date().toISOString()
    
    const { password: _, ...userWithoutPassword } = USERS[userIndex]
    
    res.json({
      success: true,
      data: { user: userWithoutPassword }
    })
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    })
  }
})

/**
 * DELETE /users/me/addresses/:addressId
 * Delete an address
 */
app.delete('/users/me/addresses/:addressId', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const userIndex = USERS.findIndex(u => u._id === decoded.userId)
    
    if (userIndex === -1) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      })
    }
    
    const addressIndex = USERS[userIndex].addresses.findIndex(
      a => a._id === req.params.addressId
    )
    
    if (addressIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Address not found' 
      })
    }
    
    USERS[userIndex].addresses.splice(addressIndex, 1)
    USERS[userIndex].updatedAt = new Date().toISOString()
    
    const { password: _, ...userWithoutPassword } = USERS[userIndex]
    
    res.json({
      success: true,
      data: { user: userWithoutPassword }
    })
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    })
  }
})


// ============ PATIENT ROUTES ============

/**
 * GET /patients/:id
 * Output: Patient object with random data
 */
app.get('/patients/:id', (req, res) => {
  res.json({
    _id: req.params.id,
    patientName: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
    mobileNumber: `+91 ${randomBetween(7000000000, 9999999999)}`,
    patientAddress: `${randomBetween(1, 999)} ${randomItem(['Main St', 'Park Ave', 'Lake Rd', 'Hill Road', 'Garden Lane'])}, ${randomItem(CITIES)}`,
    dateOfBirth: randomDate(new Date(1940, 0, 1), new Date(2010, 11, 31)).split('T')[0],
    gender: randomItem(['Male', 'Female', 'Other']),
    emergencyContacts: [{
      name: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
      relation: randomItem(['Spouse', 'Parent', 'Sibling', 'Friend']),
      phone: `+91 ${randomBetween(7000000000, 9999999999)}`
    }],
    documents: Array.from({ length: randomBetween(0, 3) }, () => ({
      docId: generateId('doc'),
      name: randomItem(['Medical Report', 'Prescription', 'Lab Results', 'X-Ray', 'MRI Scan']),
      type: randomItem(['PDF', 'JPG', 'PNG', 'DOC']),
      uploadedAt: randomDate(new Date(2025, 0, 1), new Date())
    })),
    createdAt: randomDate(new Date(2024, 0, 1), new Date())
  })
})

/**
 * PUT /patients/:id
 * Input: Partial patient object
 * Output: Updated patient object
 */
app.put('/patients/:id', (req, res) => {
  console.log('📝 UPDATE PATIENT:', { id: req.params.id, ...req.body })
  res.json({
    _id: req.params.id,
    ...req.body,
    updatedAt: new Date().toISOString()
  })
})

/**
 * POST /patients/:id/documents
 * Input: Document data
 * Output: Created document
 */
app.post('/patients/:id/documents', (req, res) => {
  console.log('📝 ADD PATIENT DOCUMENT:', { patientId: req.params.id, ...req.body })
  res.status(201).json({
    docId: generateId('doc'),
    ...req.body,
    uploadedAt: new Date().toISOString()
  })
})

/**
 * DELETE /patients/:patientId/documents/:docId
 * Output: { success: boolean, message: string }
 */
app.delete('/patients/:patientId/documents/:docId', (req, res) => {
  console.log('🗑️ DELETE PATIENT DOCUMENT:', { patientId: req.params.patientId, docId: req.params.docId })
  res.json({ success: true, message: 'Document deleted' })
})

// ============ DOCTOR ROUTES ============

/**
 * GET /doctors
 * Output: Array of doctor objects (public view)
 */
const GENERATED_DOCTORS = []

app.get('/users/doctors', (req, res) => {
  // Generate doctors once, store them
  if (GENERATED_DOCTORS.length === 0) {
    for (let i = 0; i < randomBetween(5, 15); i++) {
      GENERATED_DOCTORS.push({
        _id: generateId('doc'),
        profile: { firstName: randomItem(FIRST_NAMES), lastName: randomItem(LAST_NAMES) },
        phone: `+91 ${randomBetween(7000000000, 9999999999)}`,
        addresses: [{ 
          type: 'CLINIC',
          street: `${randomBetween(1, 999)} ${randomItem(['Main St', 'Park Ave', 'Lake Rd'])}`,
          city: randomItem(CITIES),
          state: randomItem(['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu']),
          pincode: String(randomBetween(100000, 999999))
        }],
        detailsOfHealthCareProfessional: {
          qualifications: Array.from({ length: randomBetween(1, 3) }, () => randomItem(SPECIALIZATIONS)),
          yearsOfExperience: randomBetween(3, 25),
          consultationFee: randomBetween(300, 1500),
          bio: randomItem(['Experienced specialist', 'Board certified', 'Top rated doctor']),
          stats: { 
            rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), 
            totalRatings: randomBetween(10, 500), 
            totalAppointments: randomBetween(50, 1000) 
          }
        },
        profileIcon: randomItem(['👨‍⚕️', '👩‍⚕️', '🩺']),
        // Add availability settings for booking
        availabilitySettings: {
          minAppointmentDuration: 10,
          maxAppointmentDuration: 180,
          advanceBookingDays: 14
        },
        actualAvailableSlots: [
          {
            date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            ranges: [
              { start: '09:00', end: '10:00' },
              { start: '10:30', end: '13:00' }
            ]
          },
          {
            date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
            ranges: [
              { start: '09:00', end: '13:00' },
              { start: '14:00', end: '18:00' }
            ]
          }
        ]
      })
    }
  }
  
  res.json({
    success: true,
    data: GENERATED_DOCTORS,
    pagination: { total: GENERATED_DOCTORS.length, page: 1, limit: 20, pages: 1 }
  })
})

app.get('/users/doctors/:id', (req, res) => {
  const doctorId = req.params.id
  
  // Check GENERATED_DOCTORS first
  let doctor = GENERATED_DOCTORS.find(d => d._id === doctorId)
  
  // If not found, check USERS array
  if (!doctor) {
    const user = USERS.find(u => u._id === doctorId && u.role === 'DOCTOR')
    if (user) {
      doctor = {
        _id: user._id,
        profile: user.profile || { firstName: '', lastName: '' },
        phone: user.phone || '',
        addresses: user.addresses || [],
        detailsOfHealthCareProfessional: user.detailsOfHealthCareProfessional || {},
        profileIcon: user.profileIcon || '👨‍⚕️',
        availabilitySettings: user.availabilitySettings || {
          minAppointmentDuration: 10,
          maxAppointmentDuration: 180,
          advanceBookingDays: 14
        },
        actualAvailableSlots: user.actualAvailableSlots || []
      }
    }
  }
  
  if (!doctor) {
    return res.status(404).json({ 
      success: false, 
      message: 'Doctor not found' 
    })
  }
  
  res.json({
    success: true,
    data: doctor
  })
})


/**
 * PUT /doctors/:id
 * Input: Partial doctor object
 * Output: Updated doctor object
 */
app.put('/doctors/:id', (req, res) => {
  console.log('📝 UPDATE DOCTOR:', { id: req.params.id, ...req.body })
  res.json({
    _id: req.params.id,
    ...req.body,
    updatedAt: new Date().toISOString()
  })
})

/**
 * POST /doctors/:id/documents
 * Input: Document data
 * Output: Created document
 */
app.post('/doctors/:id/documents', (req, res) => {
  console.log('📝 ADD DOCTOR DOCUMENT:', { doctorId: req.params.id, ...req.body })
  res.status(201).json({
    docId: generateId('doc'),
    ...req.body,
    uploadedAt: new Date().toISOString()
  })
})

/**
 * DELETE /doctors/:doctorId/documents/:docId
 * Output: { success: boolean, message: string }
 */
app.delete('/doctors/:doctorId/documents/:docId', (req, res) => {
  console.log('🗑️ DELETE DOCTOR DOCUMENT:', { doctorId: req.params.doctorId, docId: req.params.docId })
  res.json({ success: true, message: 'Document deleted' })
})

/**
 * GET /doctors/:id/earnings
 * Output: { doctorId, total, monthly, pending }
 */
app.get('/doctors/me/earnings', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = USERS.find(u => u._id === decoded.userId)
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      })
    }
    
    if (user.role !== 'DOCTOR') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not a doctor' 
      })
    }
    
    // Generate realistic mock data
    const completedCount = randomBetween(10, 50)
    const confirmedCount = randomBetween(3, 15)
    const cancelledCount = randomBetween(0, 5)
    
    const completedEarnings = completedCount * randomBetween(300, 1500)
    const confirmedEarnings = confirmedCount * randomBetween(300, 1500)
    
    const totalEarnings = completedEarnings + confirmedEarnings
    const totalAppointments = completedCount + confirmedCount + cancelledCount
    
    res.json({
      success: true,
      data: {
        totalEarnings: totalEarnings,
        totalAppointments: totalAppointments,
        breakdownByStatus: [
          {
            _id: 'COMPLETED',
            totalEarnings: completedEarnings,
            totalTax: Math.round(completedEarnings * 0.18),
            count: completedCount
          },
          {
            _id: 'CONFIRMED',
            totalEarnings: confirmedEarnings,
            totalTax: Math.round(confirmedEarnings * 0.18),
            count: confirmedCount
          },
          {
            _id: 'CANCELLED',
            totalEarnings: 0,
            totalTax: 0,
            count: cancelledCount
          }
        ]
      }
    })
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    })
  }
})

// server.js - Async slot generation (doesn't block response)

/**
 * PATCH /doctors/me/availability
 * Input: { availabilitySettings: {...} }
 * Output: { success: true, message: string }
 */
app.patch('/doctors/me/availability', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const userIndex = USERS.findIndex(u => u._id === decoded.userId)
    
    if (userIndex === -1) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      })
    }
    
    if (USERS[userIndex].role !== 'DOCTOR') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not a doctor' 
      })
    }
    
    const { availabilitySettings } = req.body
    
    if (!availabilitySettings) {
      return res.status(400).json({ 
        success: false, 
        message: 'availabilitySettings is required' 
      })
    }
    
    // Save availability settings
    USERS[userIndex].availabilitySettings = availabilitySettings
    USERS[userIndex].updatedAt = new Date().toISOString()
    
    console.log('✅ Availability settings saved for doctor:', decoded.userId)
    
    // Send response immediately
    res.json({
      success: true,
      message: 'Availability settings saved successfully'
    })
    
    // Generate slots asynchronously (don't wait for it)
    generateSlotsAsync(userIndex, availabilitySettings).catch(err => {
      console.error('❌ Async slot generation failed:', err)
    })
    
  } catch (error) {
    console.error('❌ Error updating availability:', error)
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    })
  }
})

// Async slot generation function
async function generateSlotsAsync(userIndex, availabilitySettings) {
  console.log('🔄 Generating slots asynchronously...')
  
  const generatedSlots = []
  const today = new Date()
  const advanceDays = availabilitySettings.advanceBookingDays || 14
  
  for (let i = 0; i < advanceDays; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dayOfWeek = date.getDay()
    
    const daySetting = availabilitySettings.workingHours?.find(w => w.dayOfWeek === dayOfWeek)
    
    if (daySetting?.isWorking && daySetting.slots?.length > 0) {
      const dateStr = date.toISOString().split('T')[0]
      const ranges = daySetting.slots.map(slot => ({
        start: slot.start,
        end: slot.end
      }))
      
      generatedSlots.push({
        date: dateStr,
        ranges: ranges
      })
    }
  }
  
  console.log(`✅ Generated ${generatedSlots.length} slot days`)
  USERS[userIndex].actualAvailableSlots = generatedSlots
}

// ============ REVIEWS ============

const REVIEWS = []

/**
 * GET /reviews
 * Query: targetType (PRODUCT/DOCTOR), targetId
 */
app.get('/reviews', (req, res) => {
  const { targetType, targetId, page = 1, limit = 20 } = req.query

  if (!targetType || !targetId) {
    return res.status(400).json({
      success: false,
      message: 'targetType and targetId are required'
    })
  }

  let reviews = REVIEWS.filter(r => r.targetType === targetType && r.targetId === targetId)

  if (reviews.length === 0) {
    reviews = Array.from({ length: randomBetween(2, 10) }, () => ({
      _id: generateId('rev'),
      reviewerId: {
        _id: generateId('pat'),
        profile: {
          firstName: randomItem(FIRST_NAMES),
          lastName: randomItem(LAST_NAMES)
        }
      },
      targetType: targetType,
      targetId: targetId,
      rating: randomBetween(1, 5),
      reviewText: randomItem([
        'Excellent!',
        'Good experience.',
        'Average.',
        'Disappointed.',
        'Highly recommend!'
      ]),
      createdAt: randomDate(new Date(2025, 0, 1), new Date()),
      updatedAt: new Date().toISOString()
    }))
  }

  const totalReviews = reviews.length
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
  const averageRating = totalReviews > 0 ? parseFloat((totalRating / totalReviews).toFixed(1)) : 0

  const total = reviews.length
  const pages = Math.ceil(total / limit)
  const start = (page - 1) * limit
  const paginated = reviews.slice(start, start + limit)

  res.json({
    success: true,
    data: paginated,
    summary: { averageRating, totalReviews },
    pagination: { total, page: parseInt(page), limit: parseInt(limit), pages }
  })
})

/**
 * POST /reviews
 * ALWAYS CREATES NEW REVIEW. Never updates existing.
 * For PRODUCT: targetType = "PRODUCT", targetId = productId
 * For DOCTOR: targetType = "DOCTOR", targetId = doctorId, appointmentId = appointmentId
 */
app.post('/reviews', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  const { targetType, targetId, rating, reviewText, appointmentId } = req.body

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' })
  }

  if (!targetType || !targetId || !rating) {
    return res.status(400).json({ success: false, message: 'targetType, targetId and rating are required' })
  }

  if (targetType !== 'PRODUCT' && targetType !== 'DOCTOR') {
    return res.status(400).json({ success: false, message: 'targetType must be PRODUCT or DOCTOR' })
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'rating must be between 1 and 5' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = USERS.find(u => u._id === decoded.userId)

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' })
    }

    // ============ VERIFICATION ============
    let isVerified = false

    if (targetType === 'PRODUCT') {
      // For test server: random verification
      isVerified = Math.random() < 0.7
    } else if (targetType === 'DOCTOR') {
      if (appointmentId) {
        // For test server: random verification
        isVerified = Math.random() < 0.7
      } else {
        isVerified = false
      }
    }

    if (!isVerified) {
      return res.status(403).json({
        success: false,
        message: targetType === 'PRODUCT'
          ? 'You cannot review this product. You must have purchased this product first. (error decided using Math.random())'
          : 'You cannot review this doctor. You must have had a completed appointment with this doctor first. (error decided using Math.random())'
      })
    }

    // ============ CHECK IF REVIEW ALREADY EXISTS ============
    // For PRODUCT: one review per user per product
    // For DOCTOR: multiple reviews allowed (one per appointment)
    let existingReview = null

    if (targetType === 'PRODUCT') {
      existingReview = REVIEWS.find(r =>
        r.reviewerId?._id === user._id &&
        r.targetType === 'PRODUCT' &&
        r.targetId === targetId
      )

      if (existingReview) {
        return res.status(409).json({
          success: false,
          message: 'You have already reviewed this product. You can edit your existing review.'
        })
      }
    }

    // For DOCTOR: no check for existing review - multiple allowed
    // (but verify appointmentId is not already used for a review by this user)
    if (targetType === 'DOCTOR' && appointmentId) {
      const reviewForThisAppointment = REVIEWS.find(r =>
        r.reviewerId?._id === user._id &&
        r.targetType === 'DOCTOR' &&
        r.targetId === targetId &&
        r.appointmentId === appointmentId
      )

      if (reviewForThisAppointment) {
        return res.status(409).json({
          success: false,
          message: 'You have already reviewed this doctor for this appointment.'
        })
      }
    }

    // ============ CREATE NEW REVIEW ============
    const newReview = {
      _id: generateId('rev'),
      reviewerId: {
        _id: user._id,
        profile: user.profile || { firstName: 'Test', lastName: 'User' },
        avatar: null
      },
      targetType: targetType,
      targetId: targetId,
      rating: rating,
      reviewText: reviewText || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(targetType === 'DOCTOR' && appointmentId && { appointmentId })
    }

    if (!REVIEWS) REVIEWS = []
    REVIEWS.push(newReview)

    // ============ AUTO-MARK APPOINTMENT AS RATED ============
    // If this is a doctor review with appointmentId, mark it as rated
    if (targetType === 'DOCTOR' && appointmentId) {
      const appointmentIndex = APPOINTMENTS.findIndex(a => a._id === appointmentId)
      if (appointmentIndex !== -1) {
        APPOINTMENTS[appointmentIndex].hasRated = true
        APPOINTMENTS[appointmentIndex].updatedAt = new Date().toISOString()
        console.log(`✅ Auto-marked appointment ${appointmentId} as rated`)
      }
    }

    return res.status(201).json({
      success: true,
      data: newReview,
      message: 'Review submitted successfully'
    })

  } catch (error) {
    console.error('Review error:', error)
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
})

/**
 * PATCH /reviews/:id
 * Update existing review by review ID
 * User can only update their own review
 */
app.patch('/reviews/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  const { rating, reviewText } = req.body

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = USERS.find(u => u._id === decoded.userId)

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' })
    }

    const reviewIndex = REVIEWS.findIndex(r => r._id === req.params.id)

    if (reviewIndex === -1) {
      return res.status(404).json({ success: false, message: 'Review not found' })
    }

    // BLOCK editing doctor reviews
    if (REVIEWS[reviewIndex].targetType === 'DOCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Doctor reviews cannot be edited after submission.'
      })
    }

    if (REVIEWS[reviewIndex].reviewerId._id !== user._id) {
      return res.status(403).json({ success: false, message: 'You can only edit your own reviews' })
    }

    if (rating) REVIEWS[reviewIndex].rating = rating
    if (reviewText !== undefined) REVIEWS[reviewIndex].reviewText = reviewText
    REVIEWS[reviewIndex].updatedAt = new Date().toISOString()

    res.json({
      success: true,
      data: REVIEWS[reviewIndex],
      message: 'Review updated successfully'
    })
  } catch (error) {
    console.error('Error updating review:', error)
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
})

/**
 * DELETE /reviews/:id
 * Delete review by review ID
 * User can only delete their own review
 */
app.delete('/reviews/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = USERS.find(u => u._id === decoded.userId)

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' })
    }

    const reviewIndex = REVIEWS.findIndex(r => r._id === req.params.id)

    if (reviewIndex === -1) {
      return res.status(404).json({ success: false, message: 'Review not found' })
    }

    // BLOCK deleting doctor reviews
    if (REVIEWS[reviewIndex].targetType === 'DOCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Doctor reviews cannot be deleted after submission.'
      })
    }

    if (REVIEWS[reviewIndex].reviewerId._id !== user._id) {
      return res.status(403).json({ success: false, message: 'You can only delete your own reviews' })
    }

    REVIEWS.splice(reviewIndex, 1)

    res.json({
      success: true,
      message: 'Review deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting review:', error)
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
})

// GET /appointments/pending-rating
// Returns appointments where status=COMPLETED AND hasRated=false
app.get('/appointments/pending-rating', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  console.log('🔵 Pending rating called with token:', token ? 'present' : 'missing')
  
  if (!token) {
    console.log('❌ No token')
    return res.status(401).json({ success: false, message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    console.log('✅ Token verified for user:', decoded.userId)
    
    const user = USERS.find(u => u._id === decoded.userId)
    
    if (!user) {
      console.log('❌ User not found')
      return res.status(401).json({ success: false, message: 'User not found' })
    }
    
    console.log('✅ User found:', user._id)
    
    const pendingAppointments = APPOINTMENTS.filter(a =>
      a.patientId === user._id &&
      a.appointmentStatus === 'COMPLETED' &&
      a.hasRated !== true
    )
    
    console.log(`✅ Found ${pendingAppointments.length} pending appointments`)
    
    res.json({
      success: true,
      data: pendingAppointments
    })
    
  } catch (error) {
    console.error('❌ Token verification failed:', error.message)
    // This should match your other endpoints
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
})

// PATCH /appointments/:id/mark-rated
app.patch('/appointments/:id/mark-rated', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = USERS.find(u => u._id === decoded.userId)
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' })
    }
    
    const appointmentIndex = APPOINTMENTS.findIndex(a => a._id === req.params.id)
    
    if (appointmentIndex === -1) {
      return res.status(404).json({ success: false, message: 'Appointment not found' })
    }
    
    APPOINTMENTS[appointmentIndex].hasRated = true
    APPOINTMENTS[appointmentIndex].updatedAt = new Date().toISOString()
    
    res.json({
      success: true,
      message: 'Appointment marked as rated'
    })
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
})

// ============ APPOINTMENT REQUEST ROUTES ============

/**
 * POST /appointment-requests
 * Input: { doctorId, patientId, date, startTime, endTime, duration, reason, type }
 * Output: Created request object
 */
app.post('/appointment-requests', (req, res) => {
  console.log('📝 CREATE APPOINTMENT REQUEST:', req.body)
  const { doctorId, patientId, date, startTime, endTime, duration, reason, type } = req.body
  res.status(201).json({
    _id: generateId('req'),
    doctorId,
    patientId,
    patientName: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
    date,
    startTime,
    endTime,
    duration,
    reason,
<<<<<<< HEAD
    type,
    status: 'PENDING',
    cost: cost,
    createdAt: new Date().toISOString()
  }
  
  db.appointmentRequests.push(newRequest)
  writeDB(db)
  res.status(201).json(newRequest)
})

// Get all requests for a doctor (all statuses except CONFIRMED)
app.get('/appointment-requests/doctor/:doctorId', (req, res) => {
  const db = readDB()
  const requests = (db.appointmentRequests || []).filter(r => 
    r.doctorId === req.params.doctorId && 
    r.status !== 'CONFIRMED' &&
    r.status !== 'CANCELLED'
  )
  
  const enhanced = requests.map(req => {
    const patient = db.patients.find(p => p._id === req.patientId)
    return {
      ...req,
      patientName: patient?.patientName || 'Unknown',
      patientPhone: patient?.mobileNumber || 'Not provided',
      hasTimeClash: !!req.timeClashNote
    }
  })
  
  res.json(enhanced)
})

// Get all requests for a patient (all statuses except CONFIRMED)
app.get('/appointment-requests/patient/:patientId', (req, res) => {
  const db = readDB()
  const requests = (db.appointmentRequests || []).filter(r => 
    r.patientId === req.params.patientId && 
    r.status !== 'CONFIRMED' &&
    r.status !== 'CANCELLED'
  )
  
  const enhanced = requests.map(req => {
    const doctor = db.doctors.find(d => d._id === req.doctorId)
    return {
      ...req,
      doctorName: doctor?.doctorName || 'Unknown',
      isChangeRequested: req.status === 'CHANGE_REQUESTED',
      hasTimeClash: !!req.timeClashNote
    }
  })
  
  res.json(enhanced)
})

// Approve a request (doctor action)
app.put('/appointment-requests/:id/approve', (req, res) => {
  const db = readDB()
  
  const requestIndex = (db.appointmentRequests || []).findIndex(r => r._id === req.params.id)
  if (requestIndex === -1) return res.status(404).json({ message: 'Request not found' })
  
  const request = db.appointmentRequests[requestIndex]
  
  if (request.status !== 'PENDING') {
    return res.status(400).json({ message: `Cannot approve request with status: ${request.status}` })
  }
  
  // Check expiry
  const startDateTime = new Date(`${request.date}T${request.startTime}`)
  const minutesUntilStart = (startDateTime - new Date()) / 1000 / 60
  if (minutesUntilStart < 10 && minutesUntilStart > 0) {
    request.status = 'CANCELLED'
    request.cancellationReason = 'Request expired - doctor did not respond in time'
    request.cancelledBy = 'SYSTEM'
    writeDB(db)
    return res.status(400).json({ message: 'Request has expired' })
  }
  
  // Check time clash with existing confirmed appointments
  const conflictingAppointment = (db.appointments || []).find(a => 
    a.doctorId === request.doctorId &&
    a.date === request.date &&
    a.appointmentStatus === 'CONFIRMED' &&
    ((request.startTime >= a.startTime && request.startTime < a.endTime) ||
     (request.endTime > a.startTime && request.endTime <= a.endTime))
  )
  
  if (conflictingAppointment) {
    request.status = 'CANCELLED'
    request.cancellationReason = 'Time clash with approved appointment'
    request.cancelledBy = 'SYSTEM'
    request.timeClashNote = `Clashes with appointment at ${conflictingAppointment.startTime}`
    writeDB(db)
    return res.status(400).json({ message: 'Time clash with existing appointment' })
  }
  
  // Create appointment
  const doctor = db.doctors.find(d => d._id === request.doctorId)
  const newAppointment = {
    _id: `apt_${Date.now()}`,
    patientId: request.patientId,
    doctorId: request.doctorId,
    consultationFees: doctor?.consultationFees || 0,
    costBreakdown: cost,
    appointmentStartDateTime: `${request.date}T${request.startTime}:00.000Z`,
    appointmentEndDateTime: `${request.date}T${request.endTime}:00.000Z`,
    consultationType: request.type || 'VIDEO',
    appointmentStatus: 'CONFIRMED',
    meetingId: `meet_${Date.now()}`,
    meetingLink: `https://meet.viqure.com/meet_${Date.now()}`,
    createdAt: new Date().toISOString()
  }
  
  if (!db.appointments) db.appointments = []
  db.appointments.push(newAppointment)
  
  // Cancel other PENDING requests that clash
  (db.appointmentRequests || []).forEach(other => {
    if (other._id !== request._id &&
        other.doctorId === request.doctorId &&
        other.date === request.date &&
        other.status === 'PENDING' &&
        ((other.startTime >= request.startTime && other.startTime < request.endTime) ||
         (other.endTime > request.startTime && other.endTime <= request.endTime))) {
      other.status = 'CANCELLED'
      other.cancellationReason = 'Time slot no longer available - booked by another patient'
      other.cancelledBy = 'SYSTEM'
      other.timeClashNote = `Clashes with approved booking at ${request.startTime}`
    }
  })
  
  // Update request
  request.status = 'CONFIRMED'
  request.convertedToAppointmentId = newAppointment._id
  
  // Update doctor's actualAvailableSlots
  if (doctor && doctor.actualAvailableSlots) {
    const daySlotIndex = doctor.actualAvailableSlots.findIndex(s => s.date === request.date)
    if (daySlotIndex !== -1) {
      const ranges = doctor.actualAvailableSlots[daySlotIndex].ranges
      let rangeIndex = -1
      let originalRange = null
      
      for (let i = 0; i < ranges.length; i++) {
        if (request.startTime >= ranges[i].start && request.endTime <= ranges[i].end) {
          rangeIndex = i
          originalRange = ranges[i]
          break
        }
      }
      
      if (rangeIndex !== -1) {
        const newRanges = []
        const cooldownEnd = addMinutes(request.endTime, 10)
        if (originalRange.start < request.startTime) newRanges.push({ start: originalRange.start, end: request.startTime })
        if (cooldownEnd < originalRange.end) newRanges.push({ start: cooldownEnd, end: originalRange.end })
        ranges.splice(rangeIndex, 1, ...newRanges)
      }
    }
  }
  
  writeDB(db)
  res.json({ success: true, appointment: newAppointment })
})

// Doctor requests change to a request
app.put('/appointment-requests/:id/request-change', (req, res) => {
  const { suggestedStartTime, suggestedEndTime, suggestedDuration, suggestedReason } = req.body
  const db = readDB()
  
  const requestIndex = (db.appointmentRequests || []).findIndex(r => r._id === req.params.id)
  if (requestIndex === -1) return res.status(404).json({ message: 'Request not found' })
  
  const request = db.appointmentRequests[requestIndex]
  if (request.status !== 'PENDING') return res.status(400).json({ message: 'Request cannot be changed' })
  
  request.status = 'CHANGE_REQUESTED'
  request.suggestedStartTime = suggestedStartTime
  request.suggestedEndTime = suggestedEndTime
  request.suggestedDuration = suggestedDuration
  request.suggestedReason = suggestedReason
  request.updatedAt = new Date().toISOString()
  
  writeDB(db)
  res.json({ success: true, request })
})

// Patient responds to change request
app.put('/appointment-requests/:id/patient-response', (req, res) => {
  const { response } = req.body
  const db = readDB()
  
  const requestIndex = (db.appointmentRequests || []).findIndex(r => r._id === req.params.id)
  if (requestIndex === -1) return res.status(404).json({ message: 'Request not found' })
  
  const request = db.appointmentRequests[requestIndex]
  if (request.status !== 'CHANGE_REQUESTED') return res.status(400).json({ message: 'No change request pending' })
  
  if (response === 'ACCEPT') {
    // Check time clash at suggested time
    const conflictingAppointment = (db.appointments || []).find(a => 
      a.doctorId === request.doctorId &&
      a.date === request.date &&
      a.appointmentStatus === 'CONFIRMED' &&
      ((request.suggestedStartTime >= a.startTime && request.suggestedStartTime < a.endTime) ||
       (request.suggestedEndTime > a.startTime && request.suggestedEndTime <= a.endTime))
    )
    
    if (conflictingAppointment) {
      request.status = 'CANCELLED'
      request.cancellationReason = 'Suggested time slot no longer available'
      request.cancelledBy = 'SYSTEM'
      writeDB(db)
      return res.status(400).json({ message: 'Suggested time slot is no longer available' })
    }
    
    // Create appointment with suggested time
    const doctor = db.doctors.find(d => d._id === request.doctorId)
    const newAppointment = {
      _id: `apt_${Date.now()}`,
      patientId: request.patientId,
      doctorId: request.doctorId,
      consultationFees: doctor?.consultationFees || 0,
      appointmentStartDateTime: `${request.date}T${request.suggestedStartTime}:00.000Z`,
      appointmentEndDateTime: `${request.date}T${request.suggestedEndTime}:00.000Z`,
      consultationType: request.type || 'VIDEO',
      appointmentStatus: 'CONFIRMED',
      meetingId: `meet_${Date.now()}`,
      meetingLink: `https://meet.viqure.com/meet_${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    
    if (!db.appointments) db.appointments = []
    db.appointments.push(newAppointment)
    
    // Cancel other PENDING requests that clash
    (db.appointmentRequests || []).forEach(other => {
      if (other._id !== request._id &&
          other.doctorId === request.doctorId &&
          other.date === request.date &&
          other.status === 'PENDING' &&
          ((other.startTime >= request.suggestedStartTime && other.startTime < request.suggestedEndTime) ||
           (other.endTime > request.suggestedStartTime && other.endTime <= request.suggestedEndTime))) {
        other.status = 'CANCELLED'
        other.cancellationReason = 'Time slot no longer available - booked by another patient'
        other.cancelledBy = 'SYSTEM'
      }
    })
    
    request.status = 'CONFIRMED'
    request.convertedToAppointmentId = newAppointment._id
    
    // Update doctor's actualAvailableSlots
    if (doctor && doctor.actualAvailableSlots) {
      const daySlotIndex = doctor.actualAvailableSlots.findIndex(s => s.date === request.date)
      if (daySlotIndex !== -1) {
        const ranges = doctor.actualAvailableSlots[daySlotIndex].ranges
        let rangeIndex = -1
        let originalRange = null
        
        for (let i = 0; i < ranges.length; i++) {
          if (request.suggestedStartTime >= ranges[i].start && request.suggestedEndTime <= ranges[i].end) {
            rangeIndex = i
            originalRange = ranges[i]
            break
          }
        }
        
        if (rangeIndex !== -1) {
          const newRanges = []
          const cooldownEnd = addMinutes(request.suggestedEndTime, 10)
          if (originalRange.start < request.suggestedStartTime) newRanges.push({ start: originalRange.start, end: request.suggestedStartTime })
          if (cooldownEnd < originalRange.end) newRanges.push({ start: cooldownEnd, end: originalRange.end })
          ranges.splice(rangeIndex, 1, ...newRanges)
        }
      }
    }
    
  } else if (response === 'REJECT') {
    request.status = 'CANCELLED'
    request.cancellationReason = 'Patient rejected doctor\'s change request'
    request.cancelledBy = 'PATIENT'
  }
  
  writeDB(db)
  res.json({ success: true })
})

// Cancel a request (patient or doctor)
app.put('/appointment-requests/:id/cancel', (req, res) => {
  const { reason, cancelledBy } = req.body
  const db = readDB()
  
  const requestIndex = (db.appointmentRequests || []).findIndex(r => r._id === req.params.id)
  if (requestIndex === -1) return res.status(404).json({ message: 'Request not found' })
  
  const request = db.appointmentRequests[requestIndex]
  request.status = 'CANCELLED'
  request.cancellationReason = reason || 'Cancelled by user'
  request.cancelledBy = cancelledBy || 'USER'
  request.updatedAt = new Date().toISOString()
  
  writeDB(db)
=======
    type: type || 'VIDEO',
    status: 'PENDING',
    cost: {
      subtotal: randomBetween(300, 1500),
      tax: randomBetween(50, 300),
      total: randomBetween(350, 1800),
      currency: 'INR'
    },
    createdAt: new Date().toISOString()
  })
})

/**
 * GET /appointment-requests/doctor/:doctorId
 * Output: Array of appointment requests for doctor
 */
app.get('/appointment-requests/doctor/:doctorId', (req, res) => {
  const requests = Array.from({ length: randomBetween(1, 5) }, () => ({
    _id: generateId('req'),
    doctorId: req.params.doctorId,
    patientId: generateId('pat'),
    patientName: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
    patientPhone: `+91 ${randomBetween(7000000000, 9999999999)}`,
    date: new Date(Date.now() + randomBetween(1, 14) * 86400000).toISOString().split('T')[0],
    startTime: `${String(randomBetween(9, 17)).padStart(2, '0')}:00`,
    endTime: `${String(randomBetween(10, 18)).padStart(2, '0')}:00`,
    duration: randomBetween(15, 60),
    reason: randomItem(['Routine checkup', 'Follow-up', 'New symptom', 'Consultation']),
    type: randomItem(CONSULTATION_TYPES),
    status: randomItem(['PENDING', 'CHANGE_REQUESTED', 'CANCELLED']),
    cost: {
      subtotal: randomBetween(300, 1500),
      tax: randomBetween(50, 300),
      total: randomBetween(350, 1800),
      currency: 'INR'
    },
    hasTimeClash: Math.random() > 0.8,
    createdAt: randomDate(new Date(2025, 0, 1), new Date())
  }))
  res.json(requests)
})

/**
 * GET /appointment-requests/patient/:patientId
 * Output: Array of appointment requests for patient
 */
app.get('/appointment-requests/patient/:patientId', (req, res) => {
  const requests = Array.from({ length: randomBetween(1, 5) }, () => ({
    _id: generateId('req'),
    doctorId: generateId('doc'),
    patientId: req.params.patientId,
    doctorName: `Dr. ${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
    date: new Date(Date.now() + randomBetween(1, 14) * 86400000).toISOString().split('T')[0],
    startTime: `${String(randomBetween(9, 17)).padStart(2, '0')}:00`,
    endTime: `${String(randomBetween(10, 18)).padStart(2, '0')}:00`,
    duration: randomBetween(15, 60),
    reason: randomItem(['Routine checkup', 'Follow-up', 'New symptom', 'Consultation']),
    type: randomItem(CONSULTATION_TYPES),
    status: randomItem(['PENDING', 'CHANGE_REQUESTED', 'CANCELLED']),
    cost: {
      subtotal: randomBetween(300, 1500),
      tax: randomBetween(50, 300),
      total: randomBetween(350, 1800),
      currency: 'INR'
    },
    isChangeRequested: Math.random() > 0.7,
    hasTimeClash: Math.random() > 0.8,
    createdAt: randomDate(new Date(2025, 0, 1), new Date())
  }))
  res.json(requests)
})

/**
 * PUT /appointment-requests/:id/approve
 * Output: { success, appointment }
 */
app.put('/appointment-requests/:id/approve', (req, res) => {
  console.log('✅ APPROVE APPOINTMENT REQUEST:', { id: req.params.id })
  res.json({
    success: true,
    appointment: {
      _id: generateId('apt'),
      patientId: generateId('pat'),
      doctorId: generateId('doc'),
      consultationFees: randomBetween(300, 1500),
      appointmentStartDateTime: new Date(Date.now() + 86400000).toISOString(),
      appointmentEndDateTime: new Date(Date.now() + 86400000 + 1800000).toISOString(),
      duration: randomBetween(15, 60),
      consultationType: randomItem(CONSULTATION_TYPES),
      appointmentStatus: 'CONFIRMED',
      meetingId: generateId('meet'),
      meetingLink: `https://meet.viqure.com/${generateId('meet')}`,
      createdAt: new Date().toISOString()
    }
  })
})

/**
 * PUT /appointment-requests/:id/request-change
 * Input: { suggestedStartTime, suggestedEndTime, suggestedDuration, suggestedReason }
 * Output: { success, request }
 */
app.put('/appointment-requests/:id/request-change', (req, res) => {
  console.log('🔄 REQUEST CHANGE:', { id: req.params.id, ...req.body })
  res.json({
    success: true,
    request: {
      _id: req.params.id,
      ...req.body,
      status: 'CHANGE_REQUESTED',
      updatedAt: new Date().toISOString()
    }
  })
})

/**
 * PUT /appointment-requests/:id/patient-response
 * Input: { response: 'ACCEPT' | 'REJECT' }
 * Output: { success }
 */
app.put('/appointment-requests/:id/patient-response', (req, res) => {
  console.log('📝 PATIENT RESPONSE:', { id: req.params.id, response: req.body.response })
  res.json({ success: true })
})

/**
 * PUT /appointment-requests/:id/cancel
 * Input: { reason, cancelledBy }
 * Output: { success }
 */
app.put('/appointment-requests/:id/cancel', (req, res) => {
  console.log('❌ CANCEL REQUEST:', { id: req.params.id, ...req.body })
  res.json({ success: true })
})

// ============ APPOINTMENT ROUTES ============

/**
 * GET /appointments/patient/:patientId
 * Output: Array of appointments for patient
 */
app.get('/appointments/patient/:patientId', (req, res) => {
  const appointments = Array.from({ length: randomBetween(2, 8) }, () => ({
    _id: generateId('apt'),
    patientId: req.params.patientId,
    doctorId: generateId('doc'),
    doctorName: `Dr. ${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
    doctorSpecialization: randomItem(SPECIALIZATIONS),
    consultationFees: randomBetween(300, 1500),
    appointmentStartDateTime: new Date(Date.now() + randomBetween(1, 30) * 86400000).toISOString(),
    appointmentEndDateTime: new Date(Date.now() + randomBetween(1, 30) * 86400000 + 1800000).toISOString(),
    duration: randomBetween(15, 60),
    consultationType: randomItem(CONSULTATION_TYPES),
    appointmentStatus: randomItem(['CONFIRMED', 'COMPLETED', 'CANCELLED']),
    isVirtual: Math.random() > 0.5,
    canJoin: Math.random() > 0.7,
    meetingId: generateId('meet'),
    meetingLink: `https://meet.viqure.com/${generateId('meet')}`,
    createdAt: randomDate(new Date(2025, 0, 1), new Date())
  }))
  res.json(appointments)
})

/**
 * GET /appointments/doctor/:doctorId
 * Output: Array of appointments for doctor
 */
app.get('/appointments/doctor/:doctorId', (req, res) => {
  const appointments = Array.from({ length: randomBetween(2, 8) }, () => ({
    _id: generateId('apt'),
    patientId: generateId('pat'),
    doctorId: req.params.doctorId,
    patientName: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
    patientPhone: `+91 ${randomBetween(7000000000, 9999999999)}`,
    consultationFees: randomBetween(300, 1500),
    appointmentStartDateTime: new Date(Date.now() + randomBetween(1, 30) * 86400000).toISOString(),
    appointmentEndDateTime: new Date(Date.now() + randomBetween(1, 30) * 86400000 + 1800000).toISOString(),
    duration: randomBetween(15, 60),
    consultationType: randomItem(CONSULTATION_TYPES),
    appointmentStatus: randomItem(['CONFIRMED', 'COMPLETED', 'CANCELLED']),
    canJoin: Math.random() > 0.7,
    meetingId: generateId('meet'),
    meetingLink: `https://meet.viqure.com/${generateId('meet')}`,
    createdAt: randomDate(new Date(2025, 0, 1), new Date())
  }))
  res.json(appointments)
})

/**
 * PUT /appointments/:id/cancel
 * Input: { reason, cancelledBy }
 * Output: { success }
 */
app.put('/appointments/:id/cancel', (req, res) => {
  console.log('❌ CANCEL APPOINTMENT:', { id: req.params.id, ...req.body })
  res.json({ success: true })
})

/**
 * PUT /appointments/:id/complete
 * Output: { success }
 */
app.put('/appointments/:id/complete', (req, res) => {
  console.log('✅ COMPLETE APPOINTMENT:', { id: req.params.id })
  res.json({ success: true })
})

// ============ ADMIN ROUTES ============

/**
 * GET /admin/pending-doctors
 * Output: Array of pending doctors
 */
app.get('/admin/pending-doctors', (req, res) => {
  const pendingDoctors = Array.from({ length: randomBetween(1, 5) }, () => ({
    _id: generateId('pending'),
    doctorName: `Dr. ${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
    email: `${randomItem(FIRST_NAMES).toLowerCase()}@example.com`,
    phone: `+91 ${randomBetween(7000000000, 9999999999)}`,
    specialization: randomItem(SPECIALIZATIONS),
    licenseNumber: `LIC-${randomBetween(1000, 9999)}-${randomBetween(1000, 9999)}`,
    experience: randomBetween(1, 20),
    clinicName: `Clinic ${randomItem(['Care', 'Health', 'Wellness'])}`,
    clinicAddress: `${randomBetween(1, 999)} ${randomItem(['Main St', 'Park Ave', 'Lake Rd'])}, ${randomItem(CITIES)}`,
    consultationFee: randomBetween(300, 1500),
    bio: randomItem(['Experienced specialist', 'Board certified', 'Top rated doctor']),
    status: 'pending',
    submittedAt: randomDate(new Date(2025, 0, 1), new Date())
  }))
  res.json(pendingDoctors)
})

/**
 * PUT /admin/doctors/:id/approve
 * Output: { success, message }
 */
app.put('/admin/doctors/:id/approve', (req, res) => {
  console.log('✅ APPROVE DOCTOR:', { id: req.params.id })
  res.json({ success: true, message: 'Doctor approved successfully' })
})

/**
 * PUT /admin/doctors/:id/reject
 * Output: { success, message }
 */
app.put('/admin/doctors/:id/reject', (req, res) => {
  console.log('❌ REJECT DOCTOR:', { id: req.params.id })
  res.json({ success: true, message: 'Doctor registration rejected' })
})

/**
 * GET /admin/stats
 * Output: Admin statistics
 */
app.get('/admin/stats', (req, res) => {
  res.json({
    totalUsers: randomBetween(50, 500),
    totalDoctors: randomBetween(10, 100),
    totalPatients: randomBetween(40, 400),
    totalAppointments: randomBetween(20, 200),
    totalOrders: randomBetween(10, 100),
    totalRevenue: randomBetween(50000, 500000),
    pendingApprovals: randomBetween(1, 10),
    lowStockProducts: randomBetween(0, 5)
  })
})

/**
 * GET /admin/patients
 * Output: Array of patients with emails
 */
app.get('/admin/patients', (req, res) => {
  const patients = Array.from({ length: randomBetween(5, 20) }, () => ({
    _id: generateId('pat'),
    patientName: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
    mobileNumber: `+91 ${randomBetween(7000000000, 9999999999)}`,
    patientAddress: `${randomBetween(1, 999)} ${randomItem(['Main St', 'Park Ave', 'Lake Rd'])}, ${randomItem(CITIES)}`,
    dateOfBirth: randomDate(new Date(1940, 0, 1), new Date(2010, 11, 31)).split('T')[0],
    gender: randomItem(['Male', 'Female', 'Other']),
    email: `${randomItem(FIRST_NAMES).toLowerCase()}@example.com`,
    createdAt: randomDate(new Date(2024, 0, 1), new Date())
  }))
  res.json(patients)
})

/**
 * GET /admin/doctors
 * Output: Array of doctors with emails
 */
app.get('/admin/doctors', (req, res) => {
  const doctors = Array.from({ length: randomBetween(5, 15) }, () => ({
    _id: generateId('doc'),
    doctorName: `Dr. ${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
    email: `${randomItem(FIRST_NAMES).toLowerCase()}@example.com`,
    phone: `+91 ${randomBetween(7000000000, 9999999999)}`,
    city: randomItem(CITIES),
    specializations: Array.from({ length: randomBetween(1, 3) }, () => randomItem(SPECIALIZATIONS)),
    clinicName: `Clinic ${randomItem(['Care', 'Health', 'Wellness'])}`,
    consultationFees: randomBetween(300, 1500),
    status: randomItem(['active', 'inactive']),
    approvalStatus: 'approved',
    createdAt: randomDate(new Date(2024, 0, 1), new Date())
  }))
  res.json(doctors)
})

/**
 * DELETE /admin/doctors/:id
 * Output: { success }
 */
app.delete('/admin/doctors/:id', (req, res) => {
  console.log('🗑️ DELETE DOCTOR:', { id: req.params.id })
  res.json({ success: true })
})

/**
 * GET /admin/appointments
 * Output: Array of appointments with patient/doctor names
 */
app.get('/admin/appointments', (req, res) => {
  const appointments = Array.from({ length: randomBetween(5, 15) }, () => ({
    _id: generateId('apt'),
    patientId: generateId('pat'),
    doctorId: generateId('doc'),
    patientName: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
    doctorName: `Dr. ${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
    consultationFees: randomBetween(300, 1500),
    appointmentStartDateTime: new Date(Date.now() + randomBetween(1, 30) * 86400000).toISOString(),
    appointmentEndDateTime: new Date(Date.now() + randomBetween(1, 30) * 86400000 + 1800000).toISOString(),
    consultationType: randomItem(CONSULTATION_TYPES),
    appointmentStatus: randomItem(['CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED']),
    createdAt: randomDate(new Date(2024, 0, 1), new Date())
  }))
  res.json(appointments)
})

/**
 * PUT /admin/appointments/:id
 * Input: { status }
 * Output: { success }
 */
app.put('/admin/appointments/:id', (req, res) => {
  console.log('📝 UPDATE APPOINTMENT (ADMIN):', { id: req.params.id, ...req.body })
  res.json({ success: true })
})

/**
 * GET /admin/orders
 * Output: Array of orders with patient details
 */
app.get('/admin/orders', (req, res) => {
  const orders = Array.from({ length: randomBetween(5, 15) }, () => ({
    _id: generateId('ord'),
    patientName: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
    patientEmail: `${randomItem(FIRST_NAMES).toLowerCase()}@example.com`,
    status: randomItem(ORDER_STATUSES),
    pricing: {
      subtotal: randomBetween(500, 5000),
      deliveryCharge: randomBetween(0, 100),
      discount: randomBetween(0, 500),
      finalAmount: randomBetween(500, 5500),
      currency: 'INR'
    },
    createdAt: randomDate(new Date(2024, 0, 1), new Date())
  }))
  res.json(orders)
})

/**
 * PUT /admin/orders/:id
 * Input: { status }
 * Output: { success }
 */
app.put('/admin/orders/:id', (req, res) => {
  console.log('📝 UPDATE ORDER (ADMIN):', { id: req.params.id, ...req.body })
  res.json({ success: true })
})

/**
 * GET /admin/categories
 * Output: Array of categories
 */
app.get('/admin/categories', (req, res) => {
  const categories = Array.from({ length: randomBetween(3, 8) }, () => ({
    _id: generateId('cat'),
    name: randomItem(['Medicines', 'Supplements', 'Medical Equipment', 'Wellness', 'Vitamins', 'Herbal']),
    slug: randomItem(['medicines', 'supplements', 'equipment', 'wellness', 'vitamins', 'herbal']),
    description: randomItem(['Quality medicines', 'Health supplements', 'Medical devices', 'Wellness products']),
    image: `/images/categories/${randomItem(['medicines', 'supplements', 'equipment'])}.jpg`,
    bannerImage: `/images/banners/${randomItem(['banner1', 'banner2', 'banner3'])}.jpg`,
    productCount: randomBetween(5, 30),
    createdAt: randomDate(new Date(2024, 0, 1), new Date())
  }))
  res.json(categories)
})

/**
 * POST /admin/categories
 * Input: { name, slug, description, image }
 * Output: Created category
 */
app.post('/admin/categories', (req, res) => {
  console.log('📝 CREATE CATEGORY:', req.body)
  res.status(201).json({
    _id: generateId('cat'),
    ...req.body,
    productCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
})

/**
 * PUT /admin/categories/:id
 * Input: { name, slug, description, image }
 * Output: Updated category
 */
app.put('/admin/categories/:id', (req, res) => {
  console.log('📝 UPDATE CATEGORY:', { id: req.params.id, ...req.body })
  res.json({
    _id: req.params.id,
    ...req.body,
    updatedAt: new Date().toISOString()
  })
})

/**
 * DELETE /admin/categories/:id
 * Output: { success }
 */
app.delete('/admin/categories/:id', (req, res) => {
  console.log('🗑️ DELETE CATEGORY:', { id: req.params.id })
  res.json({ success: true })
})

/**
 * GET /admin/products
 * Output: Array of products
 */
app.get('/admin/products', (req, res) => {
  const products = Array.from({ length: randomBetween(5, 20) }, () => ({
    _id: generateId('prod'),
    name: randomItem(PRODUCT_NAMES),
    slug: randomItem(PRODUCT_NAMES).toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
    description: randomItem(['High quality product', 'Doctor recommended', 'Best seller', 'New arrival']),
    brand: randomItem(BRANDS),
    category: {
      categoryID: generateId('cat'),
      name: randomItem(['Medicines', 'Supplements', 'Medical Equipment', 'Wellness'])
    },
    images: Array.from({ length: randomBetween(1, 3) }, () => `/images/products/${randomItem(['prod1', 'prod2', 'prod3'])}.jpg`),
    basecost: randomBetween(100, 5000),
    discountfactor: parseFloat((Math.random() * 0.3).toFixed(2)),
    inventory: {
      stockQty: randomBetween(5, 100),
      sku: `SKU-${randomBetween(1000, 9999)}`,
      lowStockThreshold: randomBetween(5, 20)
    },
    ratings: {
      average: parseFloat((Math.random() * 2 + 3).toFixed(1)),
      totalReviews: randomBetween(5, 50)
    },
    isAvailable: Math.random() > 0.2,
    estimatedDeliveryDays: randomBetween(2, 7),
    createdAt: randomDate(new Date(2024, 0, 1), new Date())
  }))
  res.json(products)
})

/**
 * POST /admin/products
 * Input: { name, brand, category, description, basecost, discountfactor, inventory, images, estimatedDeliveryDays }
 * Output: Created product
 */
app.post('/admin/products', (req, res) => {
  console.log('📝 CREATE PRODUCT:', req.body)
  res.status(201).json({
    _id: generateId('prod'),
    ...req.body,
    slug: `${req.body.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    ratings: { average: 0, totalReviews: 0 },
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
})

/**
 * PUT /admin/products/:id
 * Input: Partial product object
 * Output: Updated product
 */
app.put('/admin/products/:id', (req, res) => {
  console.log('📝 UPDATE PRODUCT:', { id: req.params.id, ...req.body })
  res.json({
    _id: req.params.id,
    ...req.body,
    updatedAt: new Date().toISOString()
  })
})

/**
 * DELETE /admin/products/:id
 * Output: { success }
 */
app.delete('/admin/products/:id', (req, res) => {
  console.log('🗑️ DELETE PRODUCT:', { id: req.params.id })
  res.json({ success: true })
})

/**
 * GET /admin/notifications
 * Output: Array of notifications
 */
app.get('/admin/notifications', (req, res) => {
  const notifications = Array.from({ length: randomBetween(3, 10) }, () => ({
    _id: generateId('notif'),
    title: randomItem(['New doctor registration', 'Payment received', 'Order placed', 'Appointment booked']),
    message: randomItem(['A new doctor has registered for approval', 'Payment of ₹1500 received', 'New order from patient', 'Appointment scheduled for tomorrow']),
    type: randomItem(['success', 'info', 'warning', 'error']),
    read: Math.random() > 0.5,
    createdAt: randomDate(new Date(2025, 0, 1), new Date())
  }))
  res.json(notifications)
})

/**
 * PUT /admin/notifications/:id/read
 * Output: { success }
 */
app.put('/admin/notifications/:id/read', (req, res) => {
  console.log('📝 MARK NOTIFICATION READ:', { id: req.params.id })
  res.json({ success: true })
})

/**
 * PUT /admin/notifications/read-all
 * Output: { success }
 */
app.put('/admin/notifications/read-all', (req, res) => {
  console.log('📝 MARK ALL NOTIFICATIONS READ')
  res.json({ success: true })
})

/**
 * GET /admin/settings
 * Output: Settings object
 */
app.get('/admin/settings', (req, res) => {
  res.json({
    siteName: 'HealthApp',
    contactEmail: 'admin@healthapp.com',
    contactPhone: '+91 98765 43210',
    address: `${randomBetween(1, 999)} ${randomItem(['Main St', 'Park Ave', 'Lake Rd'])}, ${randomItem(CITIES)}`,
    deliveryCharge: randomBetween(30, 60),
    freeDeliveryMin: randomBetween(300, 700),
    taxRate: randomBetween(5, 12)
  })
})

/**
 * PUT /admin/settings
 * Input: Partial settings object
 * Output: { success }
 */
app.put('/admin/settings', (req, res) => {
  console.log('📝 UPDATE SETTINGS:', req.body)
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
  res.json({ success: true })
})


<<<<<<< HEAD
// Calculate cost for a booking
app.post('/booking/calculate-cost', (req, res) => {
  const { doctorId, date, startTime, endTime, duration, type } = req.body
  const db = readDB()
  
  const doctor = db.doctors.find(d => d._id === doctorId)
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' })
  }
  
  const baseFee = doctor.consultationFees || 500
  
  // Calculate based on duration and type
  const perMinuteRate = baseFee / 30
  let multiplier = 1.0
  
  if (duration <= 15) multiplier = 0.6
  else if (duration <= 30) multiplier = 1.0
  else if (duration <= 45) multiplier = 1.3
  else if (duration <= 60) multiplier = 1.5
  else multiplier = 1.5 + (duration - 60) / 60 * 0.3
  
  if (type === 'VIDEO') multiplier *= 1.0
  else if (type === 'CHAT') multiplier *= 0.8
  else if (type === 'CLINIC') multiplier *= 1.2
  
=======
// ============ PRODUCT ROUTES (PUBLIC) ============

/**
 * GET /products
 * Query: q, categoryId, minPrice, maxPrice, sort (price_asc, price_desc, name_asc)
 * Output: { success: true, data: [...], pagination: {...} }
 * 
 * 
 */

const CATEGORY_LIST = [
  { _id: 'cat_medicines', name: 'Medicines', icon: 'pill', description: 'Quality medicines' },
  { _id: 'cat_supplements', name: 'Supplements', icon: 'capsule', description: 'Health supplements' },
  { _id: 'cat_equipment', name: 'Medical Equipment', icon: 'stethoscope', description: 'Medical devices' },
  { _id: 'cat_wellness', name: 'Wellness', icon: 'heart-pulse', description: 'Wellness products' },
  { _id: 'cat_vitamins', name: 'Vitamins', icon: 'flask', description: 'Daily vitamins' },
  { _id: 'cat_herbal', name: 'Herbal', icon: 'leaf', description: 'Herbal products' },
  { _id: 'cat_diabetes', name: 'Diabetes Care', icon: 'droplet', description: 'Diabetes management' },
  { _id: 'cat_digestive', name: 'Digestive Care', icon: 'stomach', description: 'Digestive health' }
]


app.get('/products', (req, res) => {
  const { q, categoryId, minPrice, maxPrice, sort, page = 1, limit = 20 } = req.query
  
  const CATEGORIES = [
    { _id: 'cat_medicines', name: 'Medicines', icon: 'pill' },
    { _id: 'cat_supplements', name: 'Supplements', icon: 'capsule' },
    { _id: 'cat_equipment', name: 'Medical Equipment', icon: 'stethoscope' },
    { _id: 'cat_wellness', name: 'Wellness', icon: 'heart-pulse' },
    { _id: 'cat_vitamins', name: 'Vitamins', icon: 'flask' },
    { _id: 'cat_herbal', name: 'Herbal', icon: 'leaf' },
    { _id: 'cat_diabetes', name: 'Diabetes Care', icon: 'droplet' },
    { _id: 'cat_digestive', name: 'Digestive Care', icon: 'stomach' }
  ]
  
  const SUPPLIERS = ['Micro Labs Ltd', 'Sun Pharma', 'Apex Laboratories', 'LifeScan', 'FDC Ltd', 'Cipla', 'Dr. Reddy\'s', 'Abbott']
  
  let products = Array.from({ length: randomBetween(8, 20) }, () => {
    const cat = CATEGORIES[randomBetween(0, CATEGORIES.length - 1)]
    return {
      _id: generateId('prod'),
      name: randomItem(PRODUCT_NAMES),
      slug: randomItem(PRODUCT_NAMES).toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      description: randomItem(['High quality product', 'Doctor recommended', 'Best seller', 'New arrival']),
      categoryId: {
        _id: cat._id,
        name: cat.name,
        icon: cat.icon
      },
      images: Array.from({ length: randomBetween(1, 3) }, () => `/images/products/${randomItem(['prod1', 'prod2', 'prod3'])}.jpg`),
      pricing: {
        mrp: randomBetween(100, 5000),
        purchasePrice: randomBetween(80, 4000),
        basePrice: randomBetween(100, 5000),
        discountPercentage: parseFloat((Math.random() * 0.3 * 100).toFixed(0)),
        taxRate: randomBetween(5, 12),
        finalPrice: randomBetween(100, 5000)
      },
      inventory: {
        stockCount: randomBetween(5, 100),
        sku: `SKU-${randomBetween(1000, 9999)}`,
        reorderLevel: randomBetween(5, 20),
        supplier: randomItem(SUPPLIERS)
      },
      ratings: {
        average: parseFloat((Math.random() * 2 + 3).toFixed(1)),
        totalReviews: randomBetween(5, 50)
      },
      isAvailable: Math.random() > 0.2,
      estimatedDeliveryDays: randomBetween(2, 7)
    }
  })
  
  // Apply filters
  if (q) {
    products = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || 
                               p.inventory.supplier.toLowerCase().includes(q.toLowerCase()))
  }
  if (categoryId) {
    products = products.filter(p => p.categoryId._id === categoryId)
  }
  if (minPrice) {
    products = products.filter(p => p.pricing.finalPrice >= parseFloat(minPrice))
  }
  if (maxPrice) {
    products = products.filter(p => p.pricing.finalPrice <= parseFloat(maxPrice))
  }
  
  // Apply sorting
  if (sort === 'price_asc') {
    products.sort((a, b) => a.pricing.finalPrice - b.pricing.finalPrice)
  } else if (sort === 'price_desc') {
    products.sort((a, b) => b.pricing.finalPrice - a.pricing.finalPrice)
  } else if (sort === 'name_asc') {
    products.sort((a, b) => a.name.localeCompare(b.name))
  }
  
  const total = products.length
  const pages = Math.ceil(total / limit)
  const start = (page - 1) * limit
  const paginated = products.slice(start, start + limit)
  
  res.json({
    success: true,
    data: paginated,
    pagination: { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit), 
      pages 
    }
  })
})

/**
 * GET /products/:id
 * Output: { success: true, data: {...} }
 */
app.get('/products/:id', (req, res) => {
  const cat = CATEGORY_LIST[randomBetween(0, CATEGORY_LIST.length - 1)]
  
  const product = {
    _id: req.params.id,
    name: randomItem(PRODUCT_NAMES),
    slug: randomItem(PRODUCT_NAMES).toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
    description: randomItem(['High quality product', 'Doctor recommended', 'Best seller']),
    brand: randomItem(BRANDS),
    categoryId: {
      _id: cat._id,
      name: cat.name,
      icon: cat.icon
    },
    images: Array.from({ length: randomBetween(1, 3) }, () => `/images/products/${randomItem(['prod1', 'prod2', 'prod3'])}.jpg`),
    pricing: {
      mrp: randomBetween(100, 5000),
      purchasePrice: randomBetween(80, 4000),
      basePrice: randomBetween(100, 5000),
      discountPercentage: parseFloat((Math.random() * 0.3 * 100).toFixed(0)),
      taxRate: randomBetween(5, 12),
      finalPrice: randomBetween(100, 5000)
    },
    inventory: {
      stockCount: randomBetween(5, 100),
      sku: `SKU-${randomBetween(1000, 9999)}`,
      reorderLevel: randomBetween(5, 20)
    },
    ratings: {
      average: parseFloat((Math.random() * 2 + 3).toFixed(1)),
      totalReviews: randomBetween(5, 50)
    },
    isAvailable: Math.random() > 0.2,
    estimatedDeliveryDays: randomBetween(2, 7),
    specifications: {
      form: randomItem(['Tablet', 'Capsule', 'Syrup', 'Spray', 'Injection', 'Cream']),
      packSize: randomItem(['10 tablets', '15 tablets', '30 tablets', '100ml', '50g', '60g']),
      dosage: randomItem(['1 tablet daily', '2 tablets daily', 'As directed by doctor', 'Apply externally'])
    },
    createdAt: randomDate(new Date(2024, 0, 1), new Date())
  }
  
  res.json({
    success: true,
    data: product
  })
})

/**
 * GET /categories
 * Output: { success: true, data: [...] }
 */
app.get('/categories', (req, res) => {
  // Return the fixed categories list
  const categories = CATEGORY_LIST.map(cat => ({
    ...cat,
    isActive: true,
    createdAt: randomDate(new Date(2024, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2024, 0, 1), new Date())
  }))
  
  res.json({
    success: true,
    data: categories
  })
})

// ============ CART ROUTES ============

/**
 * GET /users/me/cart
 * Output: Cart items array with product details
 */
app.get('/users/me/cart', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  // TEST SERVER: Just check token exists, don't verify
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    })
  }
  
  // For test server, use the user from USERS array or default to patient
  // You can pass x-user-id header or use default
  const userId = req.headers['x-user-id'] || 'usr_patient_001'
  const user = USERS.find(u => u._id === userId) || USERS[0]
  
  const cart = user.cart || []
  
  const items = cart.map(item => ({
    productId: item.productId,
    name: 'Product',
    price: randomBetween(100, 5000),
    quantity: item.quantity,
    addedAt: new Date().toISOString()
  }))
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const taxAmount = subtotal * 0.05
  const shippingAmount = subtotal > 500 ? 0 : 40
  const totalAmount = subtotal + taxAmount + shippingAmount
  
  res.json({
    success: true,
    data: {
      _id: user._id + '_cart',
      items: items,
      subtotal: subtotal,
      taxAmount: taxAmount,
      shippingAmount: shippingAmount,
      totalAmount: totalAmount,
      status: 'ACTIVE'
    }
  })
})

/**
 * POST /users/me/cart
 * Input: { productId, quantity }
 * Output: Updated cart
 */
app.post('/users/me/cart', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  const { productId, quantity = 1 } = req.body
  
  // TEST SERVER: Just check token exists
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    })
  }
  
  if (!productId) {
    return res.status(400).json({ 
      success: false, 
      message: 'productId is required' 
    })
  }
  
  // Use default user for test server
  const user = USERS[0]
  const userIndex = 0
  
  if (!USERS[userIndex].cart) {
    USERS[userIndex].cart = []
  }
  
  const existingItem = USERS[userIndex].cart.find(
    item => item.productId === productId
  )
  
  if (existingItem) {
    existingItem.quantity += Number(quantity)
  } else {
    USERS[userIndex].cart.push({ productId, quantity: Number(quantity) })
  }
  
  USERS[userIndex].updatedAt = new Date().toISOString()
  
  const items = USERS[userIndex].cart.map(item => ({
    productId: item.productId,
    name: 'Product',
    price: randomBetween(100, 5000),
    quantity: item.quantity,
    addedAt: new Date().toISOString()
  }))
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const taxAmount = subtotal * 0.05
  const shippingAmount = subtotal > 500 ? 0 : 40
  const totalAmount = subtotal + taxAmount + shippingAmount
  
  res.json({
    success: true,
    data: {
      _id: USERS[userIndex]._id + '_cart',
      items: items,
      subtotal: subtotal,
      taxAmount: taxAmount,
      shippingAmount: shippingAmount,
      totalAmount: totalAmount,
      status: 'ACTIVE'
    }
  })
})

/**
 * PATCH /users/me/cart/:productId
 * Input: { quantity }
 * Output: Updated cart
 */
app.patch('/users/me/cart/:productId', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  const { quantity } = req.body
  const productId = req.params.productId
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    })
  }
  
  if (!quantity || quantity < 1) {
    return res.status(400).json({ 
      success: false, 
      message: 'quantity must be at least 1' 
    })
  }
  
  const user = USERS[0]
  const userIndex = 0
  
  const item = USERS[userIndex].cart.find(
    i => i.productId === productId
  )
  
  if (!item) {
    return res.status(404).json({ 
      success: false, 
      message: 'Item not found in cart' 
    })
  }
  
  item.quantity = Number(quantity)
  USERS[userIndex].updatedAt = new Date().toISOString()
  
  const items = USERS[userIndex].cart.map(item => ({
    productId: item.productId,
    name: 'Product',
    price: randomBetween(100, 5000),
    quantity: item.quantity,
    addedAt: new Date().toISOString()
  }))
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const taxAmount = subtotal * 0.05
  const shippingAmount = subtotal > 500 ? 0 : 40
  const totalAmount = subtotal + taxAmount + shippingAmount
  
  res.json({
    success: true,
    data: {
      _id: USERS[userIndex]._id + '_cart',
      items: items,
      subtotal: subtotal,
      taxAmount: taxAmount,
      shippingAmount: shippingAmount,
      totalAmount: totalAmount,
      status: 'ACTIVE'
    }
  })
})

/**
 * DELETE /users/me/cart/:productId
 * Output: Updated cart
 */
app.delete('/users/me/cart/:productId', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  const productId = req.params.productId
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    })
  }
  
  const user = USERS[0]
  const userIndex = 0
  
  USERS[userIndex].cart = USERS[userIndex].cart.filter(
    item => item.productId !== productId
  )
  USERS[userIndex].updatedAt = new Date().toISOString()
  
  const items = USERS[userIndex].cart.map(item => ({
    productId: item.productId,
    name: 'Product',
    price: randomBetween(100, 5000),
    quantity: item.quantity,
    addedAt: new Date().toISOString()
  }))
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const taxAmount = subtotal * 0.05
  const shippingAmount = subtotal > 500 ? 0 : 40
  const totalAmount = subtotal + taxAmount + shippingAmount
  
  res.json({
    success: true,
    data: {
      _id: USERS[userIndex]._id + '_cart',
      items: items,
      subtotal: subtotal,
      taxAmount: taxAmount,
      shippingAmount: shippingAmount,
      totalAmount: totalAmount,
      status: 'ACTIVE'
    }
  })
})

/**
 * DELETE /users/me/cart
 * Output: { success: true, data: { items: [], totals: 0 } }
 */
app.delete('/users/me/cart', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    })
  }
  
  const user = USERS[0]
  const userIndex = 0
  
  USERS[userIndex].cart = []
  USERS[userIndex].updatedAt = new Date().toISOString()
  
  res.json({
    success: true,
    data: {
      _id: USERS[userIndex]._id + '_cart',
      items: [],
      subtotal: 0,
      taxAmount: 0,
      shippingAmount: 0,
      totalAmount: 0,
      status: 'ACTIVE'
    }
  })
})
// ============ ORDER ROUTES ============

/**
 * POST /orders/checkout
 */
app.post('/orders/checkout', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  const { deliveryAddress, paymentMethod = 'COD' } = req.body
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    })
  }
  
  if (!deliveryAddress) {
    return res.status(400).json({ 
      success: false, 
      message: 'Delivery address is required' 
    })
  }
  
  // Use default user for test server
  const user = USERS[0]
  
  const cartItems = user.cart || []
  if (cartItems.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Cart is empty' 
    })
  }
  
  // Calculate totals
  let subtotal = 0
  const orderItems = cartItems.map(item => {
    const price = randomBetween(100, 5000)
    const total = price * item.quantity
    subtotal += total
    return {
      productId: item.productId,
      productSnapshot: {
        name: 'Product',
        brand: 'Brand',
        image: '',
        mrp: price,
        sellingPrice: price
      },
      quantity: item.quantity,
      unitPrice: price,
      totalPrice: total,
      discount: 0
    }
  })
  
  const deliveryCharge = subtotal > 500 ? 0 : 49
  const taxAmount = subtotal * 0.05
  const finalAmount = subtotal + deliveryCharge + taxAmount
  
  const newOrder = {
    _id: generateId('ord'),
    userId: user._id,
    items: orderItems,
    pricing: {
      subtotal: subtotal,
      deliveryCharge: deliveryCharge,
      discount: 0,
      finalAmount: finalAmount,
      currency: 'INR'
    },
    status: 'pending',
    paymentDetails: {
      transactionId: '',
      method: paymentMethod,
      status: 'PENDING',
      paymentDate: null
    },
    shipmentDetails: {
      status: 'PENDING',
      courier: {
        name: '',
        trackingNumber: '',
        contact: ''
      },
      deliveryAddress: {
        fullName: deliveryAddress.fullName || '',
        phone: deliveryAddress.phone || '',
        addressLine: deliveryAddress.addressLine || '',
        city: deliveryAddress.city || '',
        state: deliveryAddress.state || '',
        pincode: deliveryAddress.pincode || ''
      },
      otp: '',
      otpVerification: {
        status: 'UNVERIFIED',
        verifiedAt: null
      },
      estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      actualDeliveryDate: null,
      lastUpdatedAt: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  // Clear cart
  user.cart = []
  
  if (!ORDERS) ORDERS = []
  ORDERS.push(newOrder)
  
  res.status(201).json({
    success: true,
    data: newOrder
  })
})

/**
 * GET /orders
 */
app.get('/orders', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    })
  }
  
  // Use default user for test server
  const user = USERS[0]
  
  let orders = ORDERS.filter(o => o.userId === user._id)
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  
  res.json({
    success: true,
    data: orders,
    pagination: {
      total: orders.length,
      page: 1,
      limit: 20,
      pages: Math.ceil(orders.length / 20)
    }
  })
})

/**
 * GET /orders/:id
 */
app.get('/orders/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    })
  }
  
  const order = ORDERS.find(o => o._id === req.params.id)
  
  if (!order) {
    return res.status(404).json({ 
      success: false, 
      message: 'Order not found' 
    })
  }
  
  res.json({
    success: true,
    data: order
  })
})

/**
 * PATCH /orders/:id/status
 */
app.patch('/orders/:id/status', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  const { status } = req.body
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    })
  }
  
  const orderIndex = ORDERS.findIndex(o => o._id === req.params.id)
  
  if (orderIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      message: 'Order not found' 
    })
  }
  
  ORDERS[orderIndex].status = status
  ORDERS[orderIndex].updatedAt = new Date().toISOString()
  
  res.json({
    success: true
  })
})

// ============ ORDER TRACKING, CANCEL, RETURN ============

/**
 * GET /orders/:id/track
 * Output: { success: true, data: { status, shipment, placedAt } }
 */
app.get('/orders/:id/track', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    })
  }
  
  const order = ORDERS.find(o => o._id === req.params.id)
  
  if (!order) {
    return res.status(404).json({ 
      success: false, 
      message: 'Order not found' 
    })
  }
  
  res.json({
    success: true,
    data: {
      status: order.status,
      shipment: order.shipmentDetails || {
        status: 'PENDING',
        courier: { name: '', trackingNumber: '', contact: '' },
        deliveryAddress: order.shipmentDetails?.deliveryAddress || {},
        otp: '',
        otpVerification: { status: 'UNVERIFIED', verifiedAt: null },
        estimatedDeliveryDate: null,
        actualDeliveryDate: null,
        lastUpdatedAt: new Date().toISOString()
      },
      placedAt: order.createdAt
    }
  })
})

/**
 * PATCH /orders/:id/cancel
 * Input: none (or optional reason)
 * Output: { success: true, data: { ...order } }
 */
app.patch('/orders/:id/cancel', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    })
  }
  
  const orderIndex = ORDERS.findIndex(o => o._id === req.params.id)
  
  if (orderIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      message: 'Order not found' 
    })
  }
  
  const order = ORDERS[orderIndex]
  
  // Only pending or confirmed can be cancelled
  if (order.status !== 'pending' && order.status !== 'confirmed') {
    return res.status(400).json({ 
      success: false, 
      message: 'Order is not pending or confirmed' 
    })
  }
  
  order.status = 'cancelled'
  order.updatedAt = new Date().toISOString()
  
  res.json({
    success: true,
    data: order
  })
})

/**
 * PATCH /orders/:id/return
 * Output: { success: true, data: { ...order } }
 */
app.patch('/orders/:id/return', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    })
  }
  
  const orderIndex = ORDERS.findIndex(o => o._id === req.params.id)
  
  if (orderIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      message: 'Order not found' 
    })
  }
  
  const order = ORDERS[orderIndex]
  
  // Only delivered can be returned
  if (order.status !== 'delivered') {
    return res.status(400).json({ 
      success: false, 
      message: 'Order is not delivered' 
    })
  }
  
  order.status = 'returned'
  order.updatedAt = new Date().toISOString()
  
  res.json({
    success: true,
    data: order
  })
})

// ============ SYSTEM ROUTES ============

/**
 * POST /system/check-expired-requests
 * Output: { expiredCount, message }
 */
app.post('/system/check-expired-requests', (req, res) => {
  console.log('🔄 CHECKING EXPIRED REQUESTS')
  res.json({ expiredCount: randomBetween(0, 3), message: `Expired ${randomBetween(0, 3)} requests` })
})

/**
 * POST /system/auto-complete-appointments
 * Output: { completedCount }
 */
app.post('/system/auto-complete-appointments', (req, res) => {
  console.log('🔄 AUTO-COMPLETING APPOINTMENTS')
  res.json({ completedCount: randomBetween(0, 2) })
})

/**
 * POST /booking/calculate-cost
 * Input: { doctorId, date, startTime, endTime, duration, type }
 * Output: Cost breakdown
 */
app.post('/booking/calculate-cost', (req, res) => {
  console.log('📝 CALCULATE COST:', req.body)
  const baseFee = randomBetween(300, 1500)
  const duration = req.body.duration || 30
  const perMinuteRate = baseFee / 30
  const multiplier = parseFloat((0.6 + Math.random() * 0.9).toFixed(2))
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
  const subtotal = Math.round(perMinuteRate * duration * multiplier)
  const tax = Math.round(subtotal * 0.18)
  const total = subtotal + tax
  
  res.json({
    subtotal,
    tax,
    total,
    currency: 'INR',
    breakdown: {
      baseFee,
      duration,
      perMinuteRate: Math.round(perMinuteRate),
<<<<<<< HEAD
      multiplier: parseFloat(multiplier.toFixed(2)),
      type
    }
  })
})
// ============ APPOINTMENT ROUTES ============

// ============ APPOINTMENTS ============

// Get appointments for patient
app.get('/appointments/patient/:patientId', (req, res) => {
  const db = readDB()
  const appointments = (db.appointments || []).filter(a => 
    a.patientId === req.params.patientId && 
    a.appointmentStatus !== 'CANCELLED'
  )
  
  const enhanced = appointments.map(apt => {
    const doctor = db.doctors.find(d => d._id === apt.doctorId)
    const now = new Date()
    return {
      ...apt,
      doctorName: doctor?.doctorName || 'Unknown',
      doctorSpecialization: doctor?.specializations?.[0] || 'General',
      isVirtual: apt.consultationType === 'VIDEO',
      canJoin: apt.consultationType === 'VIDEO' && 
               apt.appointmentStatus === 'CONFIRMED' &&
               new Date(apt.appointmentStartDateTime) <= now &&
               new Date(apt.appointmentEndDateTime) >= now
    }
  })
  
  res.json(enhanced)
})

// Get appointments for doctor
app.get('/appointments/doctor/:doctorId', (req, res) => {
  const db = readDB()
  const appointments = (db.appointments || []).filter(a => 
    a.patientId === req.params.patientId && 
    a.appointmentStatus !== 'CANCELLED'
  )
  
  const enhanced = appointments.map(apt => {
    const patient = db.patients.find(p => p._id === apt.patientId)
    const now = new Date()
    return {
      ...apt,
      patientName: patient?.patientName || 'Unknown',
      patientPhone: patient?.mobileNumber || 'Not provided',
      canJoin: apt.consultationType === 'VIDEO' && 
               apt.appointmentStatus === 'CONFIRMED' &&
               new Date(apt.appointmentStartDateTime) <= now &&
               new Date(apt.appointmentEndDateTime) >= now
    }
  })
  
  res.json(enhanced)
})

app.put('/appointments/:id/cancel', (req, res) => {
  const { reason, cancelledBy } = req.body
  const db = readDB()
  
  const appointmentIndex = (db.appointments || []).findIndex(a => a._id === req.params.id)
  if (appointmentIndex === -1) return res.status(404).json({ message: 'Appointment not found' })
  
  const appointment = db.appointments[appointmentIndex]
  const doctor = db.doctors.find(d => d._id === appointment.doctorId)
  
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' })
  }
  
  appointment.appointmentStatus = 'CANCELLED'
  appointment.cancellationReason = reason || 'Cancelled by user'
  appointment.cancelledBy = cancelledBy || 'USER'
  appointment.updatedAt = new Date().toISOString()
  
  // Regenerate actualAvailableSlots for this date from scratch
  const dateStr = appointment.appointmentStartDateTime.split('T')[0]
  const dayOfWeek = new Date(dateStr).getDay()
  const settings = doctor.availabilitySettings
  
  if (settings && settings.workingHours) {
    const daySchedule = settings.workingHours.find(s => s.dayOfWeek === dayOfWeek)
    
    if (daySchedule && daySchedule.isWorking) {
      // Start with full day ranges from settings
      let availableRanges = daySchedule.slots.map(slot => ({
        start: slot.start,
        end: slot.end
      }))
      
      // Get all CONFIRMED appointments for this date (excluding this cancelled one)
      const confirmedAppointments = (db.appointments || []).filter(a => 
        a.doctorId === appointment.doctorId &&
        a.date === dateStr &&
        a.appointmentStatus === 'CONFIRMED' &&
        a._id !== appointment._id
      )
      
      // Subtract each confirmed appointment with 10-min cooldown
      for (const apt of confirmedAppointments) {
        const aptStart = apt.startTime
        const aptEnd = apt.endTime
        const cooldownEnd = addMinutes(aptEnd, 10)
        
        const newRanges = []
        for (const range of availableRanges) {
          if (aptEnd <= range.start || aptStart >= range.end) {
            // No overlap
            newRanges.push(range)
          } else {
            // Overlap, split the range
            if (range.start < aptStart) {
              newRanges.push({ start: range.start, end: aptStart })
            }
            if (range.end > cooldownEnd) {
              newRanges.push({ start: cooldownEnd, end: range.end })
            }
          }
        }
        availableRanges = newRanges
      }
      
      // Update actualAvailableSlots
      if (!doctor.actualAvailableSlots) doctor.actualAvailableSlots = []
      const daySlotIndex = doctor.actualAvailableSlots.findIndex(s => s.date === dateStr)
      
      if (daySlotIndex !== -1) {
        doctor.actualAvailableSlots[daySlotIndex].ranges = availableRanges
      } else {
        doctor.actualAvailableSlots.push({ date: dateStr, ranges: availableRanges })
      }
    }
  }
  
  writeDB(db)
  res.json({ success: true })
})

// Mark appointment as completed (add feedback later)
app.put('/appointments/:id/complete', (req, res) => {
  const db = readDB()
  const appointmentIndex = (db.appointments || []).findIndex(a => a._id === req.params.id)
  if (appointmentIndex === -1) return res.status(404).json({ message: 'Appointment not found' })
  
  db.appointments[appointmentIndex].appointmentStatus = 'COMPLETED'
  db.appointments[appointmentIndex].updatedAt = new Date().toISOString()
  
  writeDB(db)
  res.json({ success: true })
})


// ============ EXPIRY CHECK (run this via cron or manual call) ============

app.post('/system/check-expired-requests', (req, res) => {
  const db = readDB()
  const now = new Date()
  let expiredCount = 0
  
  (db.appointmentRequests || []).forEach(request => {
    if (request.status !== 'PENDING' && request.status !== 'CHANGE_REQUESTED') return
    
    let checkTime = request.startTime
    let checkDate = request.date
    if (request.status === 'CHANGE_REQUESTED' && request.suggestedStartTime) {
      checkTime = request.suggestedStartTime
      checkDate = request.date
    }
    
    const targetDateTime = new Date(`${checkDate}T${checkTime}`)
    const minutesUntilTarget = (targetDateTime - now) / 1000 / 60
    
    if (minutesUntilTarget < 10 && minutesUntilTarget > -10) {
      request.status = 'CANCELLED'
      request.cancellationReason = `Request expired - no response before scheduled time (${checkTime})`
      request.cancelledBy = 'SYSTEM'
      expiredCount++
    }
  })
  
  if (expiredCount > 0) writeDB(db)
  res.json({ expiredCount, message: `Expired ${expiredCount} requests` })
})

setInterval(() => {
  fetch('http://localhost:5000/system/auto-cancel-expired', { method: 'POST' })
    .catch(err => console.error('Auto-cancel error:', err))
}, 60000)

app.post('/system/auto-complete-appointments', (req, res) => {
  const db = readDB()
  const now = new Date()
  let completedCount = 0
  
  ;(db.appointments || []).forEach(appointment => {
    if (appointment.appointmentStatus === 'CONFIRMED') {
      const endDateTime = new Date(appointment.appointmentEndDateTime)
      if (endDateTime < now) {
        appointment.appointmentStatus = 'COMPLETED'
        appointment.completedAt = new Date().toISOString()
        completedCount++
      }
    }
  })
  
  if (completedCount > 0) writeDB(db)
  res.json({ completedCount })
})

// Add this to your existing setInterval or create a new one
setInterval(() => {
  fetch('http://localhost:5000/system/auto-complete-appointments', { method: 'POST' })
    .catch(err => console.error('Auto-complete error:', err))
}, 60000)

// ============ PRODUCT ROUTES ============

// Get all products (with filters)
app.get('/products', (req, res) => {
  const { search, category, minPrice, maxPrice, sort } = req.query
  const db = readDB()
  let products = db.products || []

  // Search filter
  if (search) {
    products = products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    )
  }

  // Category filter
  if (category && category !== 'all') {
    products = products.filter(p => p.category?.name === category || p.category?.categoryID === category)
  }

  // Price filter
  if (minPrice) {
    products = products.filter(p => p.basecost >= parseFloat(minPrice))
  }
  if (maxPrice) {
    products = products.filter(p => p.basecost <= parseFloat(maxPrice))
  }

  // Sorting
  if (sort === 'price_low') {
    products.sort((a, b) => a.basecost - b.basecost)
  } else if (sort === 'price_high') {
    products.sort((a, b) => b.basecost - a.basecost)
  } else if (sort === 'rating') {
    products.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0))
  } else if (sort === 'name') {
    products.sort((a, b) => a.name.localeCompare(b.name))
  }

  // Remove sensitive inventory details for listing
  const productsForListing = products.map(({ inventory, ...product }) => product)
  res.json(productsForListing)
})

// Get single product by ID or slug
app.get('/products/:id', (req, res) => {
  const db = readDB()
  const product = db.products.find(p => p._id === req.params.id || p.slug === req.params.id)
  if (product) {
    res.json(product)
  } else {
    res.status(404).json({ message: 'Product not found' })
  }
})

// Get all categories
app.get('/categories', (req, res) => {
  const db = readDB()
  res.json(db.categories || [])
})

// ============ CART ROUTES ============

// Get cart for logged-in patient
app.get('/cart', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  const db = readDB()
  
  // In real implementation, get patientId from token
  // For mock, use patientId from query or header
  const patientId = req.headers['x-patient-id'] || 'pat_001'
  
  let cart = db.carts?.find(c => c.patientId === patientId && c.status === 'ACTIVE')
  
  if (!cart) {
    // Create empty cart if doesn't exist
    cart = {
      _id: `cart_${Date.now()}`,
      patientId,
      items: [],
      couponCode: null,
      discountAmount: 0,
      subtotal: 0,
      taxAmount: 0,
      shippingAmount: 0,
      totalAmount: 0,
      status: 'ACTIVE',
      convertedToOrderId: null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    if (!db.carts) db.carts = []
    db.carts.push(cart)
    writeDB(db)
  }
  
  res.json(cart)
})

// Add item to cart
app.post('/cart/items', (req, res) => {
  const { productId, quantity } = req.body
  const patientId = req.headers['x-patient-id'] || 'pat_001'
  const db = readDB()
  
  const product = db.products.find(p => p._id === productId)
  if (!product) {
    res.status(404).json({ message: 'Product not found' })
    return
  }
  
  // Check stock
  if (product.inventory?.stockQty < quantity) {
    res.status(400).json({ message: 'Insufficient stock' })
    return
  }
  
  let cart = db.carts?.find(c => c.patientId === patientId && c.status === 'ACTIVE')
  
  if (!cart) {
    cart = {
      _id: `cart_${Date.now()}`,
      patientId,
      items: [],
      couponCode: null,
      discountAmount: 0,
      subtotal: 0,
      taxAmount: 0,
      shippingAmount: 0,
      totalAmount: 0,
      status: 'ACTIVE',
      convertedToOrderId: null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    if (!db.carts) db.carts = []
    db.carts.push(cart)
  }
  
  const existingItem = cart.items.find(i => i.productId === productId)
  
  if (existingItem) {
    existingItem.quantity += quantity
    existingItem.updatedAt = new Date().toISOString()
  } else {
    cart.items.push({
      productId: product._id,
      name: product.name,
      image: product.images?.[0] || '',
      price: product.basecost,
      quantity,
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }
  
  // Recalculate cart totals
  cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  cart.taxAmount = cart.subtotal * 0.05 // 5% tax
  cart.shippingAmount = cart.subtotal > 500 ? 0 : 40 // Free shipping above ₹500
  cart.totalAmount = cart.subtotal + cart.taxAmount + cart.shippingAmount - (cart.discountAmount || 0)
  cart.updatedAt = new Date().toISOString()
  
  writeDB(db)
  res.json(cart)
})

// Update cart item quantity
app.put('/cart/items/:productId', (req, res) => {
  const { quantity } = req.body
  const patientId = req.headers['x-patient-id'] || 'pat_001'
  const db = readDB()
  
  const cart = db.carts?.find(c => c.patientId === patientId && c.status === 'ACTIVE')
  if (!cart) {
    res.status(404).json({ message: 'Cart not found' })
    return
  }
  
  const item = cart.items.find(i => i.productId === req.params.productId)
  if (!item) {
    res.status(404).json({ message: 'Item not found in cart' })
    return
  }
  
  if (quantity <= 0) {
    cart.items = cart.items.filter(i => i.productId !== req.params.productId)
  } else {
    item.quantity = quantity
    item.updatedAt = new Date().toISOString()
  }
  
  // Recalculate totals
  cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  cart.taxAmount = cart.subtotal * 0.05
  cart.shippingAmount = cart.subtotal > 500 ? 0 : 40
  cart.totalAmount = cart.subtotal + cart.taxAmount + cart.shippingAmount - (cart.discountAmount || 0)
  cart.updatedAt = new Date().toISOString()
  
  writeDB(db)
  res.json(cart)
})

// Remove item from cart
app.delete('/cart/items/:productId', (req, res) => {
  const patientId = req.headers['x-patient-id'] || 'pat_001'
  const db = readDB()
  
  const cart = db.carts?.find(c => c.patientId === patientId && c.status === 'ACTIVE')
  if (!cart) {
    res.status(404).json({ message: 'Cart not found' })
    return
  }
  
  cart.items = cart.items.filter(i => i.productId !== req.params.productId)
  
  // Recalculate totals
  cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  cart.taxAmount = cart.subtotal * 0.05
  cart.shippingAmount = cart.subtotal > 500 ? 0 : 40
  cart.totalAmount = cart.subtotal + cart.taxAmount + cart.shippingAmount - (cart.discountAmount || 0)
  cart.updatedAt = new Date().toISOString()
  
  writeDB(db)
  res.json(cart)
})

// Clear cart
app.delete('/cart', (req, res) => {
  const patientId = req.headers['x-patient-id'] || 'pat_001'
  const db = readDB()
  
  const cart = db.carts?.find(c => c.patientId === patientId && c.status === 'ACTIVE')
  if (cart) {
    cart.items = []
    cart.subtotal = 0
    cart.taxAmount = 0
    cart.shippingAmount = 0
    cart.totalAmount = 0
    cart.updatedAt = new Date().toISOString()
    writeDB(db)
  }
  
  res.json({ success: true, message: 'Cart cleared' })
})

//orders
// Create order from cart
app.post('/orders', async (req, res) => {
  const { shippingAddress } = req.body
  const patientId = req.headers['x-patient-id'] || 'pat_001'
  const db = readDB()
  
  // Get user's cart
  const cart = db.carts?.find(c => c.patientId === patientId && c.status === 'ACTIVE')
  
  if (!cart || cart.items.length === 0) {
    res.status(400).json({ message: 'Cart is empty' })
    return
  }
  
  // Create order items
  const orderItems = []
  for (const item of cart.items) {
    const product = db.products.find(p => p._id === item.productId)
    if (!product) continue
    
    const orderItem = {
      _id: `orderItem_${Date.now()}_${item.productId}`,
      orderID: null, // Will set after order creation
      productID: item.productId,
      productSnapshot: {
        name: product.name,
        brand: product.brand,
        image: product.images?.[0] || '',
        mrp: product.basecost,
        sellingPrice: item.price
      },
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.price * item.quantity,
      discount: product.discountfactor ? product.basecost * product.discountfactor * item.quantity : 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    orderItems.push(orderItem)
  }
  
  // Calculate pricing
  const subtotal = cart.subtotal
  const deliveryCharge = cart.shippingAmount
  const discount = cart.discountAmount || 0
  const taxableAmount = subtotal - discount
  const cgstRate = 2.5
  const sgstRate = 2.5
  const cgstAmount = (taxableAmount * cgstRate) / 100
  const sgstAmount = (taxableAmount * sgstRate) / 100
  const totalTax = cgstAmount + sgstAmount
  const finalAmount = taxableAmount + deliveryCharge + totalTax
  
  // Create order
  const newOrder = {
    _id: `ord_${Date.now()}`,
    userID: patientId,
    items: orderItems.map(item => item._id),
    status: 'pending',
    pricing: {
      subtotal: subtotal,
      deliveryCharge: deliveryCharge,
      discount: discount,
      taxBreakdown: {
        cgst: { rate: cgstRate, amount: cgstAmount },
        sgst: { rate: sgstRate, amount: sgstAmount },
        igst: { rate: 0, amount: 0 },
        totalTax: totalTax
      },
      finalAmount: finalAmount,
      currency: "INR"
    },
    paymentID: null,
    deliveryID: null,
    shippingAddress: shippingAddress,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  // Save order items with orderID
  for (const item of orderItems) {
    item.orderID = newOrder._id
  }
  
  if (!db.orderItems) db.orderItems = []
  db.orderItems.push(...orderItems)
  
  if (!db.orders) db.orders = []
  db.orders.push(newOrder)
  
  // Clear cart
  cart.items = []
  cart.subtotal = 0
  cart.taxAmount = 0
  cart.shippingAmount = 0
  cart.totalAmount = 0
  cart.updatedAt = new Date().toISOString()
  
  writeDB(db)
  
  res.status(201).json({ success: true, orderId: newOrder._id })
})

// Get all orders for a user
app.get('/orders', (req, res) => {
  const patientId = req.headers['x-patient-id'] || 'pat_001'
  const db = readDB()
  
  const orders = (db.orders || []).filter(o => o.userID === patientId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  
  res.json(orders)
})

// Get single order by ID
app.get('/orders/:id', (req, res) => {
  const db = readDB()
  const order = (db.orders || []).find(o => o._id === req.params.id)
  
  if (!order) {
    res.status(404).json({ message: 'Order not found' })
    return
  }
  
  // Get order items
  const orderItems = (db.orderItems || []).filter(item => item.orderID === req.params.id)
  
  res.json({ ...order, items: orderItems })
})

// Update order status
app.put('/orders/:id/status', (req, res) => {
  const { status } = req.body
  const db = readDB()
  const order = db.orders.find(o => o._id === req.params.id)
  
  if (order) {
    order.status = status
    order.updatedAt = new Date().toISOString()
    
    // Update order items status
    const orderItems = db.orderItems.filter(item => item.orderID === req.params.id)
    for (const item of orderItems) {
      item.status = status
      item.updatedAt = new Date().toISOString()
    }
    
    writeDB(db)
    res.json({ success: true })
  } else {
    res.status(404).json({ message: 'Order not found' })
  }
})
=======
      multiplier,
      type: req.body.type || 'VIDEO'
    }
  })
})
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log('')
<<<<<<< HEAD
  console.log('Test credentials (already in db):')
  console.log('  Patient: rahul@example.com / password123')
  console.log('  Doctor: priya.sharma@example.com / doctor123')
  console.log('')
  console.log('To create admin, manually add to db.json:')
  console.log('  users: { _id: "usr_admin", email: "admin@example.com", password: "admin123", role: "admin", roleId: "adm_001" }')
  console.log('  admins: { _id: "adm_001", name: "Admin User" }')
})
=======
  console.log('📌 This server uses MOCK data only')
  console.log('📌 Write operations are logged to console')
  console.log('')
  console.log('🔐 Test credentials (any email/password works):')
  console.log('  Email: any@example.com')
  console.log('  Password: anypassword')
  console.log('')
})
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
