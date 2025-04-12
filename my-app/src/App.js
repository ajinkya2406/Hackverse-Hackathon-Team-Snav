// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './auth/Register';
import Login from './auth/Login';
import Home from './pages/Home';
import Music from './pages/Music';
import ConcentrationMusic from './pages/ConcentrationMusic';
import MemorizingMusic from './pages/MemorizingMusic';
import MindFreshMusic from './pages/MindFreshMusic';
import Motivation from './pages/Motivation';
import Game from './pages/Game';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/music" element={<Music />} />
        <Route path="/concentration-music" element={<ConcentrationMusic />} />
        <Route path="/memorizing-music" element={<MemorizingMusic />} />
        <Route path="/mind-fresh-music" element={<MindFreshMusic />} />
        <Route path="/motivation" element={<Motivation />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </Router>
  );
}

export default App;
