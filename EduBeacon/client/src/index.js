import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';

// Configure axios base URL for all requests
// In production, use REACT_APP_API_BASE (e.g., your Render URL)
// In development, default to local server
const BASE_URL =
  process.env.REACT_APP_API_BASE ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://sih25edubeacon.onrender.com');

axios.defaults.baseURL = BASE_URL;

// All the code related to the old background's pointer tracking has been removed.
// The new canvas component handles its own animations.

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);