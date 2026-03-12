import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css'; // Global styles and CSS resets

// Target the root div defined in your public/index.html
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
