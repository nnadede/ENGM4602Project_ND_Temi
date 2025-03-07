// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Home from './components/Home';
import Readings from './components/Readings';
import Predictions from './components/Predictions';
import Breakdown from './components/Breakdown';
import ClearData from './components/ClearData';

import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/readings">Readings</Link></li>
            <li><Link to="/predict">Predict</Link></li>
            <li><Link to="/breakdown">Breakdown</Link></li>
            <li><Link to="/clear">Clear Data</Link></li>
          </ul>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/readings" element={<Readings />} />
            <Route path="/predict" element={<Predictions />} />
            <Route path="/breakdown" element={<Breakdown />} />
            <Route path="/clear" element={<ClearData />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
