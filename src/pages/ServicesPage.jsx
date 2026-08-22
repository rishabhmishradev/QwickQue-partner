import { useState, useEffect } from 'react'
import api from '../services/api'

function ServicesPage({ showToast }) {
  const [salon, setSalon] = useState(null)
  const [services, setServices] = useState([])
  const [form, setForm] = useState({ name: '', price: '', duration: '', description: '', category: 'Haircut' })
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)

  const availableCategories = ['Haircut', 'Spa', 'Facial', 'Makeup', 'Massage', 'Manicure', 'Pedicure'];

  const fetchData = async () => {
    try {
      const salonsRes = await api.get('/salons/my-salons');
      if (salonsRes.data.data.length > 0) {
        const mySalon = salonsRes.data.data[0];
        setSalon(mySalon);
        const servicesRes = await api.get(`/salons/${mySalon.id}/services`);
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const submissionData = {
        name: form.name,
        price: parseFloat(form.price),
        duration_minutes: parseInt(form.duration),
        description: form.description,
        category: form.category
      };

      if (editingId) {
        await api.patch(`/services/${editingId}`, submissionData);
        showToast('Service updated successfully!');
      } else {
        await api.post(`/salons/${salon.id}/services`, submissionData);
        showToast('Service added to catalog!');
      }
      setForm({ name: '', price: '', duration: '', description: '', category: 'Haircut' });
      setEditingId(null);
      fetchData();
    } catch (err) {
      showToast('Operation failed: ' + (err.response?.data?.error || err.message), 'error');
    }
  }

  const handleEdit = (s) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      price: s.price,
      duration: s.duration_minutes || s.duration,
      description: s.description || '',
      category: s.category || 'Haircut'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service permanently?')) return;
    try {
      await api.delete(`/services/${id}`);
      setServices(services.filter(s => s.id !== id));
      showToast('Service removed');
    } catch (err) {
      showToast('Delete failed', 'error');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>SYNCHRONIZING_CATALOG...</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Service Catalog</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your salon's service offerings and pricing.</p>
      </div>

      <div className="card" style={{ marginBottom: '48px' }}>
        <div className="card-header" style={{ background: 'var(--ink)', color: 'white' }}>
           <h3 style={{ fontSize: '18px' }}>{editingId ? 'Edit Offering' : 'Add New Offering'}</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>SERVICE NAME</label>
              <input placeholder="e.g. Premium Haircut" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>PRICE (₹)</label>
              <input type="number" placeholder="500" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>DURATION (MINS)</label>
              <input type="number" placeholder="30" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} required style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>CATEGORY</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={styles.input}>
                {availableCategories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
            </div>
            <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
              <label style={styles.label}>DESCRIPTION</label>
              <input placeholder="Short description of the service" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={styles.input} />
            </div>

            <div style={{ gridColumn: 'span 3', display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>{editingId ? 'UPDATE SERVICE' : 'SAVE TO CATALOG'}</button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', price: '', duration: '', description: '', category: 'Haircut' }) }}
                  className="btn btn-outline" style={{ flex: 1 }}>CANCEL</button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
           <h3 style={{ fontSize: '18px' }}>Active Offerings</h3>
           <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{services.length} SERVICES TOTAL</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table width="100%" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: 'var(--chalk)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700' }}>SERVICE</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700' }}>CATEGORY</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700' }}>TIME</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700' }}>PRICE</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--ink)' }}>{s.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.description || 'No description'}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span className="badge" style={{ background: '#eee', color: '#666' }}>{s.category}</span>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px' }}>{s.duration_minutes || s.duration} mins</td>
                  <td style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--primary)' }}>₹{s.price}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleEdit(s)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }}>Edit</button>
                      <button onClick={() => handleDelete(s.id)} className="btn" style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--rouge)', background: '#FEE2E2' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .table-row-hover:hover { background-color: #FAFAFA; }
      `}</style>
    </div>
  )
}

const styles = {
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.5px' },
  input: { padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }
};

export default ServicesPage

const styles = {
  input: { padding: '12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', width: '100%' },
  button: { flex: 1, padding: '14px', backgroundColor: 'var(--ink)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
  actionBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold', marginLeft: '10px', fontFamily: 'var(--font-mono)' }
};

export default ServicesPage
