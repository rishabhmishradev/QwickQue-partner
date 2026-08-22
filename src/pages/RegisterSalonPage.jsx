import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function RegisterSalonPage() {
  const [form, setForm] = useState({ name: '', description: '', phone: '', address: '', city: 'DELHI', latitude: 28.6139, longitude: 77.2090, gender_target: 'UNISEX', categories: [] });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const availableCategories = ['Haircut', 'Spa', 'Facial', 'Makeup', 'Massage', 'Manicure', 'Pedicure'];

  useEffect(() => {
    const fetchSalon = async () => {
      try {
        const res = await api.get('/salons/my-salons');
        if (res.data.data.length > 0) {
          const salon = res.data.data[0];
          setForm({
            ...salon,
            categories: salon.categories || []
          });
          setIsEditing(true);
        }
      } catch (err) {
        console.error('Failed to fetch salon');
      } finally {
        setFetching(false);
      }
    };
    fetchSalon();
  }, []);

  const handleCategoryToggle = (cat) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        alert('LOCATION_DETECTED_SUCCESSFULLY');
      },
      () => {
        alert('FAILED_TO_DETECT_LOCATION. PLEASE_ENABLE_PERMISSIONS.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Clean the data to match backend expectation
      const submissionData = {
        name: form.name,
        description: form.description,
        phone: form.phone,
        address: form.address,
        city: form.city,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        gender_target: form.gender_target,
        categories: form.categories
      };

      if (isEditing) {
        await api.patch(`/salons/${form.id}`, submissionData);
        alert('COMPANY_PROFILE_UPDATED');
      } else {
        const res = await api.post('/salons', submissionData);
        if (res.data.success) {
          alert('SALON_REGISTRATION_SUBMITTED');
          navigate('/bookings');
        }
      }
    } catch (err) {
      alert('ACTION_FAILED: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div>FETCHING_COMPANY_DATA...</div>

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px' }}>
      <h1 style={{ fontFamily: 'Fraunces, serif' }}>{isEditing ? 'Manage Your Company' : 'Register Your Salon'}</h1>
      <p style={{ marginBottom: '40px', color: '#666' }}>
        {isEditing ? 'Update your business information below.' : 'Submit your business details for platform approval.'}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="ticket-stub">
        <div style={{ padding: '32px' }}>
          <div style={styles.grid}>
            <div>
              <label style={styles.label}>COMPANY_NAME</label>
              <input style={styles.input} value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div>
              <label style={styles.label}>BUSINESS_PHONE</label>
              <input style={styles.input} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
            </div>
          </div>

          <label style={styles.label}>DESCRIPTION</label>
          <textarea style={styles.input} rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />

          <div style={styles.grid}>
            <div>
              <label style={styles.label}>STREET_ADDRESS</label>
              <input style={styles.input} value={form.address} onChange={e => setForm({...form, address: e.target.value})} required />
            </div>
            <div>
              <label style={styles.label}>CITY</label>
              <input style={styles.input} value={form.city} onChange={e => setForm({...form, city: e.target.value})} required />
            </div>
          </div>

          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px', border: '1px dashed #ccc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--brass)' }}>GEOGRAPHIC_COORDINATES</span>
              <button type="button" onClick={detectLocation} style={styles.detectBtn}>DETECT MY LOCATION</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '9px', color: '#999' }}>LATITUDE</label>
                <input style={{ ...styles.input, marginBottom: 0 }} type="number" step="any" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} required />
              </div>
              <div>
                <label style={{ fontSize: '9px', color: '#999' }}>LONGITUDE</label>
                <input style={{ ...styles.input, marginBottom: 0 }} type="number" step="any" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} required />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>TARGET_GENDER</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['MENS', 'LADIES', 'UNISEX'].map(g => (
                <button key={g} type="button"
                  onClick={() => setForm({...form, gender_target: g})}
                  style={{ ...styles.pill, backgroundColor: form.gender_target === g ? '#A6334A' : '#eee', color: form.gender_target === g ? 'white' : 'black' }}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={styles.label}>PRIMARY_CATEGORIES</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {availableCategories.map(cat => (
                <button key={cat} type="button"
                  onClick={() => handleCategoryToggle(cat)}
                  style={{ ...styles.pill, fontSize: '10px', backgroundColor: form.categories.includes(cat) ? '#444' : '#eee', color: form.categories.includes(cat) ? 'white' : 'black' }}>
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'PROCESSING...' : (isEditing ? 'UPDATE PROFILE' : 'REGISTER SALON')}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  label: { display: 'block', fontSize: '10px', fontFamily: 'var(--font-mono)', marginBottom: '8px', color: 'var(--brass)' },
  input: { width: '100%', padding: '12px', border: '1px solid #eee', borderRadius: '4px', marginBottom: '20px', boxSizing: 'border-box', fontFamily: 'inherit' },
  button: { width: '100%', padding: '16px', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  pill: { padding: '8px 16px', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '12px' },
  detectBtn: { padding: '6px 12px', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }
};

export default RegisterSalonPage;
