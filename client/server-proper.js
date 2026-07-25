const express = require('express')
const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')

require('dotenv').config();

const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET || 'test-server-not-secret';

if (!PORT) {
  console.error('❌ PORT not found in .env file');
  process.exit(1);
}

const app = express()
app.use(express.json())

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})
const otpStore = {}
const generateOTP = () => {
  let a = Math.floor(100000 + Math.random() * 900000).toString()
  console.log(`The otp for your password change is ${a}`)
  return a
}
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
      timeSlots: [],
      isAvailable: true,
      stats: { rating: 4.5, totalRatings: 120, totalAppointments: 450 },
      availabilitySettings: {
        minAppointmentDuration: 10,
        maxAppointmentDuration: 180,
        advanceBookingDays: 14,
        workingHours: DEFAULT_WORKING_HOURS,
        unavailableTimes: []
      }
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
const APPOINTMENT_STATUSES = [
  'BOOKED',          // Waiting for doctor response
  'COMPLETED',        // Appointment done
  'CANCELLED',        // Cancelled (patient)
  'REJECTED'         // Cancelled (Doctor)
]

// ============ ISSUE REPORTING ============

// Store for issue reports (in-memory - for test server only)
const ISSUE_REPORTS = []

// Issue categories
const ISSUE_CATEGORIES = [
  'TECHNICAL',
  'PAYMENT', 
  'APPOINTMENT',
  'ORDER',
  'DOCTOR_RELATED',
  'PRODUCT_QUALITY',
  'DELIVERY',
  'ACCOUNT',
  'BUG',
  'FEATURE_REQUEST',
  'OTHER'
]

// Issue statuses
const ISSUE_STATUSES = [
  'PENDING',      // Newly reported, not yet reviewed
  'IN_PROGRESS',  // Being worked on
  'RESOLVED',     // Fixed/Resolved
  'REJECTED',     // Not a valid issue or won't be fixed
  'CLOSED'        // Closed after resolution
]

const ORDER_STATUSES = ['pending', 'confirmed','processing', 'shipped', 'delivered', 'cancelled','returned','failed']
const ORDERS = []
const APPOINTMENTS = [
  // ===== BOOKED =====
  {
    _id: 'apt_001',
    patientId: 'usr_patient_001',
    doctorId: 'usr_doctor_001',
    patientName: 'Rahul Sharma',
    doctorName: 'Dr. Priya Sharma',
    schedule: {
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startDateTime: '10:00',
      endDateTime: '10:30',
      slotTime: '10:00 - 10:30'
    },
    duration: 30,
    meeting: {
      meetingId: null,
      meetingLink: null,
      consultationType: 'VIDEO'
    },
    financials: {
      consultationFee: 500,
      taxAmount: 90,
      totalAmount: 590,
      refundableAmount: 500
    },
    paymentDetails: {
      transactionId: "",
      status: "PENDING",
      currency: "INR",
      paidAt: null
    },
    appointmentStatus: 'BOOKED',
    reason: 'Chest pain and breathing difficulty',
    symptoms: 'Chest tightness, short breath',
    hasRated: false,
    rejectReason: null,
    cancelReason: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'apt_002',
    patientId: 'usr_patient_001',
    doctorId: 'usr_doctor_002',
    patientName: 'Rahul Sharma',
    doctorName: 'Dr. Rajesh Kumar',
    schedule: {
      scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startDateTime: '14:30',
      endDateTime: '15:00',
      slotTime: '14:30 - 15:00'
    },
    duration: 30,
    meeting: {
      meetingId: null,
      meetingLink: null,
      consultationType: 'CLINIC'
    },
    financials: {
      consultationFee: 600,
      taxAmount: 108,
      totalAmount: 708,
      refundableAmount: 600
    },
    paymentDetails: {
      transactionId: "",
      status: "PENDING",
      currency: "INR",
      paidAt: null
    },
    appointmentStatus: 'BOOKED',
    reason: 'Skin rash on arms',
    symptoms: 'Red patches, itching',
    hasRated: false,
    rejectReason: null,
    cancelReason: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'apt_003',
    patientId: 'usr_patient_001',
    doctorId: 'usr_doctor_001',
    patientName: 'Rahul Sharma',
    doctorName: 'Dr. Priya Sharma',
    schedule: {
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startDateTime: '09:00',
      endDateTime: '09:30',
      slotTime: '09:00 - 09:30'
    },
    duration: 30,
    meeting: {
      meetingId: 'meet_003',
      meetingLink: 'https://meet.viqure.com/meet_003',
      consultationType: 'VIDEO'
    },
    financials: {
      consultationFee: 500,
      taxAmount: 90,
      totalAmount: 590,
      refundableAmount: 500
    },
    paymentDetails: {
      transactionId: "",
      status: "PENDING",
      currency: "INR",
      paidAt: null
    },
    appointmentStatus: 'BOOKED',
    reason: 'Follow-up appointment',
    symptoms: 'No new symptoms',
    hasRated: false,
    rejectReason: null,
    cancelReason: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'apt_004',
    patientId: 'usr_patient_001',
    doctorId: 'usr_doctor_001',
    patientName: 'Rahul Sharma',
    doctorName: 'Dr. Priya Sharma',
    schedule: {
      scheduledAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startDateTime: '11:00',
      endDateTime: '11:30',
      slotTime: '11:00 - 11:30'
    },
    duration: 30,
    meeting: {
      meetingId: null,
      meetingLink: null,
      consultationType: 'CHAT'
    },
    financials: {
      consultationFee: 500,
      taxAmount: 90,
      totalAmount: 590,
      refundableAmount: 500
    },
    paymentDetails: {
      transactionId: "",
      status: "PENDING",
      currency: "INR",
      paidAt: null
    },
    appointmentStatus: 'BOOKED',
    reason: 'Medication review',
    symptoms: 'Need prescription refill',
    hasRated: false,
    rejectReason: null,
    cancelReason: null,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'apt_005',
    patientId: 'usr_patient_001',
    doctorId: 'usr_doctor_001',
    patientName: 'Rahul Sharma',
    doctorName: 'Dr. Priya Sharma',
    schedule: {
      scheduledAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startDateTime: '10:00',
      endDateTime: '10:30',
      slotTime: '10:00 - 10:30'
    },
    duration: 30,
    meeting: {
      meetingId: null,
      meetingLink: null,
      consultationType: 'VIDEO'
    },
    financials: {
      consultationFee: 500,
      taxAmount: 90,
      totalAmount: 590,
      refundableAmount: 500
    },
    paymentDetails: {
      transactionId: "",
      status: "PENDING",
      currency: "INR",
      paidAt: null
    },
    appointmentStatus: 'BOOKED',
    reason: 'Chest pain follow-up',
    symptoms: 'Mild chest discomfort',
    hasRated: false,
    rejectReason: null,
    cancelReason: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },

  // ===== COMPLETED =====
  {
    _id: 'apt_006',
    patientId: 'usr_patient_001',
    doctorId: 'usr_doctor_001',
    patientName: 'Rahul Sharma',
    doctorName: 'Dr. Priya Sharma',
    schedule: {
      scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startDateTime: '09:00',
      endDateTime: '09:30',
      slotTime: '09:00 - 09:30'
    },
    duration: 30,
    meeting: {
      meetingId: 'meet_006',
      meetingLink: 'https://meet.viqure.com/meet_006',
      consultationType: 'VIDEO'
    },
    financials: {
      consultationFee: 500,
      taxAmount: 90,
      totalAmount: 590,
      refundableAmount: 500
    },
    paymentDetails: {
      transactionId: "",
      status: "PENDING",
      currency: "INR",
      paidAt: null
    },
    appointmentStatus: 'COMPLETED',
    reason: 'Routine checkup',
    symptoms: 'None',
    hasRated: false,
    rejectReason: null,
    cancelReason: null,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'apt_007',
    patientId: 'usr_patient_001',
    doctorId: 'usr_doctor_001',
    patientName: 'Rahul Sharma',
    doctorName: 'Dr. Priya Sharma',
    schedule: {
      scheduledAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startDateTime: '14:00',
      endDateTime: '14:30',
      slotTime: '14:00 - 14:30'
    },
    duration: 30,
    meeting: {
      meetingId: null,
      meetingLink: null,
      consultationType: 'CLINIC'
    },
    financials: {
      consultationFee: 500,
      taxAmount: 90,
      totalAmount: 590,
      refundableAmount: 500
    },
    paymentDetails: {
      transactionId: "",
      status: "PENDING",
      currency: "INR",
      paidAt: null
    },
    appointmentStatus: 'COMPLETED',
    reason: 'Annual health checkup',
    symptoms: 'No symptoms',
    hasRated: true,
    rejectReason: null,
    cancelReason: null,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },

  // ===== REJECTED =====
  {
    _id: 'apt_008',
    patientId: 'usr_patient_001',
    doctorId: 'usr_doctor_002',
    patientName: 'Rahul Sharma',
    doctorName: 'Dr. Rajesh Kumar',
    schedule: {
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startDateTime: '09:00',
      endDateTime: '09:30',
      slotTime: '09:00 - 09:30'
    },
    duration: 30,
    meeting: {
      meetingId: null,
      meetingLink: null,
      consultationType: 'VIDEO'
    },
    financials: {
      consultationFee: 600,
      taxAmount: 108,
      totalAmount: 708,
      refundableAmount: 600
    },
    paymentDetails: {
      transactionId: "",
      status: "PENDING",
      currency: "INR",
      paidAt: null
    },
    appointmentStatus: 'REJECTED',
    reason: 'Skin consultation',
    symptoms: 'Acne on face',
    hasRated: false,
    rejectReason: 'Doctor is unavailable on this date',
    cancelReason: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },

  // ===== CANCELLED =====
  {
    _id: 'apt_009',
    patientId: 'usr_patient_001',
    doctorId: 'usr_doctor_001',
    patientName: 'Rahul Sharma',
    doctorName: 'Dr. Priya Sharma',
    schedule: {
      scheduledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startDateTime: '16:00',
      endDateTime: '16:30',
      slotTime: '16:00 - 16:30'
    },
    duration: 30,
    meeting: {
      meetingId: null,
      meetingLink: null,
      consultationType: 'CHAT'
    },
    financials: {
      consultationFee: 500,
      taxAmount: 90,
      totalAmount: 590,
      refundableAmount: 500
    },
    paymentDetails: {
      transactionId: "",
      status: "PENDING",
      currency: "INR",
      paidAt: null
    },
    appointmentStatus: 'CANCELLED',
    reason: 'General consultation',
    symptoms: 'Headache and fever',
    hasRated: false,
    rejectReason: null,
    cancelReason: 'Patient cancelled due to emergency',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
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
      timeSlots: [],
      isAvailable: false,
      stats: { rating: 0, totalRatings: 0, totalAppointments: 0 },
      availabilitySettings: {
        minAppointmentDuration: 10,
        maxAppointmentDuration: 180,
        advanceBookingDays: 14,
        workingHours: DEFAULT_WORKING_HOURS,
        unavailableTimes: []
      }
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
 * POST /auth/forgot-password
 * Input: { email }
 * Output: { success: true, message: string, devOtp: string (only in dev) }
 */
app.post('/auth/forgot-password', (req, res) => {
  const { email } = req.body
  
  if (!email) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email is required' 
    })
  }
  
  const user = USERS.find(u => u.email === email)
  if (!user) {
    return res.status(200).json({ 
      success: true, 
      message: 'If an account exists with this email, an OTP has been sent.' 
    })
  }
  
  const otp = generateOTP()
  const expiresAt = Date.now() + 10 * 60 * 1000
  otpStore[email] = { otp, expiresAt }
  
  console.log(`📧 OTP for ${email}: ${otp}`)
  
  // Remove devOtp from response
  res.json({
    success: true,
    message: 'OTP sent to your email'
    // NO devOtp HERE
  })
})

/**
 * POST /auth/verify-otp
 * Input: { email, otp }
 * Output: { success: true, resetToken: string }
 */
app.post('/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body
  
  console.log('📝 VERIFY OTP REQUEST:', { email, otp })
  
  if (!email || !otp) {
    console.log('❌ VERIFY OTP FAILED: Missing fields')
    return res.status(400).json({ 
      success: false, 
      message: 'Email and OTP are required' 
    })
  }
  
  const stored = otpStore[email]
  
  if (!stored) {
    console.log('❌ VERIFY OTP FAILED: No OTP requested for this email')
    return res.status(400).json({ 
      success: false, 
      message: 'No OTP requested for this email' 
    })
  }
  
  if (stored.otp !== otp) {
    console.log('❌ VERIFY OTP FAILED: Invalid OTP')
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid OTP' 
    })
  }
  
  if (Date.now() > stored.expiresAt) {
    delete otpStore[email]
    console.log('❌ VERIFY OTP FAILED: OTP expired')
    return res.status(400).json({ 
      success: false, 
      message: 'OTP has expired. Please request a new one.' 
    })
  }
  
  // OTP verified - generate reset token
  const resetToken = jwt.sign(
    { email: email, purpose: 'password-reset' },
    JWT_SECRET,
    { expiresIn: '10m' }
  )
  
  // Clear OTP from store after verification
  delete otpStore[email]
  
  console.log('✅ OTP VERIFIED SUCCESS:', { email })
  
  res.json({
    success: true,
    message: 'OTP verified successfully',
    resetToken
  })
})

/**
 * POST /auth/reset-password
 * Input: { resetToken, newPassword }
 * Output: { success: true, message: string }
 */
app.post('/auth/reset-password', (req, res) => {
  const { resetToken, newPassword } = req.body
  
  console.log('📝 RESET PASSWORD REQUEST')
  
  if (!resetToken || !newPassword) {
    console.log('❌ RESET PASSWORD FAILED: Missing fields')
    return res.status(400).json({ 
      success: false, 
      message: 'Reset token and new password are required' 
    })
  }
  
  if (newPassword.length < 6) {
    console.log('❌ RESET PASSWORD FAILED: Password too short')
    return res.status(400).json({ 
      success: false, 
      message: 'Password must be at least 6 characters' 
    })
  }
  
  try {
    const decoded = jwt.verify(resetToken, JWT_SECRET)
    
    if (decoded.purpose !== 'password-reset') {
      console.log('❌ RESET PASSWORD FAILED: Invalid purpose')
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid reset token' 
      })
    }
    
    const user = USERS.find(u => u.email === decoded.email)
    if (!user) {
      console.log('❌ RESET PASSWORD FAILED: User not found')
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      })
    }
    
    // Update password
    user.password = newPassword
    user.updatedAt = new Date().toISOString()
    
    console.log('✅ RESET PASSWORD SUCCESS:', { email: decoded.email })
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    })
    
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.log('❌ RESET PASSWORD FAILED: Token expired')
      return res.status(400).json({ 
        success: false, 
        message: 'Reset link has expired. Please request a new one.' 
      })
    }
    console.log('❌ RESET PASSWORD FAILED:', err.message)
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid reset token' 
    })
  }
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


// ============ PATIENT ROUTES ============ //These might not be used anywhere

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

// ============ DOCTOR ROUTES ============


const GENERATED_DOCTORS = []
// Add this after your other constant definitions (around line ~50-100)
const DEFAULT_WORKING_HOURS = [
  { dayOfWeek: 1, dayName: 'Monday', isWorking: true, slots: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  { dayOfWeek: 2, dayName: 'Tuesday', isWorking: true, slots: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  { dayOfWeek: 3, dayName: 'Wednesday', isWorking: true, slots: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  { dayOfWeek: 4, dayName: 'Thursday', isWorking: true, slots: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  { dayOfWeek: 5, dayName: 'Friday', isWorking: true, slots: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  { dayOfWeek: 6, dayName: 'Saturday', isWorking: true, slots: [{ start: '09:00', end: '14:00' }] },
  { dayOfWeek: 0, dayName: 'Sunday', isWorking: false, slots: [] }
]
/**
 * GET /doctors
 * Output: Array of doctor objects (public view)
 */
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
          },
          timeSlots: [],
          availabilitySettings: {
            minAppointmentDuration: 10,
            maxAppointmentDuration: 180,
            advanceBookingDays: 14,
            workingHours: DEFAULT_WORKING_HOURS,
            unavailableTimes: []
          },
          isAvailable: true
        },
        profileIcon: randomItem(['👨‍⚕️', '👩‍⚕️', '🩺']),
        
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
  
  let doctor = GENERATED_DOCTORS.find(d => d._id === doctorId)
  
  if (!doctor) {
    const user = USERS.find(u => u._id === doctorId && u.role === 'DOCTOR')
    if (user) {
      doctor = {
        _id: user._id,
        profile: user.profile || { firstName: '', lastName: '' },
        phone: user.phone || '',
        addresses: user.addresses || [],
        detailsOfHealthCareProfessional: user.detailsOfHealthCareProfessional || {},
        availabilitySettings: user.detailsOfHealthCareProfessional?.availabilitySettings || {},
        profileIcon: user.profileIcon || '👨‍⚕️'
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
    const bookedCount = randomBetween(3, 15)
    const cancelledCount = randomBetween(0, 5)
    
    const completedEarnings = completedCount * randomBetween(300, 1500)
    const bookedEarnings = bookedCount * randomBetween(300, 1500)
    
    const totalEarnings = completedEarnings + bookedEarnings
    const totalAppointments = completedCount + bookedCount + cancelledCount
    
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
            _id: 'BOOKED',
            totalEarnings: bookedEarnings,
            totalTax: Math.round(bookedEarnings * 0.18),
            count: bookedCount
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

/**
 * PATCH /doctors/me/availability/toggle
 * Toggle doctor's overall availability (accepting bookings or not)
 */
app.patch('/doctors/me/availability/toggle', (req, res) => {
  const { isAvailable } = req.body
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const userIndex = USERS.findIndex(u => u._id === decoded.userId)
    
    if (userIndex === -1) {
      return res.status(401).json({ success: false, message: 'User not found' })
    }
    
    if (USERS[userIndex].role !== 'DOCTOR') {
      return res.status(403).json({ success: false, message: 'Not a doctor' })
    }
    
    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isAvailable must be a boolean' })
    }
    
    if (!USERS[userIndex].detailsOfHealthCareProfessional) {
      USERS[userIndex].detailsOfHealthCareProfessional = {}
    }
    
    USERS[userIndex].detailsOfHealthCareProfessional.isAvailable = isAvailable
    USERS[userIndex].updatedAt = new Date().toISOString()
    
    res.json({
      success: true,
      data: {
        isAvailable: isAvailable,
        message: isAvailable ? 'Now accepting bookings' : 'Bookings disabled'
      }
    })
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' })
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
    
    // Save inside detailsOfHealthCareProfessional
    if (!USERS[userIndex].detailsOfHealthCareProfessional) {
      USERS[userIndex].detailsOfHealthCareProfessional = {}
    }
    USERS[userIndex].detailsOfHealthCareProfessional.availabilitySettings = availabilitySettings
    USERS[userIndex].updatedAt = new Date().toISOString()
    
    console.log('✅ Availability settings saved for doctor:', decoded.userId)
    
    // Send response immediately
    res.json({
      success: true,
      message: 'Availability settings saved successfully'
    })
    
    
  } catch (error) {
    console.error('❌ Error updating availability:', error)
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    })
  }
})

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

// DOCUMENTS (--------------------------)
const MEDICAL_RECORDS = []

/**
 * POST /medical-records
 * Input: { patientId, documentType, fileUrl, notes, isConfidential, appointmentId }
 * Output: { success: true, data: { ...record } }
 */
app.post('/medical-records', (req, res) => {
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
    
    const { patientId, documentType, fileUrl, notes, isConfidential, appointmentId } = req.body
    
    // Validate required fields
    if (!patientId || !documentType || !fileUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'patientId, documentType, and fileUrl are required' 
      })
    }
    
    // Validate documentType enum
    const validDocTypes = ['PRESCRIPTION', 'LAB_REPORT', 'REPORT', 'OTHER']
    if (!validDocTypes.includes(documentType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'documentType must be PRESCRIPTION, LAB_REPORT, REPORT, or OTHER' 
      })
    }
    
    // Verify patient exists (in production, check DB)
    const patient = USERS.find(u => u._id === patientId)
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      })
    }
    
    // Check if doctor has permission (in production, verify relationship)
    if (user.role === 'DOCTOR') {
      // In production: check if this patient is assigned to this doctor
      // For test server, allow any doctor to upload for any patient
    }
    
    // Resolve doctorId from appointment if provided
    let doctorId = null
    if (appointmentId) {
      const appointment = APPOINTMENTS.find(a => a._id === appointmentId)
      if (appointment) {
        doctorId = appointment.doctorId
      }
    }
    
    // If no appointment, use current user as doctor (if they are a doctor)
    if (user.role === 'DOCTOR' && !doctorId) {
      doctorId = user._id
    }
    
    const newRecord = {
      _id: `medrec_${Date.now()}`,
      patientId: patientId,
      doctorId: doctorId || null,
      appointmentId: appointmentId || null,
      documentType: documentType,
      fileUrl: fileUrl,
      uploadedAt: new Date().toISOString(),
      notes: notes || '',
      isConfidential: isConfidential || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    MEDICAL_RECORDS.push(newRecord)
    
    console.log(`📝 Medical record created: ${newRecord._id} for patient ${patientId}`)
    
    // Return with populated doctorId (matching production structure)
    const doctorUser = doctorId ? USERS.find(u => u._id === doctorId) : null
    const responseData = {
      ...newRecord,
      doctorId: doctorUser ? {
        _id: doctorUser._id,
        profile: doctorUser.profile || { firstName: '', lastName: '' },
        email: doctorUser.email
      } : null
    }
    
    res.status(201).json({
      success: true,
      data: responseData
    })
    
  } catch (error) {
    console.error('Error creating medical record:', error)
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
})

/**
 * GET /medical-records
 * Query: { patientId, documentType, page, limit }
 * Output: { success: true, data: [...], pagination: {...} }
 */
app.get('/medical-records', (req, res) => {
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
    
    let records = [...MEDICAL_RECORDS]
    
    // Role-based filtering
    if (user.role === 'CUSTOMER') {
      records = records.filter(r => r.patientId === user._id)
    } else if (user.role === 'DOCTOR') {
      // Doctor sees records they uploaded OR records of their patients
      // For test server: show all records (in production, filter by doctorId)
      records = records.filter(r => r.doctorId === user._id || r.patientId === user._id)
    } else if (user.role === 'ADMIN') {
      // Admin sees all records
      // Additional filter by patientId if provided
      if (req.query.patientId) {
        records = records.filter(r => r.patientId === req.query.patientId)
      }
    }
    
    // Filter by documentType
    if (req.query.documentType) {
      records = records.filter(r => r.documentType === req.query.documentType)
    }
    
    // Sort by createdAt (newest first)
    records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    // Pagination
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const start = (page - 1) * limit
    const end = start + limit
    const paginated = records.slice(start, end)
    
    // Populate doctorId and patientId with user data (matching production)
    const populatedRecords = paginated.map(record => {
      const doctorUser = record.doctorId ? USERS.find(u => u._id === record.doctorId) : null
      const patientUser = USERS.find(u => u._id === record.patientId)
      
      return {
        ...record,
        doctorId: doctorUser ? {
          _id: doctorUser._id,
          profile: doctorUser.profile || { firstName: '', lastName: '' },
          email: doctorUser.email
        } : null,
        patientId: patientUser ? {
          _id: patientUser._id,
          profile: patientUser.profile || { firstName: '', lastName: '' },
          email: patientUser.email
        } : record.patientId
      }
    })
    
    res.json({
      success: true,
      data: populatedRecords,
      pagination: {
        total: records.length,
        page: page,
        limit: limit,
        pages: Math.ceil(records.length / limit)
      }
    })
    
  } catch (error) {
    console.error('Error fetching medical records:', error)
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
})

/**
 * GET /medical-records/:id
 * Output: { success: true, data: { ...record } }
 */
app.get('/medical-records/:id', (req, res) => {
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
    
    const record = MEDICAL_RECORDS.find(r => r._id === req.params.id)
    
    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' })
    }
    
    // Check access: patient, doctor, or admin
    const isPatient = user.role === 'CUSTOMER' && record.patientId === user._id
    const isDoctor = user.role === 'DOCTOR' && record.doctorId === user._id
    const isAdmin = user.role === 'ADMIN'
    
    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }
    
    // Populate doctorId and patientId
    const doctorUser = record.doctorId ? USERS.find(u => u._id === record.doctorId) : null
    const patientUser = USERS.find(u => u._id === record.patientId)
    
    const populatedRecord = {
      ...record,
      doctorId: doctorUser ? {
        _id: doctorUser._id,
        profile: doctorUser.profile || { firstName: '', lastName: '' },
        email: doctorUser.email
      } : null,
      patientId: patientUser ? {
        _id: patientUser._id,
        profile: patientUser.profile || { firstName: '', lastName: '' },
        email: patientUser.email
      } : record.patientId
    }
    
    res.json({
      success: true,
      data: populatedRecord
    })
    
  } catch (error) {
    console.error('Error fetching medical record:', error)
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
})

/**
 * PATCH /medical-records/:id
 * Input: { notes, isConfidential, documentType }
 * Output: { success: true, data: { ...record } }
 */
app.patch('/medical-records/:id', (req, res) => {
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
    
    const recordIndex = MEDICAL_RECORDS.findIndex(r => r._id === req.params.id)
    
    if (recordIndex === -1) {
      return res.status(404).json({ success: false, message: 'Medical record not found' })
    }
    
    const record = MEDICAL_RECORDS[recordIndex]
    
    // Only doctor who uploaded or admin can edit
    const isUploadingDoctor = user.role === 'DOCTOR' && record.doctorId === user._id
    const isAdmin = user.role === 'ADMIN'
    
    if (!isUploadingDoctor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only uploading doctor or admin can edit' })
    }
    
    // Update fields
    const { notes, isConfidential, documentType } = req.body
    const validDocTypes = ['PRESCRIPTION', 'LAB_REPORT', 'REPORT', 'OTHER']
    
    if (documentType && !validDocTypes.includes(documentType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'documentType must be PRESCRIPTION, LAB_REPORT, REPORT, or OTHER' 
      })
    }
    
    if (notes !== undefined) MEDICAL_RECORDS[recordIndex].notes = notes
    if (isConfidential !== undefined) MEDICAL_RECORDS[recordIndex].isConfidential = isConfidential
    if (documentType) MEDICAL_RECORDS[recordIndex].documentType = documentType
    MEDICAL_RECORDS[recordIndex].updatedAt = new Date().toISOString()
    
    // Return populated record
    const updatedRecord = MEDICAL_RECORDS[recordIndex]
    const doctorUser = updatedRecord.doctorId ? USERS.find(u => u._id === updatedRecord.doctorId) : null
    const patientUser = USERS.find(u => u._id === updatedRecord.patientId)
    
    const responseData = {
      ...updatedRecord,
      doctorId: doctorUser ? {
        _id: doctorUser._id,
        profile: doctorUser.profile || { firstName: '', lastName: '' },
        email: doctorUser.email
      } : null,
      patientId: patientUser ? {
        _id: patientUser._id,
        profile: patientUser.profile || { firstName: '', lastName: '' },
        email: patientUser.email
      } : updatedRecord.patientId
    }
    
    res.json({
      success: true,
      data: responseData
    })
    
  } catch (error) {
    console.error('Error updating medical record:', error)
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
})

/**
 * DELETE /medical-records/:id
 * Output: { success: true, message: 'Medical record deleted' }
 */
app.delete('/medical-records/:id', (req, res) => {
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
    
    const recordIndex = MEDICAL_RECORDS.findIndex(r => r._id === req.params.id)
    
    if (recordIndex === -1) {
      return res.status(404).json({ success: false, message: 'Medical record not found' })
    }
    
    const record = MEDICAL_RECORDS[recordIndex]
    
    // Check access: patient (record owner), uploading doctor, or admin
    const isPatient = user.role === 'CUSTOMER' && record.patientId === user._id
    const isUploadingDoctor = user.role === 'DOCTOR' && record.doctorId === user._id
    const isAdmin = user.role === 'ADMIN'
    
    if (!isPatient && !isUploadingDoctor && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only patient, uploading doctor, or admin can delete' 
      })
    }
    
    MEDICAL_RECORDS.splice(recordIndex, 1)
    
    res.json({
      success: true,
      message: 'Medical record deleted'
    })
    
  } catch (error) {
    console.error('Error deleting medical record:', error)
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
})




// ============ APPOINTMENT ROUTES ============

app.post('/system/auto-complete-appointments', (req, res) => {
  console.log('🔄 AUTO-COMPLETING APPOINTMENTS')
  
  const now = new Date()
  let completedCount = 0
  const completedAppointments = []
  
  APPOINTMENTS.forEach(appointment => {
    if (appointment.appointmentStatus === 'BOOKED') {
      const endDateTime = new Date(`${appointment.schedule.scheduledAt}T${appointment.schedule.endDateTime}:00`)
      
      if (endDateTime < now) {
        appointment.appointmentStatus = 'COMPLETED'
        appointment.updatedAt = now.toISOString()
        appointment.completedBy = 'SYSTEM'
        completedCount++
        completedAppointments.push(appointment)
      }
    }
  })
  
  // Remove time slots for completed appointments
  completedAppointments.forEach(appointment => {
    // Search in USERS first
    let doctor = USERS.find(u => u._id === appointment.doctorId)
    if (!doctor) {
      doctor = GENERATED_DOCTORS.find(d => d._id === appointment.doctorId)
    }
    
    if (doctor && doctor.detailsOfHealthCareProfessional?.timeSlots) {
      doctor.detailsOfHealthCareProfessional.timeSlots = removeTimeSlot(
        doctor.detailsOfHealthCareProfessional.timeSlots,
        appointment.schedule.scheduledAt,
        appointment.schedule.startDateTime,
        appointment.schedule.endDateTime
      )
    }
  })
  
  console.log(`✅ Auto-completed ${completedCount} appointments`)
  
  res.json({ 
    success: true, 
    completedCount, 
    message: `Auto-completed ${completedCount} appointments` 
  })
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
      multiplier,
      type: req.body.type || 'VIDEO'
    }
  })
})

function mergeTouchingSlots(slots) {
  if (!slots || slots.length === 0) return []
  
  // Group by date
  const grouped = {}
  slots.forEach(slot => {
    if (!grouped[slot.date]) grouped[slot.date] = []
    grouped[slot.date].push(slot)
  })
  
  const result = []
  Object.keys(grouped).forEach(date => {
    const daySlots = grouped[date].sort((a, b) => a.startTime.localeCompare(b.startTime))
    const merged = [daySlots[0]]
    
    for (let i = 1; i < daySlots.length; i++) {
      const current = daySlots[i]
      const last = merged[merged.length - 1]
      
      // If slots touch or overlap (current.start <= last.end)
      if (current.startTime <= last.endTime) {
        last.endTime = current.endTime > last.endTime ? current.endTime : last.endTime
      } else {
        merged.push(current)
      }
    }
    
    result.push(...merged)
  })
  
  return result
}

function removeTimeSlot(slots, date, startTime, endTime) {
  const result = []
  
  for (const slot of slots) {
    if (slot.date !== date) {
      result.push(slot)
      continue
    }
    
    // No overlap
    if (endTime <= slot.startTime || startTime >= slot.endTime) {
      result.push(slot)
      continue
    }
    
    // Remove from middle - split into two
    if (startTime > slot.startTime && endTime < slot.endTime) {
      result.push({ date, startTime: slot.startTime, endTime: startTime })
      result.push({ date, startTime: endTime, endTime: slot.endTime })
      continue
    }
    
    // Remove from left (overlap on left side)
    if (startTime <= slot.startTime && endTime < slot.endTime && endTime > slot.startTime) {
      result.push({ date, startTime: endTime, endTime: slot.endTime })
      continue
    }
    
    // Remove from right (overlap on right side)
    if (startTime > slot.startTime && startTime < slot.endTime && endTime >= slot.endTime) {
      result.push({ date, startTime: slot.startTime, endTime: startTime })
      continue
    }
    
    // Complete removal - skip the slot entirely
  }
  
  return result
}
app.post('/appointments', (req, res) => {
  const { doctorId, patientId, date, startTime, endTime, duration, reason, consultationType } = req.body
  
  if (!doctorId || !patientId || !date || !startTime) {
    return res.status(400).json({ 
      success: false, 
      message: 'doctorId, patientId, date, and startTime are required' 
    })
  }
  
  // ✅ Search in USERS first
  let doctor = USERS.find(u => u._id === doctorId && u.role === 'DOCTOR')
  
  // ✅ If not found in USERS, search in GENERATED_DOCTORS
  if (!doctor) {
    doctor = GENERATED_DOCTORS.find(d => d._id === doctorId)
  }
  
  const patient = USERS.find(u => u._id === patientId)
  
  if (!doctor) {
    return res.status(404).json({ success: false, message: 'Doctor not found' })
  }
  
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' })
  }
  
  // Add this check after finding doctor
  if (doctor.detailsOfHealthCareProfessional?.isAvailable === false) {
    return res.status(400).json({ 
      success: false, 
      message: 'Doctor is not accepting bookings at this time' 
    })
  }

  // ✅ CHECK CONFLICT - does this time overlap with any existing timeSlots?
  const conflict = (doctor.detailsOfHealthCareProfessional.timeSlots || []).some(slot => 
    slot.date === date &&
    !(slot.endTime <= startTime || slot.startTime >= (endTime || startTime))
  ) 
  
  if (conflict) {
    return res.status(409).json({ 
      success: false, 
      message: 'This time overlaps with an existing booking' 
    })
  }
  const consultationFee = doctor.detailsOfHealthCareProfessional?.consultationFee || 500
  const taxAmount = Math.round(consultationFee * 0.18)
  const totalAmount = consultationFee + taxAmount

  const newAppointment = {
    _id: generateId('apt'),
    patientId: patientId,
    doctorId: doctorId,

    patientName: `${patient.profile?.firstName || ''} ${patient.profile?.lastName || ''}`.trim() || 'Patient',
    doctorName: `${doctor.profile?.firstName || ''} ${doctor.profile?.lastName || ''}`.trim() || 'Doctor',

    schedule: {
      scheduledAt: date,
      startDateTime: startTime,
      endDateTime: endTime,
      slotTime: `${startTime} - ${endTime || startTime}`
    },
    duration: duration || 30,
    meeting: {
      meetingId: null,
      meetingLink: null,
      consultationType: consultationType || "VIDEO"
    },
    financials: {
      consultationFee: consultationFee,
      taxAmount: taxAmount,
      totalAmount: totalAmount,
      refundableAmount: consultationFee
    },
    paymentDetails: {
      transactionId: "",
      status: "PENDING",
      currency: "INR",
      paidAt: null
    },

    appointmentStatus: 'BOOKED',
    reason: reason || '',
    symptoms: req.body.symptoms || '',
    hasRated: false,
    rejectReason: null,
    cancelReason: null,

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  APPOINTMENTS.push(newAppointment)
  
  // ✅ ADD BOOKED TIME TO timeSlots
  if (!doctor.detailsOfHealthCareProfessional.timeSlots) {
    doctor.detailsOfHealthCareProfessional.timeSlots = []
  }
  doctor.detailsOfHealthCareProfessional.timeSlots.push({
    date: date,
    startTime: startTime,
    endTime: endTime || startTime
  })
  
  // ✅ MERGE TOUCHING SLOTS
  doctor.detailsOfHealthCareProfessional.timeSlots = mergeTouchingSlots(doctor.detailsOfHealthCareProfessional.timeSlots)
  
  res.status(201).json({
    success: true,
    data: newAppointment
  })
})

/**
 * GET /appointments
 * Unified appointment list - role-based filtering
 */
app.get('/appointments', (req, res) => {
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
    
    let appointments = []
    
    if (user.role === 'CUSTOMER') {
      appointments = APPOINTMENTS.filter(a => a.patientId === user._id && 
    (a.appointmentStatus === 'BOOKED' || a.appointmentStatus === 'COMPLETED'))
    } else if (user.role === 'DOCTOR') {
      appointments = APPOINTMENTS.filter(a => a.doctorId === user._id && 
    (a.appointmentStatus === 'BOOKED' || a.appointmentStatus === 'COMPLETED'))
    } else if (user.role === 'ADMIN') {
      appointments = APPOINTMENTS
    }
    
    if (req.query.status) {
      appointments = appointments.filter(a => a.appointmentStatus === req.query.status)
    }
    
    appointments.sort((a, b) => {
      if (a.schedule?.scheduledAt !== b.schedule?.scheduledAt) {
        return (a.schedule?.scheduledAt || '').localeCompare(b.schedule?.scheduledAt || '')
      }
      return (a.schedule?.startDateTime || '').localeCompare(b.schedule?.startDateTime || '')
    })
    
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const start = (page - 1) * limit
    const paginated = appointments.slice(start, start + limit)
    
    res.json({
      success: true,
      data: paginated,
      pagination: {
        total: appointments.length,
        page: page,
        limit: limit,
        pages: Math.ceil(appointments.length / limit)
      }
    })
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
})

app.get('/appointments/:id', (req, res) => {
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
    
    const appointment = APPOINTMENTS.find(a => a._id === req.params.id)
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' })
    }
    
    const isPatient = appointment.patientId === user._id
    const isDoctor = appointment.doctorId === user._id
    const isAdmin = user.role === 'ADMIN'
    
    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }
    
    res.json({ success: true, data: appointment })
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
})

app.patch('/appointments/:id/reject', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  const { reason } = req.body

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = USERS.find(u => u._id === decoded.userId)
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' })
    }
    
    const appointment = APPOINTMENTS.find(a => a._id === req.params.id)
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' })
    }
    
  
    if (appointment.appointmentStatus !== 'BOOKED') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only BOOKED appointments can be rejected' 
      })
    }
  
    // ✅ REMOVE FROM timeSlots WITH SPLITTING
    const doctor = USERS.find(u => u._id === appointment.doctorId)
    if (doctor && doctor.detailsOfHealthCareProfessional?.timeSlots) {
      doctor.detailsOfHealthCareProfessional.timeSlots = removeTimeSlot(
        doctor.detailsOfHealthCareProfessional.timeSlots,
        appointment.schedule.scheduledAt,
        appointment.schedule.startDateTime,
        appointment.schedule.endDateTime
      )
    }
    
    appointment.appointmentStatus = 'REJECTED'
    appointment.rejectReason = reason || 'Rejected by doctor'
    appointment.updatedAt = new Date().toISOString()
    
    res.json({ success: true, data: appointment })
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
})

app.patch('/appointments/:id/cancel', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  const { reason } = req.body

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = USERS.find(u => u._id === decoded.userId)
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' })
    }
    
  
    const appointment = APPOINTMENTS.find(a => a._id === req.params.id)
      
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' })
    }
  
    if (appointment.appointmentStatus !== 'BOOKED') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only BOOKED appointments can be cancelled' 
      })
    }
  
    // ✅ REMOVE FROM timeSlots WITH SPLITTING
    const doctor = USERS.find(u => u._id === appointment.doctorId)
    if (doctor && doctor.detailsOfHealthCareProfessional?.timeSlots) {
      doctor.detailsOfHealthCareProfessional.timeSlots = removeTimeSlot(
        doctor.detailsOfHealthCareProfessional.timeSlots,
        appointment.schedule.scheduledAt,
        appointment.schedule.startDateTime,
        appointment.schedule.endDateTime
      )
    }
  
    appointment.appointmentStatus = 'CANCELLED'
    appointment.cancelReason = reason || 'Cancelled by patient'
    appointment.updatedAt = new Date().toISOString()
    
    res.json({ success: true, data: appointment })
  }
   catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
})

// ============ ISSUE REPORTING ROUTES ============
/**
 * POST /report-issue
 * Anyone (CUSTOMER/DOCTOR/ADMIN) can report an issue
 * Input: { category, subject, description, severity?, orderId?, appointmentId?, productId?, doctorId? }
 * Output: { success: true, data: { ...issue } }
 */
app.post('/report-issue', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
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
    
    const { 
      category, 
      subject, 
      description, 
      severity = 'MEDIUM',
      orderId, 
      appointmentId, 
      productId, 
      doctorId
    } = req.body
    
    // Validate required fields
    if (!category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Category is required' 
      })
    }
    
    if (!ISSUE_CATEGORIES.includes(category)) {
      return res.status(400).json({ 
        success: false, 
        message: `Category must be one of: ${ISSUE_CATEGORIES.join(', ')}` 
      })
    }
    
    if (!subject || subject.trim().length < 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subject must be at least 5 characters' 
      })
    }
    
    if (!description || description.trim().length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Description must be at least 10 characters' 
      })
    }
    
    // Validate severity
    const validSeverities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
    if (severity && !validSeverities.includes(severity)) {
      return res.status(400).json({ 
        success: false, 
        message: `Severity must be one of: ${validSeverities.join(', ')}` 
      })
    }
    
    // Create new issue report
    const newIssue = {
      _id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      reporterId: user._id,
      reporterName: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || user.email,
      reporterEmail: user.email,
      reporterRole: user.role,
      category: category,
      subject: subject.trim(),
      description: description.trim(),
      severity: severity || 'MEDIUM',
      status: 'PENDING',
      orderId: orderId || null,
      appointmentId: appointmentId || null,
      productId: productId || null,
      doctorId: doctorId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    ISSUE_REPORTS.push(newIssue)
    
    console.log(`📝 New issue reported: ${newIssue._id} by ${user.email}`)
    
    res.status(201).json({
      success: true,
      message: 'Issue reported successfully',
      data: newIssue
    })
    
  } catch (error) {
    console.error('Error reporting issue:', error)
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    })
  }
})

/**
 * GET /report-issue/my-issues
 * CUSTOMER/DOCTOR - View their own reported issues
 * Output: { success: true, data: [...] }
 */
app.get('/report-issue/my-issues', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
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
    
    // Only CUSTOMER and DOCTOR can view their own issues
    if (user.role !== 'CUSTOMER' && user.role !== 'DOCTOR') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      })
    }
    
    let issues = ISSUE_REPORTS.filter(i => i.reporterId === user._id)
    
    // Sort by createdAt (newest first)
    issues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    res.json({
      success: true,
      data: issues,
      total: issues.length
    })
    
  } catch (error) {
    console.error('Error fetching user issues:', error)
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    })
  }
})


// ============ ADMIN ROUTES (DOCTORS, PATIENTS, APPOINTMENTS, PRODUCTS, ISSUES,....) ============
/**
 * GET /admin/report-issue
 * ADMIN only - View all reported issues with filters
 * Query params: status, category, severity, reporterId, page, limit
 * Output: { success: true, data: [...], pagination: {...}, summary: {...} }
 */
app.get('/admin/report-issue', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
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
    
    // Only ADMIN can see all issues
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      })
    }
    
    let issues = [...ISSUE_REPORTS]
    
    // Apply filters
    if (req.query.status) {
      issues = issues.filter(i => i.status === req.query.status)
    }
    
    if (req.query.category) {
      issues = issues.filter(i => i.category === req.query.category)
    }
    
    if (req.query.severity) {
      issues = issues.filter(i => i.severity === req.query.severity)
    }
    
    if (req.query.reporterId) {
      issues = issues.filter(i => i.reporterId === req.query.reporterId)
    }
    
    // Sort by createdAt (newest first)
    issues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    // Pagination
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const start = (page - 1) * limit
    const paginated = issues.slice(start, start + limit)
    
    // Summary statistics
    const summary = {
      total: issues.length,
      byStatus: {},
      byCategory: {},
      bySeverity: {}
    }
    
    issues.forEach(issue => {
      summary.byStatus[issue.status] = (summary.byStatus[issue.status] || 0) + 1
      summary.byCategory[issue.category] = (summary.byCategory[issue.category] || 0) + 1
      summary.bySeverity[issue.severity] = (summary.bySeverity[issue.severity] || 0) + 1
    })
    
    res.json({
      success: true,
      data: paginated,
      summary: summary,
      pagination: {
        total: issues.length,
        page: page,
        limit: limit,
        pages: Math.ceil(issues.length / limit)
      }
    })
    
  } catch (error) {
    console.error('Error fetching issues:', error)
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    })
  }
})

/**
 * PATCH /admin/report-issue/:id/status
 * ADMIN only - Update issue status
 * Input: { status, notes? }
 * Output: { success: true, data: { ...issue } }
 */
app.patch('/admin/report-issue/:id/status', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  const { status, notes } = req.body
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
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
    
    // Only ADMIN can update issue status
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      })
    }
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status is required' 
      })
    }
    
    if (!ISSUE_STATUSES.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Status must be one of: ${ISSUE_STATUSES.join(', ')}` 
      })
    }
    
    const issueIndex = ISSUE_REPORTS.findIndex(i => i._id === req.params.id)
    
    if (issueIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Issue not found' 
      })
    }
    
    const issue = ISSUE_REPORTS[issueIndex]
    const oldStatus = issue.status
    
    // Update status
    issue.status = status
    issue.updatedAt = new Date().toISOString()
    
    // If resolved, add resolution details
    if (status === 'RESOLVED' || status === 'CLOSED') {
      issue.resolvedAt = new Date().toISOString()
      issue.resolvedBy = user._id
      issue.resolvedByName = `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || user.email
    }
    
    // Add admin note if provided
    if (notes) {
      issue.adminNote = notes
    }
    
    console.log(`📝 Issue ${issue._id} status updated: ${oldStatus} → ${status} by ${user.email}`)
    
    res.json({
      success: true,
      message: `Issue status updated to ${status}`,
      data: issue
    })
    
  } catch (error) {
    console.error('Error updating issue status:', error)
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    })
  }
})

/**
 * GET /admin/report-issue/:id
 * ADMIN only - View a specific issue with full details
 * Output: { success: true, data: { ...issue } }
 */
app.get('/admin/report-issue/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
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
    
    // Only ADMIN can view any issue
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      })
    }
    
    const issue = ISSUE_REPORTS.find(i => i._id === req.params.id)
    
    if (!issue) {
      return res.status(404).json({ 
        success: false, 
        message: 'Issue not found' 
      })
    }
    
    res.json({
      success: true,
      data: issue
    })
    
  } catch (error) {
    console.error('Error fetching issue:', error)
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    })
  }
})

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
    appointmentStatus: randomItem(['BOOKED', 'COMPLETED', 'CANCELLED']),
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
  res.json({ success: true })
})


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


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log('')
  console.log('📌 This server uses MOCK data only')
  console.log('📌 Write operations are logged to console')
  console.log('')
  console.log('🔐 Test credentials (any email/password works):')
  console.log('  Email: any@example.com')
  console.log('  Password: anypassword')
  console.log('')
})
