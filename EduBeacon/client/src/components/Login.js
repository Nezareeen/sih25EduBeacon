import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="nav-glass-effect px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-[rgb(51,116,253)]">
            EduBeacon
          </Link>
        </div>
      </nav>

      <div className="flex items-center justify-center px-4 min-h-[calc(100vh-80px)]">
        <div className="max-w-md w-full">
          <div className="liquid-form rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[rgb(51,116,253)] mb-2">Welcome Back</h1>
            <p className="text-[rgb(51,116,253)]">Sign in to your EduBeacon account</p>
          </div>

          {error && (
            <div className="error-message mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[rgb(51,116,253)] mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[rgb(51,116,253)] mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[rgb(51,116,253)]">
              Don't have an account?{' '}
              <Link to="/admin-register" className="text-[rgb(51,116,253)] hover:text-[rgb(51,116,253)]/80 font-medium">
                Create Organization
              </Link>
            </p>
          </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="nav-glass-effect py-8 mt-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[rgb(51,116,253)]">&copy; 2024 EduBeacon. Empowering student success through AI.</p>
        </div>
      </footer>
    </div>
  );
};

export default Login;
