const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
app.use(express.json())

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
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

// ============ AUTH ROUTES ============

// Login - ONLY checks users table, returns role from there
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body
  const db = readDB()
  
  const user = db.users.find(u => u.email === email && u.password === password)
  
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
    date,
    startTime,
    endTime,
    duration,
    reason,
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
  res.json({ success: true })
})


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

// Start server
app.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000')
  console.log('')
  console.log('Test credentials (already in db):')
  console.log('  Patient: rahul@example.com / password123')
  console.log('  Doctor: priya.sharma@example.com / doctor123')
  console.log('')
  console.log('To create admin, manually add to db.json:')
  console.log('  users: { _id: "usr_admin", email: "admin@example.com", password: "admin123", role: "admin", roleId: "adm_001" }')
  console.log('  admins: { _id: "adm_001", name: "Admin User" }')
})