import React, {useEffect, useState} from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HeatmapPage from './HeatmapPage';
import SessionsPage from './SessionsPage';

// type FocusSession = {
//   id: number;
//   date: string;
//   hours: number;
// }

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Heatmap</Link> | <Link to ="/sessions">Past Sessions</Link>
      </nav>
      <Routes>
        <Route path="/" element={<HeatmapPage/>}/>
        <Route path="/sessions" element={<SessionsPage/>}/>
      </Routes>
    </Router>
  );
}

export default App;
