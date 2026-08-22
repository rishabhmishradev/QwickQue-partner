import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './services/AuthContext'
import React, { useState } from 'react'
import ServicesPage from './pages/ServicesPage'
import StaffPage from './pages/StaffPage'
import BookingsPage from './pages/BookingsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RegisterSalonPage from './pages/RegisterSalonPage'
import SlotsPage from './pages/SlotsPage'

// Simple Toast Notification Component
const Toast = ({ message, type, onClose }) => (
  <div style={{
    position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
    padding: '16px 24px', borderRadius: '8px', background: type === 'error' ? 'var(--rouge)' : 'var(--sage)',
    color: 'white', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: '12px',
    animation: 'slideIn 0.3s ease-out'
  }}>
    <span style={{ fontWeight: '600' }}>{message}</span>
    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}>×</button>
  </div>
);

function AppContent() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--chalk)' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Enhanced Sidebar */}
      <aside style={{
        width: '260px', backgroundColor: 'var(--white)', borderRight: '1px solid var(--border)',
        padding: '32px 0', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh'
      }}>
        <div style={{ padding: '0 32px', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '20px', color: 'var(--ink)', letterSpacing: '1px' }}>QUICKQUE</h2>
          <p style={{ fontSize: '10px', color: 'var(--brass)', fontWeight: 'bold', marginTop: '4px' }}>PARTNER_DASHBOARD</p>
        </div>

        <nav style={{ flex: 1 }}>
          <SidebarLink to="/bookings" icon={<IconBookings />} label="Ledger" active={location.pathname === '/bookings'} />
          <SidebarLink to="/slots" icon={<IconClock />} label="Time Slots" active={location.pathname === '/slots'} />
          <SidebarLink to="/services" icon={<IconScissors />} label="Services" active={location.pathname === '/services'} />
          <SidebarLink to="/staff" icon={<IconUsers />} label="Artisans" active={location.pathname === '/staff'} />
          <SidebarLink to="/my-company" icon={<IconSettings />} label="Company Settings" active={location.pathname === '/my-company'} />
        </nav>

        <div style={{ padding: '0 24px' }}>
          <button onClick={logout} className="btn" style={{ width: '100%', color: 'var(--rust)', background: '#FEE2E2', border: 'none' }}>
            TERMINATE_SESSION
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, marginLeft: '260px', padding: '0' }}>
        {/* Top Header */}
        <header style={{
          height: '72px', background: 'white', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 48px',
          position: 'sticky', top: 0, zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <div style={{ textAlign: 'right' }}>
               <div style={{ fontWeight: '600', fontSize: '14px' }}>{user.name}</div>
               <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.role}</div>
             </div>
             <div style={{
               width: '40px', height: '40px', background: 'var(--ink)', color: 'white',
               borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
               fontWeight: 'bold'
             }}>
               {user.name[0]}
             </div>
          </div>
        </header>

        <div style={{ padding: '48px' }}>
          <Routes>
            <Route path="/bookings" element={<BookingsPage showToast={showToast} />} />
            <Route path="/slots" element={<SlotsPage showToast={showToast} />} />
            <Route path="/services" element={<ServicesPage showToast={showToast} />} />
            <Route path="/staff" element={<StaffPage showToast={showToast} />} />
            <Route path="/my-company" element={<RegisterSalonPage showToast={showToast} />} />
            <Route path="/" element={<Navigate to="/bookings" />} />
          </Routes>
        </div>
      </main>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

const SidebarLink = ({ to, label, icon, active }) => (
  <Link to={to} style={{
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 32px',
    textDecoration: 'none', color: active ? 'var(--ink)' : 'var(--text-muted)',
    backgroundColor: active ? 'var(--chalk)' : 'transparent',
    borderLeft: active ? '4px solid var(--ink)' : '4px solid transparent',
    transition: 'all 0.2s', fontSize: '14px', fontWeight: active ? '600' : '500'
  }}>
    {icon}
    <span>{label}</span>
  </Link>
);

// Inline SVG Icons
const IconBookings = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
const IconClock = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconScissors = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>;
const IconUsers = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconSettings = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;

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
