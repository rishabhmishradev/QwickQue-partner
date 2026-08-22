import { useState, useEffect } from 'react'
import api from '../services/api'

function ServicesPage() {
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
        alert('SERVICE_UPDATED');
      } else {
        await api.post(`/salons/${salon.id}/services`, submissionData);
        alert('SERVICE_ADDED_SUCCESSFULLY');
      }
      setForm({ name: '', price: '', duration: '', description: '', category: 'Haircut' });
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
      price: s.price,
      duration: s.duration_minutes || s.duration,
      description: s.description || '',
      category: s.category || 'Haircut'
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ARE_YOU_SURE?')) return;
    try {
      await api.delete(`/services/${id}`);
      setServices(services.filter(s => s.id !== id));
    } catch (err) {
      alert('DELETE_FAILED');
    }
  };

  if (loading) return <div>SYNCHRONIZING_CATALOG...</div>

  return (
    <div style={{ maxWidth: '900px' }}>
      <h1>Service Catalog</h1>
      <div className="ticket-stub" style={{ padding: '24px', marginBottom: '40px' }}>
        <h3>{editingId ? 'Edit Offering' : 'Add New Offering'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '20px' }}>
          <input placeholder="SERVICE NAME" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required style={styles.input} />
          <input type="number" placeholder="PRICE (₹)" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required style={styles.input} />
          <input type="number" placeholder="DURATION (MINS)" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} required style={styles.input} />

          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={styles.input}>
            {availableCategories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
          </select>

          <input placeholder="DESCRIPTION" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ ...styles.input, gridColumn: 'span 2' }} />

          <div style={{ gridColumn: 'span 3', display: 'flex', gap: '10px' }}>
            <button type="submit" style={styles.button}>{editingId ? 'UPDATE SERVICE' : 'COMMIT TO CATALOG'}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', price: '', duration: '', description: '', category: 'Haircut' }) }} style={{ ...styles.button, backgroundColor: '#666' }}>CANCEL</button>}
          </div>
        </form>
      </div>

      <table width="100%" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--ink)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
            <th style={{ padding: '12px' }}>SERVICE_IDENTITY</th>
            <th>CATEGORY</th>
            <th>TIME_ALLOCATION</th>
            <th>BASE_PRICE</th>
            <th style={{ textAlign: 'right' }}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {services.map(s => (
            <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>
                <div style={{ fontWeight: 'bold' }}>{s.name.toUpperCase()}</div>
                <div style={{ fontSize: '10px', color: '#999' }}>{s.description}</div>
              </td>
              <td style={{ fontSize: '12px' }}>{s.category?.toUpperCase()}</td>
              <td>{s.duration_minutes || s.duration} MINS</td>
              <td style={{ fontWeight: 'bold' }}>₹{s.price}</td>
              <td style={{ textAlign: 'right' }}>
                <button onClick={() => handleEdit(s)} style={styles.actionBtn}>EDIT</button>
                <button onClick={() => handleDelete(s.id)} style={{ ...styles.actionBtn, color: 'var(--rouge)' }}>REMOVE</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const styles = {
  input: { padding: '12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', width: '100%' },
  button: { flex: 1, padding: '14px', backgroundColor: 'var(--ink)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
  actionBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold', marginLeft: '10px', fontFamily: 'var(--font-mono)' }
};

export default ServicesPage
