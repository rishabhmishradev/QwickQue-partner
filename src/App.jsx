import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './services/AuthContext'
import ServicesPage from './pages/ServicesPage'
import StaffPage from './pages/StaffPage'
import BookingsPage from './pages/BookingsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RegisterSalonPage from './pages/RegisterSalonPage'

function AppContent() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{ width: '240px', backgroundColor: 'var(--ink)', color: 'white', padding: '40px 24px' }}>
        <h2 style={{ letterSpacing: '2px', marginBottom: '40px' }}>QUICKQUE</h2>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <li><SidebarLink to="/bookings" label="LEDGER" /></li>
          <li><SidebarLink to="/services" label="SERVICES" /></li>
          <li><SidebarLink to="/staff" label="ARTISANS (EMPLOYEES)" /></li>
          <li><SidebarLink to="/my-company" label="MY COMPANY" /></li>
          <li style={{ marginTop: '40px' }}>
            <button onClick={logout} style={{ background: 'transparent', border: 'none', color: 'var(--rouge)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>TERMINATE_SESSION</button>
          </li>
        </ul>
      </nav>
      <main style={{ flex: 1, padding: '60px', backgroundColor: 'var(--chalk)' }}>
        <Routes>
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/my-company" element={<RegisterSalonPage />} />
          <Route path="/" element={<Navigate to="/bookings" />} />
        </Routes>
      </main>
    </div>
  )
}

const SidebarLink = ({ to, label }) => (
  <Link to={to} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{label}</Link>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
