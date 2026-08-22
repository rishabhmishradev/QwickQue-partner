import React, { useState } from 'react';
import { useAuth } from '../services/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    companyName: '',
    genderTarget: 'UNISEX',
    categories: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const availableCategories = ['Haircut', 'Spa', 'Facial', 'Makeup', 'Massage', 'Manicure', 'Pedicure'];

  const handleCategoryToggle = (cat) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // 1. Register the User
      const regRes = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'SALON_OWNER'
      });

      if (regRes.data.success) {
        // 2. Login to get token for salon registration
        const loginRes = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password
        });

        if (loginRes.data.success) {
          const token = loginRes.data.data.token;
          localStorage.setItem('partner_token', token);

          // 3. Register the Salon
          await api.post('/salons', {
            name: formData.companyName,
            description: `A premium ${formData.genderTarget.toLowerCase()} salon.`,
            phone: formData.phone,
            address: 'To be updated',
            city: 'DELHI',
            state: 'DELHI',
            latitude: 28.6139,
            longitude: 77.2090,
            gender_target: formData.genderTarget,
            categories: formData.categories
          });

          alert('PARTNER_REGISTRATION_COMPLETE. WELCOME_TO_QUICKQUE.');
          window.location.href = '/bookings';
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'REGISTRATION_FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5', padding: '40px 0' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', width: '500px' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', textAlign: 'center' }}>Join QuickQue</h1>
        <p style={{ textAlign: 'center' }}>Partner Registration</p>

        <form onSubmit={handleSubmit} style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={styles.section}>
            <span style={styles.sectionLabel}>PERSONAL DETAILS</span>
            <input type="text" placeholder="OWNER NAME" required style={styles.input} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input type="email" placeholder="EMAIL ADDRESS" required style={styles.input} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <input type="tel" placeholder="MOBILE NUMBER" required style={styles.input} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <input type="password" placeholder="PASSWORD" required style={styles.input} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>

          <div style={styles.section}>
            <span style={styles.sectionLabel}>COMPANY DETAILS</span>
            <input type="text" placeholder="COMPANY NAME" required style={styles.input} value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />

            <div style={{ marginTop: '10px' }}>
              <span style={{ fontSize: '10px', color: '#666' }}>FOR GENDER</span>
              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                {['MENS', 'LADIES', 'UNISEX'].map(g => (
                  <button key={g} type="button"
                    onClick={() => setFormData({...formData, genderTarget: g})}
                    style={{ ...styles.pill, backgroundColor: formData.genderTarget === g ? '#A6334A' : '#eee', color: formData.genderTarget === g ? 'white' : 'black' }}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '15px' }}>
              <span style={{ fontSize: '10px', color: '#666' }}>CATEGORIES</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '5px' }}>
                {availableCategories.map(cat => (
                  <button key={cat} type="button"
                    onClick={() => handleCategoryToggle(cat)}
                    style={{ ...styles.pill, fontSize: '10px', backgroundColor: formData.categories.includes(cat) ? '#444' : '#eee', color: formData.categories.includes(cat) ? 'white' : 'black' }}>
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <div style={{ color: 'red', fontSize: '12px', textAlign: 'center' }}>{error.toUpperCase()}</div>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'INITIALIZING_PARTNERSHIP...' : 'REGISTER PARTNER'}
          </button>
        </form>
        <div style={{ marginTop: '20px', fontSize: '12px', textAlign: 'center' }}>
          ALREADY A PARTNER? <Link to="/login" style={{ color: '#A6334A' }}>LOG IN</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  section: { border: '1px solid #eee', padding: '15px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '10px' },
  sectionLabel: { fontSize: '9px', fontWeight: 'bold', color: '#999', letterSpacing: '1px' },
  input: { padding: '12px', borderRadius: '4px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box' },
  button: { width: '100%', padding: '15px', backgroundColor: '#A6334A', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
  pill: { padding: '6px 12px', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '11px', transition: '0.2s' }
};

export default RegisterPage;
