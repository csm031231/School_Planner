// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom'; // Router 임포트

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router> {/* 여기서 Router 사용 */}
    <App />
  </Router>
);
