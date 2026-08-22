import { useState, useEffect } from 'react'
import api from '../services/api'

function StaffPage() {
  const [salon, setSalon] = useState(null)
  const [staff, setStaff] = useState([])
  const [services, setServices] = useState([])
  const [form, setForm] = useState({ name: '', phone: '', service_ids: [] })
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)

  const fetchData = async () => {
    try {
      const salonsRes = await api.get('/salons/my-salons');
      if (salonsRes.data.data.length > 0) {
        const mySalon = salonsRes.data.data[0];
        setSalon(mySalon);

        const [staffRes, servicesRes] = await Promise.all([
          api.get(`/salons/${mySalon.id}/staff`),
          api.get(`/salons/${mySalon.id}/services`)
        ]);

        setStaff(staffRes.data.data);
        setServices(servicesRes.data.data);
      }
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleServiceToggle = (id) => {
    setForm(prev => ({
      ...prev,
      service_ids: prev.service_ids.includes(id)
        ? prev.service_ids.filter(sid => sid !== id)
        : [...prev.service_ids, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Clean data for backend
      const submissionData = {
        name: form.name,
        phone: form.phone,
        service_ids: form.service_ids.map(id => parseInt(id))
      };

      if (editingId) {
        await api.patch(`/staff/${editingId}`, submissionData);
        alert('STAFF_MEMBER_UPDATED');
      } else {
        await api.post(`/salons/${salon.id}/staff`, submissionData);
        alert('STAFF_MEMBER_REGISTERED');
      }
      setForm({ name: '', phone: '', service_ids: [] });
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert('OPERATION_FAILED: ' + (err.response?.data?.error || err.message));
    }
  }

  const handleEdit = (s) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      phone: s.phone || '',
      service_ids: s.service_ids || []
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('TERMINATE_CONTRACT?')) return;
    try {
      await api.delete(`/staff/${id}`);
      setStaff(staff.filter(s => s.id !== id));
    } catch (err) {
      alert('DELETE_FAILED');
    }
  };

  if (loading) return <div>RECONSTRUCTING_ROSTER...</div>

  return (
    <div style={{ maxWidth: '900px' }}>
      <h1>Artisan Roster</h1>
      <div className="ticket-stub" style={{ padding: '24px', marginBottom: '40px' }}>
        <h3>{editingId ? 'Modify Artisan Access' : 'Enroll New Artisan'}</h3>
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <input placeholder="ARTISAN NAME" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required style={styles.input} />
            <input placeholder="MOBILE NUMBER" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={styles.input} />
          </div>

          <div style={{ marginTop: '20px' }}>
            <span style={{ fontSize: '10px', color: '#666', fontWeight: 'bold' }}>ASSIGNED SERVICES (OPTIONAL)</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
              {services.map(s => (
                <button key={s.id} type="button"
                  onClick={() => handleServiceToggle(s.id)}
                  style={{ ...styles.pill, backgroundColor: form.service_ids.includes(s.id) ? 'var(--brass)' : '#eee', color: form.service_ids.includes(s.id) ? 'white' : 'black' }}>
                  {s.name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
            <button type="submit" style={styles.button}>{editingId ? 'COMMIT_CHANGES' : 'AUTHENTICATE ARTISAN'}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', phone: '', service_ids: [] }) }} style={{ ...styles.button, backgroundColor: '#666' }}>CANCEL</button>}
          </div>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {staff.map(s => (
          <div key={s.id} className="ticket-stub" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', position: 'relative' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--brass)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }}>
              {s.name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{s.name.toUpperCase()}</div>
              <div style={{ fontSize: '10px', color: 'var(--brass)', fontFamily: 'var(--font-mono)' }}>
                {s.service_ids?.length || 0} SERVICES ASSIGNED
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <button onClick={() => handleEdit(s)} style={styles.miniBtn}>EDIT</button>
              <button onClick={() => handleDelete(s.id)} style={{ ...styles.miniBtn, color: 'var(--rouge)' }}>REMOVE</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  input: { padding: '12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', width: '100%' },
  button: { flex: 1, padding: '14px', backgroundColor: 'var(--ink)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
  pill: { padding: '6px 12px', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '10px', transition: '0.2s' },
  miniBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '9px', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }
};

export default StaffPage
