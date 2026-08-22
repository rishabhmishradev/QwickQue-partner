import React, { useState } from 'react';
import { useAuth } from '../services/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate('/bookings');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      backgroundColor: 'var(--chalk)',
      backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)',
      backgroundSize: '32px 32px'
    }}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
        <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '48px', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '32px', color: 'var(--ink)', marginBottom: '8px' }}>QUICKQUE</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>Partner access terminal</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={styles.label}>EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                style={styles.input}
                required
              />
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={styles.label}>PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
                required
              />
            </div>

            {error && (
              <div style={{
                background: '#FEE2E2', color: 'var(--rouge)', padding: '12px',
                borderRadius: '8px', fontSize: '13px', marginBottom: '24px',
                textAlign: 'center', fontWeight: '600', border: '1px solid #FECACA'
              }}>
                {error.toUpperCase()}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '16px' }}>
              {loading ? 'AUTHENTICATING...' : 'SECURE LOG IN'}
            </button>
          </form>

          <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
            New to the platform? <Link to="/register" style={{ color: 'var(--ink)', fontWeight: '700', textDecoration: 'none' }}>Create Partner Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    marginBottom: '8px',
    color: 'var(--text-muted)',
    letterSpacing: '0.5px'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--chalk)',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.2s'
  }
};

export default LoginPage;
