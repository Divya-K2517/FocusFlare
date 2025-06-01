import React, {useEffect, useState} from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HeatmapPage from './HeatmapPage';
import InstructionsPage from './InstructionsPage';

//color palette used: https://www.figma.com/color-palettes/ballerina/

function App() {
  //monthly totals needs to be accessed by both the heatmap and past sessions page
  //so it is defined here
  const [monthlyTotals, setMonthlyTotals] = useState<Map<string, Map<string, number>>>(new Map());
  return (
    <Router>
      <nav>
        <div className="split-navbar">
          <div className="nav-half">
            <Link to ="/instructions">Instructions</Link> 
          </div>
          <div className="nav-half">
            <Link to="/">Heatmap</Link>
          </div>
        </div>
      </nav>
      <Routes>
        <Route 
          path="/" 
          element={
            <HeatmapPage 
              monthlyTotals={monthlyTotals}
              setMonthlyTotals={setMonthlyTotals}
            />
          }
        />
        <Route 
          path="/instructions" 
          element={
            <InstructionsPage
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
