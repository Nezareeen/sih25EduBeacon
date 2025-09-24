import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { registerAdmin } = useAuth();
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await registerAdmin(
      formData.name,
      formData.email,
      formData.password,
      formData.organizationName
    );
    
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
            <h1 className="text-3xl font-bold text-[rgb(51,116,253)] mb-2">Create Organization</h1>
            <p className="text-[rgb(51,116,253)]">Set up your EduBeacon organization</p>
          </div>

          {error && (
            <div className="error-message mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[rgb(51,116,253)] mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter your full name"
              />
            </div>

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
              <label htmlFor="organizationName" className="block text-sm font-medium text-[rgb(51,116,253)] mb-2">
                Organization Name
              </label>
              <input
                type="text"
                id="organizationName"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter organization name"
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
                placeholder="Create a password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[rgb(51,116,253)] mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Organization...' : 'Create Organization'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[rgb(51,116,253)]">
              Already have an account?{' '}
              <Link to="/login" className="text-[rgb(51,116,253)] hover:text-[rgb(51,116,253)]/80 font-medium">
                Sign In
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

export default AdminRegister;
