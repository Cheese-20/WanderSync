import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/styles.css';

// Global error listener to catch broken image links and show a placeholder
window.addEventListener('error', function(e) {
  if (e.target && e.target.tagName && e.target.tagName.toLowerCase() === 'img') {
    // Prevent infinite loops if the placeholder itself fails
    if (!e.target.dataset.fallbackApplied) {
      e.target.dataset.fallbackApplied = 'true';
      e.target.src = 'https://via.placeholder.com/400x300?text=WanderSync';
    }
  }
}, true);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
