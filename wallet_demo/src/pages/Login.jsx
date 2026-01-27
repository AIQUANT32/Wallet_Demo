import { useState } from 'react';
import { useNavigate, Link} from 'react-router-dom';
import './SignUp.css';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email:'',
    password:'',
    srp:'',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password || !formData.srp) {
      setError('Please enter all the Details');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          srp: formData.srp
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Store JWT token in localStorage
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        // Store SRP in localStorage for wallet connections
        localStorage.setItem('srp', formData.srp);
        // Redirect to dashboard after successful login
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    }
  };

 return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome back</h1>
          <p>Log in to continue to your account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          <input
            type="password"
            name="srp"
            placeholder="Secret Recovery Phrase"
            value={formData.srp}
            onChange={handleChange}
          />

          {error && <div className="auth-error">{error}</div>}

          <button className="primary-button" type="submit">
            Log in
          </button>
        </form>

        <p className="auth-footer">
          Don’t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
