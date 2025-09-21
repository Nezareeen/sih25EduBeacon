
import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import BackgroundImage from '../assets/Desktop Bg.png';

const HomePage = () => {
  return (
    <div className="home-container" style={{ backgroundImage: `url(${BackgroundImage})` }}>
      <div className="home-content">
        <h1 className="home-title">EduBeacon</h1>
        <p className="home-subtitle">
          An AI-powered early warning and counseling system to prevent student dropouts.
          We analyze attendance, grades, and well-being surveys to provide actionable insights and support.
        </p>
        <div className="home-buttons">
          <Link to="/login" className="home-btn primary">Login</Link>
          <Link to="/register" className="home-btn secondary">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
