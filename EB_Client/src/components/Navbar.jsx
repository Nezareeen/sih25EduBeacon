
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          EduBeacon
        </Link>
        <div className="navbar-links">
          <Link to="/help" className="nav-link">?</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
