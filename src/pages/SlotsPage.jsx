import React, { useState, useEffect } from 'react';
import api from '../services/api';

function SlotsPage() {
  const [salon, setSalon] = useState(null);
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [form, setForm] = useState({ staff_id: '', service_id: '', start_time: '10:00', end_time: '11:00' });

  const fetchData = async () => {
    try {
      const salonsRes = await api.get('/salons/my-salons');
      if (salonsRes.data.data.length > 0) {
        const mySalon = salonsRes.data.data[0];
        setSalon(mySalon);

        const [staffRes, servicesRes, slotsRes] = await Promise.all([
          api.get(`/salons/${mySalon.id}/staff`),
          api.get(`/salons/${mySalon.id}/services`),
          api.get(`/salons/${mySalon.id}/slots?date=${date}`)
        ]);

        setStaff(staffRes.data.data || []);
        setServices(servicesRes.data.data || []);
        setSlots(slotsRes.data.data || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        staff_id: form.staff_id ? parseInt(form.staff_id) : null,
        service_id: form.service_id ? parseInt(form.service_id) : null,
        slot_date: date,
        start_time: form.start_time + ':00',
        end_time: form.end_time + ':00'
      };

      const res = await api.post(`/salons/${salon.id}/slots`, payload);

      if (res.data.success) {
        alert('SLOT_OPENED_SUCCESSFULLY');
        setForm({ ...form, staff_id: '', service_id: '' });
        fetchData();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'FAILED_TO_CREATE_SLOT';
      alert('ERROR: ' + errorMsg);
    }
  };

  const toggleStatus = async (slotId, currentStatus) => {
    try {
      await api.patch(`/slots/${slotId}/status`, { isOccupied: !currentStatus });
      fetchData();
    } catch (err) {
      alert('UPDATE_FAILED');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('REMOVE_SLOT?')) return;
    try {
      await api.delete(`/slots/${id}`);
      fetchData();
    } catch (err) {
      alert('DELETE_FAILED');
    }
  };

  if (loading) return <div>SYNCHRONIZING_INVENTORY...</div>

  return (
    <div style={{ maxWidth: '900px' }}>
      <h1>Slot Management</h1>

      <div className="ticket-stub" style={{ padding: '24px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
          <label style={{ fontSize: '10px', fontWeight: 'bold' }}>ACTIVE_DATE</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={styles.input} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '15px' }}>
          <select value={form.service_id} onChange={e => setForm({...form, service_id: e.target.value})} style={styles.input}>
            <option value="">SELECT SERVICE (OPTIONAL)</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
          </select>
          <select value={form.staff_id} onChange={e => setForm({...form, staff_id: e.target.value})} style={styles.input}>
            <option value="">SELECT ARTISAN (OPTIONAL)</option>
            {staff.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
          </select>
          <input type="time" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} required style={styles.input} />
          <input type="time" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} required style={styles.input} />
          <button type="submit" style={styles.button}>OPEN SLOT</button>
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {slots.map(s => (
          <div key={s.id} className="ticket-stub" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: s.is_occupied ? 0.6 : 1 }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)}</div>
              <div style={{ fontSize: '10px', color: 'var(--brass)', fontFamily: 'var(--font-mono)' }}>
                {s.service_name?.toUpperCase() || 'GENERAL'} // {s.staff_name?.toUpperCase() || 'ANY ARTISAN'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  fontSize: '9px',
                  fontWeight: 'bold',
                  padding: '4px 8px',
                  borderRadius: '2px',
                  backgroundColor: s.is_occupied ? 'var(--rouge)' : 'var(--sage)',
                  color: 'white'
                }}>
                  {s.is_occupied ? 'OCCUPIED' : 'AVAILABLE'}
                </span>
              </div>
              <button onClick={() => toggleStatus(s.id, s.is_occupied)} style={{ ...styles.actionBtn, color: s.is_occupied ? 'var(--sage)' : 'var(--rouge)' }}>
                {s.is_occupied ? 'MARK FREE' : 'MARK OCCUPIED'}
              </button>
              <button onClick={() => handleDelete(s.id)} style={{ ...styles.actionBtn, color: '#999' }}>REMOVE</button>
            </div>
          </div>
        ))}
        {slots.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>NO_SLOTS_FOR_THIS_DATE</div>}
      </div>
    </div>
  );
}

const styles = {
  input: { padding: '12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' },
  button: { padding: '12px', backgroundColor: 'var(--ink)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
  actionBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }
};

export default SlotsPage;
