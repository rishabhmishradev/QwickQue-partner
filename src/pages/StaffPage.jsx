import { useState, useEffect } from 'react'
import api from '../services/api'

function StaffPage({ showToast }) {
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
      const submissionData = {
        name: form.name,
        phone: form.phone,
        service_ids: form.service_ids.map(id => parseInt(id))
      };

      if (editingId) {
        await api.patch(`/staff/${editingId}`, submissionData);
        showToast('Artisan profile updated!');
      } else {
        await api.post(`/salons/${salon.id}/staff`, submissionData);
        showToast('New artisan enrolled!');
      }
      setForm({ name: '', phone: '', service_ids: [] });
      setEditingId(null);
      fetchData();
    } catch (err) {
      showToast('Enrollment failed: ' + (err.response?.data?.error || err.message), 'error');
    }
  }

  const handleEdit = (s) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      phone: s.phone || '',
      service_ids: s.service_ids || []
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Terminate this artisan\'s contract?')) return;
    try {
      await api.delete(`/staff/${id}`);
      setStaff(staff.filter(s => s.id !== id));
      showToast('Artisan removed from roster');
    } catch (err) {
      showToast('Removal failed', 'error');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>RECONSTRUCTING_ROSTER...</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Artisan Roster</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your team of professionals and their assigned services.</p>
      </div>

      <div className="card" style={{ marginBottom: '48px' }}>
        <div className="card-header" style={{ background: 'var(--ink)', color: 'white' }}>
           <h3 style={{ fontSize: '18px' }}>{editingId ? 'Modify Artisan Details' : 'Enroll New Artisan'}</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>FULL NAME</label>
                <input placeholder="e.g. John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>MOBILE NUMBER</label>
                <input placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={styles.input} />
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <label style={{ ...styles.label, marginBottom: '12px', display: 'block' }}>QUALIFIED SERVICES</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {services.map(s => (
                  <button key={s.id} type="button"
                    onClick={() => handleServiceToggle(s.id)}
                    style={{
                      ...styles.pill,
                      backgroundColor: form.service_ids.includes(s.id) ? 'var(--ink)' : 'white',
                      color: form.service_ids.includes(s.id) ? 'white' : 'var(--ink)',
                      border: '1px solid var(--border)',
                      padding: '8px 16px',
                      fontWeight: form.service_ids.includes(s.id) ? '600' : '400'
                    }}>
                    {s.name}
                  </button>
                ))}
                {services.length === 0 && <span style={{ fontSize: '12px', color: '#999' }}>Please add services first in the Services tab.</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>{editingId ? 'COMMIT CHANGES' : 'AUTHENTICATE & ENROLL'}</button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', phone: '', service_ids: [] }) }}
                  className="btn btn-outline" style={{ flex: 1 }}>CANCEL</button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {staff.map(s => (
          <div key={s.id} className="card" style={{ border: 'none' }}>
            <div className="card-body" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{
                width: '60px', height: '60px', background: 'var(--chalk)', color: 'var(--ink)',
                borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', fontWeight: 'bold', border: '1px solid var(--border)'
              }}>
                {s.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '18px', marginBottom: '4px' }}>{s.name}</h4>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>{s.phone || 'No phone provided'}</div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                   {s.service_ids?.map(sid => {
                     const service = services.find(sv => sv.id === sid);
                     return service ? <span key={sid} className="badge" style={{ background: 'var(--chalk)', color: 'var(--brass)', fontSize: '9px' }}>{service.name}</span> : null;
                   })}
                </div>
              </div>
            </div>
            <div className="card-footer" style={{
              padding: '12px 24px', borderTop: '1px solid var(--border)',
              display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#FAFAFA'
            }}>
               <button onClick={() => handleEdit(s)} style={{ color: 'var(--ink)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>EDIT</button>
               <button onClick={() => handleDelete(s.id)} style={{ color: 'var(--rouge)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>REMOVE</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.5px' },
  input: { padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  pill: { padding: '6px 12px', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', transition: '0.2s' }
};

export default StaffPage
