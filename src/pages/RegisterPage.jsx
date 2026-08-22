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
      const regRes = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'SALON_OWNER'
      });

      if (regRes.data.success) {
        const loginRes = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password
        });

        if (loginRes.data.success) {
          const token = loginRes.data.data.token;
          const user = loginRes.data.data.user;
          localStorage.setItem('partner_token', token);
          localStorage.setItem('partner_user', JSON.stringify(user));

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
    <div style={{
      minHeight: '100vh', display: 'flex', justifyContent: 'center',
      alignItems: 'center', backgroundColor: 'var(--chalk)',
      padding: '60px 20px'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '48px' }}>
        <h1 style={{ fontSize: '32px', textAlign: 'center', marginBottom: '8px' }}>Join QuickQue</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '40px' }}>Professional Partner Registration</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div>
            <h4 style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--brass)', letterSpacing: '1px' }}>PERSONAL ACCOUNT</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>OWNER NAME</label>
                <input type="text" placeholder="Full Name" required style={styles.input} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>EMAIL ADDRESS</label>
                <input type="email" placeholder="email@example.com" required style={styles.input} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>MOBILE NUMBER</label>
                <input type="tel" placeholder="+91" required style={styles.input} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>PASSWORD</label>
                <input type="password" placeholder="Create Password" required style={styles.input} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--brass)', letterSpacing: '1px' }}>BUSINESS PROFILE</h4>
            <div style={styles.formGroup}>
              <label style={styles.label}>COMPANY NAME</label>
              <input type="text" placeholder="Salon or Studio Name" required style={styles.input} value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
            </div>

            <div style={{ marginTop: '20px' }}>
              <label style={styles.label}>TARGET AUDIENCE</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                {['MENS', 'LADIES', 'UNISEX'].map(g => (
                  <button key={g} type="button"
                    onClick={() => setFormData({...formData, genderTarget: g})}
                    style={{
                      ...styles.pill, flex: 1, padding: '10px',
                      backgroundColor: formData.genderTarget === g ? 'var(--ink)' : 'white',
                      color: formData.genderTarget === g ? 'white' : 'var(--ink)',
                      border: '1px solid var(--border)', fontWeight: '600'
                    }}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <label style={styles.label}>SERVICE CATEGORIES</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {availableCategories.map(cat => (
                  <button key={cat} type="button"
                    onClick={() => handleCategoryToggle(cat)}
                    style={{
                      ...styles.pill, padding: '6px 16px', fontSize: '12px',
                      backgroundColor: formData.categories.includes(cat) ? 'var(--brass)' : 'white',
                      color: formData.categories.includes(cat) ? 'white' : 'var(--ink)',
                      border: '1px solid var(--border)'
                    }}>
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div style={{ color: 'var(--rouge)', fontSize: '13px', textAlign: 'center', background: '#FEE2E2', padding: '12px', borderRadius: '8px' }}>
              {error.toUpperCase()}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '18px', fontSize: '16px' }}>
            {loading ? 'INITIALIZING PARTNERSHIP...' : 'CREATE PARTNER ACCOUNT'}
          </button>
        </form>
        <div style={{ marginTop: '32px', fontSize: '14px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Already a partner? <Link to="/login" style={{ color: 'var(--ink)', fontWeight: '700', textDecoration: 'none' }}>Log In</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.5px' },
  input: { padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%', boxSizing: 'border-box', outline: 'none', fontSize: '14px' },
  pill: { border: 'none', borderRadius: '20px', cursor: 'pointer', transition: '0.2s' }
};

export default RegisterPage;
