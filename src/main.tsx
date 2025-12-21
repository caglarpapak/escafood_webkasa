import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// Import clearAllData to make it available globally in browser console
import './utils/clearAllData';

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
