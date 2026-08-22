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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F1EDE6' }}>
      <div style={{ width: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <div style={{ marginBottom: '60px', textAlign: 'center' }}>
          <img src="/logo.png" alt="Logo" style={{ height: '150px', objectFit: 'contain' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: '24px' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ENTER YOUR EMAIL"
              style={styles.input}
              required
            />
            <label style={styles.label}>ENTER YOUR EMAIL</label>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="PASSWORD"
              style={styles.input}
              required
            />
            <label style={styles.label}>PASSWORD</label>
          </div>

          {error && <div style={{ color: '#B4462F', fontSize: '12px', marginBottom: '20px', textAlign: 'center' }}>{error.toUpperCase()}</div>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'LOADING...' : 'LOG IN'}
          </button>
        </form>

        <Link to="/register" style={{ marginTop: '32px', fontSize: '11px', color: 'black', textDecoration: 'underline', fontWeight: 'bold' }}>
          NEW TO QWICKQUE? CREATE AN ACCOUNT
        </Link>
      </div>
    </div>
  );
}

const styles = {
  input: {
    width: '100%',
    padding: '16px',
    border: 'none',
    backgroundColor: 'white',
    fontSize: '12px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  label: {
    display: 'block',
    fontSize: '10px',
    fontWeight: 'bold',
    marginTop: '8px',
    textAlign: 'left',
    color: '#251F1C'
  },
  button: {
    width: '100%',
    padding: '16px',
    background: '#7A0000',
    color: 'black',
    border: 'none',
    fontSize: '24px',
    fontWeight: 'bold',
    cursor: 'pointer',
    letterSpacing: '1px'
  }
};

export default LoginPage;
