import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
const basePath = new URL(process.env.PUBLIC_URL || '/', window.location.origin).pathname.replace(/\/$/, '') || '/';

root.render(
  <React.StrictMode>
    <BrowserRouter basename={basePath}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
