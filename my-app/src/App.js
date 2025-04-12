// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './auth/Register';
import Login from './auth/Login';
import Home from './pages/Home';
import Music from './pages/Music';
import ConcentrationMusic from './pages/ConcentrationMusic';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/music" element={<Music />} />
        <Route path="/concentration-music" element={<ConcentrationMusic />} />
      </Routes>
    </Router>
  );
}

export default App;
