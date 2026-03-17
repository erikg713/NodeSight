import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css';

/**
 * NodeSight Frontend Entry Point
 * Optimized for Pi Browser & Sentenial-X AI Integration
 */

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you plan to measure performance (highly recommended for AI frames),
// you can add reportWebVitals() here.
