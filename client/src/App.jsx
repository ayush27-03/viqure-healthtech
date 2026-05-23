import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Auth Pages
import Login from './pages/Login'
import PatientRegister from './pages/PatientRegister'
import DoctorRegister from './pages/DoctorRegister'

// Dashboard Pages
import PatientDashboard from './pages/PatientDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import AdminDashboard from './pages/AdminDashboard'

// Other Pages
import Homepage from './pages/Homepage'
import DoctorProfile from './pages/DoctorProfile'
import Appointments from './pages/Appointments'
import Shop from './pages/Shop'

function Navigation() {
  const { isAuthenticated, user, logout, role } = useAuth()

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="flex justify-between items-center px-6">
        
        <div className="flex gap-6 items-center">
          <Link to="/" className="font-bold text-xl hover:text-blue-200">
            🏥 HealthApp
          </Link>
          <Link to="/doctors" className="hover:text-blue-200">Find Doctors</Link>
          <Link to="/shop" className="hover:text-blue-200">Shop</Link>
          
          {isAuthenticated && (
            <>
              {role === 'patient' && (
                <Link to="/patient/dashboard" className="hover:text-blue-200">Dashboard</Link>
              )}
              {role === 'doctor' && (
                <Link to="/doctor/dashboard" className="hover:text-blue-200">Dashboard</Link>
              )}
              {role === 'admin' && (
                <Link to="/admin/dashboard" className="hover:text-blue-200">Admin</Link>
              )}
              <Link to="/appointments" className="hover:text-blue-200">My Appointments</Link>
            </>
          )}
        </div>
        
      
        <div>
          {isAuthenticated ? (
            <div className="flex gap-4 items-center">
              <span className="text-sm">👋 {user?.name?.split(' ')[0]}</span>
              <button onClick={logout} className="hover:text-blue-200">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="bg-white text-blue-600 px-5 py-1.5 rounded-lg hover:bg-blue-50 transition font-medium">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register/patient" element={<PatientRegister />} />
      <Route path="/register/doctor" element={<DoctorRegister />} />
      <Route path="/doctors" element={<Homepage />} />
      <Route path="/doctor/:id" element={<DoctorProfile />} />
      
      <Route path="/patient/dashboard" element={
        <ProtectedRoute allowedRoles={['patient']}>
          <PatientDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/doctor/dashboard" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <DoctorDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/appointments" element={
        <ProtectedRoute allowedRoles={['patient', 'doctor']}>
          <Appointments />
        </ProtectedRoute>
      } />
      
      <Route path="/shop" element={<Shop />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navigation />
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App