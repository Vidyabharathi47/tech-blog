
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      // Store authentication token
      localStorage.setItem('token', response.data.token);

      localStorage.setItem(
        'user',
        JSON.stringify(response.data.user)
      );

      // Navigate to Admin Dashboard
      navigate('/admin', { replace: true });

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <h1>TECH<span>BLOG.</span></h1>

        <p className="login-subtitle">Admin Login</p>

        <form onSubmit={handleLogin}>

          <label>Email Address</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </form>

        {error && (
          <p className="login-error">{error}</p>
        )}

        <Link to="/" className="back-home">
          ← Back to Home
        </Link>

      </div>

    </div>
  );
}

export default Login;
