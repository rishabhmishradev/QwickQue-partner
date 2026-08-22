import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../services/AuthContext'

function BookingsPage() {
  const { user } = useAuth();
  const [salon, setSalon] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  const fetchInitialData = async () => {
    try {
      const salonsRes = await api.get('/salons/my-salons');
      if (salonsRes.data.data.length > 0) {
        const mySalon = salonsRes.data.data[0];
        setSalon(mySalon);

        // Check if profile is complete AND hasn't been shown in this session
        const hasSeenPopup = sessionStorage.getItem('profile_popup_shown');
        const isIncomplete = !mySalon.address || mySalon.address === 'To be updated' || !mySalon.description;

        if (isIncomplete && !hasSeenPopup) {
          setShowProfilePopup(true);
          sessionStorage.setItem('profile_popup_shown', 'true');
        }

        const bookingsRes = await api.get(`/salons/${mySalon.id}/bookings`);
        setBookings(bookingsRes.data.data);
      } else {
        setShowProfilePopup(true);
      }
    } catch (e) {
      console.error('Error fetching data:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchInitialData()
  }, [user])

  const handleAction = async (id, action) => {
    try {
      await api.post(`/bookings/${id}/${action === 'confirmed' ? 'accept' : action}`)
      // Refresh bookings
      const bookingsRes = await api.get(`/salons/${salon.id}/bookings`);
      setBookings(bookingsRes.data.data);
      alert(`BOOKING_${action.toUpperCase()}_SUCCESS`);
    } catch (e) {
      alert('ACTION_FAILED: ' + (e.response?.data?.error || e.message));
    }
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>INITIALIZING_LEDGER...</div>

  const currentBookings = bookings.filter(b => ['PENDING_CONFIRMATION', 'CONFIRMED'].includes(b.status));
  const pastBookings = bookings.filter(b => ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(b.status));

  return (
    <div style={{ maxWidth: '1000px', position: 'relative' }}>
      {showProfilePopup && (
        <div style={styles.overlay}>
          <div className="ticket-stub" style={styles.popup}>
            <h2>Complete Your Profile</h2>
            <p>Please update your company details to start accepting bookings.</p>
            <button onClick={() => window.location.href='/my-company'} style={styles.popupButton}>UPDATE NOW</button>
          </div>
        </div>
      )}

      <h1 style={{ fontSize: '2.5rem' }}>{salon?.name?.toUpperCase() || 'MY'} Ledger</h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--brass)', marginBottom: '40px' }}>
        LOCATION_ID: SALON_{salon?.id?.toString().padStart(3, '0') || '000'} // STATUS: {salon?.status || 'UNKNOWN'}
      </p>

      <h3 style={{ color: 'var(--rouge)', borderBottom: '1px solid var(--rouge)', paddingBottom: '8px', marginBottom: '24px' }}>CURRENT REQUESTS</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {currentBookings.map(b => (
          <BookingTicket key={b.id} booking={b} actions={
            b.status === 'PENDING_CONFIRMATION' ? (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => handleAction(b.id, 'confirmed')} className="btn-primary" style={{ backgroundColor: 'var(--sage)', padding: '8px 16px' }}>ACCEPT</button>
                <button onClick={() => handleAction(b.id, 'rejected')} className="btn-primary" style={{ backgroundColor: 'var(--rust)', padding: '8px 16px' }}>REJECT</button>
              </div>
            ) : (
              <button onClick={() => handleAction(b.id, 'completed')} className="btn-primary" style={{ padding: '8px 16px' }}>MARK COMPLETED</button>
            )
          } />
        ))}
        {currentBookings.length === 0 && (
          <div style={{ padding: '24px', border: '1px dashed #ddd', textAlign: 'center', color: '#999' }}>NO_ACTIVE_BOOKINGS</div>
        )}
      </div>

      <h3 style={{ marginTop: '60px', borderBottom: '1px solid var(--ink)', paddingBottom: '8px', marginBottom: '24px' }}>PAST BOOKINGS</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', opacity: 0.7 }}>
        {pastBookings.map(b => (
          <BookingTicket key={b.id} booking={b} actions={
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: b.status === 'COMPLETED' ? 'var(--sage)' : 'var(--rouge)' }}>{b.status}</span>
          } />
        ))}
        {pastBookings.length === 0 && (
           <div style={{ padding: '24px', border: '1px dashed #ddd', textAlign: 'center', color: '#999' }}>NO_PAST_ACTIVITY</div>
        )}
      </div>
    </div>
  )
}

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  popup: { background: 'white', padding: '40px', borderRadius: '8px', textAlign: 'center', maxWidth: '400px' },
  popupButton: { marginTop: '20px', padding: '12px 24px', backgroundColor: 'var(--ink)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
};

const BookingTicket = ({ booking, actions }) => (
  <div className="ticket-stub" style={{ display: 'flex', overflow: 'hidden' }}>
    <div style={{ flex: 1, padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--brass)' }}>APPT_REF: #{booking.id}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>{new Date(booking.booking_date).toLocaleDateString().toUpperCase()}</span>
      </div>
      <div style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'var(--font-display)' }}>{booking.service_name.toUpperCase()}</div>
      <div style={{ marginTop: '8px', fontSize: '12px' }}>
        <span style={{ fontWeight: 'bold' }}>CUSTOMER:</span> {booking.user_name} ({booking.user_phone})
      </div>
    </div>
    <div style={{ width: '200px', backgroundColor: '#fafafa', borderLeft: '1px dashed #DED9D1', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
       <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', fontSize: '18px', marginBottom: '12px' }}>{booking.start_time.substring(0, 5)}</div>
       {actions}
    </div>
  </div>
)

export default BookingsPage
