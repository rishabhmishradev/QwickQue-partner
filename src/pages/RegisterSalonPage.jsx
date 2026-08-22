import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import locationData from '../assets/india_states_cities.json';

function RegisterSalonPage({ showToast }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    latitude: 28.6139,
    longitude: 77.2090,
    gender_target: 'UNISEX',
    categories: []
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !form.id) {
      showToast('Please save company details first.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const res = await api.post(`/uploads/salon-image/${form.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        showToast('Image uploaded successfully!');
        setForm(prev => ({
          ...prev,
          images: [...(prev.images || []), res.data.url]
        }));
      }
    } catch (err) {
      showToast('Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

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
      showToast('Geolocation not supported', 'error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        showToast('Location detected!');
      },
      () => {
        showToast('Failed to detect location', 'error');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submissionData = {
        name: form.name,
        description: form.description,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        gender_target: form.gender_target,
        categories: form.categories
      };

      if (isEditing) {
        await api.patch(`/salons/${form.id}`, submissionData);
        showToast('Company profile updated!');
      } else {
        const res = await api.post('/salons', submissionData);
        if (res.data.success) {
          showToast('Salon registered successfully!');
          navigate('/bookings');
        }
      }
    } catch (err) {
      showToast('Action failed: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>FETCHING_COMPANY_DATA...</div>

  const selectedStateData = locationData.states.find(s => s.name === form.state);
  const cities = selectedStateData ? selectedStateData.cities : [];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>{isEditing ? 'Company Settings' : 'Business Registration'}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{isEditing ? 'Update your business details and public profile.' : 'Join QuickQue and start reaching customers.'}</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div className="card">
          <div className="card-header"><h3 style={{ fontSize: '18px' }}>Basic Information</h3></div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>COMPANY NAME</label>
                <input style={styles.input} value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>BUSINESS PHONE</label>
                <input style={styles.input} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
              </div>
            </div>

            <div style={{ ...styles.formGroup, marginTop: '24px' }}>
              <label style={styles.label}>BUSINESS DESCRIPTION</label>
              <textarea style={{ ...styles.input, minHeight: '100px', fontFamily: 'inherit' }} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 style={{ fontSize: '18px' }}>Location & Reach</h3></div>
          <div className="card-body">
            <div style={styles.formGroup}>
              <label style={styles.label}>STREET ADDRESS</label>
              <input style={styles.input} value={form.address} onChange={e => setForm({...form, address: e.target.value})} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>STATE</label>
                <select style={styles.input} value={form.state} onChange={e => setForm({...form, state: e.target.value, city: ''})} required>
                  <option value="">SELECT STATE</option>
                  {locationData.states.map(s => <option key={s.name} value={s.name}>{s.name.toUpperCase()}</option>)}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>CITY</label>
                <select style={styles.input} value={form.city} onChange={e => setForm({...form, city: e.target.value})} required disabled={!form.state}>
                  <option value="">SELECT CITY</option>
                  {cities.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '24px', padding: '20px', backgroundColor: 'var(--chalk)', borderRadius: '12px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                 <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink)' }}>GEO_COORDINATES</span>
                 <button type="button" onClick={detectLocation} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '11px' }}>DETECT MY LOCATION</button>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                 <input style={styles.input} type="number" step="any" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} required placeholder="LATITUDE" />
                 <input style={styles.input} type="number" step="any" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} required placeholder="LONGITUDE" />
               </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 style={{ fontSize: '18px' }}>Targeting & Categories</h3></div>
          <div className="card-body">
             <label style={styles.label}>TARGET GENDER</label>
             <div style={{ display: 'flex', gap: '12px', marginTop: '12px', marginBottom: '32px' }}>
               {['MENS', 'LADIES', 'UNISEX'].map(g => (
                 <button key={g} type="button" onClick={() => setForm({...form, gender_target: g})}
                   style={{
                     ...styles.pill, flex: 1, padding: '12px',
                     backgroundColor: form.gender_target === g ? 'var(--ink)' : 'white',
                     color: form.gender_target === g ? 'white' : 'var(--ink)',
                     border: '1px solid var(--border)', fontWeight: '600'
                   }}>
                   {g}
                 </button>
               ))}
             </div>

             <label style={styles.label}>PRIMARY BUSINESS CATEGORIES</label>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
               {availableCategories.map(cat => (
                 <button key={cat} type="button" onClick={() => handleCategoryToggle(cat)}
                   style={{
                     ...styles.pill, padding: '8px 20px',
                     backgroundColor: form.categories.includes(cat) ? 'var(--brass)' : 'white',
                     color: form.categories.includes(cat) ? 'white' : 'var(--ink)',
                     border: '1px solid var(--border)', fontSize: '12px', fontWeight: '500'
                   }}>
                   {cat.toUpperCase()}
                 </button>
               ))}
             </div>
          </div>
        </div>

        {isEditing && (
          <div className="card">
            <div className="card-header"><h3 style={{ fontSize: '18px' }}>Gallery & Visuals</h3></div>
            <div className="card-body">
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                 {form.images && form.images.map((img, i) => (
                   <div key={i} style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                     <img src={img} alt="Salon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   </div>
                 ))}
                 <label style={{
                   width: '120px', height: '120px', border: '2px dashed var(--border)', borderRadius: '12px',
                   display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                   cursor: 'pointer', color: 'var(--text-muted)', fontSize: '11px', transition: 'all 0.2s'
                 }} className="upload-btn">
                   <span>+ ADD IMAGE</span>
                   <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ display: 'none' }} />
                 </label>
               </div>
               {uploading && <div style={{ fontSize: '12px', color: 'var(--brass)', fontWeight: '600' }}>UPLOADING_TO_CLOUD...</div>}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', marginBottom: '60px' }}>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1, padding: '18px', fontSize: '16px' }}>
            {loading ? 'PROCESSING...' : (isEditing ? 'SAVE ALL CHANGES' : 'SUBMIT REGISTRATION')}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.5px' },
  input: { padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  pill: { padding: '8px 16px', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '12px' }
};

export default RegisterSalonPage;

const styles = {
  label: { display: 'block', fontSize: '10px', fontFamily: 'var(--font-mono)', marginBottom: '8px', color: 'var(--brass)' },
  input: { width: '100%', padding: '12px', border: '1px solid #eee', borderRadius: '4px', marginBottom: '20px', boxSizing: 'border-box', fontFamily: 'inherit' },
  button: { width: '100%', padding: '16px', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  pill: { padding: '8px 16px', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '12px' },
  detectBtn: { padding: '6px 12px', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }
};

export default RegisterSalonPage;
