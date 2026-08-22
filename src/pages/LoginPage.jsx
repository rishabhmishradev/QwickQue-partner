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
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', width: '350px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>QuickQue Partner</h1>
        <p>Salon Management Ledger</p>

        <form onSubmit={handleSubmit} style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="email"
            placeholder="EMAIL ADDRESS"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ddd' }}
          />

          {error && <div style={{ color: 'red', fontSize: '12px' }}>{error.toUpperCase()}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#A6334A',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'AUTHENTICATING...' : 'ACCESS DASHBOARD'}
          </button>
        </form>

        <div style={{ marginTop: '20px', fontSize: '12px' }}>
          DON'T HAVE AN ACCOUNT? <Link to="/register" style={{ color: '#A6334A', fontWeight: 'bold', textDecoration: 'none' }}>REGISTER COMPANY</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
