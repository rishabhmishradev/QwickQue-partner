import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../services/AuthContext'

function BookingsPage({ showToast }) {
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
      const bookingsRes = await api.get(`/salons/${salon.id}/bookings`);
      setBookings(bookingsRes.data.data);
      showToast(`Booking ${action} successfully!`);
    } catch (e) {
      showToast('Action failed: ' + (e.response?.data?.error || e.message), 'error');
    }
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>INITIALIZING_LEDGER...</div>

  const currentBookings = bookings.filter(b => ['PENDING_CONFIRMATION', 'CONFIRMED'].includes(b.status));
  const pastBookings = bookings.filter(b => ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(b.status));

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {showProfilePopup && (
        <div style={styles.overlay}>
          <div className="card" style={styles.popup}>
            <div className="card-body">
              <h2 style={{ marginBottom: '16px' }}>Complete Your Profile</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Please update your company details to start accepting bookings and appear in searches.</p>
              <button onClick={() => window.location.href='/my-company'} className="btn btn-primary" style={{ width: '100%' }}>UPDATE NOW</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Appointments Ledger</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Viewing all requests for <span style={{ color: 'var(--ink)', fontWeight: '600' }}>{salon?.name || 'My Salon'}</span>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
           <span className="badge" style={{ background: 'var(--ink)', color: 'white', padding: '6px 12px' }}>
             SALON_ID: {salon?.id?.toString().padStart(3, '0') || '---'}
           </span>
        </div>
      </div>

      <section style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', color: 'var(--rouge)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></div>
          ACTIVE REQUESTS
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          {currentBookings.map(b => (
            <BookingCard key={b.id} booking={b} handleAction={handleAction} />
          ))}
          {currentBookings.length === 0 && (
            <div style={{ padding: '48px', background: 'white', borderRadius: '12px', textAlign: 'center', color: '#999', border: '1px dashed #ddd' }}>
              NO_ACTIVE_BOOKINGS_AT_THE_MOMENT
            </div>
          )}
        </div>
      </section>

      <section>
        <h3 style={{ fontSize: '18px', color: 'var(--ink)', marginBottom: '24px', opacity: 0.6 }}>PAST ACTIVITY</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', opacity: 0.8 }}>
          {pastBookings.map(b => (
            <BookingCard key={b.id} booking={b} isPast />
          ))}
          {pastBookings.length === 0 && (
             <div style={{ padding: '24px', textAlign: 'center', color: '#999' }}>NO_PAST_HISTORY</div>
          )}
        </div>
      </section>
    </div>
  )
}

const BookingCard = ({ booking, handleAction, isPast }) => {
  const statusColors = {
    'PENDING_CONFIRMATION': 'badge-pending',
    'CONFIRMED': 'badge-confirmed',
    'COMPLETED': 'badge-completed',
    'CANCELLED': 'badge-cancelled',
    'REJECTED': 'badge-cancelled'
  };

  return (
    <div className="card" style={{ display: 'flex', border: 'none' }}>
      <div style={{
        width: '120px', background: isPast ? '#F3F4F6' : 'var(--ink)', color: isPast ? 'var(--ink)' : 'white',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '20px'
      }}>
        <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>{new Date(booking.booking_date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</div>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{new Date(booking.booking_date).getDate()}</div>
        <div style={{ fontSize: '14px', marginTop: '8px', fontWeight: '600' }}>{booking.start_time.substring(0, 5)}</div>
      </div>

      <div style={{ flex: 1, padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
             <span className={`badge ${statusColors[booking.status]}`}>{booking.status.replace('_', ' ')}</span>
             <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>REF: #{booking.id}</span>
          </div>
          <h4 style={{ fontSize: '20px', marginBottom: '12px' }}>{booking.service_name}</h4>

          <div style={{ display: 'flex', gap: '24px' }}>
             <div>
               <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>CUSTOMER</div>
               <div style={{ fontSize: '14px', fontWeight: '500' }}>{booking.user_name}</div>
             </div>
             <div>
               <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>ARTISAN</div>
               <div style={{ fontSize: '14px', fontWeight: '500' }}>{booking.staff_name || 'Unassigned'}</div>
             </div>
          </div>
        </div>

        {!isPast && (
          <div style={{ display: 'flex', gap: '12px' }}>
            {booking.status === 'PENDING_CONFIRMATION' ? (
              <>
                <button onClick={() => handleAction(b.id, 'confirmed')} className="btn" style={{ background: 'var(--sage)', color: 'white' }}>ACCEPT</button>
                <button onClick={() => handleAction(b.id, 'rejected')} className="btn" style={{ background: 'var(--rust)', color: 'white' }}>REJECT</button>
              </>
            ) : (
              <button onClick={() => handleAction(booking.id, 'completed')} className="btn btn-primary">MARK DONE</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsPage
