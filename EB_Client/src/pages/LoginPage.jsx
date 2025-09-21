
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css'; // We'll reuse the same CSS
import BackgroundImage from '../assets/Desktop Bg.png';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', formData);
      console.log('Login successful', res.data);
      // TODO: Store the token (e.g., in localStorage) and update auth context
      alert('Login successful!');
      // Redirect based on role
      switch (res.data.role) {
        case 'instructor':
          navigate('/instructor-dashboard');
          break;
        case 'student':
          navigate('/student-dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      console.error(err.response.data);
      alert(err.response.data.message || 'An error occurred');
    }
  };

  return (
    <div className="auth-container" style={{ backgroundImage: `url(${BackgroundImage})` }}>
      <div className="auth-form-container">
        <h1 className="auth-title">Welcome Back</h1>
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" name="email" value={email} onChange={onChange} required className="form-input" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" value={password} onChange={onChange} required className="form-input" />
          </div>
          <button type="submit" className="auth-button">Login</button>
        </form>
        <p className="auth-switch-link">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
